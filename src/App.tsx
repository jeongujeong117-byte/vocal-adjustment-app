import { useState } from 'react';
import type { VocalRange, KeyAdjustment } from './types';
import { recommendSongs } from './utils/vocalMatcher';
import { SAMPLE_SONGS } from './data/songs';
import { VocalRangeInput } from './components/VocalRangeInput';
import { SongRecommendations } from './components/SongRecommendations';
import { VoiceRecorder } from './components/VoiceRecorder';
import { VocalRangeVisualizer } from './components/VocalRangeVisualizer';
import { RangeDetails } from './components/RangeDetails';

function App() {
  const [userRange, setUserRange] = useState<VocalRange | null>(null);
  const [detectedRange, setDetectedRange] = useState<VocalRange | null>(null);
  const [recommendations, setRecommendations] = useState<KeyAdjustment[]>([]);
  const [showOnlyInRange, setShowOnlyInRange] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'record'>('manual');

  const handleRangeChange = (range: VocalRange) => {
    setUserRange(range);
    updateRecommendations(range, showOnlyInRange);
  };

  const handleRangeDetected = (range: VocalRange) => {
    setDetectedRange(range);
    setUserRange(range);
    updateRecommendations(range, showOnlyInRange);
    setActiveTab('manual'); // 측정 후 수동 탭으로 전환
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

        {/* 탭 선택 */}
        <div className="bg-white rounded-lg shadow-md p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ⌨️ 직접 입력
            </button>
            <button
              onClick={() => setActiveTab('record')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'record'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🎙️ 음성 측정
            </button>
          </div>
        </div>

        {/* 음역대 입력/측정 */}
        {activeTab === 'manual' ? (
          <VocalRangeInput onRangeChange={handleRangeChange} />
        ) : (
          <VoiceRecorder onRangeDetected={handleRangeDetected} />
        )}

        {/* 음역대 시각화 */}
        {(userRange || detectedRange) && (
          <VocalRangeVisualizer
            userRange={userRange}
            detectedRange={detectedRange}
          />
        )}

        {/* 음역대 상세 정보 */}
        {userRange && (
          <RangeDetails
            range={userRange}
            title={detectedRange ? '측정된 음역대 상세 정보' : '설정된 음역대 상세 정보'}
          />
        )}

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
              <span>
                음역대를 직접 입력하거나 음성 녹음/파일 업로드로 자동 측정하세요.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <span>피아노 건반과 상세 분석으로 내 음역대를 시각적으로 확인하세요.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <span>추천된 노래 목록에서 부를 수 있는 곡을 확인하세요.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">4.</span>
              <span>
                키 조절이 필요한 경우, 노래방 리모컨에서 해당 키만큼 올리거나 내리세요.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">5.</span>
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
