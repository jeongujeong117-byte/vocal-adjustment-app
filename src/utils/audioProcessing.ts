// 오디오 신호 처리 유틸리티
// 노이즈 제거 및 음질 향상 기능

/**
 * Pre-emphasis 필터
 * 고주파 성분을 강조하여 음성 특징 부각 (음성은 고주파에 정보가 많음)
 */
export function preEmphasis(buffer: Float32Array, coefficient: number = 0.97): Float32Array {
  const output = new Float32Array(buffer.length);
  output[0] = buffer[0];

  for (let i = 1; i < buffer.length; i++) {
    output[i] = buffer[i] - coefficient * buffer[i - 1];
  }

  return output;
}

/**
 * Median 필터
 * 순간적인 노이즈 spike 제거
 */
export function medianFilter(buffer: Float32Array, windowSize: number = 5): Float32Array {
  const output = new Float32Array(buffer.length);
  const halfWindow = Math.floor(windowSize / 2);

  for (let i = 0; i < buffer.length; i++) {
    const start = Math.max(0, i - halfWindow);
    const end = Math.min(buffer.length, i + halfWindow + 1);
    const window = Array.from(buffer.slice(start, end)).sort((a, b) => a - b);
    output[i] = window[Math.floor(window.length / 2)];
  }

  return output;
}

/**
 * 간단한 Spectral Subtraction
 * 배경 노이즈 스펙트럼을 추정하여 제거
 */
export function spectralSubtraction(
  signal: Float32Array,
  noiseProfile: Float32Array | null = null,
  alpha: number = 2.0 // 노이즈 감소 강도
): Float32Array {
  const fftSize = signal.length;

  // FFT 계산 (간단한 버전)
  const spectrum = computeSpectrum(signal);

  // 노이즈 프로파일이 없으면 신호의 처음 10%를 노이즈로 간주
  let noiseSpec: Float32Array;
  if (noiseProfile) {
    noiseSpec = computeSpectrum(noiseProfile);
  } else {
    const noiseLength = Math.floor(fftSize * 0.1);
    const noiseSample = signal.slice(0, noiseLength);
    noiseSpec = computeSpectrum(noiseSample);
  }

  // Spectral Subtraction
  for (let i = 0; i < spectrum.length; i++) {
    const subtracted = spectrum[i] - alpha * noiseSpec[i];
    spectrum[i] = Math.max(subtracted, 0.1 * spectrum[i]); // Floor 설정 (완전히 0이 되지 않도록)
  }

  // IFFT로 복원 (간단한 근사)
  return inverseSpectrum(spectrum, fftSize);
}

/**
 * 간단한 스펙트럼 계산 (파워 스펙트럼)
 */
function computeSpectrum(signal: Float32Array): Float32Array {
  const fftSize = signal.length;
  const spectrum = new Float32Array(fftSize / 2);

  for (let k = 0; k < fftSize / 2; k++) {
    let real = 0;
    let imag = 0;

    for (let n = 0; n < fftSize; n++) {
      const angle = (2 * Math.PI * k * n) / fftSize;
      real += signal[n] * Math.cos(angle);
      imag += signal[n] * Math.sin(angle);
    }

    spectrum[k] = Math.sqrt(real * real + imag * imag);
  }

  return spectrum;
}

/**
 * 스펙트럼에서 신호로 복원 (간단한 근사)
 */
function inverseSpectrum(spectrum: Float32Array, size: number): Float32Array {
  const output = new Float32Array(size);

  for (let n = 0; n < size; n++) {
    let sum = 0;
    for (let k = 0; k < spectrum.length; k++) {
      const angle = (2 * Math.PI * k * n) / size;
      sum += spectrum[k] * Math.cos(angle);
    }
    output[n] = sum / size;
  }

  return output;
}

/**
 * Harmonic Product Spectrum (HPS)
 * 피치 검출 정확도 향상 - 배음 구조를 이용해 기본 주파수 강조
 */
export function harmonicProductSpectrum(
  spectrum: Float32Array,
  maxHarmonics: number = 5
): Float32Array {
  const hps = new Float32Array(spectrum.length);

  for (let i = 0; i < spectrum.length; i++) {
    hps[i] = spectrum[i];

    // 배음들을 곱함
    for (let h = 2; h <= maxHarmonics; h++) {
      const harmonicIndex = i * h;
      if (harmonicIndex < spectrum.length) {
        hps[i] *= spectrum[harmonicIndex];
      }
    }
  }

  return hps;
}

/**
 * 개선된 Voice Activity Detection (VAD)
 * 에너지, 제로 크로싱율, 스펙트럼 플럭스를 종합 판단
 */
