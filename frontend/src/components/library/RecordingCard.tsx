import { formatDistanceToNow } from 'date-fns';
import { Play, Pause, Download, Trash2, Film, FileQuestion, BookOpen, FileText, RefreshCw } from 'lucide-react';
import { Recording, TranscriptionStatus } from '../../types';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { RETRY_TRANSCRIPTION } from '../../graphql/mutations';
import { GET_ALL_RECORDINGS } from '../../graphql/queries';
import { useAPIKeys } from '../../hooks/useAPIKeys';

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
  const { hasTranscriptionEnabled } = useAPIKeys();
  const [retryTranscription, { loading: retrying }] = useMutation(RETRY_TRANSCRIPTION, {
    refetchQueries: [{ query: GET_ALL_RECORDINGS }],
    onError: (error) => {
      console.error('Failed to retry transcription:', error);
    }
  });

  const handleRetryTranscription = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking retry
    e.stopPropagation();
    try {
      await retryTranscription({ variables: { id: recording.id } });
    } catch (error) {
      // Error handled by onError
    }
  };

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

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <Link 
      to={`/recordings/${recording.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
            <Film className="w-4 h-4" />
            <span>{formatDuration(recording.duration)}</span>
            <span>•</span>
            <span>{formatDate(recording.createdAt)}</span>
            {recording.transcriptStatus === TranscriptionStatus.COMPLETED && (
              <>
                <span>•</span>
                <span className="flex items-center" title="Transcript available">
                  <FileText className="w-4 h-4 text-green-600" />
                </span>
              </>
            )}
            {recording.transcriptStatus === TranscriptionStatus.FAILED && (
              <>
                <span>•</span>
                <span className="flex items-center text-red-600" title="Transcription failed">
                  <FileText className="w-4 h-4" />
                </span>
              </>
            )}
            {(recording.transcriptStatus === TranscriptionStatus.PENDING || 
              recording.transcriptStatus === TranscriptionStatus.PROCESSING) && (
              <>
                <span>•</span>
                <span className="flex items-center text-blue-600" title="Transcription in progress">
                  <FileText className="w-4 h-4 animate-pulse" />
                </span>
              </>
            )}
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
                <span className="text-sm text-gray-600">
                  Story: {recording.story.title}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={(e) => handleAction(e, onPlayPause)}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>
          
          {recording.transcriptStatus === TranscriptionStatus.FAILED && (
            <button
              onClick={handleRetryTranscription}
              disabled={retrying}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
              title="Retry transcription"
            >
              <RefreshCw className={`w-5 h-5 ${retrying ? 'animate-spin' : ''}`} />
            </button>
          )}
          
          {recording.transcriptStatus === TranscriptionStatus.NONE && hasTranscriptionEnabled && (
            <button
              onClick={handleRetryTranscription}
              disabled={retrying}
              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
              title="Transcribe recording"
            >
              <FileText className={`w-5 h-5 ${retrying ? 'animate-spin' : ''}`} />
            </button>
          )}
          
          <button
            onClick={(e) => handleAction(e, onDownload)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
          
          <button
            onClick={(e) => handleAction(e, onDelete)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Link>
  );
};