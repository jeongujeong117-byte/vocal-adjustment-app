/**
 * 음색 및 스타일 분석 유틸리티
 *
 * 참고: 음성의 음색(timbre)은 주파수(pitch)와 별개로
 * 소리의 질감, 밝기, 거칠기 등을 나타냅니다.
 */

export interface TimbreProfile {
  // 스펙트럼 특징
  brightness: number;        // 0~1 (밝기 - Spectral Centroid 기반)
  roughness: number;         // 0~1 (거칠기 - Zero Crossing Rate 기반)
  clarity: number;           // 0~1 (깨끗함 - HNR 추정)
  richness: number;          // 0~1 (풍부함 - Spectral Rolloff 기반)

  // 다이내믹 특징
  dynamicRange: number;      // dB
  averageEnergy: number;     // RMS

  // 원본 값들
  spectralCentroid: number;  // Hz
  zeroCrossingRate: number;  // 비율
  spectralRolloff: number;   // Hz
}

export interface VocalStyle {
  // 음색 카테고리
  timbreType: 'bright' | 'warm' | 'dark' | 'neutral';

  // 질감
  textureType: 'smooth' | 'rough' | 'breathy' | 'clear';

  // 추천 장르
  suggestedGenres: Array<{
    genre: string;
    confidence: number;
    reason: string;
  }>;

  // 스타일 설명
  description: string;
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
  let minRMS = Infinity;
  let maxRMS = -Infinity;

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

    // 특징 계산
    const centroid = calculateSpectralCentroid(spectrum, audioBuffer.sampleRate);
    const zcr = calculateZeroCrossingRate(segment);
    const rolloff = calculateSpectralRolloff(spectrum, audioBuffer.sampleRate);
    const rms = calculateRMS(segment);

    totalCentroid += centroid;
    totalZCR += zcr;
    totalRolloff += rolloff;
    totalRMS += rms;

    minRMS = Math.min(minRMS, rms);
    maxRMS = Math.max(maxRMS, rms);
  }

  // 평균 계산
  const avgCentroid = totalCentroid / segmentCount;
  const avgZCR = totalZCR / segmentCount;
  const avgRolloff = totalRolloff / segmentCount;
  const avgRMS = totalRMS / segmentCount;

  // 정규화된 값으로 변환 (0~1)
  const brightness = Math.min(1, avgCentroid / 4000); // ~4kHz를 기준으로
  const roughness = Math.min(1, avgZCR * 10); // ZCR은 보통 0~0.1 범위
  const richness = Math.min(1, avgRolloff / 8000); // ~8kHz를 기준으로
  const clarity = Math.max(0, 1 - roughness * 0.5); // ZCR이 낮을수록 깨끗함

  const dynamicRange = 20 * Math.log10(maxRMS / (minRMS + 1e-10));

  await audioContext.close();

  return {
    brightness,
    roughness,
    clarity,
    richness,
    dynamicRange,
    averageEnergy: avgRMS,
    spectralCentroid: avgCentroid,
    zeroCrossingRate: avgZCR,
    spectralRolloff: avgRolloff,
  };
}

/**
 * 음색 프로필을 기반으로 보컬 스타일 추론
 */
export function inferVocalStyle(profile: TimbreProfile): VocalStyle {
  const { brightness, roughness, clarity, richness } = profile;

  // 음색 타입 판별
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

  // 질감 타입 판별
  let textureType: VocalStyle['textureType'];
  if (clarity > 0.7 && roughness < 0.3) {
    textureType = 'clear';
  } else if (roughness > 0.6) {
    textureType = 'rough';
  } else if (roughness > 0.4 && clarity < 0.6) {
    textureType = 'breathy';
  } else {
    textureType = 'smooth';
  }

  // 장르 추천 (규칙 기반)
  const suggestedGenres: VocalStyle['suggestedGenres'] = [];

  // 밝고 깨끗한 음색 → 팝, 댄스
  if (brightness > 0.6 && clarity > 0.6) {
    suggestedGenres.push({
      genre: '팝 (Pop)',
      confidence: Math.min(0.95, brightness + clarity) / 2,
      reason: '밝고 맑은 음색이 경쾌한 팝 음악과 잘 어울려요',
    });
    suggestedGenres.push({
      genre: '댄스 (Dance)',
      confidence: brightness * 0.9,
      reason: '에너지 넘치는 밝은 음색이 댄스 음악에 적합해요',
    });
  }

  // 어둡고 풍부한 음색 → R&B, 소울
  if (brightness < 0.4 && richness > 0.5) {
    suggestedGenres.push({
      genre: 'R&B',
      confidence: (1 - brightness + richness) / 2,
      reason: '깊고 풍부한 음색이 R&B의 감성과 잘 맞아요',
    });
    suggestedGenres.push({
      genre: '소울 (Soul)',
      confidence: richness * 0.85,
      reason: '따뜻하고 깊은 음색이 소울 음악의 특징이에요',
    });
  }

  // 거친 질감 → 록, 힙합
  if (roughness > 0.5) {
    suggestedGenres.push({
      genre: '록 (Rock)',
      confidence: roughness * 0.9,
      reason: '거칠고 강렬한 음색이 록 음악에 잘 어울려요',
    });
    suggestedGenres.push({
      genre: '힙합 (Hip-Hop)',
      confidence: roughness * 0.8,
      reason: '독특하고 개성 있는 음색이 힙합 스타일에 적합해요',
    });
  }

  // 부드럽고 따뜻한 → 발라드, 재즈
  if (clarity > 0.5 && roughness < 0.4 && richness > 0.4) {
    suggestedGenres.push({
      genre: '발라드 (Ballad)',
      confidence: clarity * 0.9,
      reason: '부드럽고 감성적인 음색이 발라드에 완벽해요',
    });
    suggestedGenres.push({
      genre: '재즈 (Jazz)',
      confidence: (clarity + richness) / 2 * 0.85,
      reason: '따뜻하고 풍부한 음색이 재즈의 감성을 잘 표현해요',
    });
  }

  // 중립적 → 어쿠스틱
  if (
    brightness > 0.4 &&
    brightness < 0.7 &&
    clarity > 0.5 &&
    roughness < 0.5
  ) {
    suggestedGenres.push({
      genre: '어쿠스틱 (Acoustic)',
      confidence: clarity * 0.8,
      reason: '자연스럽고 균형 잡힌 음색이 어쿠스틱 음악에 어울려요',
    });
  }

  // 신뢰도 순 정렬
  suggestedGenres.sort((a, b) => b.confidence - a.confidence);

  // 스타일 설명 생성
  const descriptions: string[] = [];

  if (brightness > 0.7) {
    descriptions.push('밝고 투명한');
  } else if (brightness < 0.3) {
    descriptions.push('어둡고 깊은');
  }

  if (roughness > 0.6) {
    descriptions.push('거칠고 강렬한');
  } else if (roughness < 0.3) {
    descriptions.push('부드럽고 매끄러운');
  }

  if (clarity > 0.7) {
    descriptions.push('맑고 깨끗한');
  }

  if (richness > 0.6) {
    descriptions.push('풍부하고 따뜻한');
  }

  const description =
    descriptions.length > 0
      ? `${descriptions.join(', ')} 음색을 가지고 있어요`
      : '균형 잡힌 음색을 가지고 있어요';

  return {
    timbreType,
    textureType,
    suggestedGenres: suggestedGenres.slice(0, 5),
    description,
  };
}
