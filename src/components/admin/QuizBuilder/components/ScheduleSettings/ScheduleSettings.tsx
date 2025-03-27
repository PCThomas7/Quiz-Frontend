import React, { useState } from 'react';

interface ScheduleSettingsProps {
  isScheduled: boolean;
  startDate: string;
  endDate: string;
  onChange: (isScheduled: boolean, startDate?: string, endDate?: string) => void;
}

export const ScheduleSettings: React.FC<ScheduleSettingsProps> = ({
  isScheduled,
  startDate,
  endDate,
  onChange
}) => {
  const formatDateTimeForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDThh:mm
  };

  const handleScheduleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked, startDate, endDate);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(isScheduled, e.target.value, endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(isScheduled, startDate, e.target.value);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Quiz Schedule</h3>
      
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="schedule-toggle"
          checked={isScheduled}
          onChange={handleScheduleToggle}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="schedule-toggle" className="ml-2 block text-sm font-medium text-gray-700">
          Schedule this quiz
        </label>
      </div>
      
      {isScheduled && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={formatDateTimeForInput(startDate)}
              onChange={handleStartDateChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              value={formatDateTimeForInput(endDate)}
              onChange={handleEndDateChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};