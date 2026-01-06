import { useState } from 'react';
import type { VocalRange, KeyAdjustment } from './types';
import { numberToNote } from './types';
import { recommendSongs } from './utils/vocalMatcher';
import { findSimilarArtists, getVocalType } from './utils/artistMatcher';
import type { TimbreProfile, VocalStyle } from './utils/timbreAnalysis';
import { SAMPLE_SONGS } from './data/songs';
import { VoiceRecorder } from './components/VoiceRecorder';
import { VocalRangeVisualizer } from './components/VocalRangeVisualizer';
import { RangeDetails } from './components/RangeDetails';
import { TimbreRecorder } from './components/TimbreRecorder';
import { TimbreResult } from './components/TimbreResult';

type Step = 'start' | 'select-analysis' | 'measuring-range' | 'measuring-timbre' | 'range-result' | 'timbre-result' | 'songs' | 'search';

function App() {
  const [step, setStep] = useState<Step>('start');
  const [userRange, setUserRange] = useState<VocalRange | null>(null);
  const [recommendations, setRecommendations] = useState<KeyAdjustment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [timbreProfile, setTimbreProfile] = useState<TimbreProfile | null>(null);
  const [vocalStyle, setVocalStyle] = useState<VocalStyle | null>(null);

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 animate-gradient">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 헤더 */}
        <header className="text-center mb-12 animate-slideUp">
          <h1 className="text-6xl font-bold gradient-text mb-4">
            🎤 내 음역대 찾기
          </h1>
          <p className="text-gray-700 text-xl font-medium">
            나에게 딱 맞는 노래를 찾아드릴게요! ✨
          </p>
        </header>

        {/* Step 1: 시작 화면 - 분석 타입 선택 */}
        {step === 'start' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl p-10 text-center hover-lift">
              <div className="text-8xl mb-6 animate-bounce-slow">🎵</div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                어떤 분석을 원하시나요?
              </h2>
              <p className="text-gray-600 mb-8 text-xl">
                음역대와 음색, 원하는 분석을 선택하세요
              </p>
            </div>

            {/* 분석 타입 카드 */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* 음역대 분석 */}
              <div
                onClick={() => setStep('measuring-range')}
                className="bg-gradient-to-br from-blue-100 to-indigo-200 border-4 border-blue-400 rounded-3xl p-10 cursor-pointer hover-lift hover:border-blue-500 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 animate-shimmer"></div>
                <div className="relative">
                  <div className="text-7xl mb-4 animate-float">🎼</div>
                  <h3 className="text-3xl font-extrabold text-gray-900 mb-4">
                    음역대 분석
                  </h3>
                  <p className="text-gray-700 mb-5 text-lg font-medium">
                    내 최저음/최고음을 측정하고<br />
                    부를 수 있는 노래를 추천받아요
                  </p>
                  <ul className="text-base text-gray-700 space-y-2 text-left font-medium">
                    <li>✨ 음역대 측정 (예: E2 ~ E4)</li>
                    <li>🎤 비슷한 가수 찾기</li>
                    <li>🎹 노래 키 조절 가이드</li>
                  </ul>
                </div>
              </div>

              {/* 음색 & 장르 분석 */}
              <div
                onClick={() => setStep('measuring-timbre')}
                className="bg-gradient-to-br from-pink-100 to-purple-200 border-4 border-pink-400 rounded-3xl p-10 cursor-pointer hover-lift hover:border-pink-500 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 to-purple-400/10 animate-shimmer"></div>
                <div className="relative">
                  <div className="text-7xl mb-4 animate-float" style={{animationDelay: '0.5s'}}>🎨</div>
                  <h3 className="text-3xl font-extrabold text-gray-900 mb-4">
                    음색 & 장르 분석
                  </h3>
                  <p className="text-gray-700 mb-5 text-lg font-medium">
                    목소리 특징을 분석하고<br />
                    어울리는 장르를 추천받아요
                  </p>
                  <ul className="text-base text-gray-700 space-y-2 text-left font-medium">
                    <li>✨ 음색 프로필 (밝기, 질감)</li>
                    <li>🎵 보컬 스타일 분석</li>
                    <li>🎧 장르 추천 (팝, 발라드 등)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-3 border-yellow-400 rounded-2xl p-8 shadow-lg animate-scale-in">
              <h3 className="font-bold text-yellow-900 mb-4 flex items-center gap-2 text-xl">
                <span className="text-3xl animate-pulse-slow">💡</span>
                측정 팁
              </h3>
              <ul className="space-y-3 text-yellow-900 text-lg">
                <li className="flex items-center gap-2">
                  <span className="text-xl">🔇</span>
                  <span>조용한 곳에서 측정해주세요</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-xl">🎵</span>
                  <span>"아~" 소리를 내면서 자연스럽게 노래해보세요</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-xl">⏱️</span>
                  <span>최소 5~10초 이상 녹음하면 정확해요</span>
                </li>
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
            <TimbreRecorder
              onAnalysisComplete={(profile, style) => {
                setTimbreProfile(profile);
                setVocalStyle(style);
                setStep('timbre-result');
              }}
            />
            <button
              onClick={() => setStep('start')}
              className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              ← 처음으로
            </button>
          </div>
        )}

        {/* Step 3-1: 음색 결과 화면 */}
        {step === 'timbre-result' && timbreProfile && vocalStyle && (
          <div className="space-y-8 animate-fadeIn">
            <TimbreResult profile={timbreProfile} style={vocalStyle} />

            {/* 다음 단계 버튼 */}
            <div className="flex gap-4">
              <button
                onClick={() => setStep('start')}
                className="flex-1 btn-primary"
              >
                다시 분석하기 →
              </button>
            </div>
          </div>
        )}

        {/* Step 3-2: 음역대 결과 화면 */}
        {step === 'range-result' && userRange && (
          <div className="space-y-8 animate-fadeIn">
            {/* 음역대 결과 */}
            <div className="bg-white rounded-3xl shadow-2xl p-12 text-center hover-lift relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-shimmer"></div>
              <div className="text-8xl mb-6 animate-bounce-slow">🎉</div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                당신의 음역대에요!
              </h2>
              <div className="text-6xl font-extrabold gradient-text my-8 neon-glow">
                {numberToNote(userRange.low)} ~ {numberToNote(userRange.high)}
              </div>
              <p className="text-2xl text-gray-700 font-semibold mb-4">{vocalType}</p>
            </div>

            {/* 시각화 */}
            <VocalRangeVisualizer userRange={userRange} detectedRange={null} />

            {/* 유사 가수 */}
            <div className="bg-gradient-to-r from-purple-200 to-pink-200 rounded-3xl shadow-xl p-10">
              <h3 className="text-3xl font-extrabold text-gray-900 mb-6 text-center flex items-center justify-center gap-2">
                <span className="text-4xl animate-pulse-slow">🌟</span>
                이 가수들과 음역대가 비슷해요!
              </h3>
              <div className="grid grid-cols-3 gap-6">
                {similarArtists.map((artist, index) => (
                  <div
                    key={artist.name}
                    className="bg-white rounded-2xl p-6 text-center shadow-lg hover-lift animate-scale-in"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="text-4xl mb-3 animate-float" style={{animationDelay: `${index * 0.3}s`}}>🎤</div>
                    <p className="font-extrabold text-xl text-gray-900 mb-2">{artist.name}</p>
                    <p className="text-base text-purple-600 font-bold">{artist.similarity}% 유사</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 상세 정보 */}
            <RangeDetails range={userRange} title="상세 음역대 분석" />

            {/* 다음 단계 버튼 */}
            <div className="flex gap-6">
              <button
                onClick={() => setStep('songs')}
                className="flex-1 btn-primary text-2xl"
              >
                🎵 추천 노래 보기
              </button>
              <button
                onClick={() => setStep('start')}
                className="px-10 py-5 bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-800 text-xl font-bold rounded-full transition-all duration-300 hover:shadow-lg transform hover:scale-105"
              >
                🔄 다시 측정
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 노래 추천 */}
        {step === 'songs' && userRange && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl p-10">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4 text-center flex items-center justify-center gap-3">
                <span className="text-5xl animate-pulse-slow">🎵</span>
                추천 노래 목록
              </h2>
              <p className="text-gray-700 text-center mb-8 text-xl font-medium">
                당신의 음역대에 딱 맞는 노래들이에요!
              </p>

              <div className="space-y-4">
                {recommendations.slice(0, 10).map((rec, index) => (
                  <div
                    key={rec.song.id}
                    className={`p-6 rounded-2xl border-3 transition-all hover-lift animate-scale-in ${
                      rec.isInRange
                        ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-100'
                        : 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-100'
                    }`}
                    style={{animationDelay: `${index * 0.05}s`}}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-extrabold text-gray-900 mb-1">
                          {rec.song.title}
                        </h3>
                        <p className="text-base text-gray-600 font-medium">{rec.song.artist}</p>
                      </div>
                      <div className="text-right">
                        {rec.isInRange ? (
                          <span className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-extrabold rounded-full shadow-lg">
                            완벽! ✨
                          </span>
                        ) : (
                          <span className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg font-extrabold rounded-full shadow-lg">
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
            <div className="bg-gradient-to-r from-indigo-200 to-purple-200 rounded-3xl shadow-xl p-10 text-center hover-lift">
              <div className="text-5xl mb-4 animate-bounce-slow">🔍</div>
              <h3 className="text-3xl font-extrabold text-gray-900 mb-4">
                부르고 싶은 노래가 따로 있나요?
              </h3>
              <p className="text-gray-700 mb-6 text-lg font-medium">
                원하는 노래를 검색하면 음 조절을 도와드릴게요!
              </p>
              <button
                onClick={() => setStep('search')}
                className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-extrabold rounded-full hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                🔍 노래 검색하기
              </button>
            </div>

            <button
              onClick={() => setStep('range-result')}
              className="w-full px-8 py-4 bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-800 text-lg font-bold rounded-full transition-all duration-300 hover:shadow-lg"
            >
              ← 결과 화면으로
            </button>
          </div>
        )}

        {/* Step 5: 노래 검색 */}
        {step === 'search' && userRange && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl p-10">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center flex items-center justify-center gap-3">
                <span className="text-5xl animate-pulse-slow">🔍</span>
                노래 검색
              </h2>

              <div className="mb-8">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🎤 노래 제목이나 가수 이름을 입력하세요"
                  className="w-full px-8 py-5 text-xl border-4 border-purple-300 rounded-full focus:border-purple-500 focus:outline-none shadow-lg transition-all duration-300 focus:shadow-2xl"
                />
              </div>

              {searchQuery && filteredSongs.length > 0 ? (
                <div className="space-y-5">
                  {filteredSongs.map((song, index) => {
                    const adjustment = recommendSongs(userRange, [song], {
                      maxAdjustment: 12,
                    })[0];

                    return (
                      <div
                        key={song.id}
                        className="p-6 rounded-2xl border-3 border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 hover-lift animate-scale-in"
                        style={{animationDelay: `${index * 0.05}s`}}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-xl font-extrabold text-gray-900 mb-1">
                              {song.title}
                            </h3>
                            <p className="text-base text-gray-600 font-medium mb-2">{song.artist}</p>
                            <p className="text-sm text-gray-500 font-medium">
                              원곡: {numberToNote(song.range.low)} ~ {numberToNote(song.range.high)}
                            </p>
                          </div>
                          <div className="text-right">
                            {adjustment.isInRange ? (
                              <div>
                                <span className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-extrabold rounded-full shadow-lg">
                                  완벽해요! ✨
                                </span>
                              </div>
                            ) : (
                              <div>
                                <span className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-lg font-extrabold rounded-full mb-3 shadow-lg">
                                  {adjustment.adjustment > 0
                                    ? `+${adjustment.adjustment}`
                                    : adjustment.adjustment}
                                  키 조절
                                </span>
                                <p className="text-sm text-gray-700 font-medium">
                                  조절 후: {numberToNote(adjustment.adjustedRange.low)} ~ {numberToNote(adjustment.adjustedRange.high)}
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
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🤔</div>
                  <p className="text-gray-600 text-xl font-medium">
                    검색 결과가 없습니다. 다른 검색어로 시도해보세요.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 animate-pulse-slow">✨</div>
                  <p className="text-gray-500 text-xl font-medium">
                    검색어를 입력해주세요
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setStep('songs')}
              className="w-full px-8 py-4 bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-800 text-lg font-bold rounded-full transition-all duration-300 hover:shadow-lg"
            >
              ← 추천 노래로
            </button>
          </div>
        )}

        {/* 푸터 */}
        <footer className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 shadow-lg">
            <p className="text-gray-700 font-medium text-base">
              💡 음역대는 대략적인 값이며, 개인차가 있을 수 있습니다.
            </p>
            <p className="text-gray-600 text-sm mt-2">
              꾸준한 연습으로 음역대를 넓혀보세요! 🎵
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
