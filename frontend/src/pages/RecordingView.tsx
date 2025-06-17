import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  ArrowLeft,
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  FileQuestion, 
  BookOpen,
  Film
} from 'lucide-react';
import { GET_ALL_RECORDINGS } from '../graphql/queries';
import { LoadingSpinner, ErrorMessage } from '../components/ui';
import { TranscriptSection } from '../components/recording';
import { Recording } from '../types';

export const RecordingView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);

  const { data, loading, error } = useQuery(GET_ALL_RECORDINGS);
  
  // Find current recording and its position
  const recordings = data?.recordings || [];
  const currentIndex = recordings.findIndex((r: Recording) => r.id === id);
  const currentRecording = currentIndex !== -1 ? recordings[currentIndex] : null;

  const parseRecordingDate = (date: any): Date => {
    if (date && typeof date === 'object' && 'year' in date && 'month' in date && 'day' in date) {
      const utcDate = new Date(Date.UTC(
        date.year,
        date.month - 1,
        date.day,
        date.hour || 0,
        date.minute || 0,
        date.second || 0
      ));
      const offsetMs = (date.timeZoneOffsetSeconds || 0) * 1000;
      return new Date(utcDate.getTime() + offsetMs);
    }
    return new Date(date);
  };

  const formatDate = (date: any): string => {
    try {
      const dateObj = parseRecordingDate(date);
      const isRecent = Date.now() - dateObj.getTime() < 7 * 24 * 60 * 60 * 1000;
      return isRecent 
        ? formatDistanceToNow(dateObj, { addSuffix: true })
        : format(dateObj, 'MMM d, yyyy');
    } catch {
      return 'Unknown date';
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const navigateToRecording = (recordingId: string) => {
    navigate(`/recordings/${recordingId}`);
  };

  // Get recordings for the same question
  const questionRecordings = currentRecording?.question 
    ? recordings.filter((r: Recording) => r.question?.id === currentRecording.question?.id)
        .sort((a: Recording, b: Recording) => parseRecordingDate(b.createdAt).getTime() - parseRecordingDate(a.createdAt).getTime())
    : [];
  const questionIndex = questionRecordings.findIndex((r: Recording) => r.id === id);

  // Update video source when recording changes
  useEffect(() => {
    if (videoRef.current && currentRecording) {
      setIsVideoLoading(true);
      setVideoError(null);
      const videoUrl = `http://localhost:9000/recordings/${currentRecording.minio_key}`;
      videoRef.current.src = videoUrl;
      videoRef.current.load();
    }
  }, [currentRecording]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" text="Loading recording..." />
      </div>
    );
  }

  if (error || !currentRecording) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ErrorMessage message="Recording not found" />
        <Link to="/library" className="mt-4 text-primary-600 hover:underline">
          Back to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/library')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Library
            </button>
            
            {questionRecordings.length > 1 && (
              <div className="text-sm text-gray-600">
                Recording {questionRecordings.length - questionIndex} of {questionRecordings.length}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Video Player */}
          <div className="bg-black">
            <div className="relative aspect-video flex items-center justify-center">
              {isVideoLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <LoadingSpinner size="lg" className="text-white" />
                </div>
              )}
              {videoError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-red-400">{videoError}</div>
                </div>
              )}
              <video
                ref={videoRef}
                controls
                className="w-full h-full"
                onLoadedData={() => setIsVideoLoading(false)}
                onError={() => {
                  setIsVideoLoading(false);
                  setVideoError('Failed to load video');
                }}
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="p-6 space-y-4">
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
                <div className="flex items-center space-x-1">
                  <Film className="w-4 h-4" />
                  <span>{currentRecording.filename}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <FileQuestion className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    {currentRecording.question?.text || 'No question text'}
                  </h2>
                </div>
              </div>
              
              {currentRecording.story && (
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-gray-400" />
                  <Link 
                    to={`/library/stories/${currentRecording.story.id}/edit`}
                    className="text-gray-600 hover:text-primary-600 hover:underline"
                  >
                    Story used: {currentRecording.story.title}
                  </Link>
                </div>
              )}
            </div>

            {/* Transcript Section */}
            <TranscriptSection 
              transcript={currentRecording.transcript}
              transcriptStatus={currentRecording.transcriptStatus}
              recordingId={currentRecording.id}
            />
          </div>

          {/* Navigation */}
          {questionRecordings.length > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <button
                onClick={() => navigateToRecording(questionRecordings[questionIndex - 1].id)}
                disabled={questionIndex === 0}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous (Newer)</span>
              </button>

              <div className="flex space-x-1">
                {questionRecordings.map((_: Recording, index: number) => (
                  <button
                    key={index}
                    onClick={() => navigateToRecording(questionRecordings[index].id)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === questionIndex
                        ? 'bg-primary-600'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => navigateToRecording(questionRecordings[questionIndex + 1].id)}
                disabled={questionIndex === questionRecordings.length - 1}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next (Older)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};