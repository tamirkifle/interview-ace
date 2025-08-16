import { useQuery } from '@apollo/client';
import { Plus, BookOpen } from 'lucide-react';
import { GET_STORIES } from '../graphql/queries';
import { Story } from '../types';
import { ErrorMessage, SkeletonLoader, LoadingSpinner } from '../components/ui';
import { StoriesList } from '../components/library/StoriesList';
import { EmptyState } from '../components/library/EmptyState';
import { useNavigate } from 'react-router-dom';

export const Stories = () => {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery(GET_STORIES);

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <BookOpen className="w-6 h-6 text-primary-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Stories</h1>
          </div>
          <button
            disabled
            className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Story
          </button>
        </div>
        
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Loading stories..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <BookOpen className="w-6 h-6 text-primary-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Stories</h1>
          </div>
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
  const hasStories = stories.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <BookOpen className="w-6 h-6 text-primary-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Stories</h1>
        </div>
        <button
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
          onClick={() => navigate('/stories/new')}
        >
          <Plus className="w-5 h-5 mr-2" />
          New Story
        </button>
      </div>

      {/* Content */}
      {!hasStories ? (
        <EmptyState
          icon={BookOpen}
          title="No stories yet"
          description="Create your first STAR story to build your interview response library."
          actionLabel="Create Story"
          actionHref="/stories/new"
        />
      ) : (
        <StoriesList />
      )}
    </div>
  );
};