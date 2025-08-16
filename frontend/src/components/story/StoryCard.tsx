import { formatDistanceToNow, parseISO } from 'date-fns';
import { Story } from '../../types';
import { Badge } from '../ui';
import { Tag, Folder } from 'lucide-react';

interface StoryCardProps {
  story: Story;
  onClick?: () => void;
}

export const StoryCard = ({ story, onClick }: StoryCardProps) => {
  // Truncate situation to preview length
  const situationPreview = story.situation.length > 150 
    ? `${story.situation.substring(0, 150)}...` 
    : story.situation;

  return (
    <div
      className={`
        flex flex-col bg-white rounded-lg border border-gray-200 p-6 
        transition-all duration-200 ease-out
        hover:shadow-md hover:border-gray-300 hover:-translate-y-1
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      {/* Title */}
      <h2 className="text-xl font-bold text-gray-900 mb-3 overflow-hidden" 
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
        {story.title}
      </h2>

      {/* Situation Preview */}
      <p className="text-gray-600 text-sm leading-relaxed mb-4 overflow-hidden"
         style={{
           display: '-webkit-box',
           WebkitLineClamp: 3,
           WebkitBoxOrient: 'vertical',
         }}>
        {situationPreview}
      </p>

      {/* Category Badges */}
      {story.categories && story.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto mb-3">
            {story.categories.map((category) => (
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

      {/* Trait Tags */}
      {story.traits && story.traits.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
            {story.traits.slice(0, 4).map((trait) => (
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
            {story.traits.length > 4 && (
            <Badge variant="square" size="xs" className="flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" />
                +{story.traits.length - 4} more
            </Badge>
            )}
        </div>
        )}

      {/* Footer with metadata */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          {story.updatedAt && (
            <>
              Updated {formatDistanceToNow(parseISO(story.updatedAt), { addSuffix: true })}
            </>
          )}
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