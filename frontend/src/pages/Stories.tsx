import { useQuery } from '@apollo/client';
import { GET_STORIES } from '../graphql/queries';
import { Story } from '../types';
import { LoadingSpinner, ErrorMessage } from '../components/ui';
import { formatDistanceToNow, parseISO } from 'date-fns';

export const Stories = () => {
  const { data, loading, error, refetch } = useQuery(GET_STORIES);

  // Debug logging
  console.log('GraphQL Response:', { data, loading, error });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading stories..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Error loading stories"
        message={error.message}
        onRetry={() => refetch()}
      />
    );
  }

  // Defensive check for data
  if (!data || !data.stories) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No stories data available.</p>
      </div>
    );
  }

  const stories = data.stories;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Stories</h1>
        <button
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          onClick={() => {/* TODO: Implement story creation */}}
        >
          Add Story
        </button>
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No stories yet. Add your first story to get started!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story: Story) => (
            <div
              key={story.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{story.title}</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Situation</h3>
                    <p className="mt-1 text-gray-700">{story.situation}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Task</h3>
                    <p className="mt-1 text-gray-700">{story.task}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Action</h3>
                    <p className="mt-1 text-gray-700">{story.action}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Result</h3>
                    <p className="mt-1 text-gray-700">{story.result}</p>
                  </div>
                </div>

                {story.categories && story.categories.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {story.categories.map((category) => (
                        <span
                          key={category.id}
                          className="px-2 py-1 text-xs font-medium rounded-full"
                          style={{
                            backgroundColor: `${category.color}20`,
                            color: category.color,
                          }}
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {story.traits && story.traits.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Traits</h3>
                    <div className="flex flex-wrap gap-2">
                      {story.traits.map((trait) => (
                        <span
                          key={trait.id}
                          className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                        >
                          {trait.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {story.recordings && story.recordings.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Recordings</h3>
                    <div className="space-y-2">
                      {story.recordings.map((recording) => (
                        <div
                          key={recording.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-700">{recording.filename}</span>
                            <span className="text-xs text-gray-500">
                              {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                          <button
                            className="text-primary-600 hover:text-primary-700"
                            onClick={() => {/* TODO: Implement recording playback */}}
                          >
                            Play
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {story.updatedAt && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Last updated {formatDistanceToNow(parseISO(story.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 