import type { VocalRange } from '../types';

// 유명 가수 음역대 데이터
export const ARTIST_VOCAL_RANGES = [
  // 남성 가수 (저음)
  { name: '임창정', range: { low: 26, high: 50 }, gender: 'male', type: 'bass' }, // E2~D4
  { name: '윤도현', range: { low: 28, high: 52 }, gender: 'male', type: 'bass' }, // E2~E4
  { name: '김종국', range: { low: 26, high: 53 }, gender: 'male', type: 'baritone' }, // D2~F4

  // 남성 가수 (바리톤)
  { name: '성시경', range: { low: 33, high: 57 }, gender: 'male', type: 'baritone' }, // A2~A4
  { name: '이승기', range: { low: 31, high: 55 }, gender: 'male', type: 'baritone' }, // G2~G4
  { name: '폴킴', range: { low: 33, high: 60 }, gender: 'male', type: 'baritone' }, // A2~C5

  // 남성 가수 (테너)
  { name: '임재현', range: { low: 36, high: 62 }, gender: 'male', type: 'tenor' }, // C3~D5
  { name: '박효신', range: { low: 38, high: 67 }, gender: 'male', type: 'tenor' }, // D3~G5
  { name: '김범수', range: { low: 36, high: 65 }, gender: 'male', type: 'tenor' }, // C3~F5

  // 여성 가수 (알토)
  { name: '에일리', range: { low: 41, high: 72 }, gender: 'female', type: 'alto' }, // F3~C6
  { name: '박정현', range: { low: 41, high: 70 }, gender: 'female', type: 'alto' }, // F3~Bb5
  { name: '소향', range: { low: 43, high: 77 }, gender: 'female', type: 'soprano' }, // G3~F6

  // 여성 가수 (메조소프라노)
  { name: '아이유', range: { low: 45, high: 69 }, gender: 'female', type: 'mezzo' }, // A3~A5
  { name: '태연', range: { low: 48, high: 72 }, gender: 'female', type: 'mezzo' }, // C4~C6
  { name: '백예린', range: { low: 45, high: 67 }, gender: 'female', type: 'mezzo' }, // A3~G5

  // 여성 가수 (소프라노)
  { name: '선미', range: { low: 48, high: 69 }, gender: 'female', type: 'soprano' }, // C4~A5
  { name: '청하', range: { low: 50, high: 72 }, gender: 'female', type: 'soprano' }, // D4~C6
];

export interface ArtistMatch {
  name: string;
  similarity: number; // 0~100
  type: string;
}

/**
 * 사용자 음역대와 유사한 가수 찾기
 */
export function findSimilarArtists(userRange: VocalRange, limit: number = 5): ArtistMatch[] {
  const matches = ARTIST_VOCAL_RANGES.map((artist) => {
    // 음역대 중심점 비교
    const userMid = (userRange.low + userRange.high) / 2;
    const artistMid = (artist.range.low + artist.range.high) / 2;
    const midDiff = Math.abs(userMid - artistMid);

    // 음역 폭 비교
    const userSpan = userRange.high - userRange.low;
    const artistSpan = artist.range.high - artist.range.low;
    const spanDiff = Math.abs(userSpan - artistSpan);

    // 겹치는 범위 계산
    const overlapLow = Math.max(userRange.low, artist.range.low);
    const overlapHigh = Math.min(userRange.high, artist.range.high);
    const overlap = Math.max(0, overlapHigh - overlapLow);

    // 유사도 계산 (0~100)
    // 겹치는 범위가 클수록, 중심점 차이가 작을수록 높은 점수
    const overlapScore = (overlap / Math.max(userSpan, artistSpan)) * 60;
    const midScore = Math.max(0, 30 - midDiff);
    const spanScore = Math.max(0, 10 - spanDiff / 2);

    const similarity = Math.min(100, overlapScore + midScore + spanScore);

    return {
      name: artist.name,
      similarity: Math.round(similarity),
      type: artist.type,
    };
  });

  // 유사도 순으로 정렬
  return matches.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
}

/**
 * 음역대 타입 판별
 */
export function getVocalType(range: VocalRange): string {
  const mid = (range.low + range.high) / 2;

  // 남성/여성 추정 (중간 지점 기준)
  if (mid < 45) {
    // 남성 음역대
    if (mid < 33) return '베이스 (낮은 남성)';
    if (mid < 40) return '바리톤 (일반 남성)';
    return '테너 (높은 남성)';
  } else {
    // 여성 음역대
    if (mid < 50) return '알토 (낮은 여성)';
    if (mid < 55) return '메조소프라노 (일반 여성)';
    return '소프라노 (높은 여성)';
  }
}
