/**
 * 음색 및 스타일 분석 유틸리티
 *
 * 참고: 음성의 음색(timbre)은 주파수(pitch)와 별개로
 * 소리의 질감, 밝기, 거칠기 등을 나타냅니다.
 */

export interface TimbreProfile {
  // 스펙트럼 특징
  brightness: number;          // 0~1 (밝기 - Spectral Centroid 기반)
  roughness: number;           // 0~1 (거칠기 - Zero Crossing Rate 기반)
  clarity: number;             // 0~1 (깨끗함 - HNR 기반)
  richness: number;            // 0~1 (풍부함 - Spectral Rolloff 기반)

  // 다이내믹 특징
  dynamicRange: number;        // dB
  averageEnergy: number;       // RMS

  // 고급 특징 (추가)
  harmonicity: number;         // 0~1 (HNR - 고조파 vs 잡음 비율)
  spectralFlatness: number;    // 0~1 (스펙트럼 평탄도)
  vibratoRate: number | null;  // Hz (비브라토 속도, 없으면 null)
  vibratoExtent: number;       // semitones (비브라토 폭)
  jitter: number;              // % (음정 미세 떨림)
  shimmer: number;             // % (음량 미세 떨림)
  attackTime: number;          // ms (소리 시작 속도)
  pitchRange: number;          // semitones (음역대 폭)

  // 원본 값들
  spectralCentroid: number;    // Hz
  zeroCrossingRate: number;    // 비율
  spectralRolloff: number;     // Hz
  hnr: number;                 // dB (Harmonics-to-Noise Ratio)
}

export interface VocalStyle {
  // 음색 카테고리
  timbreType: 'bright' | 'warm' | 'dark' | 'neutral';

  // 질감
  textureType: 'smooth' | 'rough' | 'breathy' | 'clear';

  // 발성 스타일 (추가)
  vocalTechnique: 'powerful' | 'soft' | 'controlled' | 'expressive';

  // 표현 특성 (추가)
  expressiveness: 'dramatic' | 'stable' | 'emotional' | 'technical';

  // 추천 장르
  suggestedGenres: Array<{
    genre: string;
    confidence: number;
    reason: string;
  }>;

  // 스타일 설명
  description: string;

  // 상세 분석 (추가)
  detailedAnalysis: {
    voiceQuality: string;      // "맑고 청명한 목소리" 등
    strengthArea: string;       // "감정 표현" 등
    recommendedStyle: string;   // "발라드, R&B 등 감정선이 중요한 장르"
  };
}

/**
 * Spectral Centroid 계산 (음색의 밝기)
 * 높을수록 밝고 날카로운 소리
 */
function calculateSpectralCentroid(
  spectrum: Float32Array,
  sampleRate: number
): number {
  let weightedSum = 0;
  let sum = 0;

  for (let i = 0; i < spectrum.length; i++) {
    const frequency = (i * sampleRate) / (2 * spectrum.length);
    const magnitude = spectrum[i];
    weightedSum += frequency * magnitude;
    sum += magnitude;
  }

  return sum > 0 ? weightedSum / sum : 0;
}

/**
 * Zero Crossing Rate 계산 (거칠기/고주파 성분)
 * 높을수록 거친/기식음이 많은 소리
 */
function calculateZeroCrossingRate(timeDomainData: Float32Array): number {
  let crossings = 0;

  for (let i = 1; i < timeDomainData.length; i++) {
    if (
      (timeDomainData[i - 1] >= 0 && timeDomainData[i] < 0) ||
      (timeDomainData[i - 1] < 0 && timeDomainData[i] >= 0)
    ) {
      crossings++;
    }
  }

  return crossings / timeDomainData.length;
}

/**
 * Spectral Rolloff 계산 (고주파 에너지 분포)
 * 전체 에너지의 85%가 집중된 주파수
 */
function calculateSpectralRolloff(
  spectrum: Float32Array,
  sampleRate: number,
  rolloffThreshold: number = 0.85
): number {
  let totalEnergy = 0;
  for (let i = 0; i < spectrum.length; i++) {
    totalEnergy += spectrum[i];
  }

  const targetEnergy = totalEnergy * rolloffThreshold;
  let cumulativeEnergy = 0;

  for (let i = 0; i < spectrum.length; i++) {
    cumulativeEnergy += spectrum[i];
    if (cumulativeEnergy >= targetEnergy) {
      return (i * sampleRate) / (2 * spectrum.length);
    }
  }

  return 0;
}

/**
 * RMS Energy 계산 (음량/다이내믹)
 */
function calculateRMS(timeDomainData: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < timeDomainData.length; i++) {
    sum += timeDomainData[i] * timeDomainData[i];
  }
  return Math.sqrt(sum / timeDomainData.length);
}

/**
 * HNR (Harmonics-to-Noise Ratio) 계산
 * 고조파 성분과 잡음 성분의 비율 - 높을수록 깨끗한 음성
 */
