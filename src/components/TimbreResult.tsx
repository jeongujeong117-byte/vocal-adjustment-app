import type { TimbreProfile, VocalStyle } from '../utils/timbreAnalysis';

interface TimbreResultProps {
  profile: TimbreProfile;
  style: VocalStyle;
}

export function TimbreResult({ profile, style }: TimbreResultProps) {
  // 점수를 백분율로 변환
  const toPercent = (value: number) => Math.round(value * 100);

  // 음색 타입 이모지
  const timbreEmoji = {
    bright: '☀️',
    warm: '🔥',
    dark: '🌙',
    neutral: '⚖️',
  };

  // 질감 타입 이모지
  const textureEmoji = {
    clear: '💎',
    smooth: '✨',
    rough: '⚡',
    breathy: '💨',
  };

  return (
    <div className="space-y-6">
      {/* 메인 결과 */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-100 rounded-2xl shadow-xl p-8 text-center border-2 border-pink-300">
        <div className="text-6xl mb-4">{timbreEmoji[style.timbreType]}</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          당신의 음색 프로필!
        </h2>
        <p className="text-xl text-gray-700 mb-4">{style.description}</p>
        <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md">
          <span className="text-3xl">{textureEmoji[style.textureType]}</span>
          <span className="text-lg font-semibold text-gray-800">
            {style.textureType === 'clear' && '맑고 깨끗한'}
            {style.textureType === 'smooth' && '부드럽고 매끄러운'}
            {style.textureType === 'rough' && '거칠고 강렬한'}
            {style.textureType === 'breathy' && '숨소리 섞인'}
            {' '}질감
          </span>
        </div>
      </div>

      {/* 음색 특징 점수 */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">🎨 음색 특징</h3>

        <div className="space-y-4">
          {/* 밝기 */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-700">밝기 (Brightness)</span>
              <span className="text-purple-600 font-bold">{toPercent(profile.brightness)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all"
                style={{ width: `${toPercent(profile.brightness)}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {profile.brightness > 0.7 ? '매우 밝고 투명한 음색' : profile.brightness > 0.4 ? '중간 밝기' : '어둡고 깊은 음색'}
            </p>
          </div>

          {/* 거칠기 */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-700">거칠기 (Roughness)</span>
              <span className="text-purple-600 font-bold">{toPercent(profile.roughness)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-red-400 to-pink-500 h-3 rounded-full transition-all"
                style={{ width: `${toPercent(profile.roughness)}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {profile.roughness > 0.6 ? '거친 질감, 록/힙합 스타일' : profile.roughness > 0.3 ? '적당한 질감' : '부드럽고 매끄러운'}
            </p>
          </div>

          {/* 깨끗함 */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-700">깨끗함 (Clarity)</span>
              <span className="text-purple-600 font-bold">{toPercent(profile.clarity)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-400 to-cyan-500 h-3 rounded-full transition-all"
                style={{ width: `${toPercent(profile.clarity)}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {profile.clarity > 0.7 ? '매우 맑고 깨끗한' : profile.clarity > 0.4 ? '적당히 깨끗한' : '허스키하거나 거친'}
            </p>
          </div>

          {/* 풍부함 */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-700">풍부함 (Richness)</span>
              <span className="text-purple-600 font-bold">{toPercent(profile.richness)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-amber-400 to-orange-600 h-3 rounded-full transition-all"
                style={{ width: `${toPercent(profile.richness)}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {profile.richness > 0.6 ? '풍부하고 따뜻한 배음' : profile.richness > 0.3 ? '적당한 풍부함' : '얇고 날카로운'}
            </p>
          </div>
        </div>
      </div>

      {/* 장르 추천 */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">🎵 추천 장르</h3>

        {style.suggestedGenres.length > 0 ? (
          <div className="space-y-3">
            {style.suggestedGenres.map((genre, index) => (
              <div
                key={genre.genre}
                className={`p-4 rounded-xl border-2 transition-all ${
                  index === 0
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-bold text-gray-800">
                    {index === 0 && '👑 '}
                    {genre.genre}
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${genre.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-purple-600">
                      {Math.round(genre.confidence * 100)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{genre.reason}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            장르 추천 정보가 없습니다
          </p>
        )}
      </div>

      {/* 기술적 상세 정보 */}
      <details className="bg-gray-50 rounded-lg p-4">
        <summary className="cursor-pointer font-semibold text-gray-700">
          🔬 기술적 상세 정보
        </summary>
        <div className="mt-3 space-y-2 text-sm text-gray-600">
          <p>• Spectral Centroid: {profile.spectralCentroid.toFixed(1)} Hz</p>
          <p>• Zero Crossing Rate: {profile.zeroCrossingRate.toFixed(4)}</p>
          <p>• Spectral Rolloff: {profile.spectralRolloff.toFixed(1)} Hz</p>
          <p>• Dynamic Range: {profile.dynamicRange.toFixed(1)} dB</p>
          <p>• Average Energy (RMS): {profile.averageEnergy.toFixed(4)}</p>
        </div>
      </details>
    </div>
  );
}
