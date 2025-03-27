import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  // Convert string dates to Date objects for the DatePicker
  const [startDateObj, setStartDateObj] = useState<Date | null>(
    startDate ? new Date(startDate) : null
  );
  const [endDateObj, setEndDateObj] = useState<Date | null>(
    endDate ? new Date(endDate) : null
  );

  const handleScheduleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIsScheduled = e.target.checked;
    onChange(newIsScheduled, startDate, endDate);
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDateObj(date);
    if (date) {
      onChange(isScheduled, date.toISOString(), endDate);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDateObj(date);
    if (date) {
      onChange(isScheduled, startDate, date.toISOString());
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date & Time
            </label>
            <DatePicker
              selected={startDateObj}
              onChange={handleStartDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholderText="Select start date and time"
              minDate={new Date()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date & Time
            </label>
            <DatePicker
              selected={endDateObj}
              onChange={handleEndDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholderText="Select end date and time"
              minDate={startDateObj || new Date()}
            />
          </div>
        </div>
      )}

      {isScheduled && (
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Schedule Information</h4>
          <div className="text-sm text-blue-700">
            {startDateObj ? (
              <p>
                <span className="font-medium">Starts:</span> {startDateObj.toLocaleString()}
              </p>
            ) : (
              <p className="text-yellow-600">Please select a start date and time</p>
            )}
            
            {endDateObj ? (
              <p>
                <span className="font-medium">Ends:</span> {endDateObj.toLocaleString()}
              </p>
            ) : (
              <p className="text-yellow-600">Please select an end date and time</p>
            )}
            
            {startDateObj && endDateObj && (
              <p className="mt-2">
                <span className="font-medium">Duration:</span> {calculateDuration(startDateObj, endDateObj)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to calculate duration between two dates
function calculateDuration(start: Date, end: Date): string {
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  let duration = '';
  if (diffDays > 0) {
    duration += `${diffDays} day${diffDays !== 1 ? 's' : ''} `;
  }
  if (diffHours > 0) {
    duration += `${diffHours} hour${diffHours !== 1 ? 's' : ''} `;
  }
  if (diffMinutes > 0) {
    duration += `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
  }
  
  return duration.trim() || 'Less than a minute';
}