export function detectVoiceActivity(
  buffer: Float32Array,
  _sampleRate: number, // 파라미터 이름 앞에 _ 추가로 unused 경고 제거
  threshold: {
    energy?: number;
    zcr?: number;
    spectralFlux?: number;
  } = {}
): boolean {
  const energyThreshold = threshold.energy ?? 0.02;
  const zcrThreshold = threshold.zcr ?? 0.3;
  const spectralFluxThreshold = threshold.spectralFlux ?? 0.05;

  // 1. 에너지 계산
  let energy = 0;
  for (let i = 0; i < buffer.length; i++) {
    energy += buffer[i] * buffer[i];
  }
  energy = Math.sqrt(energy / buffer.length);

  if (energy < energyThreshold) {
    return false; // 너무 조용함
  }

  // 2. Zero Crossing Rate (ZCR) 계산
  let zeroCrossings = 0;
  for (let i = 1; i < buffer.length; i++) {
    if ((buffer[i] >= 0 && buffer[i - 1] < 0) || (buffer[i] < 0 && buffer[i - 1] >= 0)) {
      zeroCrossings++;
    }
  }
  const zcr = zeroCrossings / buffer.length;

  // 음성은 일반적으로 ZCR이 중간 정도 (너무 높으면 노이즈, 너무 낮으면 저주파 노이즈)
  if (zcr > zcrThreshold) {
    return false; // 고주파 노이즈일 가능성
  }

  // 3. 스펙트럼 플럭스 (변화량) - 음성은 시간에 따라 변함
  const spectrum = computeSpectrum(buffer);
  let spectralFlux = 0;
  for (let i = 1; i < spectrum.length; i++) {
    spectralFlux += Math.abs(spectrum[i] - spectrum[i - 1]);
  }
  spectralFlux /= spectrum.length;

  if (spectralFlux < spectralFluxThreshold) {
    return false; // 너무 정적 (배경 소음)
  }

  return true; // 음성으로 판단
}

/**
 * 노이즈 프로파일 추정
 * 조용한 구간에서 배경 소음의 특성 학습
 */
export class NoiseProfileEstimator {
  private noiseProfile: Float32Array | null = null;
  private noiseSamples: Float32Array[] = [];
  private readonly maxSamples = 10;

  /**
   * 노이즈 샘플 추가 (VAD가 false인 구간)
   */
  addNoiseSample(buffer: Float32Array): void {
    // Float32Array를 복사해서 저장
    const copy = new Float32Array(buffer.length);
    copy.set(buffer);
    this.noiseSamples.push(copy);

    if (this.noiseSamples.length > this.maxSamples) {
      this.noiseSamples.shift(); // 오래된 샘플 제거
    }

    // 프로파일 업데이트
    this.updateProfile();
  }

  /**
   * 노이즈 프로파일 업데이트 (평균)
   */
  private updateProfile(): void {
    if (this.noiseSamples.length === 0) return;

    const length = this.noiseSamples[0].length;
    const profile = new Float32Array(length);

    // 모든 노이즈 샘플의 평균 계산
    for (const sample of this.noiseSamples) {
      for (let i = 0; i < length; i++) {
        profile[i] += sample[i];
      }
    }

    for (let i = 0; i < length; i++) {
      profile[i] /= this.noiseSamples.length;
    }

    this.noiseProfile = profile;
  }

  /**
   * 현재 노이즈 프로파일 반환
   */
  getProfile(): Float32Array | null {
    return this.noiseProfile;
  }

  /**
   * 프로파일 리셋
   */
  reset(): void {
    this.noiseProfile = null;
    this.noiseSamples = [];
  }
}

/**
 * 통합 오디오 전처리
 * Pre-emphasis → Noise Reduction → Median Filter
 * (현재 미사용 - 필요시 활성화)
 */
/*
export function preprocessAudio(
  buffer: Float32Array,
  options: {
    usePreEmphasis?: boolean;
    useNoiseReduction?: boolean;
    useMedianFilter?: boolean;
    noiseProfile?: Float32Array | null;
  } = {}
): Float32Array {
  // 버퍼 복사
  const copy = new Float32Array(buffer.length);
  copy.set(buffer);
  let processed = copy;

  // 1. Pre-emphasis (고주파 강조)
  if (options.usePreEmphasis !== false) {
    processed = preEmphasis(processed) as Float32Array;
  }

  // 2. Spectral Subtraction (노이즈 감소)
  if (options.useNoiseReduction !== false && options.noiseProfile) {
    processed = spectralSubtraction(processed, options.noiseProfile) as Float32Array;
  }

  // 3. Median Filter (순간 노이즈 제거)
  if (options.useMedianFilter !== false) {
    processed = medianFilter(processed, 3) as Float32Array;
  }

  return processed;
}
*/
