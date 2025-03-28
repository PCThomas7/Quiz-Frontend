import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaThumbsUp, FaComment, FaPaperclip } from 'react-icons/fa';
import { CommunityPost } from '../../types/communityTypes';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: CommunityPost;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const hasAttachments = post.attachments && post.attachments.length > 0;
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center mb-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
            {post.author?.name?.charAt(0) || 'U'}
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-900">{post.author?.name}</h3>
            <p className="text-xs text-gray-500">
              {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Recently'}
            </p>
          </div>
        </div>
        
        <Link to={`/student/community/${post._id}`}>
          <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-indigo-600 transition-colors">
            {post.title}
          </h2>
        </Link>
        
        <div className="prose prose-sm max-w-none mb-4 line-clamp-3 text-gray-600">
          {post.content}
        </div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex space-x-4">
            <div className="flex items-center text-gray-500">
              <FaThumbsUp className="mr-1 h-4 w-4" />
              <span className="text-sm">{post.likes || 0}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <FaComment className="mr-1 h-4 w-4" />
              <span className="text-sm">{post.comments?.length || 0}</span>
            </div>
          </div>
          
          {hasAttachments && (
            <div className="flex items-center text-gray-500">
              <FaPaperclip className="mr-1 h-4 w-4" />
              <span className="text-sm">{post.attachments.length}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};