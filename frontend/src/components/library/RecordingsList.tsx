import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import { 
  Film, 
  Calendar, 
  LayoutList, 
  Clock,
  Download,
  Trash2,
  BookOpen,
  FileText,
  RefreshCw
} from 'lucide-react';
import { GET_ALL_RECORDINGS, GET_QUESTIONS, GET_STORIES } from '../../graphql/queries';
import { DELETE_RECORDING, RETRY_TRANSCRIPTION } from '../../graphql/mutations';
import { LoadingSpinner, ErrorMessage } from '../ui';
import { RecordingCard } from './RecordingCard';
import { RecordingFilters, RecordingFilterState } from './RecordingFilters';
import { Recording, Question, TranscriptionStatus } from '../../types';
import { parseISO, isWithinInterval, isValid } from 'date-fns';
import { useAPIKeys } from '../../hooks/useAPIKeys';

type ViewMode = 'timeline' | 'question';

export const RecordingsList = () => {
  const { hasTranscriptionEnabled } = useAPIKeys();
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('recordingsViewMode') as ViewMode) || 'timeline';
  });
  const [filters, setFilters] = useState<RecordingFilterState>({
    startDate: null,
    endDate: null,
    questionId: null,
    storyId: null,
    hasMultiple: null,
    transcriptStatus: null,
    searchTerm: ''
  });
  const [playingRecordingId, setPlayingRecordingId] = useState<string | null>(null);

  const { data: recordingsData, loading: recordingsLoading, error: recordingsError } = useQuery(GET_ALL_RECORDINGS);
  const { data: questionsData } = useQuery(GET_QUESTIONS);
  const { data: storiesData } = useQuery(GET_STORIES);

  const [deleteRecording] = useMutation(DELETE_RECORDING, {
    refetchQueries: [{ query: GET_ALL_RECORDINGS }]
  });

  const [retryTranscription, { loading: retrying }] = useMutation(RETRY_TRANSCRIPTION, {
    refetchQueries: [{ query: GET_ALL_RECORDINGS }],
    onError: (error) => {
      console.error('Failed to retry transcription:', error);
    }
  });

  const recordings = recordingsData?.recordings || [];
  const questions = questionsData?.questions || [];
  const stories = storiesData?.stories || [];

  // Save view mode preference
  useEffect(() => {
    localStorage.setItem('recordingsViewMode', viewMode);
  }, [viewMode]);

  // Helper function to parse Neo4j DateTime or standard dates
  const parseRecordingDate = (date: any): Date => {
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
      return new Date(utcDate.getTime() + offsetMs);
    }
    
    // Handle string dates
    if (typeof date === 'string') {
      const parsed = parseISO(date);
      if (isValid(parsed)) return parsed;
    }
    
    // Handle Date objects
    if (date instanceof Date && isValid(date)) {
      return date;
    }
    
    // Fallback to epoch
    return new Date(0);
  };

  // Filter recordings
  const filteredRecordings = useMemo(() => {
    let filtered = [...recordings];

    // Date range filter
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter((r: Recording) => {
        const recordingDate = parseRecordingDate(r.createdAt);
        const start = filters.startDate ? parseISO(filters.startDate) : new Date(0);
        const end = filters.endDate ? parseISO(filters.endDate) : new Date();
        return isWithinInterval(recordingDate, { start, end });
      });
    }

    // Question filter
    if (filters.questionId) {
      filtered = filtered.filter((r: Recording) => r.question?.id === filters.questionId);
    }

    // Story filter
    if (filters.storyId === 'none') {
      filtered = filtered.filter((r: Recording) => !r.story);
    } else if (filters.storyId) {
      filtered = filtered.filter((r: Recording) => r.story?.id === filters.storyId);
    }

    // Multiple recordings filter
    if (filters.hasMultiple !== null) {
      const questionRecordingCounts = recordings.reduce((acc: Record<string, number>, r: Recording) => {
        const qId = r.question?.id;
        if (qId) {
          acc[qId] = (acc[qId] || 0) + 1;
        }
        return acc;
      }, {});

      filtered = filtered.filter((r: Recording) => {
        const count = questionRecordingCounts[r.question?.id || ''] || 0;
        return filters.hasMultiple ? count > 1 : count === 1;
      });
    }

    // Transcript status filter
    if (filters.transcriptStatus) {
      filtered = filtered.filter((r: Recording) => r.transcriptStatus === filters.transcriptStatus);
    }

    // Transcript search
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter((r: Recording) => 
        r.transcript && r.transcript.toLowerCase().includes(searchLower)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a: Recording, b: Recording) => {
      return parseRecordingDate(b.createdAt).getTime() - parseRecordingDate(a.createdAt).getTime();
    });

    return filtered;
  }, [recordings, filters]);

  // Group recordings by question for question view
  const recordingsByQuestion = useMemo((): Record<string, Recording[]> => {
    const grouped = filteredRecordings.reduce((acc: Record<string, Recording[]>, recording: Recording) => {
      const questionId = recording.question?.id || 'unknown';
      if (!acc[questionId]) {
        acc[questionId] = [];
      }
      acc[questionId].push(recording);
      return acc;
    }, {});

    // Sort recordings within each question (newest first)
    (Object.values(grouped) as Recording[][]).forEach((recs: Recording[]) => {
      recs.sort((a: Recording, b: Recording) => parseRecordingDate(b.createdAt).getTime() - parseRecordingDate(a.createdAt).getTime());
    });

    return grouped;
  }, [filteredRecordings]);

  const handleDeleteRecording = async (recordingId: string) => {
    if (!confirm('Are you sure you want to delete this recording?')) return;

    try {
      await deleteRecording({ variables: { id: recordingId } });
    } catch (error) {
      console.error('Failed to delete recording:', error);
    }
  };

  const handleDownloadRecording = (recording: Recording) => {
    // Create download link
    const downloadUrl = `http://localhost:9000/recordings/${recording.minio_key}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = recording.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (recordingsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (recordingsError) {
    return <ErrorMessage message="Failed to load recordings" />;
  }

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'timeline'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => setViewMode('question')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'question'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutList className="w-4 h-4" />
            <span>By Question</span>
          </button>
        </div>

        <div className="text-sm text-gray-600">
          {filteredRecordings.length} recording{filteredRecordings.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filters */}
      <RecordingFilters
        questions={questions}
        stories={stories}
        onFilterChange={setFilters}
      />

      {/* Recordings List */}
      {filteredRecordings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Film className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No recordings found</p>
          {Object.values(filters).some(v => v !== null) && (
            <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {viewMode === 'timeline' ? (
            // Timeline View
            filteredRecordings.map((recording: Recording) => (
              <RecordingCard
                key={recording.id}
                recording={recording}
                isPlaying={playingRecordingId === recording.id}
                onPlayPause={() => setPlayingRecordingId(playingRecordingId === recording.id ? null : recording.id)}
                onDelete={() => handleDeleteRecording(recording.id)}
                onDownload={() => handleDownloadRecording(recording)}
              />
            ))
          ) : (
            // Question View
            (Object.entries(recordingsByQuestion) as [string, Recording[]][]).map(([questionId, questionRecordings]) => {
              const question = questions.find((q: Question) => q.id === questionId);
              return (
                <div key={questionId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 mb-1">
                          {question?.text || 'Unknown Question'}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Film className="w-4 h-4 mr-1" />
                            {questionRecordings.length} recording{questionRecordings.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {questionRecordings.map((recording: Recording, index: number) => (
                      <div key={recording.id} className="p-4 hover:bg-gray-50">
                        <Link 
                          to={`/recordings/${recording.id}`}
                          className="flex items-center justify-between group"
                        >
                          <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-500">
                              Recording {questionRecordings.length - index} of {questionRecordings.length}
                            </span>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>{Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}</span>
                            </div>
                            {recording.story && (
                              <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <BookOpen className="w-4 h-4" />
                                <span>{recording.story.title}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {(recording.transcriptStatus === TranscriptionStatus.FAILED || 
                              (recording.transcriptStatus === TranscriptionStatus.NONE && hasTranscriptionEnabled)) && (
                              <button
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  try {
                                    await retryTranscription({ variables: { id: recording.id } });
                                  } catch (error) {
                                    // Error handled by onError
                                  }
                                }}
                                disabled={retrying}
                                className={`p-1.5 ${
                                  recording.transcriptStatus === TranscriptionStatus.FAILED 
                                    ? 'text-orange-600 hover:bg-orange-50' 
                                    : 'text-primary-600 hover:bg-primary-50'
                                } rounded transition-colors`}
                                title={recording.transcriptStatus === TranscriptionStatus.FAILED ? "Retry transcription" : "Transcribe recording"}
                              >
                                {recording.transcriptStatus === TranscriptionStatus.FAILED ? (
                                  <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
                                ) : (
                                  <FileText className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
                                )}
                              </button>
                            )}
                            <Link
                              to={`/recordings/${recording.id}`}
                              className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Film className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDownloadRecording(recording);
                              }}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteRecording(recording.id);
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};