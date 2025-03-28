import React from 'react';

interface ErrorMessageProps {
  message: string;
  subMessage?: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  subMessage,
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-8 text-center ${className}`}>
      <h3 className="text-lg font-medium text-gray-500">{message}</h3>
      {subMessage && (
        <p className="mt-2 text-gray-400">{subMessage}</p>
      )}
    </div>
  );
};