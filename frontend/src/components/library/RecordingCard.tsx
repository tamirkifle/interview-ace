import { formatDistanceToNow } from 'date-fns';
import { Play, Pause, Download, Trash2, Film, FileQuestion, BookOpen } from 'lucide-react';
import { Recording } from '../../types';
import { Link } from 'react-router-dom';

interface RecordingCardProps {
  recording: Recording;
  isPlaying: boolean;
  onPlayPause: () => void;
  onDelete: () => void;
  onDownload: () => void;
}

export const RecordingCard = ({
  recording,
  isPlaying,
  onPlayPause,
  onDelete,
  onDownload
}: RecordingCardProps) => {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: any): string => {
    try {
      // Handle Neo4j DateTime objects
      if (date && typeof date === 'object' && 'year' in date && 'month' in date && 'day' in date) {
        // Create UTC date first, then convert to local
        const utcDate = new Date(Date.UTC(
          date.year,
          date.month - 1, // JavaScript months are 0-indexed
          date.day,
          date.hour || 0,
          date.minute || 0,
          date.second || 0
        ));
        
        // Apply timezone offset if provided
        const offsetMs = (date.timeZoneOffsetSeconds || 0) * 1000;
        const localDate = new Date(utcDate.getTime() + offsetMs);
        
        return formatDistanceToNow(localDate, { addSuffix: true });
      }
      
      // Handle string dates
      if (typeof date === 'string') {
        const dateObj = new Date(date);
        if (!isNaN(dateObj.getTime())) {
          return formatDistanceToNow(dateObj, { addSuffix: true });
        }
      }
      
      // Handle Date objects
      if (date instanceof Date && !isNaN(date.getTime())) {
        return formatDistanceToNow(date, { addSuffix: true });
      }
      
      return 'Unknown date';
    } catch (error) {
      console.error('Date formatting error:', error, date);
      return 'Unknown date';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
            <Film className="w-4 h-4" />
            <span>{formatDuration(recording.duration)}</span>
            <span>•</span>
            <span>{formatDate(recording.createdAt)}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <FileQuestion className="w-4 h-4 text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-900 line-clamp-2">
                {recording.question?.text || 'No question text'}
              </p>
            </div>
            
            {recording.story && (
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <Link 
                  to={`/library/stories/${recording.story.id}/edit`}
                  className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Story: {recording.story.title}
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onPlayPause}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>
          
          <button
            onClick={onDownload}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
          
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};