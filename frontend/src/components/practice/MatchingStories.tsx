import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { BookOpen, Target, TrendingUp, Check, ChevronDown, ChevronUp, Folder, Tag } from 'lucide-react';
import { GET_MATCHING_STORIES, GET_STORIES } from '../../graphql/queries';
import { LoadingSpinner, Badge } from '../ui';
import { cn } from '../../utils/cn';

interface MatchingStoriesProps {
  questionId: string;
  onStorySelect?: (storyId: string | null) => void;
  selectedStoryId?: string | null;
}

export const MatchingStories = ({ questionId, onStorySelect, selectedStoryId }: MatchingStoriesProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: matchingData, loading: matchingLoading } = useQuery(GET_MATCHING_STORIES, {
    variables: { questionId, limit: 10 },
    skip: !questionId,
  });
  const { data: allStoriesData, loading: allStoriesLoading } = useQuery(GET_STORIES);

  const matchingStories = matchingData?.question?.matchingStories || [];
  const allStories = allStoriesData?.stories || [];
  // const currentQuestionCategories = matchingData?.question?.categories || [];
  // const currentQuestionTraits = matchingData?.question?.traits || [];

  // Filter relevant stories (score > 0)
  const relevantStories = matchingStories.filter((ms: any) => ms.relevanceScore > 0);
  // Get stories that aren't in the relevant results
  const relevantStoryIds = new Set(relevantStories.map((ms: any) => ms.story.id));
  const otherStories = allStories.filter((story: any) => !relevantStoryIds.has(story.id));

  const handleStoryClick = (storyId: string) => {
    if (selectedStoryId === storyId) {
      onStorySelect?.(null);
    } else {
      onStorySelect?.(storyId);
    }
  };

  const MatchingStoriesCard = ({ story, relevanceScore, matchedCategories = [], matchedTraits = [], isMatched = false }: any) => {
    const isSelected = selectedStoryId === story.id;
    // Create sets of matched IDs for easy lookup
    const matchedCategoryIds = new Set(matchedCategories.map((c: any) => c.id));
    const matchedTraitIds = new Set(matchedTraits.map((t: any) => t.id));
    
    // Separate matched and unmatched categories/traits
    const matchedCats = story.categories?.filter((cat: any) => matchedCategoryIds.has(cat.id)) || [];
    const unmatchedCats = story.categories?.filter((cat: any) => !matchedCategoryIds.has(cat.id)) || [];
    
    const matchedTraitsList = story.traits?.filter((trait: any) => matchedTraitIds.has(trait.id)) || [];
    const unmatchedTraits = story.traits?.filter((trait: any) => !matchedTraitIds.has(trait.id)) || [];
    
    // Truncate situation to preview length
    const situationPreview = story.situation.length > 150 
      ? `${story.situation.substring(0, 150)}...` 
      : story.situation;

    return (
      <div
        onClick={() => handleStoryClick(story.id)}
        className={cn(
          "flex flex-col bg-white rounded-lg border p-6 transition-all duration-200 ease-out cursor-pointer",
          "hover:shadow-md hover:border-gray-300 hover:-translate-y-1",
          isSelected ? "border-primary-500 bg-primary-50 shadow-sm" : "border-gray-200"
        )}
      >
        {/* Header with Title and Relevance Score */}
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900 flex-1 overflow-hidden" 
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
            {story.title}
          </h2>
          <div className="flex items-center ml-3 flex-shrink-0 space-x-2">
            {isMatched && relevanceScore > 0 && (
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm font-medium text-green-600">
                  {Math.round(relevanceScore * 100)}%
                </span>
              </div>
            )}
            {isSelected && (
              <div className="flex items-center text-primary-600">
                <Check className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>
  
        {/* Selection Status */}
        {isSelected && (
          <div className="mb-3 text-xs text-primary-600 font-medium">
            ✓ Selected • Click again to deselect
          </div>
        )}
  
        {/* Situation Preview */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 overflow-hidden"
           style={{
             display: '-webkit-box',
             WebkitLineClamp: 3,
             WebkitBoxOrient: 'vertical',
           }}>
          {situationPreview}
        </p>
  
        {/* Category Badges - Matched First, Then Others */}
        {story.categories && story.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {/* Show matched categories first with sparkles */}
            {matchedCats.map((category: any) => (
              <Badge
                key={category.id}
                variant="colored"
                color={category.color}
                size="sm"
                className="flex items-center gap-1 relative ring-2 ring-yellow-400 ring-opacity-60 shadow-lg"
              >
                <Folder className="w-3 h-3" />
                {category.name}
                <span className="absolute -top-2 -right-2 text-yellow-400 text-xs">
                  ✨
                </span>
              </Badge>
            ))}
            
            {/* Then show unmatched categories */}
            {unmatchedCats.map((category: any) => (
              <Badge
                key={category.id}
                variant="colored"
                color={category.color}
                size="sm"
                className="flex items-center gap-1"
              >
                <Folder className="w-3 h-3" />
                {category.name}
              </Badge>
            ))}
          </div>
        )}
  
        {/* Trait Tags - Matched First, Then Others */}
        {story.traits && story.traits.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {/* Show matched traits first with sparkles */}
            {matchedTraitsList.map((trait: any) => (
              <Badge
                key={trait.id}
                variant="square"
                size="xs"
                className="flex items-center gap-1 relative ring-2 ring-yellow-400 ring-opacity-60 shadow-lg border-yellow-400"
              >
                <Tag className="w-2.5 h-2.5" />
                {trait.name}
                <span className="absolute -top-2 -right-2 text-yellow-400 text-xs">
                  ✨
                </span>
              </Badge>
            ))}
            
            {/* Then show unmatched traits (limit to remaining space) */}
            {unmatchedTraits.slice(0, Math.max(0, 4 - matchedTraitsList.length)).map((trait: any) => (
              <Badge
                key={trait.id}
                variant="square"
                size="xs"
                className="flex items-center gap-1"
              >
                <Tag className="w-2.5 h-2.5" />
                {trait.name}
              </Badge>
            ))}
            
            {/* Show +more if there are remaining traits */}
            {(matchedTraitsList.length + unmatchedTraits.length) > 4 && (
              <Badge variant="square" size="xs" className="flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" />
                +{((matchedTraitsList.length + unmatchedTraits.length) - 4)} more
              </Badge>
            )}
          </div>
        )}
  
        {/* Match Legend */}
        {isMatched && (matchedCategoryIds.size > 0 || matchedTraitIds.size > 0) && (
          <div className="text-xs text-yellow-600 flex items-center mb-3">
            <span className="mr-1">✨</span>
            <span>Matches this question</span>
          </div>
        )}
  
        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Click to select for practice
          </div>
          
          {story.recordings && story.recordings.length > 0 && (
            <div className="flex items-center text-xs text-gray-500">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
              {story.recordings.length} recording{story.recordings.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (matchingLoading || allStoriesLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <LoadingSpinner size="sm" text="Loading stories..." />
        </div>
      </div>
    );
  }

  if (allStories.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="text-center text-gray-500">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No stories in your collection yet</p>
          <p className="text-xs mt-1">Create some stories to practice with them</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          <BookOpen className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">
            Matching Stories
          </h3>
          <span className="text-sm text-gray-500 ml-2">
            ({relevantStories.length} found, {otherStories.length} others)
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-6 space-y-6">
          {/* Relevant Stories Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Target className="w-5 h-5 text-primary-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  Relevant Stories
                </h3>
                <span className="text-sm text-gray-500 ml-2">
                  ({relevantStories.length} found)
                </span>
              </div>
            </div>

            {relevantStories.length > 0 ? (
              <div className="space-y-3">
                {relevantStories.map(({ story, relevanceScore, matchedCategories, matchedTraits }: any) => (
                  <MatchingStoriesCard
                    key={story.id}
                    story={story}
                    relevanceScore={relevanceScore}
                    matchedCategories={matchedCategories}
                    matchedTraits={matchedTraits}
                    isMatched={true}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Target className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-amber-800">
                      No matching stories found
                    </h4>
                    <p className="text-sm text-amber-700 mt-1">
                      This question doesn't have stories that share categories or traits yet.
                    </p>
                    <div className="mt-2">
                      <p className="text-xs text-amber-600">
                        💡 <strong>Tip:</strong> Create stories with similar categories to get matches
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Other Stories Dropdown Section */}
          <div>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  Other Stories
                </h3>
                <span className="text-sm text-gray-500 ml-2">
                  ({otherStories.length} available)
                </span>
              </div>
              
              {isDropdownOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {isDropdownOpen && (
              <div className="mt-3 space-y-3 max-h-96 overflow-y-auto">
                {otherStories.length > 0 ? (
                  otherStories.map((story: any) => (
                    <MatchingStoriesCard
                      key={story.id}
                      story={story}
                      isMatched={false}
                    />
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <BookOpen className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">All your stories are already shown above</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selection Status */}
      {selectedStoryId ? (
        <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-primary-700">
              <Check className="w-4 h-4 mr-2" />
              Story selected for practice
            </div>
            <button
              onClick={() => onStorySelect?.(null)}
              className="text-xs text-primary-600 hover:text-primary-800 underline"
            >
              Deselect
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-600 text-center">
            Click any story above to select it for practice
          </div>
        </div>
      )}
    </div>
  );
};