import { useState } from 'react';
import { analyzeTimbre, inferVocalStyle, type TimbreProfile, type VocalStyle } from '../utils/timbreAnalysis';

interface TimbreRecorderProps {
  onAnalysisComplete: (profile: TimbreProfile, style: VocalStyle) => void;
}

export function TimbreRecorder({ onAnalysisComplete }: TimbreRecorderProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // 음색 분석
      const timbreProfile = await analyzeTimbre(audioBuffer);

      // 보컬 스타일 추론
      const vocalStyle = inferVocalStyle(timbreProfile);

      await audioContext.close();

      // 결과 전달
      onAnalysisComplete(timbreProfile, vocalStyle);

      setIsProcessing(false);
    } catch (error) {
      console.error('Error analyzing timbre:', error);
      alert('음성 분석 중 오류가 발생했습니다.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">🎨 음색 분석</h2>

      <div className="space-y-4">
        {/* 파일 업로드 */}
        <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 bg-purple-50">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">
            음성 파일 업로드
          </h3>

          <label className="block">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="hidden"
            />
            <div
              className={`cursor-pointer px-8 py-4 border-2 border-purple-600 bg-white text-purple-600 hover:bg-purple-50 font-semibold rounded-xl transition-colors text-center text-lg ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <span>분석 중...</span>
                </div>
              ) : (
                '📁 노래 파일 선택하기'
              )}
            </div>
          </label>

          <p className="text-sm text-gray-500 mt-3 text-center">
            MP3, WAV, M4A 등 지원 (10초 이상 권장)
          </p>
        </div>

        {/* 녹음 기능 (향후 추가) */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 opacity-60">
          <p className="text-center text-gray-500">
            🎙️ 실시간 녹음 기능은 곧 추가됩니다
          </p>
        </div>

        {/* 안내 */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4">
          <h4 className="font-semibold text-pink-900 mb-2">💡 분석 팁</h4>
          <ul className="text-sm text-pink-800 space-y-1">
            <li>• 반주(MR)가 없는 보컬만 있는 파일이 가장 정확해요</li>
            <li>• 다양한 음정을 포함한 10초 이상의 파일을 권장해요</li>
            <li>• 목소리 특징이 잘 드러나는 부분을 업로드하세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
