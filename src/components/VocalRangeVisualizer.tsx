import type { VocalRange } from '../types';
import { numberToNote, NOTE_NAMES } from '../types';

interface VocalRangeVisualizerProps {
  userRange: VocalRange | null;
  detectedRange?: VocalRange | null;
  showLabels?: boolean;
}

export function VocalRangeVisualizer({
  userRange,
  detectedRange,
  showLabels = true,
}: VocalRangeVisualizerProps) {
  // 표시할 음역대 범위 (C2 ~ C6)
  const displayStart = 24; // C2
  const displayEnd = 72; // C6
  const totalNotes = displayEnd - displayStart + 1;

  const isBlackKey = (noteIndex: number) => {
    const note = NOTE_NAMES[noteIndex % 12];
    return note.includes('#');
  };

  const isInRange = (noteNum: number, range: VocalRange | null) => {
    if (!range) return false;
    return noteNum >= range.low && noteNum <= range.high;
  };

  const renderPianoKeys = () => {
    const keys = [];
    let whiteKeyIndex = 0;

    for (let i = 0; i < totalNotes; i++) {
      const noteNum = displayStart + i;
      const noteIndex = noteNum % 12;
      const isBlack = isBlackKey(noteIndex);

      const inUserRange = isInRange(noteNum, userRange);
      const inDetectedRange = isInRange(noteNum, detectedRange || null);

      if (isBlack) {
        const prevWhiteKeyIndex = whiteKeyIndex - 1;
        keys.push(
          <div
            key={`black-${noteNum}`}
            className="absolute h-16 w-3 bg-gray-800 border border-gray-900 z-10 rounded-b"
            style={{
              left: `calc(${prevWhiteKeyIndex * (100 / (totalNotes * 7 / 12))}% + ${100 / (totalNotes * 7 / 12) * 0.7}%)`,
            }}
          >
            {inUserRange && (
              <div className="absolute inset-0 bg-blue-500 opacity-60 rounded-b" />
            )}
            {inDetectedRange && (
              <div className="absolute inset-0 bg-green-500 opacity-60 rounded-b" />
            )}
          </div>
        );
      } else {
        keys.push(
          <div
            key={`white-${noteNum}`}
            className="flex-1 h-24 bg-white border border-gray-300 relative"
          >
            {inUserRange && (
              <div className="absolute inset-0 bg-blue-400 opacity-40" />
            )}
            {inDetectedRange && (
              <div className="absolute inset-0 bg-green-400 opacity-40" />
            )}
            {showLabels && noteIndex === 0 && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 font-semibold">
                {numberToNote(noteNum)}
              </div>
            )}
          </div>
        );
        whiteKeyIndex++;
      }
    }

    return keys;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-bold text-gray-800 mb-3">음역대 시각화</h3>

      {/* 범례 */}
      <div className="flex gap-4 mb-3 text-sm">
        {userRange && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-400 opacity-60 rounded" />
            <span className="text-gray-700">
              내 음역대: {numberToNote(userRange.low)} ~ {numberToNote(userRange.high)}
            </span>
          </div>
        )}
        {detectedRange && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 opacity-60 rounded" />
            <span className="text-gray-700">
              측정된 음역대: {numberToNote(detectedRange.low)} ~{' '}
              {numberToNote(detectedRange.high)}
            </span>
          </div>
        )}
      </div>

      {/* 피아노 건반 */}
      <div className="relative bg-gray-100 p-2 rounded overflow-x-auto">
        <div className="relative flex min-w-full" style={{ minWidth: '800px' }}>
          {renderPianoKeys()}
        </div>
      </div>

      {/* 도움말 */}
      {!userRange && !detectedRange && (
        <p className="text-sm text-gray-500 mt-3 text-center">
          음역대를 설정하거나 측정하면 피아노 건반에 표시됩니다
        </p>
      )}
    </div>
  );
}
