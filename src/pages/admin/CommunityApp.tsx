import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import { communityService } from '../../services/communityService';
import { CommunityPost } from '../../types/communityTypes';
import CommunityPostCard from '../../components/community/CommunityPostCard';
import { toast } from 'react-hot-toast';

const CommunityApp: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await communityService.getPosts();
      setPosts(data);
      
      // Extract all unique tags
      const tags = data.reduce((acc: string[], post: CommunityPost) => {
        if (post.tags) {
          post.tags.forEach(tag => {
            if (!acc.includes(tag)) {
              acc.push(tag);
            }
          });
        }
        return acc;
      }, []);
      
      setAllTags(tags);
    } catch (error) {
      toast.error('Failed to load community posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag ? post.tags?.includes(selectedTag) : true;
    
    return matchesSearch && matchesTag;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Community</h1>
        <Link
          to="/admin/community/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          New Post
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search posts..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div className="relative inline-block text-left">
            <div>
              <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500"
                id="filter-menu"
                aria-expanded="true"
                aria-haspopup="true"
              >
                <FiFilter className="mr-2 h-5 w-5" />
                {selectedTag || 'Filter by tag'}
              </button>
            </div>
            
            {/* Dropdown menu */}
            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="filter-menu">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`block px-4 py-2 text-sm w-full text-left ${!selectedTag ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`}
                  role="menuitem"
                >
                  All Tags
                </button>
                
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`block px-4 py-2 text-sm w-full text-left ${selectedTag === tag ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`}
                    role="menuitem"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <CommunityPostCard 
              key={post._id} 
              post={post} 
              onDelete={handleDeletePost} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No posts found.</p>
          {searchTerm || selectedTag ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTag(null);
              }}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          ) : (
            <Link
              to="/admin/community/create"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Create your first post
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityApp;