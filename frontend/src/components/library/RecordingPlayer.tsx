import { useRef, useEffect, useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  MessageCircleQuestion, 
  BookOpen,
  X
} from 'lucide-react';
import { Recording } from '../../types';

interface RecordingPlayerProps {
  recordings: Recording[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
}

export const RecordingPlayer = ({
  recordings,
  currentIndex,
  onNavigate,
  onClose
}: RecordingPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentRecording = recordings[currentIndex];
  const totalRecordings = recordings.length;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < totalRecordings - 1) {
        onNavigate(currentIndex + 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, totalRecordings, onNavigate, onClose]);

  // Update video source when recording changes
  useEffect(() => {
    if (videoRef.current && currentRecording) {
      setIsLoading(true);
      setError(null);
      // Construct the video URL from MinIO
      const videoUrl = `http://localhost:9000/recordings/${currentRecording.minio_key}`;
      videoRef.current.src = videoUrl;
      videoRef.current.load();
    }
  }, [currentRecording]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: any): string => {
    try {
      let dateObj: Date;
      
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
        dateObj = new Date(utcDate.getTime() + offsetMs);
      } else if (typeof date === 'string') {
        dateObj = new Date(date);
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        return 'Unknown date';
      }
      
      if (isNaN(dateObj.getTime())) {
        return 'Unknown date';
      }
      
      const isRecent = Date.now() - dateObj.getTime() < 7 * 24 * 60 * 60 * 1000;
      return isRecent 
        ? formatDistanceToNow(dateObj, { addSuffix: true })
        : format(dateObj, 'MMM d, yyyy');
    } catch (error) {
      console.error('Date formatting error:', error, date);
      return 'Unknown date';
    }
  };

  if (!currentRecording) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Recording {totalRecordings - currentIndex} of {totalRecordings}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="bg-black flex-1 flex items-center justify-center relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white">Loading video...</div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-red-400">{error}</div>
            </div>
          )}
          <video
            ref={videoRef}
            controls
            className="max-w-full max-h-full"
            onLoadedData={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError('Failed to load video');
            }}
          />
        </div>

        {/* Metadata */}
        <div className="px-6 py-4 bg-gray-50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(currentRecording.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(currentRecording.duration)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <MessageCircleQuestion className="w-4 h-4 text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-900">
                {currentRecording.question?.text || 'No question text'}
              </p>
            </div>
            
            {currentRecording.story && (
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Story used: {currentRecording.story.title}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        {totalRecordings > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => onNavigate(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous (Newer)</span>
            </button>

            <div className="flex space-x-1">
              {recordings.map((_, index) => (
                <button
                  key={index}
                  onClick={() => onNavigate(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex
                      ? 'bg-primary-600'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => onNavigate(currentIndex + 1)}
              disabled={currentIndex === totalRecordings - 1}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next (Older)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};