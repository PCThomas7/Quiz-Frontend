import React from 'react';

interface SectionHeaderProps {
  section: QuizSection;
  onDelete: () => void;
  onChange: (section: QuizSection) => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ section, onDelete, onChange }) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex-1 space-y-4">
        <input
          type="text"
          value={section.name}
          onChange={(e) => onChange({ ...section, name: e.target.value })}
          placeholder="Section Name"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <button
        onClick={onDelete}
        className="ml-4 text-red-600 hover:text-red-800"
      >
        Delete Section
      </button>
    </div>
  );
};