import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { FiUpload, FiX, FiTag } from 'react-icons/fi';
import { communityService } from '../../services/communityService';
import { CommunityPostFormData } from '../../types/communityTypes';

interface CommunityPostFormProps {
  onSuccess: () => void;
  initialData?: CommunityPostFormData;
  isEditing?: boolean;
  postId?: string;
}

const CommunityPostForm: React.FC<CommunityPostFormProps> = ({ 
  onSuccess, 
  initialData, 
  isEditing = false,
  postId
}) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CommunityPostFormData>({
    defaultValues: initialData || {
      title: '',
      content: '',
      tags: []
    }
  });
  
  const [files, setFiles] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setFiles(prev => [...prev, ...fileArray]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const onSubmit = async (data: CommunityPostFormData) => {
    try {
      setIsSubmitting(true);
      
      // Add files and tags to form data
      const formData: CommunityPostFormData = {
        ...data,
        attachments: files,
        tags
      };
      
      if (isEditing && postId) {
        await communityService.updatePost(postId, formData);
        toast.success('Post updated successfully');
      } else {
        await communityService.createPost(formData);
        toast.success('Post created successfully');
        reset();
        setFiles([]);
        setTags([]);
      }
      
      onSuccess();
    } catch (error) {
      toast.error('Failed to save post. Please try again.');
      console.error('Error saving post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="title"
          type="text"
          {...register('title', { required: 'Title is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          id="content"
          rows={6}
          {...register('content', { required: 'Content is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tags</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, index) => (
            <span 
              key={index} 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
              <button 
                type="button" 
                onClick={() => removeTag(tag)} 
                className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-200 text-blue-500 hover:bg-blue-300"
              >
                <FiX className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag"
            className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <button
            type="button"
            onClick={addTag}
            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100"
          >
            <FiTag className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Attachments</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <span>Upload files</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  multiple
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF, PDF up to 10MB
            </p>
          </div>
        </div>
        
        {files.length > 0 && (
          <ul className="mt-3 divide-y divide-gray-200 border rounded-md">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between py-2 px-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Post' : 'Create Post'}
        </button>
      </div>
    </form>
  );
};

export default CommunityPostForm;