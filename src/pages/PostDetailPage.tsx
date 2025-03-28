import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PostDetail } from '../components/community/PostDetail';
import { CommunityPost } from '../types/communityTypes';
import { communityService } from '../services/communityService';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (postId) {
      fetchPost(postId);
    }
  }, [postId]);
  
  const fetchPost = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPost = await communityService.getPost(id);
      setPost(fetchedPost);
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load the post. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLike = async () => {
    if (!postId) return;
    
    try {
      const response = await communityService.likePost(postId);
      setPost(prev => {
        if (!prev) return null;
        return {
          ...prev,
          likes: response.likes,
          likedByCurrentUser: true
        };
      });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };
  
  const handleAddComment = async (content: string) => {
    if (!postId) return;
    
    try {
      const newComment = await communityService.addComment(postId, content);
      setPost(prev => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [...(prev.comments || []), newComment]
        };
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  
  if (loading) {
    return <LoadingSpinner size="large" className="py-12" />;
  }
  
  if (error || !post) {
    return (
      <ErrorMessage 
        message={error || 'Post not found'} 
        subMessage="Please try again later or go back to the community page" 
      />
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <PostDetail 
        post={post} 
        onLike={handleLike} 
        onAddComment={handleAddComment} 
      />
    </motion.div>
  );
}