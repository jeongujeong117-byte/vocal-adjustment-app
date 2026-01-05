import { useState } from 'react';
import type { VocalRange } from '../types';
import { NOTE_NAMES, VOCAL_PRESETS, noteToNumber, numberToNote } from '../types';

interface VocalRangeInputProps {
  onRangeChange: (range: VocalRange) => void;
}

export function VocalRangeInput({ onRangeChange }: VocalRangeInputProps) {
  const [lowNote, setLowNote] = useState('E2');
  const [highNote, setHighNote] = useState('E4');

  const handleUpdate = (newLow: string, newHigh: string) => {
    try {
      const range: VocalRange = {
        low: noteToNumber(newLow),
        high: noteToNumber(newHigh),
      };
      onRangeChange(range);
    } catch (error) {
      console.error('Invalid note format', error);
    }
  };

  const handleLowNoteChange = (value: string) => {
    setLowNote(value);
    handleUpdate(value, highNote);
  };

  const handleHighNoteChange = (value: string) => {
    setHighNote(value);
    handleUpdate(lowNote, value);
  };

  const handlePresetClick = (preset: { low: number; high: number }) => {
    const newLow = numberToNote(preset.low);
    const newHigh = numberToNote(preset.high);
    setLowNote(newLow);
    setHighNote(newHigh);
    handleUpdate(newLow, newHigh);
  };

  // 음 선택 옵션 생성 (C2 ~ C6)
  const generateNoteOptions = (startOctave: number, endOctave: number) => {
    const notes: string[] = [];
    for (let octave = startOctave; octave <= endOctave; octave++) {
      for (const note of NOTE_NAMES) {
        notes.push(`${note}${octave}`);
      }
    }
    return notes;
  };

  const noteOptions = generateNoteOptions(2, 6);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">내 음역대 설정</h2>

      {/* 프리셋 버튼 */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">빠른 선택</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(VOCAL_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePresetClick(preset)}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md text-sm transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* 수동 입력 */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            최저음
          </label>
          <select
            value={lowNote}
            onChange={(e) => handleLowNoteChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {noteOptions.map((note) => (
              <option key={note} value={note}>
                {note}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            최고음
          </label>
          <select
            value={highNote}
            onChange={(e) => handleHighNoteChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {noteOptions.map((note) => (
              <option key={note} value={note}>
                {note}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 현재 선택된 음역대 표시 */}
      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">
          선택된 음역대: <span className="font-bold text-blue-600">{lowNote}</span> ~ <span className="font-bold text-blue-600">{highNote}</span>
        </p>
      </div>
    </div>
  );
}