function calculateHNR(
  spectrum: Float32Array,
  fundamentalFreq: number,
  sampleRate: number
): number {
  if (fundamentalFreq <= 0) return 0;

  const binWidth = sampleRate / (2 * spectrum.length);
  let harmonicEnergy = 0;
  let noiseEnergy = 0;

  // 처음 10개의 고조파 검사
  const maxHarmonics = 10;
  const harmonicBandwidth = 50; // Hz (각 고조파 주변 대역폭)

  for (let h = 1; h <= maxHarmonics; h++) {
    const harmonicFreq = fundamentalFreq * h;
    if (harmonicFreq > sampleRate / 2) break;

    const harmonicBin = Math.round(harmonicFreq / binWidth);
    const bandwidthBins = Math.ceil(harmonicBandwidth / binWidth);

    // 고조파 주변의 에너지 합산
    for (let i = -bandwidthBins; i <= bandwidthBins; i++) {
      const bin = harmonicBin + i;
      if (bin >= 0 && bin < spectrum.length) {
        harmonicEnergy += spectrum[bin] * spectrum[bin];
      }
    }
  }

  // 전체 에너지에서 고조파 에너지를 뺀 것이 잡음
  let totalEnergy = 0;
  for (let i = 0; i < spectrum.length; i++) {
    totalEnergy += spectrum[i] * spectrum[i];
  }
  noiseEnergy = Math.max(totalEnergy - harmonicEnergy, 1e-10);

  // HNR (dB) = 10 * log10(harmonicEnergy / noiseEnergy)
  const hnrDb = 10 * Math.log10(harmonicEnergy / noiseEnergy);
  return Math.max(0, hnrDb); // 음수 방지
}

/**
 * Spectral Flatness 계산
 * 0에 가까울수록 톤이 뚜렷한 소리 (음성), 1에 가까울수록 백색 잡음
 */
function calculateSpectralFlatness(spectrum: Float32Array): number {
  let geometricMean = 1;
  let arithmeticMean = 0;
  let validBins = 0;

  for (let i = 0; i < spectrum.length; i++) {
    if (spectrum[i] > 0) {
      geometricMean *= spectrum[i];
      arithmeticMean += spectrum[i];
      validBins++;
    }
  }

  if (validBins === 0) return 0;

  geometricMean = Math.pow(geometricMean, 1 / validBins);
  arithmeticMean /= validBins;

  if (arithmeticMean === 0) return 0;
  return geometricMean / arithmeticMean;
}

/**
 * 비브라토 검출 (F0의 주기적 변동)
 * 연속된 피치 값에서 주기적 패턴 찾기
 */
function detectVibrato(pitchTrack: number[]): {
  rate: number | null;
  extent: number;
} {
  if (pitchTrack.length < 20) {
    return { rate: null, extent: 0 };
  }

  // 피치 변동 계산
  const deviations: number[] = [];
  const mean = pitchTrack.reduce((a, b) => a + b, 0) / pitchTrack.length;

  for (const pitch of pitchTrack) {
    deviations.push(pitch - mean);
  }

  // Autocorrelation으로 주기 찾기
  let bestPeriod = 0;
  let bestCorr = 0;

  for (let lag = 5; lag < deviations.length / 2; lag++) {
    let correlation = 0;
    for (let i = 0; i < deviations.length - lag; i++) {
      correlation += deviations[i] * deviations[i + lag];
    }
    if (correlation > bestCorr) {
      bestCorr = correlation;
      bestPeriod = lag;
    }
  }

  // 비브라토가 있다고 판단하려면 상관관계가 충분히 높아야 함
  if (bestCorr < 0.3 || bestPeriod === 0) {
    return { rate: null, extent: 0 };
  }

  // 비브라토 속도 (Hz) - 가정: 각 프레임이 약 0.05초 간격
  const frameRate = 20; // Hz (20 fps)
  const vibratoRate = frameRate / bestPeriod;

  // 비브라토 폭 (semitones)
  const maxDeviation = Math.max(...deviations.map(Math.abs));
  const vibratoExtent = maxDeviation;

  return {
    rate: vibratoRate,
    extent: vibratoExtent,
  };
}

/**
 * Jitter 계산 (음정의 미세한 떨림)
 * 연속된 피치 주기의 변동성 - 주파수(Hz) 기반으로 계산
 * 참고: Praat 표준 - 정상 범위 0.5-0.6%
 */
function calculateJitter(frequencyTrack: number[]): number {
  if (frequencyTrack.length < 2) return 0;

  // 주파수를 주기(period)로 변환: period = 1 / frequency
  const periods: number[] = frequencyTrack.map(f => f > 0 ? 1 / f : 0).filter(p => p > 0);

  if (periods.length < 2) return 0;

  // 주기 간 차이의 평균 절대값 계산
  let sumAbsDiff = 0;
  for (let i = 1; i < periods.length; i++) {
    sumAbsDiff += Math.abs(periods[i] - periods[i - 1]);
  }

  const avgAbsDiff = sumAbsDiff / (periods.length - 1);
  const avgPeriod = periods.reduce((a, b) => a + b, 0) / periods.length;

  // Jitter (%) = (평균 절대 차이 / 평균 주기) * 100
  return avgPeriod > 0 ? (avgAbsDiff / avgPeriod) * 100 : 0;
}

/**
 * Shimmer 계산 (음량의 미세한 떨림)
 * 연속된 RMS 값의 변동성 - dB 단위로 계산
 * 참고: Praat 표준 - 정상 범위 0.19-0.22 dB
 */
