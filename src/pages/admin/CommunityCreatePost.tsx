import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import CommunityPostForm from '../../components/community/CommunityPostForm';

const CommunityCreatePost: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/admin/community');
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate('/admin/community')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FiArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Create New Post</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <CommunityPostForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default CommunityCreatePost;