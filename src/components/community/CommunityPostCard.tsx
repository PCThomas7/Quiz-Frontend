import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiThumbsUp, FiMessageSquare, FiMoreVertical, FiDownload } from 'react-icons/fi';
import { format } from 'date-fns';
import { CommunityPost } from '../../types/communityTypes';
import { communityService } from '../../services/communityService';
import { toast } from 'react-hot-toast';

interface CommunityPostCardProps {
  post: CommunityPost;
  onDelete: (postId: string) => void;
  isDetailView?: boolean;
}

const CommunityPostCard: React.FC<CommunityPostCardProps> = ({ 
  post, 
  onDelete,
  isDetailView = false 
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleLike = async () => {
    try {
      if (post._id) {
        await communityService.likePost(post._id);
        setLikes(prev => prev + 1);
      }
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post._id) return;
    
    try {
      setIsSubmittingComment(true);
      const response = await communityService.addComment(post._id, commentText);
      setComments(prev => [...prev, response]);
      setCommentText('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post._id) return;
    
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await communityService.deletePost(post._id);
        onDelete(post._id);
        toast.success('Post deleted successfully');
      } catch (error) {
        toast.error('Failed to delete post');
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isDetailView ? post.title : (
                <Link to={`/admin/community/${post._id}`} className="hover:text-blue-600">
                  {post.title}
                </Link>
              )}
            </h3>
            <p className="text-sm text-gray-500">
              Posted by {post.author?.name} on {formatDate(post.createdAt)}
            </p>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <FiMoreVertical className="h-5 w-5 text-gray-500" />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <Link 
                    to={`/admin/community/edit/${post._id}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleDeletePost}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {post.tags.map((tag, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-3">
          <p className={`text-gray-700 ${isDetailView ? '' : 'line-clamp-3'}`}>
            {post.content}
          </p>
          
          {!isDetailView && post.content.length > 300 && (
            <Link to={`/admin/community/${post._id}`} className="text-blue-600 text-sm hover:underline">
              Read more
            </Link>
          )}
        </div>
        
        {post.attachments && post.attachments.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700">Attachments:</h4>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {post.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center p-2 border rounded-md">
                  <span className="text-sm truncate flex-1">{attachment.name}</span>
                  <a 
                    href={attachment.url} 
                    download
                    className="ml-2 p-1 text-blue-600 hover:text-blue-800"
                  >
                    <FiDownload className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-4 flex items-center space-x-4">
          <button 
            onClick={handleLike}
            className="flex items-center text-gray-500 hover:text-blue-600"
          >
            <FiThumbsUp className="h-4 w-4 mr-1" />
            <span>{likes}</span>
          </button>
          
          <div className="flex items-center text-gray-500">
            <FiMessageSquare className="h-4 w-4 mr-1" />
            <span>{comments.length}</span>
          </div>
        </div>
      </div>
      
      {isDetailView && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Comments</h4>
          
          {comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment._id} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{comment.author.name}</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No comments yet.</p>
          )}
          
          <form onSubmit={handleAddComment} className="mt-4">
            <div className="flex">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmittingComment}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-transparent rounded-r-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmittingComment ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CommunityPostCard;