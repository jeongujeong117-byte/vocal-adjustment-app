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

  // 발성 기법 이모지
  const techniqueEmoji = {
    powerful: '💪',
    soft: '🌸',
    controlled: '🎯',
    expressive: '🎭',
  };

  // 표현력 이모지
  const expressivenessEmoji = {
    dramatic: '🎪',
    stable: '🏛️',
    emotional: '💝',
    technical: '⚙️',
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

      {/* 상세 분석 결과 */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl shadow-xl p-6 border-2 border-indigo-300">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">🎤 상세 음성 분석</h3>

        <div className="space-y-3">
          <div className="bg-white rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-600 mb-1">목소리 특징</p>
            <p className="text-lg font-bold text-indigo-700">{style.detailedAnalysis.voiceQuality}</p>
          </div>

          <div className="bg-white rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-600 mb-1">강점 영역</p>
            <p className="text-lg font-bold text-indigo-700">{style.detailedAnalysis.strengthArea}</p>
          </div>

          <div className="bg-white rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-600 mb-1">추천 스타일</p>
            <p className="text-lg font-bold text-indigo-700">{style.detailedAnalysis.recommendedStyle}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 text-center">
              <span className="text-3xl">{techniqueEmoji[style.vocalTechnique]}</span>
              <p className="text-xs text-gray-600 mt-2">발성 기법</p>
              <p className="font-bold text-gray-800">
                {style.vocalTechnique === 'powerful' && '강렬한'}
                {style.vocalTechnique === 'soft' && '부드러운'}
                {style.vocalTechnique === 'controlled' && '절제된'}
                {style.vocalTechnique === 'expressive' && '표현적인'}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 text-center">
              <span className="text-3xl">{expressivenessEmoji[style.expressiveness]}</span>
              <p className="text-xs text-gray-600 mt-2">표현 방식</p>
              <p className="font-bold text-gray-800">
                {style.expressiveness === 'dramatic' && '드라마틱'}
                {style.expressiveness === 'stable' && '안정적'}
                {style.expressiveness === 'emotional' && '감성적'}
                {style.expressiveness === 'technical' && '테크니컬'}
              </p>
            </div>
          </div>
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

      {/* 고급 음성 분석 지표 */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">📊 고급 음성 분석</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* 화성비 */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-xl border border-green-200">
            <p className="text-xs text-gray-600 mb-1">화성비 (Harmonicity)</p>
            <p className="text-2xl font-bold text-green-700">{toPercent(profile.harmonicity)}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {profile.harmonicity > 0.7 ? '매우 깨끗한 음성' : profile.harmonicity > 0.4 ? '보통' : '노이즈 많음'}
            </p>
          </div>

          {/* 스펙트럼 평탄도 */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-4 rounded-xl border border-purple-200">
            <p className="text-xs text-gray-600 mb-1">스펙트럼 평탄도</p>
            <p className="text-2xl font-bold text-purple-700">{toPercent(profile.spectralFlatness)}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {profile.spectralFlatness < 0.2 ? '음악적' : profile.spectralFlatness < 0.4 ? '중간' : '노이즈 많음'}
            </p>
          </div>

          {/* 피치 범위 */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-4 rounded-xl border border-blue-200">
            <p className="text-xs text-gray-600 mb-1">음역대 너비</p>
            <p className="text-2xl font-bold text-blue-700">{profile.pitchRange.toFixed(1)} st</p>
            <p className="text-xs text-gray-500 mt-1">
              {profile.pitchRange > 18 ? '매우 넓음' : profile.pitchRange > 12 ? '넓음' : '좁음'}
            </p>
          </div>

          {/* 지터 */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-4 rounded-xl border border-orange-200">
            <p className="text-xs text-gray-600 mb-1">지터 (Jitter)</p>
            <p className="text-2xl font-bold text-orange-700">{profile.jitter.toFixed(2)}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {profile.jitter < 1 ? '매우 안정적' : profile.jitter < 2 ? '안정적' : '불안정'}
            </p>
          </div>

          {/* 시머 */}
          <div className="bg-gradient-to-br from-pink-50 to-rose-100 p-4 rounded-xl border border-pink-200">
            <p className="text-xs text-gray-600 mb-1">시머 (Shimmer)</p>
            <p className="text-2xl font-bold text-pink-700">{profile.shimmer.toFixed(2)}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {profile.shimmer < 3 ? '매우 안정적' : profile.shimmer < 6 ? '안정적' : '불안정'}
            </p>
          </div>

          {/* 어택 타임 */}
          <div className="bg-gradient-to-br from-red-50 to-orange-100 p-4 rounded-xl border border-red-200">
            <p className="text-xs text-gray-600 mb-1">어택 타임</p>
            <p className="text-2xl font-bold text-red-700">{profile.attackTime.toFixed(0)}ms</p>
            <p className="text-xs text-gray-500 mt-1">
              {profile.attackTime < 60 ? '빠름' : profile.attackTime < 100 ? '보통' : '느림'}
            </p>
          </div>
        </div>

        {/* 비브라토 정보 (있을 경우에만 표시) */}
        {profile.vibratoRate !== null && (
          <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200">
            <p className="font-semibold text-gray-700 mb-2">🎵 비브라토 검출됨!</p>
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-gray-600">진동 속도</p>
                <p className="text-lg font-bold text-indigo-700">{profile.vibratoRate.toFixed(2)} Hz</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">진동 폭</p>
                <p className="text-lg font-bold text-indigo-700">{profile.vibratoExtent.toFixed(2)} 반음</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {profile.vibratoRate < 5 ? '느린 비브라토 (오페라 스타일)' :
               profile.vibratoRate < 6.5 ? '적당한 비브라토 (발라드 스타일)' :
               '빠른 비브라토 (팝 스타일)'}
            </p>
          </div>
        )}
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
          🔬 기술적 상세 정보 (Raw Data)
        </summary>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
          <div>
            <p className="font-semibold text-gray-700 mb-2">기본 특성</p>
            <p>• Spectral Centroid: {profile.spectralCentroid.toFixed(1)} Hz</p>
            <p>• Zero Crossing Rate: {profile.zeroCrossingRate.toFixed(4)}</p>
            <p>• Spectral Rolloff: {profile.spectralRolloff.toFixed(1)} Hz</p>
            <p>• Dynamic Range: {profile.dynamicRange.toFixed(1)} dB</p>
            <p>• Average Energy (RMS): {profile.averageEnergy.toFixed(4)}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-2">고급 특성</p>
            <p>• HNR (Harmonics-to-Noise Ratio): {profile.hnr.toFixed(2)} dB</p>
            <p>• Harmonicity: {profile.harmonicity.toFixed(3)}</p>
            <p>• Spectral Flatness: {profile.spectralFlatness.toFixed(3)}</p>
            <p>• Jitter: {profile.jitter.toFixed(3)}%</p>
            <p>• Shimmer: {profile.shimmer.toFixed(3)}%</p>
            <p>• Attack Time: {profile.attackTime.toFixed(1)} ms</p>
            <p>• Pitch Range: {profile.pitchRange.toFixed(2)} semitones</p>
            {profile.vibratoRate !== null && (
              <>
                <p>• Vibrato Rate: {profile.vibratoRate.toFixed(2)} Hz</p>
                <p>• Vibrato Extent: {profile.vibratoExtent.toFixed(2)} semitones</p>
              </>
            )}
          </div>
        </div>
      </details>
    </div>
  );
}
