import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiEdit } from 'react-icons/fi';
import { communityService } from '../../services/communityService';
import { CommunityPost } from '../../types/communityTypes';
import CommunityPostCard from '../../components/community/CommunityPostCard';
import { toast } from 'react-hot-toast';

const CommunityPostDetail: React.FC = () => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<CommunityPost | null>(null);

  useEffect(() => {
    if (postId) {
      fetchPostData(postId);
    }
  }, [postId]);

  const fetchPostData = async (id: string) => {
    try {
      setLoading(true);
      const postData = await communityService.getPost(id);
      setPost(postData);
    } catch (error) {
      toast.error('Failed to load post');
      navigate('/admin/community');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = () => {
    navigate('/admin/community');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Post not found.</p>
        <button
          onClick={() => navigate('/admin/community')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Back to Community
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/admin/community')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <FiArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Post Details</h1>
        </div>
        
        <button
          onClick={() => navigate(`/admin/community/edit/${postId}`)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiEdit className="mr-2 h-4 w-4" />
          Edit Post
        </button>
      </div>

      <CommunityPostCard 
        post={post} 
        onDelete={handleDeletePost}
        isDetailView={true}
      />
    </div>
  );
};

export default CommunityPostDetail;