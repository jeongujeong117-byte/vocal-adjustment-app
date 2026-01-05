// 음역대 데이터 타입 정의

export interface VocalRange {
  low: number;  // 최저음 (숫자로 표현, C0 = 0)
  high: number; // 최고음
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  originalKey: string; // 원곡 키 (예: "C", "D#")
  range: VocalRange;   // 노래의 음역대
  genre?: string;
}

export interface KeyAdjustment {
  song: Song;
  adjustment: number;  // 조정해야 할 반음 수 (양수: 올림, 음수: 내림)
  isInRange: boolean;  // 조정 없이 부를 수 있는지
  adjustedRange: VocalRange; // 조정 후 음역대
}

// 음 이름 배열 (반음 단위)
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// 일반적인 음역대 프리셋
export const VOCAL_PRESETS = {
  BASS: { name: '베이스 (낮은 남성)', low: noteToNumber('E2'), high: noteToNumber('E4') },
  BARITONE: { name: '바리톤 (일반 남성)', low: noteToNumber('A2'), high: noteToNumber('A4') },
  TENOR: { name: '테너 (높은 남성)', low: noteToNumber('C3'), high: noteToNumber('C5') },
  ALTO: { name: '알토 (낮은 여성)', low: noteToNumber('F3'), high: noteToNumber('F5') },
  MEZZO_SOPRANO: { name: '메조소프라노 (일반 여성)', low: noteToNumber('A3'), high: noteToNumber('A5') },
  SOPRANO: { name: '소프라노 (높은 여성)', low: noteToNumber('C4'), high: noteToNumber('C6') },
};

// 음 이름을 숫자로 변환 (C0 = 0, C#0 = 1, ...)
export function noteToNumber(note: string): number {
  const match = note.match(/^([A-G]#?)(\d+)$/);
  if (!match) throw new Error(`Invalid note format: ${note}`);

  const noteName = match[1];
  const octave = parseInt(match[2]);

  const noteIndex = NOTE_NAMES.indexOf(noteName);
  if (noteIndex === -1) throw new Error(`Invalid note name: ${noteName}`);

  return octave * 12 + noteIndex;
}

// 숫자를 음 이름으로 변환
export function numberToNote(num: number): string {
  const octave = Math.floor(num / 12);
  const noteIndex = num % 12;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}
