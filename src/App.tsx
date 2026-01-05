import { useState } from 'react';
import type { VocalRange, KeyAdjustment } from './types';
import { numberToNote } from './types';
import { recommendSongs } from './utils/vocalMatcher';
import { findSimilarArtists, getVocalType } from './utils/artistMatcher';
// import { analyzeTimbre, inferVocalStyle, type TimbreProfile, type VocalStyle } from './utils/timbreAnalysis';
import { SAMPLE_SONGS } from './data/songs';
import { VoiceRecorder } from './components/VoiceRecorder';
import { VocalRangeVisualizer } from './components/VocalRangeVisualizer';
import { RangeDetails } from './components/RangeDetails';

type Step = 'start' | 'select-analysis' | 'measuring-range' | 'measuring-timbre' | 'range-result' | 'timbre-result' | 'songs' | 'search';

function App() {
  const [step, setStep] = useState<Step>('start');
  const [userRange, setUserRange] = useState<VocalRange | null>(null);
  const [recommendations, setRecommendations] = useState<KeyAdjustment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const similarArtists = userRange ? findSimilarArtists(userRange, 3) : [];
  const vocalType = userRange ? getVocalType(userRange) : '';

  const filteredSongs = searchQuery
    ? SAMPLE_SONGS.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 헤더 */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            🎤 내 음역대 찾기
          </h1>
          <p className="text-gray-600 text-lg">
            나에게 딱 맞는 노래를 찾아드릴게요!
          </p>
        </header>

        {/* Step 1: 시작 화면 - 분석 타입 선택 */}
        {step === 'start' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-6">🎵</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                어떤 분석을 원하시나요?
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                음역대와 음색, 원하는 분석을 선택하세요
              </p>
            </div>

            {/* 분석 타입 카드 */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* 음역대 분석 */}
              <div
                onClick={() => setStep('measuring-range')}
                className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 rounded-2xl p-8 cursor-pointer hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <div className="text-5xl mb-4">🎼</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  음역대 분석
                </h3>
                <p className="text-gray-600 mb-4">
                  내 최저음/최고음을 측정하고<br />
                  부를 수 있는 노래를 추천받아요
                </p>
                <ul className="text-sm text-gray-600 space-y-1 text-left">
                  <li>• 음역대 측정 (예: E2 ~ E4)</li>
                  <li>• 비슷한 가수 찾기</li>
                  <li>• 노래 키 조절 가이드</li>
                </ul>
              </div>

              {/* 음색 & 장르 분석 */}
              <div
                onClick={() => setStep('measuring-timbre')}
                className="bg-gradient-to-br from-pink-50 to-purple-100 border-2 border-pink-300 rounded-2xl p-8 cursor-pointer hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <div className="text-5xl mb-4">🎨</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  음색 & 장르 분석
                </h3>
                <p className="text-gray-600 mb-4">
                  목소리 특징을 분석하고<br />
                  어울리는 장르를 추천받아요
                </p>
                <ul className="text-sm text-gray-600 space-y-1 text-left">
                  <li>• 음색 프로필 (밝기, 질감)</li>
                  <li>• 보컬 스타일 분석</li>
                  <li>• 장르 추천 (팝, 발라드 등)</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6">
              <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                측정 팁
              </h3>
              <ul className="space-y-2 text-yellow-800">
                <li>• 조용한 곳에서 측정해주세요</li>
                <li>• "아~" 소리를 내면서 자연스럽게 노래해보세요</li>
                <li>• 최소 5~10초 이상 녹음하면 정확해요</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 2-1: 음역대 측정 중 */}
        {step === 'measuring-range' && (
          <div className="space-y-6 animate-fadeIn">
            <VoiceRecorder onRangeDetected={(range) => {
              setUserRange(range);
              const results = recommendSongs(range, SAMPLE_SONGS, {
                maxAdjustment: 6,
                onlyInRange: false,
              });
              setRecommendations(results);
              setStep('range-result');
            }} />
            <button
              onClick={() => setStep('start')}
              className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              ← 처음으로
            </button>
          </div>
        )}

        {/* Step 2-2: 음색 측정 중 */}
        {step === 'measuring-timbre' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">🎨</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                음색 분석 중...
              </h2>
              <p className="text-gray-600 mb-8">
                곧 구현 예정입니다! 음역대 분석을 먼저 이용해주세요.
              </p>
              <button
                onClick={() => setStep('start')}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-full hover:shadow-lg transform hover:scale-105 transition-all"
              >
                ← 분석 선택으로
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 음역대 결과 화면 */}
        {step === 'range-result' && userRange && (
          <div className="space-y-6 animate-fadeIn">
            {/* 음역대 결과 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                당신의 음역대에요!
              </h2>
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent my-6">
                {numberToNote(userRange.low)} ~ {numberToNote(userRange.high)}
              </div>
              <p className="text-xl text-gray-600 mb-4">{vocalType}</p>
            </div>

            {/* 시각화 */}
            <VocalRangeVisualizer userRange={userRange} detectedRange={null} />

            {/* 유사 가수 */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                🌟 이 가수들과 음역대가 비슷해요!
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {similarArtists.map((artist) => (
                  <div
                    key={artist.name}
                    className="bg-white rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="text-3xl mb-2">🎤</div>
                    <p className="font-bold text-lg text-gray-800">{artist.name}</p>
                    <p className="text-sm text-gray-500">{artist.similarity}% 유사</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 상세 정보 */}
            <RangeDetails range={userRange} title="상세 음역대 분석" />

            {/* 다음 단계 버튼 */}
            <div className="flex gap-4">
              <button
                onClick={() => setStep('songs')}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-full hover:shadow-lg transform hover:scale-105 transition-all"
              >
                추천 노래 보기 →
              </button>
              <button
                onClick={() => setStep('start')}
                className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-full transition-colors"
              >
                다시 측정
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 노래 추천 */}
        {step === 'songs' && userRange && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
                추천 노래 목록
              </h2>
              <p className="text-gray-600 text-center mb-6">
                당신의 음역대에 딱 맞는 노래들이에요!
              </p>

              <div className="space-y-3">
                {recommendations.slice(0, 10).map((rec) => (
                  <div
                    key={rec.song.id}
                    className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                      rec.isInRange
                        ? 'border-green-400 bg-green-50'
                        : 'border-blue-300 bg-blue-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {rec.song.title}
                        </h3>
                        <p className="text-sm text-gray-600">{rec.song.artist}</p>
                      </div>
                      <div className="text-right">
                        {rec.isInRange ? (
                          <span className="inline-block px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-full">
                            조정 불필요! ✨
                          </span>
                        ) : (
                          <span className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-full">
                            {rec.adjustment > 0 ? `+${rec.adjustment}` : rec.adjustment}키
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 노래 검색으로 이동 */}
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl shadow-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                부르고 싶은 노래가 따로 있나요?
              </h3>
              <p className="text-gray-600 mb-4">
                원하는 노래를 검색하면 음 조절을 도와드릴게요!
              </p>
              <button
                onClick={() => setStep('search')}
                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-colors"
              >
                노래 검색하기 →
              </button>
            </div>

            <button
              onClick={() => setStep('range-result')}
              className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              ← 결과 화면으로
            </button>
          </div>
        )}

        {/* Step 5: 노래 검색 */}
        {step === 'search' && userRange && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                🔍 노래 검색
              </h2>

              <div className="mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="노래 제목이나 가수 이름을 입력하세요"
                  className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-full focus:border-purple-500 focus:outline-none"
                />
              </div>

              {searchQuery && filteredSongs.length > 0 ? (
                <div className="space-y-3">
                  {filteredSongs.map((song) => {
                    const adjustment = recommendSongs(userRange, [song], {
                      maxAdjustment: 12,
                    })[0];

                    return (
                      <div
                        key={song.id}
                        className="p-4 rounded-xl border-2 border-purple-300 bg-purple-50 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">
                              {song.title}
                            </h3>
                            <p className="text-sm text-gray-600">{song.artist}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              원곡: {numberToNote(song.range.low)} ~{' '}
                              {numberToNote(song.range.high)}
                            </p>
                          </div>
                          <div className="text-right">
                            {adjustment.isInRange ? (
                              <div>
                                <span className="inline-block px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-full">
                                  바로 부를 수 있어요! ✨
                                </span>
                              </div>
                            ) : (
                              <div>
                                <span className="inline-block px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-full mb-2">
                                  {adjustment.adjustment > 0
                                    ? `+${adjustment.adjustment}`
                                    : adjustment.adjustment}
                                  키 조절
                                </span>
                                <p className="text-xs text-gray-600">
                                  조절 후: {numberToNote(adjustment.adjustedRange.low)} ~{' '}
                                  {numberToNote(adjustment.adjustedRange.high)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : searchQuery ? (
                <p className="text-center text-gray-500 py-8">
                  검색 결과가 없습니다. 다른 검색어로 시도해보세요.
                </p>
              ) : (
                <p className="text-center text-gray-400 py-8">
                  검색어를 입력해주세요
                </p>
              )}
            </div>

            <button
              onClick={() => setStep('songs')}
              className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              ← 추천 노래로
            </button>
          </div>
        )}

        {/* 푸터 */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>음역대는 대략적인 값이며, 개인차가 있을 수 있습니다.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
