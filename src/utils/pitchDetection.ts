// 음역대 측정 유틸리티
import {
  preEmphasis,
  detectVoiceActivity,
  NoiseProfileEstimator,
} from './audioProcessing';

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
 * Autocorrelation을 사용한 피치 검출 (노이즈 제거 강화)
 */
function autoCorrelate(
  buffer: Float32Array,
  sampleRate: number,
  useNoiseReduction: boolean = true
): number {
  // 노이즈 제거 전처리 적용
  let processedBuffer = buffer;
  if (useNoiseReduction) {
    // Pre-emphasis 적용 (고주파 강조)
    processedBuffer = preEmphasis(buffer, 0.97);
  }

  const SIZE = processedBuffer.length;
  const MAX_SAMPLES = Math.floor(SIZE / 2);
  let bestOffset = -1;
  let bestCorrelation = 0;
  let rms = 0;

  // RMS (Root Mean Square) 계산
  for (let i = 0; i < SIZE; i++) {
    const val = processedBuffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);

  // 너무 조용하면 -1 반환 (임계값 상향으로 노이즈 제거)
  if (rms < 0.05) return -1;

  // 자기상관 계산 (개선된 버전)
  let lastCorrelation = 1;
  for (let offset = 1; offset < MAX_SAMPLES; offset++) {
    let correlation = 0;
    for (let i = 0; i < MAX_SAMPLES; i++) {
      correlation += Math.abs(processedBuffer[i] - processedBuffer[i + offset]);
    }
    correlation = 1 - correlation / MAX_SAMPLES;

    // 더 높은 신뢰도 요구 (0.9 → 0.92)
    if (correlation > 0.92 && correlation > lastCorrelation) {
      const foundGoodCorrelation = correlation > bestCorrelation;
      if (foundGoodCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    }
    lastCorrelation = correlation;
  }

  // 신뢰도가 충분히 높을 때만 주파수 반환
  if (bestCorrelation > 0.85) {
    // 임계값 상향 (0.01 → 0.85)
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

    // VAD (Voice Activity Detection) - 음성 구간만 처리
    const hasVoice = detectVoiceActivity(buffer, sampleRate, {
      energy: 0.02,
      zcr: 0.3,
      spectralFlux: 0.05,
    });

    if (!hasVoice) {
      continue; // 음성이 아닌 구간은 건너뜀
    }

    const frequency = autoCorrelate(buffer, sampleRate, true);

    // 주파수 범위 축소 (1200Hz → 800Hz, E2 ~ G#5)
    // 일반인 음역대에 맞게 조정
    if (frequency > 0 && frequency >= 80 && frequency <= 800) {
      const midi = frequencyToNote(frequency);
      const note = midiToNote(midi);
      results.push({
        frequency,
        note,
        noteName: '', // 나중에 채울 예정
        confidence: 0.9, // VAD 통과한 구간이므로 신뢰도 높임
      });
    }
  }

  return results;
}

/**
 * 피치 검출 결과에서 음역대 추출
 * Percentile 방식으로 아웃라이어 제거
 */
export function extractVocalRange(results: PitchDetectionResult[]): {
  low: number;
  high: number;
  detectedNotes: number[];
} {
  if (results.length === 0) {
    throw new Error('No pitch detected');
  }

  const notes = results.map((r) => r.note).sort((a, b) => a - b);

  // 아웃라이어 제거: 하위 5%, 상위 5% 제거
  const percentile5 = Math.floor(notes.length * 0.05);
  const percentile95 = Math.ceil(notes.length * 0.95);
  const filteredNotes = notes.slice(percentile5, percentile95);

  if (filteredNotes.length === 0) {
    // 폴백: 필터링 후 비어있으면 원본 사용
    const low = Math.min(...notes);
    const high = Math.max(...notes);
    return { low, high, detectedNotes: notes };
  }

  const low = Math.min(...filteredNotes);
  const high = Math.max(...filteredNotes);

  return { low, high, detectedNotes: filteredNotes };
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
  private noiseEstimator: NoiseProfileEstimator = new NoiseProfileEstimator();
  private frameCount: number = 0;

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

    this.frameCount++;

    // VAD (Voice Activity Detection)
    const hasVoice = detectVoiceActivity(buffer, this.audioContext.sampleRate, {
      energy: 0.03, // 실시간은 임계값을 약간 높게
      zcr: 0.3,
      spectralFlux: 0.05,
    });

    // 음성이 없는 구간은 노이즈 프로파일 업데이트
    if (!hasVoice && this.frameCount % 5 === 0) {
      // 5프레임마다 한 번
      this.noiseEstimator.addNoiseSample(buffer);
    }

    // 음성이 있는 구간만 피치 검출
    if (hasVoice) {
      // 노이즈 제거 적용한 피치 검출
      const frequency = autoCorrelate(buffer, this.audioContext.sampleRate, true);

      // 주파수 범위 축소 (실시간도 동일하게 적용)
      if (frequency > 0 && frequency >= 80 && frequency <= 800) {
        const midi = frequencyToNote(frequency);
        const note = midiToNote(midi);

        if (this.onPitchCallback) {
          this.onPitchCallback({
            frequency,
            note,
            noteName: '',
            confidence: 0.9, // VAD 통과 + 노이즈 제거 적용으로 신뢰도 높임
          });
        }
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
    this.noiseEstimator.reset();
    this.frameCount = 0;
  }
}

