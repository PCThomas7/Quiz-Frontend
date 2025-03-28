import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaThumbsUp, FaComment, FaPaperclip, FaArrowLeft } from 'react-icons/fa';
import { CommunityPost } from '../../types/communityTypes';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { CommentList } from './CommentList';
import { CommentForm } from './CommentForm';
import { communityService } from '../../services/communityService';

interface PostDetailProps {
  post: CommunityPost;
  onLike: () => void;
  onAddComment: (comment: string) => Promise<void>;
}

export const PostDetail: React.FC<PostDetailProps> = ({ post, onLike, onAddComment }) => {
  const navigate = useNavigate();
  const [isLiking, setIsLiking] = useState(false);
  
  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      await onLike();
    } finally {
      setIsLiking(false);
    }
  };
  
  const handleBack = () => {
    navigate('/student/community');
  };
  
  const handleOpenAttachment = (url: string) => {
    window.open(url, '_blank');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <button 
          onClick={handleBack}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <FaArrowLeft className="mr-2" />
          Back to Community
        </button>
        
        <div className="flex items-center mb-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
            {post.author?.name?.charAt(0) || 'U'}
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-900">{post.author?.name}</h3>
            <p className="text-xs text-gray-500">
              {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Recently'}
            </p>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
        
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
        
        <div className="prose prose-indigo max-w-none mb-6">
          {post.content}
        </div>
        
        {post.attachments && post.attachments.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Attachments</h3>
            <div className="space-y-2">
              {post.attachments.map((attachment, index) => (
                <div 
                  key={index}
                  onClick={() => handleOpenAttachment(attachment.url)}
                  className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                >
                  <FaPaperclip className="text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{attachment.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-4 py-3 border-t border-b border-gray-100 mb-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            disabled={isLiking}
            className="flex items-center px-4 py-2 rounded-md hover:bg-gray-50"
          >
            <FaThumbsUp className={`mr-2 ${post.likedByCurrentUser ? 'text-indigo-600' : 'text-gray-400'}`} />
            <span className={`${post.likedByCurrentUser ? 'text-indigo-600' : 'text-gray-600'}`}>
              {post.likes || 0} Likes
            </span>
          </motion.button>
          
          <div className="flex items-center text-gray-600">
            <FaComment className="mr-2 text-gray-400" />
            <span>{post.comments?.length || 0} Comments</span>
          </div>
        </div>
        
        <CommentForm onSubmit={onAddComment} />
        
        {post.comments && post.comments.length > 0 && (
          <CommentList comments={post.comments} />
        )}
      </div>
    </div>
  );
};