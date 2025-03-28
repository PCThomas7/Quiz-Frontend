import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PostList } from '../components/community/PostList';
import { CommunityFilter } from '../components/community/CommunityFilter';
import { CommunityPost } from '../types/communityTypes';
import { communityService } from '../services/communityService';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [currentFilter, setCurrentFilter] = useState<'recent' | 'popular'>('recent');
  
  // Extract unique tags from all posts
  const tags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  }, [posts]);
  
  useEffect(() => {
    fetchPosts();
  }, [currentFilter]);
  
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      let fetchedPosts;
      
      if (currentFilter === 'popular') {
        fetchedPosts = await communityService.getPopularPosts();
      } else {
        fetchedPosts = await communityService.getPosts();
      }
      
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load community posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
  };
  
  const handleFilterByPopular = () => {
    if (currentFilter !== 'popular') {
      setCurrentFilter('popular');
    }
  };
  
  const handleFilterByRecent = () => {
    if (currentFilter !== 'recent') {
      setCurrentFilter('recent');
    }
  };
  
  // Filter posts based on search query and selected tag
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = searchQuery === '' || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTag = selectedTag === '' || 
        (post.tags && post.tags.includes(selectedTag));
      
      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, selectedTag]);
  
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Community</h1>
          <p className="text-gray-600">Explore posts and discussions from the community</p>
        </div>
        
        <CommunityFilter
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedTag={selectedTag}
          tags={tags}
          onTagSelect={handleTagSelect}
          onFilterByPopular={handleFilterByPopular}
          onFilterByRecent={handleFilterByRecent}
          currentFilter={currentFilter}
        />
        
        {loading ? (
          <LoadingSpinner size="large" className="py-12" />
        ) : error ? (
          <ErrorMessage 
            message={error} 
            subMessage="Please try refreshing the page or check back later." 
          />
        ) : (
          <PostList posts={filteredPosts} loading={false} />
        )}
      </motion.div>
    </div>
  );
}