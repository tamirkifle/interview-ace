import { useQuery } from '@apollo/client';
import { Eye, EyeOff, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { GET_STORIES } from '../../graphql/queries';
import { LoadingSpinner, Badge } from '../ui';
import { CollapsibleText } from '../ui/CollapsibleText';

interface SelectedStoryDetailsProps {
  storyId: string;
}

export const SelectedStoryDetails = ({ storyId }: SelectedStoryDetailsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, loading } = useQuery(GET_STORIES);
  
  if (loading) {
    return (
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <LoadingSpinner size="sm" text="Loading story details..." />
      </div>
    );
  }

  const story = data?.stories?.find((s: any) => s.id === storyId);
  
  if (!story) return null;

  return (
    <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
          <h4 className="font-medium text-blue-900">Selected Story</h4>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          {isExpanded ? (
            <>
              <EyeOff className="w-4 h-4 mr-1" />
              Hide Details
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </>
          )}
        </button>
      </div>

      <h5 className="font-medium text-gray-900 mb-2">{story.title}</h5>
      
      {/* Categories */}
      {story.categories && story.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {story.categories.map((category: any) => (
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
      )}

      {isExpanded && (
        <div className="space-y-4 mt-4 pt-4 border-t border-blue-200">
          <div>
            <h6 className="text-sm font-medium text-gray-700 mb-1">Situation</h6>
            <CollapsibleText text={story.situation} />
          </div>
          
          <div>
            <h6 className="text-sm font-medium text-gray-700 mb-1">Task</h6>
            <CollapsibleText text={story.task} />
          </div>
        
          <div>
            <h6 className="text-sm font-medium text-gray-700 mb-1">Action</h6>
            <CollapsibleText text={story.action} />
          </div>
          
          <div>
            <h6 className="text-sm font-medium text-gray-700 mb-1">Result</h6>
            <CollapsibleText text={story.result} />
          </div>

          {/* Traits */}
          {story.traits && story.traits.length > 0 && (
            <div>
              <h6 className="text-sm font-medium text-gray-700 mb-1">Traits Demonstrated</h6>
              <div className="flex flex-wrap gap-1">
                {story.traits.map((trait: any) => (
                  <Badge
                    key={trait.id}
                    variant="square"
                    size="xs"
                  >
                    {trait.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 text-xs text-blue-600">
        💡 Use this story as the foundation for your answer
      </div>
    </div>
  );
};