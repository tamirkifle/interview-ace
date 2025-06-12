import { useQuery } from '@apollo/client';
import { BookOpen, Target, TrendingUp } from 'lucide-react';
import { GET_MATCHING_STORIES } from '../../graphql/queries';
import { LoadingSpinner, Badge } from '../ui';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Category, StoryMatch } from '../../types';

interface MatchingStoriesProps {
  questionId: string;
}

export const MatchingStories = ({ questionId }: MatchingStoriesProps) => {
  const { data, loading, error } = useQuery(GET_MATCHING_STORIES, {
    variables: { questionId, limit: 3 },
    skip: !questionId,
  });

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <LoadingSpinner size="sm" text="Finding relevant stories..." />
        </div>
      </div>
    );
  }

  if (error || !data?.question?.matchingStories) {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="text-center text-gray-500">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No matching stories found</p>
        </div>
      </div>
    );
  }

  const matchingStories = data.question.matchingStories;

  if (matchingStories.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="text-center text-gray-500">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No stories match this question yet</p>
          <p className="text-xs mt-1">Create stories with similar categories to see matches</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <Target className="w-5 h-5 text-primary-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">
          Relevant Stories
        </h3>
        <span className="text-sm text-gray-500 ml-2">
          ({matchingStories.length} found)
        </span>
      </div>

      <div className="space-y-4">
        {matchingStories.map(({ story, relevanceScore, matchedCategories, matchedTraits }: StoryMatch) => (
          <div
            key={story.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-medium text-gray-900 line-clamp-2 flex-1">
                {story.title}
              </h4>
              <div className="flex items-center ml-3 flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm font-medium text-green-600">
                  {Math.round(relevanceScore * 100)}%
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {story.situation}
            </p>

            {/* Matched Categories */}
            {matchedCategories.length > 0 && (
              <div className="mb-2">
                <span className="text-xs font-medium text-gray-500 mb-1 block">
                  Matched Categories:
                </span>
                <div className="flex flex-wrap gap-1">
                  {matchedCategories.map((category: Category) => (
                    <Badge
                      key={category.id}
                      variant="colored"
                      color={category.color}
                      size="xs"
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Traits */}
            {matchedTraits.length > 0 && (
              <div className="mb-2">
                <span className="text-xs font-medium text-gray-500 mb-1 block">
                  Matched Traits:
                </span>
                <div className="flex flex-wrap gap-1">
                  {matchedTraits.slice(0, 3).map((trait) => (
                    <Badge
                      key={trait.id}
                      variant="outline"
                      size="xs"
                    >
                      {trait.name}
                    </Badge>
                  ))}
                  {matchedTraits.length > 3 && (
                    <Badge variant="outline" size="xs">
                      +{matchedTraits.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-400 mt-2">
              Created {formatDistanceToNow(parseISO(story.createdAt), { addSuffix: true })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};