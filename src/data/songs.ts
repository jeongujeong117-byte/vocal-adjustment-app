import type { Song } from '../types';
import { noteToNumber } from '../types';

// 샘플 노래 데이터베이스
// 실제 음역대는 대략적인 값입니다
export const SAMPLE_SONGS: Song[] = [
  // 발라드 (낮은 음역대)
  {
    id: '1',
    title: '사랑했지만',
    artist: '김광석',
    originalKey: 'G',
    range: { low: noteToNumber('G3'), high: noteToNumber('D5') },
    genre: '발라드',
  },
  {
    id: '2',
    title: '좋니',
    artist: '윤종신',
    originalKey: 'C',
    range: { low: noteToNumber('A2'), high: noteToNumber('D4') },
    genre: '발라드',
  },
  {
    id: '3',
    title: '벚꽃엔딩',
    artist: '버스커버스커',
    originalKey: 'A',
    range: { low: noteToNumber('E3'), high: noteToNumber('C#5') },
    genre: '발라드',
  },

  // 발라드 (중간 음역대)
  {
    id: '4',
    title: 'Love Poem',
    artist: '아이유',
    originalKey: 'D',
    range: { low: noteToNumber('D4'), high: noteToNumber('E5') },
    genre: '발라드',
  },
  {
    id: '5',
    title: '너의 의미',
    artist: '아이유',
    originalKey: 'F',
    range: { low: noteToNumber('C4'), high: noteToNumber('F5') },
    genre: '발라드',
  },
  {
    id: '6',
    title: '사계',
    artist: '태연',
    originalKey: 'C',
    range: { low: noteToNumber('C4'), high: noteToNumber('G5') },
    genre: '발라드',
  },

  // 댄스/팝
  {
    id: '7',
    title: 'Dynamite',
    artist: 'BTS',
    originalKey: 'C#',
    range: { low: noteToNumber('C#3'), high: noteToNumber('E4') },
    genre: '팝',
  },
  {
    id: '8',
    title: 'Super Shy',
    artist: 'NewJeans',
    originalKey: 'F',
    range: { low: noteToNumber('C4'), high: noteToNumber('C5') },
    genre: '팝',
  },

  // 록/인디
  {
    id: '9',
    title: '거짓말 거짓말 거짓말',
    artist: '이적',
    originalKey: 'Am',
    range: { low: noteToNumber('A2'), high: noteToNumber('E4') },
    genre: '록',
  },
  {
    id: '10',
    title: '잊어버리지마',
    artist: '크러쉬',
    originalKey: 'G',
    range: { low: noteToNumber('G2'), high: noteToNumber('D4') },
    genre: 'R&B',
  },

  // 남성 저음 추천곡
  {
    id: '11',
    title: '다시 사랑한다면',
    artist: '임창정',
    originalKey: 'F',
    range: { low: noteToNumber('F2'), high: noteToNumber('C4') },
    genre: '발라드',
  },
  {
    id: '12',
    title: '그때 그 사람',
    artist: 'S.E.S',
    originalKey: 'Bb',
    range: { low: noteToNumber('Bb3'), high: noteToNumber('F5') },
    genre: '발라드',
  },
  {
    id: '13',
    title: '남자를 몰라',
    artist: '버즈',
    originalKey: 'E',
    range: { low: noteToNumber('B2'), high: noteToNumber('E4') },
    genre: '록',
  },
  {
    id: '14',
    title: '널 사랑하지 않아',
    artist: '어반자카파',
    originalKey: 'D',
    range: { low: noteToNumber('D3'), high: noteToNumber('A4') },
    genre: '발라드',
  },
  {
    id: '15',
    title: '비와 당신',
    artist: '이적',
    originalKey: 'C',
    range: { low: noteToNumber('G2'), high: noteToNumber('C4') },
    genre: '발라드',
  },

  // 최근 인기곡
  {
    id: '16',
    title: 'Ditto',
    artist: 'NewJeans',
    originalKey: 'F#',
    range: { low: noteToNumber('C#4'), high: noteToNumber('D5') },
    genre: '팝',
  },
  {
    id: '17',
    title: 'OMG',
    artist: 'NewJeans',
    originalKey: 'Eb',
    range: { low: noteToNumber('Bb3'), high: noteToNumber('Eb5') },
    genre: '팝',
  },
  {
    id: '18',
    title: 'Hype Boy',
    artist: 'NewJeans',
    originalKey: 'C',
    range: { low: noteToNumber('C4'), high: noteToNumber('D5') },
    genre: '팝',
  },
  {
    id: '19',
    title: '혼자 못 자는 사람',
    artist: '권진아',
    originalKey: 'F',
    range: { low: noteToNumber('A3'), high: noteToNumber('C5') },
    genre: '발라드',
  },
  {
    id: '20',
    title: '있잖아',
    artist: '김세정',
    originalKey: 'F',
    range: { low: noteToNumber('C4'), high: noteToNumber('F5') },
    genre: '발라드',
  },
];
