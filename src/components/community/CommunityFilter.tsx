import React from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter } from 'react-icons/fa';

interface CommunityFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTag: string;
  tags: string[];
  onTagSelect: (tag: string) => void;
  onFilterByPopular: () => void;
  onFilterByRecent: () => void;
  currentFilter: 'recent' | 'popular';
}

export const CommunityFilter: React.FC<CommunityFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedTag,
  tags,
  onTagSelect,
  onFilterByPopular,
  onFilterByRecent,
  currentFilter
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search posts..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onFilterByRecent}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              currentFilter === 'recent' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Recent
          </button>
          <button
            onClick={onFilterByPopular}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              currentFilter === 'popular' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Popular
          </button>
        </div>
      </div>
      
      {tags.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <FaFilter className="h-3 w-3 text-gray-400 mr-2" />
            <span className="text-xs font-medium text-gray-500">Filter by tag</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTagSelect('')}
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                selectedTag === '' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </motion.button>
            
            {tags.map((tag) => (
              <motion.button
                key={tag}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTagSelect(tag)}
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  selectedTag === tag 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tag}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};