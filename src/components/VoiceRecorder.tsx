import { useState, useRef, useEffect } from 'react';
import type { VocalRange } from '../types';
import { numberToNote } from '../types';
import {
  RealTimePitchDetector,
  detectPitch,
  extractVocalRange,
  type PitchDetectionResult,
} from '../utils/pitchDetection';

interface VoiceRecorderProps {
  onRangeDetected: (range: VocalRange) => void;
}

export function VoiceRecorder({ onRangeDetected }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPitch, setCurrentPitch] = useState<PitchDetectionResult | null>(null);
  const [detectedNotes, setDetectedNotes] = useState<number[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);

  const pitchDetectorRef = useRef<RealTimePitchDetector | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pitchDetectorRef.current) {
        pitchDetectorRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setDetectedNotes([]);
      setRecordingTime(0);
      audioChunksRef.current = [];

      // 타이머 시작
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // 미디어 스트림 얻기
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // MediaRecorder 설정
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();

      // 실시간 피치 검출 시작
      pitchDetectorRef.current = new RealTimePitchDetector();
      await pitchDetectorRef.current.start((result) => {
        setCurrentPitch(result);
        setDetectedNotes((prev) => [...prev, result.note]);
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('마이크 접근 권한이 필요합니다.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (pitchDetectorRef.current) {
      pitchDetectorRef.current.stop();
      pitchDetectorRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }

    // 측정된 음역대 계산
    if (detectedNotes.length > 0) {
      const low = Math.min(...detectedNotes);
      const high = Math.max(...detectedNotes);
      onRangeDetected({ low, high });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // 피치 검출
      const results = detectPitch(audioBuffer);

      if (results.length === 0) {
        alert('음성을 감지할 수 없습니다. 노래나 목소리가 포함된 파일을 업로드해주세요.');
        setIsProcessing(false);
        return;
      }

      // 음역대 추출
      const { low, high } = extractVocalRange(results);
      onRangeDetected({ low, high });

      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing audio file:', error);
      alert('오디오 파일 처리 중 오류가 발생했습니다.');
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">🎙️ 음역대 측정</h2>

      <div className="space-y-4">
        {/* 실시간 녹음 */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">실시간 녹음</h3>

          {!isRecording ? (
            <button
              onClick={startRecording}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              녹음 시작
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                <span className="text-lg font-mono text-gray-700">
                  {formatTime(recordingTime)}
                </span>
              </div>

              {currentPitch && (
                <div className="bg-blue-50 p-3 rounded text-center">
                  <p className="text-sm text-gray-600">현재 음정</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {numberToNote(currentPitch.note)} ({currentPitch.frequency.toFixed(1)}Hz)
                  </p>
                </div>
              )}

              <button
                onClick={stopRecording}
                className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition-colors"
              >
                녹음 중지 및 분석
              </button>

              <p className="text-xs text-gray-500 text-center">
                최소 5초 이상 다양한 음정으로 노래해보세요
              </p>
            </div>
          )}
        </div>

        {/* 파일 업로드 */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">음성 파일 업로드</h3>

          <label className="block">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="hidden"
            />
            <div
              className={`cursor-pointer px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-colors text-center ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? '처리 중...' : '📁 오디오 파일 선택'}
            </div>
          </label>

          <p className="text-xs text-gray-500 mt-2 text-center">
            MP3, WAV, M4A 등 지원
          </p>
        </div>

        {/* 안내 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">💡 측정 팁</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 가장 낮은 음부터 가장 높은 음까지 천천히 불러보세요</li>
            <li>• "아~" 소리를 내면서 음정을 올리고 내려보세요</li>
            <li>• 조용한 환경에서 측정하면 더 정확합니다</li>
            <li>• 최소 5초 이상 녹음하는 것을 권장합니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