function calculateShimmer(rmsTrack: number[]): number {
  if (rmsTrack.length < 2) return 0;

  // RMS 값들을 dB로 변환하여 차이 계산
  let sumAbsDiff = 0;
  let validDiffs = 0;

  for (let i = 1; i < rmsTrack.length; i++) {
    if (rmsTrack[i] > 0 && rmsTrack[i - 1] > 0) {
      // dB 차이 = 20 * log10(rms1 / rms2)
      const dbDiff = Math.abs(20 * Math.log10(rmsTrack[i] / rmsTrack[i - 1]));
      sumAbsDiff += dbDiff;
      validDiffs++;
    }
  }

  // Shimmer (dB) = 평균 절대 dB 차이
  return validDiffs > 0 ? sumAbsDiff / validDiffs : 0;
}

/**
 * Attack Time 계산 (소리의 시작 속도)
 * 에너지가 최대치의 90%에 도달하는 시간
 */
function calculateAttackTime(
  timeDomainData: Float32Array,
  sampleRate: number
): number {
  // Attack time은 소리의 시작 부분만 분석하면 되므로
  // 처음 2초만 사용 (너무 긴 버퍼로 인한 스택 오버플로우 방지)
  const maxSamples = Math.min(timeDomainData.length, sampleRate * 2);
  const analysisBuffer = timeDomainData.slice(0, maxSamples);

  // RMS 엔벨로프 계산
  const windowSize = 128;
  const envelope: number[] = [];

  for (let i = 0; i < analysisBuffer.length - windowSize; i += windowSize / 2) {
    const window = analysisBuffer.slice(i, i + windowSize);
    const rms = calculateRMS(window);
    envelope.push(rms);
  }

  if (envelope.length === 0) return 0;

  const maxEnergy = Math.max(...envelope);
  const threshold = maxEnergy * 0.9;

  // 처음으로 threshold를 넘는 지점 찾기
  let attackFrames = 0;
  for (let i = 0; i < envelope.length; i++) {
    if (envelope[i] >= threshold) {
      attackFrames = i;
      break;
    }
  }

  // 시간으로 변환 (ms)
  const frameTime = (windowSize / 2) / sampleRate * 1000;
  return attackFrames * frameTime;
}

/**
 * 오디오 버퍼에서 음색 프로필 추출
 */
