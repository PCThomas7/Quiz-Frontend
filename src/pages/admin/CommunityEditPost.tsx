import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import CommunityPostForm from '../../components/community/CommunityPostForm';
import { communityService } from '../../services/communityService';
import { CommunityPostFormData } from '../../types/communityTypes';
import { toast } from 'react-hot-toast';

const CommunityEditPost: React.FC = () => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const [loading, setLoading] = useState(true);
  const [postData, setPostData] = useState<CommunityPostFormData | null>(null);

  useEffect(() => {
    if (postId) {
      fetchPostData(postId);
    }
  }, [postId]);

  const fetchPostData = async (id: string) => {
    try {
      setLoading(true);
      const post = await communityService.getPost(id);
      
      // Transform post data to form data format
      setPostData({
        title: post.title,
        content: post.content,
        tags: post.tags || []
      });
    } catch (error) {
      toast.error('Failed to load post data');
      navigate('/admin/community');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    navigate(`/admin/community/${postId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate(`/admin/community/${postId}`)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FiArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Edit Post</h1>
      </div>

      {postData && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <CommunityPostForm 
            onSuccess={handleSuccess} 
            initialData={postData} 
            isEditing={true}
            postId={postId}
          />
        </div>
      )}
    </div>
  );
};

export default CommunityEditPost;