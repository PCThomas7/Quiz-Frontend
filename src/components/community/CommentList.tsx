import React from 'react';
import { motion } from 'framer-motion';
import { Comment } from '../../types/communityTypes';
import { formatDistanceToNow } from 'date-fns';

interface CommentListProps {
  comments: Comment[];
}

export const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4 mt-6"
    >
      <h3 className="font-medium text-gray-900">Comments</h3>
      
      {comments.map((comment) => (
        <motion.div 
          key={comment._id} 
          variants={item}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-center mb-2">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
              {comment.author?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-2">
              <h4 className="font-medium text-gray-900 text-sm">{comment.author?.name}</h4>
              <p className="text-xs text-gray-500">
                {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'Recently'}
              </p>
            </div>
          </div>
          <p className="text-gray-700 text-sm">{comment.content}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};