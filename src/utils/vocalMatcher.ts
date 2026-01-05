import type { VocalRange, Song, KeyAdjustment } from '../types';

/**
 * 사용자 음역대와 노래를 비교하여 키 조절이 필요한지 계산
 */
export function calculateKeyAdjustment(
  userRange: VocalRange,
  song: Song
): KeyAdjustment {
  // 조정 없이 부를 수 있는지 확인
  const isInRange =
    song.range.low >= userRange.low &&
    song.range.high <= userRange.high;

  if (isInRange) {
    return {
      song,
      adjustment: 0,
      isInRange: true,
      adjustedRange: song.range,
    };
  }

  // 최적의 키 조절 값 찾기
  // 노래의 중간 음역대를 사용자의 중간 음역대에 맞추기
  const songMid = (song.range.low + song.range.high) / 2;
  const userMid = (userRange.low + userRange.high) / 2;
  const idealAdjustment = Math.round(userMid - songMid);

  // 조정 후에도 사용자 음역대 안에 들어가는지 확인
  const adjustedLow = song.range.low + idealAdjustment;
  const adjustedHigh = song.range.high + idealAdjustment;

  let finalAdjustment = idealAdjustment;

  // 조정 후에도 범위를 벗어나면 미세 조정
  if (adjustedLow < userRange.low) {
    finalAdjustment += (userRange.low - adjustedLow);
  } else if (adjustedHigh > userRange.high) {
    finalAdjustment -= (adjustedHigh - userRange.high);
  }

  return {
    song,
    adjustment: finalAdjustment,
    isInRange: false,
    adjustedRange: {
      low: song.range.low + finalAdjustment,
      high: song.range.high + finalAdjustment,
    },
  };
}

/**
 * 사용자 음역대에 맞는 노래 추천 (조정 필요 여부 포함)
 */
export function recommendSongs(
  userRange: VocalRange,
  songs: Song[],
  options: {
    maxAdjustment?: number; // 최대 허용 키 조절 (반음 수)
    onlyInRange?: boolean;  // 조정 없이 부를 수 있는 노래만
  } = {}
): KeyAdjustment[] {
  const { maxAdjustment = 6, onlyInRange = false } = options;

  const results = songs.map(song => calculateKeyAdjustment(userRange, song));

  // 필터링
  const filtered = results.filter(result => {
    if (onlyInRange && !result.isInRange) return false;
    if (Math.abs(result.adjustment) > maxAdjustment) return false;
    return true;
  });

  // 정렬: 조정이 적게 필요한 순서
  return filtered.sort((a, b) => {
    const absA = Math.abs(a.adjustment);
    const absB = Math.abs(b.adjustment);
    return absA - absB;
  });
}

/**
 * 키 조절을 문자열로 표현
 */
export function formatAdjustment(adjustment: number): string {
  if (adjustment === 0) return '조정 불필요';
  const direction = adjustment > 0 ? '올림' : '내림';
  const abs = Math.abs(adjustment);
  return `${direction} ${abs}키`;
}

/**
 * 음역대가 사용자 범위 내에 있는지 비율 계산 (0~1)
 */
export function calculateMatchScore(
  userRange: VocalRange,
  songRange: VocalRange
): number {
  const songSpan = songRange.high - songRange.low;

  // 겹치는 범위 계산
  const overlapLow = Math.max(userRange.low, songRange.low);
  const overlapHigh = Math.min(userRange.high, songRange.high);
  const overlap = Math.max(0, overlapHigh - overlapLow);

  // 매칭 점수: 겹치는 부분 / 노래 음역대
  return overlap / songSpan;
}