export async function analyzeTimbre(audioBuffer: AudioBuffer): Promise<TimbreProfile> {
  const audioContext = new AudioContext({ sampleRate: audioBuffer.sampleRate });
  const channelData = audioBuffer.getChannelData(0);

  // FFT 분석을 위한 AnalyserNode
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;

  const bufferSource = audioContext.createBufferSource();
  bufferSource.buffer = audioBuffer;
  bufferSource.connect(analyser);

  // 분석할 세그먼트들
  const segmentCount = 10;
  const segmentLength = Math.floor(channelData.length / segmentCount);

  let totalCentroid = 0;
  let totalZCR = 0;
  let totalRolloff = 0;
  let totalRMS = 0;
  let totalHNR = 0;
  let totalFlatness = 0;
  let minRMS = Infinity;
  let maxRMS = -Infinity;

  const pitchTrack: number[] = []; // 세미톤 단위 (음역대 계산용)
  const frequencyTrack: number[] = []; // Hz 단위 (Jitter 계산용)
  const rmsTrack: number[] = [];
  let minPitch = Infinity;
  let maxPitch = -Infinity;

  for (let seg = 0; seg < segmentCount; seg++) {
    const start = seg * segmentLength;
    const end = Math.min(start + segmentLength, channelData.length);
    const segment = channelData.slice(start, end);

    // FFT 분석
    const fftSize = 2048;
    const spectrum = new Float32Array(fftSize / 2);

    // 간단한 FFT 시뮬레이션 (실제로는 Web Audio API의 analyser 사용)
    // 여기서는 근사치로 계산
    for (let i = 0; i < spectrum.length; i++) {
      let real = 0;
      let imag = 0;
      const freq = (i * audioBuffer.sampleRate) / fftSize;

      for (let n = 0; n < Math.min(segment.length, fftSize); n++) {
        const angle = (2 * Math.PI * freq * n) / audioBuffer.sampleRate;
        real += segment[n] * Math.cos(angle);
        imag += segment[n] * Math.sin(angle);
      }

      spectrum[i] = Math.sqrt(real * real + imag * imag);
    }

    // 기본 주파수 추정 (스펙트럼의 피크)
    let maxMagnitude = 0;
    let fundamentalFreq = 0;
    for (let i = 10; i < spectrum.length / 2; i++) {
      // 너무 낮은 주파수 제외
      if (spectrum[i] > maxMagnitude) {
        maxMagnitude = spectrum[i];
        fundamentalFreq = (i * audioBuffer.sampleRate) / fftSize;
      }
    }

    // 특징 계산
    const centroid = calculateSpectralCentroid(spectrum, audioBuffer.sampleRate);
    const zcr = calculateZeroCrossingRate(segment);
    const rolloff = calculateSpectralRolloff(spectrum, audioBuffer.sampleRate);
    const rms = calculateRMS(segment);
    const hnr = calculateHNR(spectrum, fundamentalFreq, audioBuffer.sampleRate);
    const flatness = calculateSpectralFlatness(spectrum);

    totalCentroid += centroid;
    totalZCR += zcr;
    totalRolloff += rolloff;
    totalRMS += rms;
    totalHNR += hnr;
    totalFlatness += flatness;

    minRMS = Math.min(minRMS, rms);
    maxRMS = Math.max(maxRMS, rms);

    // 피치 트래킹
    if (fundamentalFreq > 0 && fundamentalFreq >= 80 && fundamentalFreq <= 800) {
      // 세미톤 단위 (음역대 계산용)
      const semitone = 12 * Math.log2(fundamentalFreq / 440);
      pitchTrack.push(semitone);
      minPitch = Math.min(minPitch, semitone);
      maxPitch = Math.max(maxPitch, semitone);

      // Hz 단위 (Jitter 계산용)
      frequencyTrack.push(fundamentalFreq);
    }

    rmsTrack.push(rms);
  }

  // 평균 계산
  const avgCentroid = totalCentroid / segmentCount;
  const avgZCR = totalZCR / segmentCount;
  const avgRolloff = totalRolloff / segmentCount;
  const avgRMS = totalRMS / segmentCount;
  const avgHNR = totalHNR / segmentCount;
  const avgFlatness = totalFlatness / segmentCount;

  // 정규화된 값으로 변환 (0~1)
  const brightness = Math.min(1, avgCentroid / 4000); // ~4kHz를 기준으로
  const roughness = Math.min(1, avgZCR * 10); // ZCR은 보통 0~0.1 범위
  const richness = Math.min(1, avgRolloff / 8000); // ~8kHz를 기준으로

  // Harmonicity는 HNR을 0~1로 정규화 (clarity와 동일 개념이므로 통합)
  // 참고: 정상 음성 HNR 범위 10-25 dB (연구 표준)
  const harmonicity = Math.min(1, avgHNR / 25); // ~25dB를 최대로 (연구 기반)
  const clarity = harmonicity; // 하위 호환성을 위해 유지 (harmonicity와 동일)

  const dynamicRange = 20 * Math.log10(maxRMS / (minRMS + 1e-10));

  // 고급 특징 계산
  const vibrato = detectVibrato(pitchTrack);
  const jitter = calculateJitter(frequencyTrack); // 주파수 기반으로 수정
  const shimmer = calculateShimmer(rmsTrack); // dB 단위로 수정
  const attackTime = calculateAttackTime(channelData, audioBuffer.sampleRate);
  const pitchRange = maxPitch !== -Infinity ? maxPitch - minPitch : 0;

  // 디버그 로깅: 실제 측정값 출력 (개발 모드)
  // Vite 환경에서는 import.meta.env.DEV를 사용
  if (import.meta.env.DEV) {
    console.group('🎵 음성 분석 측정값 (Voice Analysis Debug)');
    console.log('📊 기본 측정값:');
    console.log(`  - Spectral Centroid: ${avgCentroid.toFixed(2)} Hz`);
    console.log(`  - Zero Crossing Rate: ${avgZCR.toFixed(4)}`);
    console.log(`  - Spectral Rolloff: ${avgRolloff.toFixed(2)} Hz`);
    console.log(`  - RMS Energy: ${avgRMS.toFixed(6)}`);
    console.log(`  - Dynamic Range: ${dynamicRange.toFixed(2)} dB`);
    console.log('');
    console.log('🎼 고급 음성 측정값:');
    console.log(`  - HNR (원본): ${avgHNR.toFixed(2)} dB (정상: 10-25 dB)`);
    console.log(`  - Harmonicity (정규화): ${(harmonicity * 100).toFixed(1)}%`);
    console.log(`  - Spectral Flatness: ${avgFlatness.toFixed(4)} (0=톤, 1=노이즈)`);
    console.log(`  - Jitter: ${jitter.toFixed(2)}% (정상: 0.5-0.6%)`);
    console.log(`  - Shimmer: ${shimmer.toFixed(2)} dB (정상: 0.19-0.22 dB)`);
    console.log(`  - Attack Time: ${attackTime.toFixed(2)} ms`);
    console.log(`  - Pitch Range: ${pitchRange.toFixed(2)} semitones`);
    console.log(`  - Vibrato Rate: ${vibrato.rate ? vibrato.rate.toFixed(2) + ' Hz' : 'None'}`);
    console.log(`  - Vibrato Extent: ${vibrato.extent.toFixed(2)} semitones`);
    console.log('');
    console.log('📈 정규화된 특징값 (0-1):');
    console.log(`  - Brightness: ${(brightness * 100).toFixed(1)}%`);
    console.log(`  - Roughness: ${(roughness * 100).toFixed(1)}%`);
    console.log(`  - Clarity: ${(clarity * 100).toFixed(1)}%`);
    console.log(`  - Richness: ${(richness * 100).toFixed(1)}%`);
    console.groupEnd();
  }

  await audioContext.close();

  return {
    brightness,
    roughness,
    clarity,
    richness,
    dynamicRange,
    averageEnergy: avgRMS,
    harmonicity,
    spectralFlatness: avgFlatness,
    vibratoRate: vibrato.rate,
    vibratoExtent: vibrato.extent,
    jitter,
    shimmer,
    attackTime,
    pitchRange,
    spectralCentroid: avgCentroid,
    zeroCrossingRate: avgZCR,
    spectralRolloff: avgRolloff,
    hnr: avgHNR,
  };
}

/**
 * 음색 프로필을 기반으로 보컬 스타일 추론
 */
