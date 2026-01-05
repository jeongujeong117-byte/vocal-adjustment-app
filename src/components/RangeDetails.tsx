import type { VocalRange } from '../types';
import { numberToNote, NOTE_NAMES } from '../types';

interface RangeDetailsProps {
  range: VocalRange;
  title?: string;
}

export function RangeDetails({ range, title = '음역대 상세 정보' }: RangeDetailsProps) {
  // 음역대에 포함된 모든 음계 나열
  const getAllNotes = () => {
    const notes: string[] = [];
    for (let i = range.low; i <= range.high; i++) {
      notes.push(numberToNote(i));
    }
    return notes;
  };

  // 옥타브별로 그룹화
  const getNotesByOctave = () => {
    const notesByOctave: Record<number, string[]> = {};

    for (let i = range.low; i <= range.high; i++) {
      const note = numberToNote(i);
      const octave = Math.floor(i / 12);

      if (!notesByOctave[octave]) {
        notesByOctave[octave] = [];
      }
      notesByOctave[octave].push(note);
    }

    return notesByOctave;
  };

  const notesByOctave = getNotesByOctave();
  const totalSemitones = range.high - range.low + 1;
  const totalOctaves = Math.floor(totalSemitones / 12);
  const remainingSemitones = totalSemitones % 12;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
      <h3 className="text-lg font-bold text-gray-800 mb-3">{title}</h3>

      {/* 요약 정보 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded p-3">
          <p className="text-xs text-gray-500 mb-1">전체 음역대</p>
          <p className="text-lg font-bold text-blue-600">
            {numberToNote(range.low)} ~ {numberToNote(range.high)}
          </p>
        </div>
        <div className="bg-white rounded p-3">
          <p className="text-xs text-gray-500 mb-1">음역 폭</p>
          <p className="text-lg font-bold text-indigo-600">
            {totalOctaves > 0 && `${totalOctaves}옥타브 `}
            {remainingSemitones}음
            <span className="text-sm text-gray-500 ml-1">({totalSemitones}반음)</span>
          </p>
        </div>
      </div>

      {/* 옥타브별 음계 */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">옥타브별 음계:</p>
        {Object.entries(notesByOctave).map(([octave, notes]) => (
          <div key={octave} className="bg-white rounded p-3">
            <p className="text-xs text-gray-500 mb-2">옥타브 {octave}</p>
            <div className="flex flex-wrap gap-1">
              {notes.map((note) => {
                const isSharp = note.includes('#');
                return (
                  <span
                    key={note}
                    className={`px-2 py-1 text-xs font-mono rounded ${
                      isSharp
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}
                  >
                    {note}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 음정 분포 */}
      <div className="mt-4 bg-white rounded p-3">
        <p className="text-xs text-gray-500 mb-2">음정 분포</p>
        <div className="grid grid-cols-12 gap-1">
          {NOTE_NAMES.map((noteName, index) => {
            const count = getAllNotes().filter((n) => {
              const noteNum = range.low + getAllNotes().indexOf(n);
              return noteNum % 12 === index;
            }).length;

            return (
              <div key={noteName} className="text-center">
                <div
                  className={`h-12 rounded flex items-end justify-center ${
                    count > 0 ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                  style={{ height: `${Math.max(12, count * 12)}px` }}
                >
                  {count > 0 && (
                    <span className="text-xs text-white font-bold mb-1">{count}</span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1 font-mono">{noteName}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
