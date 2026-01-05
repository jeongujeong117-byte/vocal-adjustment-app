import { useState } from 'react';
import type { VocalRange, KeyAdjustment } from './types';
import { recommendSongs } from './utils/vocalMatcher';
import { SAMPLE_SONGS } from './data/songs';
import { VocalRangeInput } from './components/VocalRangeInput';
import { SongRecommendations } from './components/SongRecommendations';

function App() {
  const [userRange, setUserRange] = useState<VocalRange | null>(null);
  const [recommendations, setRecommendations] = useState<KeyAdjustment[]>([]);
  const [showOnlyInRange, setShowOnlyInRange] = useState(false);

  const handleRangeChange = (range: VocalRange) => {
    setUserRange(range);
    updateRecommendations(range, showOnlyInRange);
  };

  const handleToggleFilter = () => {
    const newFilter = !showOnlyInRange;
    setShowOnlyInRange(newFilter);
    if (userRange) {
      updateRecommendations(userRange, newFilter);
    }
  };

  const updateRecommendations = (range: VocalRange, onlyInRange: boolean) => {
    const results = recommendSongs(range, SAMPLE_SONGS, {
      maxAdjustment: 6,
      onlyInRange,
    });
    setRecommendations(results);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 헤더 */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎤 음역대 노래 추천
          </h1>
          <p className="text-gray-600">
            내 목소리 음역대에 맞는 노래를 찾아보세요!
          </p>
        </header>

        {/* 음역대 입력 */}
        <VocalRangeInput onRangeChange={handleRangeChange} />

        {/* 노래 추천 */}
        <SongRecommendations
          recommendations={recommendations}
          showOnlyInRange={showOnlyInRange}
          onToggleFilter={handleToggleFilter}
        />

        {/* 사용 안내 */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">💡 사용 방법</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <span>자신의 최저음과 최고음을 선택하거나 프리셋을 사용하세요.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <span>추천된 노래 목록에서 부를 수 있는 곡을 확인하세요.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <span>
                키 조절이 필요한 경우, 노래방 리모컨에서 해당 키만큼 올리거나 내리세요.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">4.</span>
              <span>
                초록색 표시는 조정 없이 바로 부를 수 있는 노래입니다!
              </span>
            </li>
          </ul>
        </div>

        {/* 푸터 */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>음역대는 대략적인 값이며, 개인차가 있을 수 있습니다.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