export function inferVocalStyle(profile: TimbreProfile): VocalStyle {
  const {
    brightness,
    roughness,
    richness,
    harmonicity, // clarity와 동일하므로 harmonicity만 사용
    spectralFlatness,
    vibratoRate,
    vibratoExtent,
    jitter,
    shimmer,
    attackTime,
    dynamicRange,
    pitchRange,
  } = profile;

  // 음색 타입 판별 (기존 로직 유지)
  let timbreType: VocalStyle['timbreType'];
  if (brightness > 0.7) {
    timbreType = 'bright';
  } else if (brightness < 0.3) {
    timbreType = 'dark';
  } else if (richness > 0.6) {
    timbreType = 'warm';
  } else {
    timbreType = 'neutral';
  }

  // 질감 타입 판별 (HNR과 Spectral Flatness 추가 고려)
  let textureType: VocalStyle['textureType'];
  if (harmonicity > 0.7 && spectralFlatness < 0.2) {
    textureType = 'clear'; // 고조파 강하고 톤이 뚜렷함
  } else if (roughness > 0.6 || spectralFlatness > 0.5) {
    textureType = 'rough'; // 거칠거나 노이즈가 많음
  } else if (roughness > 0.4 && harmonicity < 0.5) {
    textureType = 'breathy'; // 기식음 많음
  } else {
    textureType = 'smooth';
  }

  // 발성 기법 판별
  let vocalTechnique: VocalStyle['vocalTechnique'];
  if (dynamicRange > 15 && attackTime < 50) {
    vocalTechnique = 'powerful'; // 다이내믹 크고 빠른 어택
  } else if (dynamicRange < 8 && jitter < 0.5 && shimmer < 0.3) {
    vocalTechnique = 'controlled'; // 안정적이고 통제된 발성
  } else if (attackTime > 100 && shimmer < 0.3) {
    vocalTechnique = 'soft'; // 부드러운 어택
  } else {
    vocalTechnique = 'expressive'; // 표현력 있는 발성
  }

  // 표현력 특성 판별
  let expressiveness: VocalStyle['expressiveness'];
  const hasVibrato = vibratoRate !== null && vibratoExtent > 0.3;
  const isStable = jitter < 0.5 && shimmer < 0.3;
  const isVaried = dynamicRange > 12;

  if (hasVibrato && isVaried && (jitter > 1 || shimmer > 0.5)) {
    expressiveness = 'dramatic'; // 비브라토 + 다이내믹 + 변동성
  } else if (isStable && !hasVibrato && dynamicRange < 10) {
    expressiveness = 'stable'; // 안정적이고 일정한 발성
  } else if ((jitter > 1 || shimmer > 0.5) && dynamicRange > 10) {
    expressiveness = 'emotional'; // 변동성이 높음 (감정적)
  } else {
    expressiveness = 'technical'; // 기술적이고 균형잡힌
  }

  // 장르 추천 (모든 지표를 종합적으로 활용)
  const suggestedGenres: VocalStyle['suggestedGenres'] = [];

  // 클래식/뮤지컬: 매우 깨끗 + 비브라토 + 안정적 + 넓은 음역
  if (harmonicity > 0.65 || (hasVibrato && spectralFlatness < 0.25)) {
    const scores = {
      harmonicity: harmonicity > 0.7 ? 1.0 : harmonicity > 0.6 ? 0.7 : 0.4,
      vibrato: hasVibrato && vibratoExtent > 0.4 ? 1.0 : hasVibrato ? 0.6 : 0.2,
      flatness: spectralFlatness < 0.15 ? 1.0 : spectralFlatness < 0.25 ? 0.7 : 0.3,
      stability: (jitter < 0.8 && shimmer < 4) ? 1.0 : 0.5,
      range: pitchRange > 18 ? 1.0 : pitchRange > 12 ? 0.7 : 0.4,
    };

    const confidence = (scores.harmonicity * 0.3 + scores.vibrato * 0.25 +
                       scores.flatness * 0.2 + scores.stability * 0.15 + scores.range * 0.1);

    if (confidence > 0.5) {
      const reasons = [];
      if (scores.harmonicity > 0.7) reasons.push(`매우 맑은 음성 (${(harmonicity * 100).toFixed(0)}%)`);
      if (scores.vibrato > 0.6) reasons.push(`비브라토 ${vibratoRate?.toFixed(1)}Hz`);
      if (scores.flatness > 0.7) reasons.push(`음악적 톤`);
      if (scores.stability > 0.7) reasons.push(`안정적 (J${jitter.toFixed(1)}%)`);

      suggestedGenres.push({
        genre: '클래식/뮤지컬 (Classical/Musical)',
        confidence: Math.min(0.95, confidence),
        reason: reasons.length > 0 ? reasons.join(', ') : '클래식 발성의 특징을 가지고 있어요',
      });
    }
  }

  // 발라드: 감정적 표현 + 넓은 다이내믹 + 비브라토 + 음역대
  if (dynamicRange > 8 || jitter > 0.8 || shimmer > 0.3) {
    const scores = {
      emotion: (jitter > 1.5 || shimmer > 0.7) ? 1.0 : (jitter > 0.8 || shimmer > 0.4) ? 0.8 : 0.5,
      dynamics: dynamicRange > 15 ? 1.0 : dynamicRange > 10 ? 0.8 : dynamicRange > 8 ? 0.5 : 0.3,
      range: pitchRange > 18 ? 1.0 : pitchRange > 12 ? 0.8 : 0.5,
      vibrato: hasVibrato ? (vibratoExtent > 0.5 ? 1.0 : 0.7) : 0.4,
      clarity: harmonicity > 0.5 ? 0.9 : 0.6,
    };

    const confidence = (scores.emotion * 0.3 + scores.dynamics * 0.25 + scores.range * 0.2 +
                       scores.vibrato * 0.15 + scores.clarity * 0.1);

    if (confidence > 0.5) {
      const reasons = [];
      if (scores.emotion > 0.7) reasons.push(`감정 표현 (J${jitter.toFixed(1)}% S${shimmer.toFixed(2)}dB)`);
      if (scores.dynamics > 0.7) reasons.push(`다이내믹 ${dynamicRange.toFixed(1)}dB`);
      if (scores.range > 0.7) reasons.push(`음역 ${pitchRange.toFixed(0)}st`);
      if (scores.vibrato > 0.6 && hasVibrato) reasons.push(`비브라토`);

      suggestedGenres.push({
        genre: '발라드 (Ballad)',
        confidence: Math.min(0.95, confidence),
        reason: reasons.length > 0 ? reasons.join(', ') : '풍부한 감정 표현이 발라드에 적합해요',
      });
    }
  }

  // 팝: 밝고 깨끗 + 적당한 비브라토 + 넓은 음역 + 안정적
  if (harmonicity > 0.45 || brightness > 0.55) {
    const scores = {
      brightness: brightness > 0.65 ? 1.0 : brightness > 0.55 ? 0.8 : 0.5,
      clarity: harmonicity > 0.65 ? 1.0 : harmonicity > 0.5 ? 0.8 : 0.5,
      range: pitchRange > 18 ? 1.0 : pitchRange > 15 ? 0.8 : pitchRange > 12 ? 0.6 : 0.4,
      vibrato: hasVibrato ? (vibratoExtent < 0.8 ? 1.0 : 0.7) : 0.6, // 적당한 비브라토 선호
      attack: attackTime < 80 ? 0.9 : attackTime < 100 ? 0.7 : 0.5,
    };

    const confidence = (scores.brightness * 0.25 + scores.clarity * 0.25 + scores.range * 0.2 +
                       scores.vibrato * 0.15 + scores.attack * 0.15);

    if (confidence > 0.5) {
      const reasons = [];
      if (scores.brightness > 0.7) reasons.push(`밝은 음색 ${(brightness * 100).toFixed(0)}%`);
      if (scores.clarity > 0.7) reasons.push(`깨끗함 ${(harmonicity * 100).toFixed(0)}%`);
      if (scores.range > 0.7) reasons.push(`넓은 음역 ${pitchRange.toFixed(0)}st`);

      suggestedGenres.push({
        genre: '팝 (Pop)',
        confidence: Math.min(0.95, confidence),
        reason: reasons.length > 0 ? reasons.join(', ') : '밝고 맑은 음색이 팝에 적합해요',
      });
    }
  }

  // R&B/소울: 어둡고 풍부 + 감정적 표현 + 느린 어택
  if (brightness < 0.5 || richness > 0.5 || (jitter > 1 && shimmer > 0.5)) {
    const scores = {
      darkness: brightness < 0.35 ? 1.0 : brightness < 0.45 ? 0.8 : 0.5,
      richness: richness > 0.6 ? 1.0 : richness > 0.5 ? 0.8 : 0.5,
      emotion: (jitter > 1.5 || shimmer > 0.7) ? 1.0 : (jitter > 1 || shimmer > 0.5) ? 0.8 : 0.5,
      dynamics: dynamicRange > 12 ? 1.0 : dynamicRange > 10 ? 0.7 : 0.5,
      vibrato: hasVibrato ? (vibratoExtent > 0.5 ? 1.0 : 0.7) : 0.5,
    };

    const confidence = (scores.darkness * 0.2 + scores.richness * 0.25 + scores.emotion * 0.3 +
                       scores.dynamics * 0.15 + scores.vibrato * 0.1);

    if (confidence > 0.5) {
      const reasons = [];
      if (scores.darkness > 0.7) reasons.push(`깊은 음색`);
      if (scores.richness > 0.7) reasons.push(`풍부함 ${(richness * 100).toFixed(0)}%`);
      if (scores.emotion > 0.7) reasons.push(`감정 (J${jitter.toFixed(1)}% S${shimmer.toFixed(2)}dB)`);

      suggestedGenres.push({
        genre: 'R&B/소울 (R&B/Soul)',
        confidence: Math.min(0.95, confidence),
        reason: reasons.length > 0 ? reasons.join(', ') : '깊고 감성적인 R&B 스타일이에요',
      });
    }
  }

  // 록: 거칠고 강렬 + 빠른 어택 + 높은 에너지
  if (spectralFlatness > 0.3 || roughness > 0.4 || attackTime < 70) {
    const scores = {
      roughness: roughness > 0.6 ? 1.0 : roughness > 0.45 ? 0.8 : 0.5,
      flatness: spectralFlatness > 0.45 ? 1.0 : spectralFlatness > 0.35 ? 0.8 : 0.5,
      attack: attackTime < 50 ? 1.0 : attackTime < 60 ? 0.8 : attackTime < 70 ? 0.6 : 0.3,
      dynamics: dynamicRange > 15 ? 1.0 : dynamicRange > 12 ? 0.8 : 0.5,
      power: (jitter > 1 || shimmer > 0.5) ? 0.8 : 0.5,
    };

    const confidence = (scores.roughness * 0.25 + scores.flatness * 0.2 + scores.attack * 0.25 +
                       scores.dynamics * 0.2 + scores.power * 0.1);

    if (confidence > 0.5) {
      const reasons = [];
      if (scores.roughness > 0.7) reasons.push(`거칠기 ${(roughness * 100).toFixed(0)}%`);
      if (scores.attack > 0.7) reasons.push(`빠른 어택 ${attackTime.toFixed(0)}ms`);
      if (scores.dynamics > 0.7) reasons.push(`파워풀 ${dynamicRange.toFixed(1)}dB`);

      suggestedGenres.push({
        genre: '록 (Rock)',
        confidence: Math.min(0.95, confidence),
        reason: reasons.length > 0 ? reasons.join(', ') : '강렬하고 파워풀한 록 스타일이에요',
      });
    }
  }

  // 재즈: 풍부하고 표현력 + 다이내믹 + 비브라토
  if (richness > 0.45 || (hasVibrato && dynamicRange > 10)) {
    const scores = {
      richness: richness > 0.6 ? 1.0 : richness > 0.5 ? 0.8 : 0.5,
      clarity: harmonicity > 0.6 ? 1.0 : harmonicity > 0.5 ? 0.7 : 0.5,
      dynamics: dynamicRange > 15 ? 1.0 : dynamicRange > 12 ? 0.8 : dynamicRange > 10 ? 0.6 : 0.4,
      range: pitchRange > 18 ? 1.0 : pitchRange > 15 ? 0.8 : pitchRange > 12 ? 0.6 : 0.4,
      vibrato: hasVibrato ? 1.0 : 0.4,
    };

    const confidence = (scores.richness * 0.25 + scores.clarity * 0.2 + scores.dynamics * 0.2 +
                       scores.range * 0.2 + scores.vibrato * 0.15);

    if (confidence > 0.5) {
      const reasons = [];
      if (scores.richness > 0.7) reasons.push(`풍부한 톤 ${(richness * 100).toFixed(0)}%`);
      if (scores.dynamics > 0.7) reasons.push(`다이내믹 ${dynamicRange.toFixed(1)}dB`);
      if (scores.vibrato > 0.7) reasons.push(`비브라토`);

      suggestedGenres.push({
        genre: '재즈 (Jazz)',
        confidence: Math.min(0.95, confidence),
        reason: reasons.length > 0 ? reasons.join(', ') : '풍부하고 표현력 있는 재즈 스타일이에요',
      });
    }
  }

  // 힙합/랩: 높은 Spectral Flatness + 매우 빠른 어택 + 리듬감
  if (spectralFlatness > 0.35 || attackTime < 55) {
    const scores = {
      flatness: spectralFlatness > 0.5 ? 1.0 : spectralFlatness > 0.4 ? 0.8 : 0.5,
      attack: attackTime < 40 ? 1.0 : attackTime < 50 ? 0.8 : attackTime < 60 ? 0.6 : 0.3,
      stability: (jitter < 1 && shimmer < 0.6) ? 0.8 : 0.5,
      rhythm: !hasVibrato ? 0.9 : 0.5, // 비브라토 없는 것이 힙합에 더 적합
    };

    const confidence = (scores.flatness * 0.35 + scores.attack * 0.35 + scores.stability * 0.15 + scores.rhythm * 0.15);

    if (confidence > 0.45) {
      const reasons = [];
      if (scores.flatness > 0.7) reasons.push(`타악기적 ${(spectralFlatness * 100).toFixed(0)}%`);
      if (scores.attack > 0.7) reasons.push(`빠른 어택 ${attackTime.toFixed(0)}ms`);
      if (scores.rhythm > 0.7) reasons.push(`리듬감`);

      suggestedGenres.push({
        genre: '힙합/랩 (Hip-Hop/Rap)',
        confidence: Math.min(0.9, confidence),
        reason: reasons.length > 0 ? reasons.join(', ') : '리드미컬한 힙합 스타일이에요',
      });
    }
  }

  // 어쿠스틱/포크: 중립적 + 안정적 + 자연스러움
  if ((brightness > 0.4 && brightness < 0.7) || (jitter < 1.2 && shimmer < 0.6 && harmonicity > 0.4)) {
    const scores = {
      balance: 1.0 - Math.abs(brightness - 0.55) * 2,
      clarity: harmonicity > 0.6 ? 1.0 : harmonicity > 0.5 ? 0.8 : harmonicity > 0.4 ? 0.6 : 0.4,
      stability: (jitter < 1 && shimmer < 0.4) ? 1.0 : (jitter < 1.5 && shimmer < 0.6) ? 0.7 : 0.5,
      natural: (spectralFlatness < 0.3 && !hasVibrato) ? 0.9 : spectralFlatness < 0.35 ? 0.7 : 0.5,
      attack: attackTime > 70 ? 1.0 : attackTime > 60 ? 0.7 : 0.5,
    };

    const confidence = (scores.balance * 0.25 + scores.clarity * 0.25 + scores.stability * 0.2 +
                       scores.natural * 0.2 + scores.attack * 0.1);

    if (confidence > 0.5) {
      const reasons = [];
      if (scores.balance > 0.7) reasons.push(`균형 잡힌 음색`);
      if (scores.clarity > 0.7) reasons.push(`자연스러움 ${(harmonicity * 100).toFixed(0)}%`);
      if (scores.stability > 0.7) reasons.push(`안정적`);

      suggestedGenres.push({
        genre: '어쿠스틱/포크 (Acoustic/Folk)',
        confidence: Math.min(0.9, confidence),
        reason: reasons.length > 0 ? reasons.join(', ') : '자연스러운 어쿠스틱 스타일이에요',
      });
    }
  }

  // 댄스/일렉트로닉: 밝고 에너지 + 안정적 + 빠른 어택
  if (brightness > 0.6 || (attackTime < 65 && jitter < 1 && shimmer < 0.6)) {
    const scores = {
      brightness: brightness > 0.75 ? 1.0 : brightness > 0.65 ? 0.8 : 0.5,
      attack: attackTime < 50 ? 1.0 : attackTime < 60 ? 0.8 : attackTime < 70 ? 0.6 : 0.3,
      stability: (jitter < 0.8 && shimmer < 0.4) ? 1.0 : (jitter < 1 && shimmer < 0.6) ? 0.7 : 0.5,
      energy: harmonicity > 0.6 ? 0.9 : 0.6,
      rhythm: !hasVibrato ? 0.9 : hasVibrato && vibratoExtent < 0.4 ? 0.6 : 0.4,
    };

    const confidence = (scores.brightness * 0.3 + scores.attack * 0.25 + scores.stability * 0.2 +
                       scores.energy * 0.15 + scores.rhythm * 0.1);

    if (confidence > 0.5) {
      const reasons = [];
      if (scores.brightness > 0.7) reasons.push(`밝음 ${(brightness * 100).toFixed(0)}%`);
      if (scores.attack > 0.7) reasons.push(`어택 ${attackTime.toFixed(0)}ms`);
      if (scores.stability > 0.7) reasons.push(`안정적 (J${jitter.toFixed(1)}%)`);

      suggestedGenres.push({
        genre: '댄스/일렉트로닉 (Dance/Electronic)',
        confidence: Math.min(0.9, confidence),
        reason: reasons.length > 0 ? reasons.join(', ') : '에너지 넘치는 댄스 스타일이에요',
      });
    }
  }

  // 신뢰도 순 정렬
  suggestedGenres.sort((a, b) => b.confidence - a.confidence);

  // 스타일 설명 생성 (더 상세하게)
  const descriptions: string[] = [];

  // 음색 밝기
  if (brightness > 0.7) {
    descriptions.push('밝고 투명한');
  } else if (brightness < 0.3) {
    descriptions.push('어둡고 깊은');
  }

  // 질감
  if (harmonicity > 0.7) {
    descriptions.push('맑고 깨끗한');
  } else if (roughness > 0.6) {
    descriptions.push('거칠고 강렬한');
  } else if (roughness < 0.3) {
    descriptions.push('부드럽고 매끄러운');
  }

  // 풍부함
  if (richness > 0.6) {
    descriptions.push('풍부하고 따뜻한');
  }

  const description =
    descriptions.length > 0
      ? `${descriptions.join(', ')} 음색을 가지고 있어요`
      : '균형 잡힌 음색을 가지고 있어요';

  // 상세 분석 생성
  let voiceQuality = '';
  if (harmonicity > 0.7 && spectralFlatness < 0.2) {
    voiceQuality = '맑고 청명한 목소리';
  } else if (richness > 0.6 && brightness < 0.4) {
    voiceQuality = '깊고 풍부한 목소리';
  } else if (brightness > 0.7) {
    voiceQuality = '밝고 경쾌한 목소리';
  } else if (roughness > 0.5) {
    voiceQuality = '거칠고 개성있는 목소리';
  } else {
    voiceQuality = '자연스럽고 균형잡힌 목소리';
  }

  let strengthArea = '';
  if (dynamicRange > 15 && (jitter > 1 || shimmer > 0.5)) {
    strengthArea = '강렬한 감정 표현';
  } else if (harmonicity > 0.7 && jitter < 0.5) {
    strengthArea = '안정적이고 정확한 음정';
  } else if (pitchRange > 20) {
    strengthArea = '넓은 음역대 활용';
  } else if (hasVibrato && vibratoExtent > 0.5) {
    strengthArea = '풍부한 비브라토 표현';
  } else {
    strengthArea = '균형잡힌 발성';
  }

  let recommendedStyle = '';
  if (suggestedGenres.length > 0) {
    const topGenres = suggestedGenres.slice(0, 3).map((g) => g.genre.split(' ')[0]);
    recommendedStyle = `${topGenres.join(', ')} 등의 장르가 잘 어울려요`;
  } else {
    recommendedStyle = '다양한 장르에 도전해보세요';
  }

  return {
    timbreType,
    textureType,
    vocalTechnique,
    expressiveness,
    suggestedGenres: suggestedGenres.slice(0, 5),
    description,
    detailedAnalysis: {
      voiceQuality,
      strengthArea,
      recommendedStyle,
    },
  };
}
