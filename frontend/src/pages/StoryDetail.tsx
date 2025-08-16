import { useQuery } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Calendar, Film, MessageCircleQuestion } from 'lucide-react';
import { GET_STORIES } from '../graphql/queries';
import { LoadingSpinner, ErrorMessage, Badge } from '../components/ui';
import { formatDistanceToNow, parseISO } from 'date-fns';

export const StoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_STORIES);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading story..." />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="Failed to load story" />;
  }

  const story = data?.stories?.find((s: any) => s.id === id);

  if (!story) {
    return <ErrorMessage message="Story not found" />;
  }

  const formatDate = (dateValue: any): string => {
    if (!dateValue) return 'N/A';
    try {
      const date = typeof dateValue === 'string' ? parseISO(dateValue) : new Date(dateValue);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/library')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Library
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-2xl font-bold text-gray-900">{story.title}</h1>
        </div>
        
        <button
          onClick={() => navigate(`/stories/${story.id}/edit`)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Story
        </button>
      </div>

      {/* Story Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
        {/* Metadata */}
        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Created {formatDate(story.createdAt)}</span>
          </div>
          <div className="flex items-center">
            <Film className="w-4 h-4 mr-1" />
            <span>{story.recordings?.length || 0} recordings</span>
          </div>
          <div className="flex items-center">
            <MessageCircleQuestion className="w-4 h-4 mr-1" />
            <span>{story.questions?.length || 0} questions</span>
          </div>
        </div>

        {/* Categories & Traits */}
        <div className="mb-8">
          {story.categories && story.categories.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {story.categories.map((category: any) => (
                  <Badge
                    key={category.id}
                    variant="colored"
                    color={category.color}
                    size="sm"
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {story.traits && story.traits.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Traits Demonstrated</h3>
              <div className="flex flex-wrap gap-2">
                {story.traits.map((trait: any) => (
                  <Badge
                    key={trait.id}
                    variant="square"
                    size="sm"
                  >
                    {trait.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* STAR Content */}
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">S</span>
              Situation
            </h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{story.situation}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">T</span>
              Task
            </h3>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{story.task}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">A</span>
              Action
            </h3>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{story.action}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">R</span>
              Result
            </h3>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{story.result}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Questions */}
      {story.questions && story.questions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Related Questions</h3>
          <div className="space-y-3">
            {story.questions.map((question: any) => (
              <div
                key={question.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/questions`)}
              >
                <p className="text-sm text-gray-900">{question.text}</p>
                <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                  question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  question.difficulty === 'medium' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {question.difficulty}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};