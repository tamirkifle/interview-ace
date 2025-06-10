import { useQuery } from '@apollo/client';
import { Plus } from 'lucide-react';
import { GET_STORIES } from '../graphql/queries';
import { Story } from '../types';
import { LoadingSpinner, ErrorMessage, SkeletonLoader } from '../components/ui';
import { StoryCard } from '../components/story/StoryCard';
import { useState } from 'react';
import { CreateStoryModal } from '../components/story/CreateStoryModal';

export const Stories = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data, loading, error, refetch } = useQuery(GET_STORIES);

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Stories</h1>
          <button
            disabled
            className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Story
          </button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <SkeletonLoader key={i} variant="card" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Stories</h1>
        </div>
        <ErrorMessage
          title="Failed to load stories"
          message={error.message}
          onRetry={() => refetch()}
          className="max-w-md mx-auto"
        />
      </div>
    );
  }

  const stories = data?.stories || [];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stories</h1>
          <p className="text-gray-600 mt-1">
            {stories.length} {stories.length === 1 ? 'story' : 'stories'} in your collection
          </p>
        </div>
        <button
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-5 h-5 mr-2" />
          New Story
        </button>
      </div>

      {/* Content */}
      {stories.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stories yet</h3>
            <p className="text-gray-600 mb-6">
              Start building your story collection by adding your first behavioral interview story.
            </p>
            <button
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Story
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stories.map((story: Story) => (
            <StoryCard
              key={story.id}
              story={story}
              onClick={() => {
                // TODO: Implement story detail view
                console.log('Story detail view coming soon!', story.id);
              }}
            />
          ))}
        </div>
      )}
      <CreateStoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};