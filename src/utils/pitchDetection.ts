// 음역대 측정 유틸리티

export interface PitchDetectionResult {
  frequency: number;
  note: number;
  noteName: string;
  confidence: number;
}

/**
 * 주파수를 MIDI 노트 번호로 변환
 */
export function frequencyToNote(frequency: number): number {
  // MIDI note = 69 + 12 * log2(frequency / 440)
  // 440Hz = A4 = MIDI note 69
  return Math.round(69 + 12 * Math.log2(frequency / 440));
}

/**
 * MIDI 노트 번호를 주파수로 변환
 */
export function noteToFrequency(note: number): number {
  // frequency = 440 * 2^((note - 69) / 12)
  return 440 * Math.pow(2, (note - 69) / 12);
}

/**
 * MIDI 노트 번호를 음역대 표기법으로 변환
 */
export function midiToNote(midi: number): number {
  // MIDI 0 = C-1, 하지만 우리 시스템은 C0 = 0
  // MIDI의 C0 = 12
  return midi - 12;
}

/**
 * Autocorrelation을 사용한 피치 검출
 */
function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  const SIZE = buffer.length;
  const MAX_SAMPLES = Math.floor(SIZE / 2);
  let bestOffset = -1;
  let bestCorrelation = 0;
  let rms = 0;

  // RMS (Root Mean Square) 계산
  for (let i = 0; i < SIZE; i++) {
    const val = buffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);

  // 너무 조용하면 -1 반환
  if (rms < 0.01) return -1;

  // 자기상관 계산
  let lastCorrelation = 1;
  for (let offset = 1; offset < MAX_SAMPLES; offset++) {
    let correlation = 0;
    for (let i = 0; i < MAX_SAMPLES; i++) {
      correlation += Math.abs(buffer[i] - buffer[i + offset]);
    }
    correlation = 1 - correlation / MAX_SAMPLES;

    if (correlation > 0.9 && correlation > lastCorrelation) {
      const foundGoodCorrelation = correlation > bestCorrelation;
      if (foundGoodCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    }
    lastCorrelation = correlation;
  }

  if (bestCorrelation > 0.01) {
    return sampleRate / bestOffset;
  }
  return -1;
}

/**
 * 오디오 버퍼에서 피치 검출
 */
export function detectPitch(
  audioBuffer: AudioBuffer,
  startTime: number = 0,
  duration: number = audioBuffer.duration
): PitchDetectionResult[] {
  const sampleRate = audioBuffer.sampleRate;
  const channelData = audioBuffer.getChannelData(0);
  const startSample = Math.floor(startTime * sampleRate);
  const endSample = Math.min(
    Math.floor((startTime + duration) * sampleRate),
    channelData.length
  );

  const results: PitchDetectionResult[] = [];
  const windowSize = 2048;
  const hopSize = 512;

  for (let i = startSample; i < endSample - windowSize; i += hopSize) {
    const buffer = channelData.slice(i, i + windowSize);
    const frequency = autoCorrelate(buffer, sampleRate);

    if (frequency > 0 && frequency >= 80 && frequency <= 1200) {
      const midi = frequencyToNote(frequency);
      const note = midiToNote(midi);
      results.push({
        frequency,
        note,
        noteName: '', // 나중에 채울 예정
        confidence: 0.8,
      });
    }
  }

  return results;
}

/**
 * 피치 검출 결과에서 음역대 추출
 */
export function extractVocalRange(results: PitchDetectionResult[]): {
  low: number;
  high: number;
  detectedNotes: number[];
} {
  if (results.length === 0) {
    throw new Error('No pitch detected');
  }

  const notes = results.map((r) => r.note);
  const low = Math.min(...notes);
  const high = Math.max(...notes);

  return { low, high, detectedNotes: notes };
}

/**
 * 실시간 마이크 입력에서 피치 검출
 */
export class RealTimePitchDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private rafId: number | null = null;
  private onPitchCallback: ((result: PitchDetectionResult) => void) | null = null;

  async start(onPitch: (result: PitchDetectionResult) => void) {
    this.onPitchCallback = onPitch;
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.analyser);

      this.detectPitchLoop();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  private detectPitchLoop = () => {
    if (!this.analyser || !this.audioContext) return;

    const buffer = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(buffer);

    const frequency = autoCorrelate(buffer, this.audioContext.sampleRate);

    if (frequency > 0 && frequency >= 80 && frequency <= 1200) {
      const midi = frequencyToNote(frequency);
      const note = midiToNote(midi);

      if (this.onPitchCallback) {
        this.onPitchCallback({
          frequency,
          note,
          noteName: '',
          confidence: 0.8,
        });
      }
    }

    this.rafId = requestAnimationFrame(this.detectPitchLoop);
  };

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.onPitchCallback = null;
  }
}
