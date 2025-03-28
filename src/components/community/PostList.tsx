import React from 'react';
import { motion } from 'framer-motion';
import { PostCard } from './PostCard';
import { CommunityPost } from '../../types/communityTypes';

interface PostListProps {
  posts: CommunityPost[];
  loading: boolean;
}

export const PostList: React.FC<PostListProps> = ({ posts, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h3 className="text-lg font-medium text-gray-500">No posts available</h3>
        <p className="mt-2 text-gray-400">Check back later for community updates</p>
      </div>
    );
  }

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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6"
    >
      {posts.map((post) => (
        <motion.div key={post._id} variants={item}>
          <PostCard post={post} />
        </motion.div>
      ))}
    </motion.div>
  );
};