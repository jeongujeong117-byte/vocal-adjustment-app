import { useState } from 'react';
import type { TimbreProfile, VocalStyle } from '../utils/timbreAnalysis';

interface TimbreResultProps {
  profile: TimbreProfile;
  style: VocalStyle;
}

// 툴팁 컴포넌트
function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </span>
      {show && (
        <div className="absolute z-10 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl -top-2 left-full ml-2 animate-fadeIn">
          <div className="whitespace-pre-line">{content}</div>
          <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
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

      {/* 고급 음성 분석 지표 (메인) */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">📊 고급 음성 분석</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* 화성비 */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-xl border border-green-200">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs text-gray-600">화성비 (Harmonicity)</p>
              <Tooltip content={`음성의 깨끗함을 측정합니다.

고조파 vs 노이즈 비율로 계산되며:
• 70% 이상: 클래식 성악가처럼 매우 맑은 음성
• 40~70%: 일반적인 깨끗한 음성
• 40% 미만: 허스키하거나 노이즈가 많은 음성

예시:
- 아이유, 태연: 75~85% (매우 깨끗)
- 폴킴, 벤: 65~75% (깨끗)
- 박효신, 김범수: 50~65% (힘있고 깨끗)
- 윤하, 백예린: 55~70% (맑음)`}>
                <span className="text-xs text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold text-green-700">{toPercent(profile.harmonicity)}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {profile.harmonicity > 0.7 ? '매우 깨끗한 음성 (성악/클래식 수준)' :
               profile.harmonicity > 0.5 ? '깨끗한 음성 (발라드/팝 적합)' :
               profile.harmonicity > 0.3 ? '약간 허스키 (R&B/소울 적합)' :
               '노이즈 많음 (개선 필요)'}
            </p>
          </div>

          {/* 스펙트럼 평탄도 */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs text-gray-600">스펙트럼 평탄도</p>
              <Tooltip content={`목소리의 음악성을 측정합니다.

0 = 톤이 뚜렷 (음악적), 1 = 백색 소음:
• 20% 미만: 매우 음악적인 목소리 (노래에 적합)
• 20~40%: 일반적인 목소리
• 40% 이상: 타악기적/랩 스타일

예시:
- 성악가, 발라드 가수: 10~20% (음악적)
- 팝 가수: 20~35% (보통)
- 래퍼: 35~50% (리듬감 있음)

낮을수록 좋습니다!`}>
                <span className="text-xs text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold text-purple-700">{toPercent(profile.spectralFlatness)}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {profile.spectralFlatness < 0.2 ? '매우 음악적 (발라드/팝)' :
               profile.spectralFlatness < 0.35 ? '음악적 (다양한 장르)' :
               profile.spectralFlatness < 0.5 ? '타악기적 (힙합/랩)' :
               '노이즈 많음 (개선 필요)'}
            </p>
          </div>

          {/* 피치 범위 */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs text-gray-600">음역대 너비</p>
              <Tooltip content={`녹음 중 사용한 음역대의 폭입니다.

반음(semitone) 단위:
• 18반음 이상: 1.5옥타브 이상 (매우 넓음)
• 12~18반음: 1~1.5옥타브 (넓음)
• 6~12반음: 0.5~1옥타브 (보통)
• 6반음 미만: 좁음

예시:
- 소향, 박정현: 30+ 반음 (3옥타브)
- 일반 발라드 가수: 15~24 반음
- 성악가: 24~36 반음

넓을수록 다양한 곡 소화 가능!`}>
                <span className="text-xs text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold text-blue-700">{profile.pitchRange.toFixed(1)} st</p>
            <p className="text-xs text-gray-500 mt-1">
              {profile.pitchRange > 24 ? '매우 넓음 (2옥타브+)' :
               profile.pitchRange > 18 ? '넓음 (1.5옥타브+)' :
               profile.pitchRange > 12 ? '보통 (1옥타브+)' :
               profile.pitchRange > 6 ? '좁음 (0.5옥타브)' :
               '매우 좁음 (개선 권장)'}
            </p>
          </div>

          {/* 지터 */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-4 rounded-xl border border-orange-200">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs text-gray-600">지터 (Jitter)</p>
              <Tooltip content={`음정의 미세한 떨림을 측정합니다.

연속된 음의 주기 변동성:
• 1% 미만: 매우 안정적 (테크니컬)
• 1~2%: 안정적 (일반적)
• 2~4%: 표현력 있음 (감정적)
• 4% 이상: 불안정 (개선 필요)

예시:
- 기계적 보컬: 0.3~0.7%
- 안정적 발라드: 0.8~1.5%
- 감정적 R&B: 1.5~3%

적당한 지터는 감정 표현에 좋아요!`}>
                <span className="text-xs text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold text-orange-700">{profile.jitter.toFixed(2)}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {profile.jitter < 0.5 ? '매우 안정적 (테크니컬)' :
               profile.jitter < 1 ? '안정적 (정확함)' :
               profile.jitter < 2.5 ? '표현적 (감정적)' :
               '불안정 (개선 필요)'}
            </p>
          </div>

          {/* 시머 */}
          <div className="bg-gradient-to-br from-pink-50 to-rose-100 p-4 rounded-xl border border-pink-200">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs text-gray-600">시머 (Shimmer)</p>
              <Tooltip content={`음량의 미세한 떨림을 측정합니다.

연속된 음의 진폭 변동성:
• 3% 미만: 매우 안정적
• 3~6%: 안정적
• 6~10%: 감정적 표현
• 10% 이상: 매우 불안정

예시:
- 일렉트로닉 보컬: 1~2%
- 팝 가수: 2~5%
- 발라드/R&B: 4~8%

감정 표현이 풍부하면 높아져요!`}>
                <span className="text-xs text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold text-pink-700">{profile.shimmer.toFixed(2)}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {profile.shimmer < 2 ? '매우 안정적 (댄스/팝)' :
               profile.shimmer < 4 ? '안정적 (팝/록)' :
               profile.shimmer < 7 ? '감정적 (발라드/R&B)' :
               '매우 감정적 (드라마틱)'}
            </p>
          </div>

          {/* 어택 타임 */}
          <div className="bg-gradient-to-br from-red-50 to-orange-100 p-4 rounded-xl border border-red-200">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs text-gray-600">어택 타임</p>
              <Tooltip content={`소리가 시작되는 속도입니다.

최대 에너지까지 걸리는 시간:
• 60ms 미만: 빠름 (록/힙합/댄스)
• 60~100ms: 보통 (팝/발라드)
• 100ms 이상: 느림 (재즈/어쿠스틱)

예시:
- 래퍼: 20~50ms (타악기적)
- 록 가수: 40~70ms (파워풀)
- 발라드 가수: 60~120ms (부드러움)

빠를수록 리드미컬해요!`}>
                <span className="text-xs text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold text-red-700">{profile.attackTime.toFixed(0)}ms</p>
            <p className="text-xs text-gray-500 mt-1">
              {profile.attackTime < 50 ? '매우 빠름 (힙합/댄스)' :
               profile.attackTime < 80 ? '빠름 (록/팝)' :
               profile.attackTime < 120 ? '보통 (발라드)' :
               '느림 (재즈/어쿠스틱)'}
            </p>
          </div>
        </div>

        {/* 비브라토 정보 (있을 경우에만 표시) */}
        {profile.vibratoRate !== null && (
          <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200">
            <div className="flex items-center gap-1 mb-2">
              <p className="font-semibold text-gray-700">🎵 비브라토 검출됨!</p>
              <Tooltip content={`비브라토는 음의 주기적인 떨림입니다.

진동 속도 (Hz):
• 4~5 Hz: 느린 비브라토 (클래식/오페라)
• 5~6.5 Hz: 적당한 비브라토 (발라드/재즈)
• 6.5 Hz 이상: 빠른 비브라토 (팝/R&B)

진동 폭 (반음):
• 0.3~0.5: 미세한 떨림
• 0.5~1.0: 표준 비브라토
• 1.0 이상: 강한 비브라토

예시:
- 성악가: 5~6 Hz, 0.5~1.0 반음
- 발라드 가수: 5~7 Hz, 0.3~0.8 반음`}>
                <span className="text-xs text-gray-400 cursor-help">ⓘ</span>
              </Tooltip>
            </div>
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
              {profile.vibratoRate < 5 ? '느린 비브라토 (클래식/오페라 스타일)' :
               profile.vibratoRate < 6.5 ? '적당한 비브라토 (발라드/재즈 스타일)' :
               '빠른 비브라토 (팝/R&B 스타일)'}
            </p>
          </div>
        )}

        {/* 비브라토 없는 경우 */}
        {profile.vibratoRate === null && (
          <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600">
              ℹ️ 비브라토가 검출되지 않았습니다. 댄스/일렉트로닉/힙합 스타일에 적합하거나, 더 긴 녹음이 필요할 수 있어요.
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
