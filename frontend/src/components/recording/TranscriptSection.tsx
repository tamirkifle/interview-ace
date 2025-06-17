import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, FileText, Check, RefreshCw } from 'lucide-react';
import { TranscriptionStatus } from '../../types';
import { TranscriptStatus } from './TranscriptStatus';
import { LoadingSpinner } from '../ui';
import { useMutation } from '@apollo/client';
import { RETRY_TRANSCRIPTION } from '../../graphql/mutations';
import { GET_ALL_RECORDINGS } from '../../graphql/queries';
import { useAPIKeys } from '../../hooks/useAPIKeys';
import { Link } from 'react-router-dom';

interface TranscriptSectionProps {
  transcript?: string;
  transcriptStatus?: TranscriptionStatus;
  searchTerm?: string;
  recordingId: string;
}

export const TranscriptSection = ({ 
  transcript, 
  transcriptStatus = TranscriptionStatus.NONE,
  searchTerm,
  recordingId
}: TranscriptSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { hasTranscriptionEnabled } = useAPIKeys();
  
  const [retryTranscription, { loading: retrying }] = useMutation(RETRY_TRANSCRIPTION, {
    refetchQueries: [{ query: GET_ALL_RECORDINGS }],
    onError: (error) => {
      console.error('Failed to retry transcription:', error);
    }
  });

  const handleRetry = async () => {
    try {
      await retryTranscription({ variables: { id: recordingId } });
    } catch (error) {
      // Error handled by onError
    }
  };

  const handleCopy = async () => {
    if (!transcript) return;
    
    try {
      await navigator.clipboard.writeText(transcript);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy transcript:', error);
    }
  };

  const highlightText = (text: string, term: string): React.ReactElement => {
    if (!term) return <>{text}</>;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, index) => 
          regex.test(part) ? (
            <mark key={index} className="bg-yellow-200 text-gray-900 rounded px-0.5">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };

  const wordCount = transcript ? transcript.split(/\s+/).length : 0;

  return (
    <div className="border-t border-gray-200 mt-4 pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors"
      >
        <div className="flex items-center space-x-3">
          <FileText className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Transcript</span>
          {transcriptStatus === TranscriptionStatus.COMPLETED && wordCount > 0 && (
            <span className="text-xs text-gray-500">({wordCount} words)</span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <TranscriptStatus status={transcriptStatus} showLabel={false} size="sm" />
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {transcriptStatus === TranscriptionStatus.NONE && (
            <div className="space-y-3">
              {hasTranscriptionEnabled ? (
                <>
                  <div className="text-sm text-gray-500 italic">
                    This recording was made before transcription was enabled. You can transcribe it now.
                  </div>
                  <button
                    onClick={handleRetry}
                    disabled={retrying}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-primary-700 bg-primary-100 rounded-lg hover:bg-primary-200 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
                    <span>{retrying ? 'Starting transcription...' : 'Transcribe Now'}</span>
                  </button>
                </>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  Transcription is not enabled. <Link to="/settings" className="text-primary-600 hover:underline">Enable transcription in settings</Link> to transcribe your recordings.
                </div>
              )}
            </div>
          )}

          {(transcriptStatus === TranscriptionStatus.PENDING || 
            transcriptStatus === TranscriptionStatus.PROCESSING) && (
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <LoadingSpinner size="sm" />
                <span>
                  {transcriptStatus === TranscriptionStatus.PENDING 
                    ? 'Transcription queued...' 
                    : 'Processing transcript...'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                If this takes too long, you can try again:
              </p>
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
                <span>{retrying ? 'Restarting...' : 'Restart Transcription'}</span>
              </button>
            </div>
          )}

          {transcriptStatus === TranscriptionStatus.FAILED && (
            <div className="space-y-3">
              <div className="text-sm text-red-600">
                Transcription failed. Please try again or check your transcription settings.
              </div>
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
                <span>{retrying ? 'Retrying...' : 'Retry Transcription'}</span>
              </button>
            </div>
          )}

          {transcriptStatus === TranscriptionStatus.COMPLETED && transcript && (
            <>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {searchTerm ? highlightText(transcript, searchTerm) : transcript}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy transcript</span>
                  </>
                )}
              </button>
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                title="Regenerate transcript"
              >
                <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
                <span>{retrying ? 'Regenerating...' : 'Regenerate'}</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};