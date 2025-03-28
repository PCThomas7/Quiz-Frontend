import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CommentFormProps {
  onSubmit: (comment: string) => Promise<void>;
}

export const CommentForm: React.FC<CommentFormProps> = ({ onSubmit }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(comment);
      setComment('');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="mb-3">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
          Add a comment
        </label>
        <textarea
          id="comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Share your thoughts..."
          disabled={isSubmitting}
        />
      </div>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isSubmitting || !comment.trim()}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isSubmitting ? 'Posting...' : 'Post Comment'}
      </motion.button>
    </form>
  );
};