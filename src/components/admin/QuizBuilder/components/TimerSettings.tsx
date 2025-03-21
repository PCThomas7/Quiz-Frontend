import React, { useState } from 'react';

interface TimerSettingsProps {
  section: QuizSection;
  onChange: (section: QuizSection) => void;
}

export const TimerSettings: React.FC<TimerSettingsProps> = ({ section, onChange }) => {
  const [duration, setDuration] = useState(section.duration || 0);

  return (
    <div>
      <div className="flex items-center mb-2">
        <input
          type="checkbox"
          id={`timer-${section.id}`}
          checked={section.timerEnabled}
          onChange={(e) => {
            const timerEnabled = e.target.checked;
            const newDuration = timerEnabled ? duration || 60 : 0;
            setDuration(newDuration);
            onChange({
              ...section,
              timerEnabled,
              duration: timerEnabled ? newDuration : undefined,
            });
          }}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor={`timer-${section.id}`} className="ml-2 block text-sm font-medium text-gray-700">
          Enable Section Timing
        </label>
      </div>
      {section.timerEnabled && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => {
              const newDuration = parseInt(e.target.value) || 0;
              setDuration(newDuration);
              onChange({ ...section, duration: newDuration });
            }}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}
    </div>
  );
};