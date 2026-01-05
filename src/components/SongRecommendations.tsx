import type { KeyAdjustment } from '../types';
import { numberToNote } from '../types';
import { formatAdjustment } from '../utils/vocalMatcher';

interface SongRecommendationsProps {
  recommendations: KeyAdjustment[];
  showOnlyInRange: boolean;
  onToggleFilter: () => void;
}

export function SongRecommendations({
  recommendations,
  showOnlyInRange,
  onToggleFilter,
}: SongRecommendationsProps) {
  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">추천 노래</h2>
        <p className="text-gray-500 text-center py-8">
          음역대를 설정하면 노래를 추천해드립니다.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">추천 노래</h2>
        <button
          onClick={onToggleFilter}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            showOnlyInRange
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {showOnlyInRange ? '조정 없이 부를 수 있는 곡만' : '모든 노래 보기'}
        </button>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.song.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              rec.isInRange
                ? 'border-green-500 bg-green-50'
                : 'border-blue-300 bg-blue-50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {rec.song.title}
                </h3>
                <p className="text-sm text-gray-600">{rec.song.artist}</p>
              </div>
              <div className="text-right">
                {rec.isInRange ? (
                  <span className="inline-block px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded-full">
                    조정 불필요
                  </span>
                ) : (
                  <span
                    className={`inline-block px-3 py-1 text-white text-sm font-semibold rounded-full ${
                      rec.adjustment > 0 ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                  >
                    {formatAdjustment(rec.adjustment)}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-2 rounded">
                <p className="text-gray-500 text-xs mb-1">원곡 음역대</p>
                <p className="font-mono font-semibold text-gray-700">
                  {numberToNote(rec.song.range.low)} ~ {numberToNote(rec.song.range.high)}
                </p>
              </div>
              {!rec.isInRange && (
                <div className="bg-white p-2 rounded">
                  <p className="text-gray-500 text-xs mb-1">조정 후 음역대</p>
                  <p className="font-mono font-semibold text-blue-700">
                    {numberToNote(rec.adjustedRange.low)} ~{' '}
                    {numberToNote(rec.adjustedRange.high)}
                  </p>
                </div>
              )}
            </div>

            {rec.song.genre && (
              <div className="mt-2">
                <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                  {rec.song.genre}
                </span>
              </div>
            )}

            {!rec.isInRange && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-gray-700">
                💡 <strong>팁:</strong> 노래방에서 리모컨으로{' '}
                <span className="font-bold text-blue-600">
                  {rec.adjustment > 0 ? `+${rec.adjustment}` : rec.adjustment}
                </span>{' '}
                키 조절하세요!
              </div>
            )}
          </div>
        ))}
      </div>

      {recommendations.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          조건에 맞는 노래가 없습니다. 필터를 변경해보세요.
        </p>
      )}
    </div>
  );
}
