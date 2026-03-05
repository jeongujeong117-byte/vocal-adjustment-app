// Web Worker: 피치 검출을 메인 스레드와 완전히 분리된 스레드에서 실행

interface PitchResult {
  frequency: number;
  note: number;
  noteName: string;
  confidence: number;
}

function preEmphasis(buffer: Float32Array, coefficient: number = 0.97): Float32Array {
  const output = new Float32Array(buffer.length);
  output[0] = buffer[0];
  for (let i = 1; i < buffer.length; i++) {
    output[i] = buffer[i] - coefficient * buffer[i - 1];
  }
  return output;
}

function detectVoiceActivity(buffer: Float32Array, energyThreshold: number, zcrThreshold: number): boolean {
  let energy = 0;
  for (let i = 0; i < buffer.length; i++) {
    energy += buffer[i] * buffer[i];
  }
  energy = Math.sqrt(energy / buffer.length);
  if (energy < energyThreshold) return false;

  let zeroCrossings = 0;
  for (let i = 1; i < buffer.length; i++) {
    if ((buffer[i] >= 0 && buffer[i - 1] < 0) || (buffer[i] < 0 && buffer[i - 1] >= 0)) {
      zeroCrossings++;
    }
  }
  const zcr = zeroCrossings / buffer.length;
  return zcr <= zcrThreshold;
}

function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  const processed = preEmphasis(buffer, 0.97);
  const SIZE = processed.length;
  const MAX_SAMPLES = Math.floor(SIZE / 2);

  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += processed[i] * processed[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.05) return -1;

  const minOffset = Math.floor(sampleRate / 800);
  const maxOffset = Math.min(Math.ceil(sampleRate / 80), MAX_SAMPLES);

  let bestOffset = -1;
  let bestCorrelation = 0;
  let lastCorrelation = 1;

  for (let offset = minOffset; offset < maxOffset; offset++) {
    let correlation = 0;
    for (let i = 0; i < MAX_SAMPLES; i++) {
      correlation += Math.abs(processed[i] - processed[i + offset]);
    }
    correlation = 1 - correlation / MAX_SAMPLES;

    if (correlation > 0.92 && correlation > lastCorrelation && correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
    }
    lastCorrelation = correlation;
  }

  return bestCorrelation > 0.85 ? sampleRate / bestOffset : -1;
}

function frequencyToNote(frequency: number): number {
  return Math.round(69 + 12 * Math.log2(frequency / 440));
}

function detectPitch(channelData: Float32Array, sampleRate: number): PitchResult[] {
  const results: PitchResult[] = [];
  const windowSize = 1024;
  const hopSize = 2048;

  for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
    const buffer = channelData.slice(i, i + windowSize);

    if (!detectVoiceActivity(buffer, 0.02, 0.3)) continue;

    const frequency = autoCorrelate(buffer, sampleRate);

    if (frequency >= 80 && frequency <= 800) {
      const midi = frequencyToNote(frequency);
      const note = midi - 12;
      results.push({ frequency, note, noteName: '', confidence: 0.9 });
    }
  }

  return results;
}

self.onmessage = (e: MessageEvent<{ channelData: Float32Array; sampleRate: number }>) => {
  const { channelData, sampleRate } = e.data;
  try {
    const results = detectPitch(channelData, sampleRate);
    self.postMessage({ results });
  } catch (err) {
    self.postMessage({ error: String(err) });
  }
};
