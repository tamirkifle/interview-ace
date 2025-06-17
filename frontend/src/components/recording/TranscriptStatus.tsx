import { AlertCircle, CheckCircle, Clock, FileText, XCircle } from 'lucide-react';
import { TranscriptionStatus } from '../../types';

interface TranscriptStatusProps {
  status?: TranscriptionStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TranscriptStatus = ({ 
  status = TranscriptionStatus.NONE, 
  showLabel = true,
  size = 'md' 
}: TranscriptStatusProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const iconSize = sizeClasses[size];
  const textSize = textSizeClasses[size];

  const getStatusConfig = () => {
    switch (status) {
      case TranscriptionStatus.NONE:
        return {
          icon: <FileText className={`${iconSize} text-gray-400`} />,
          label: 'Transcription not enabled',
          className: 'text-gray-500'
        };
      case TranscriptionStatus.PENDING:
        return {
          icon: <Clock className={`${iconSize} text-yellow-500 animate-pulse`} />,
          label: 'Transcription pending',
          className: 'text-yellow-600'
        };
      case TranscriptionStatus.PROCESSING:
        return {
          icon: <Clock className={`${iconSize} text-blue-500 animate-spin`} />,
          label: 'Processing transcript',
          className: 'text-blue-600'
        };
      case TranscriptionStatus.COMPLETED:
        return {
          icon: <CheckCircle className={`${iconSize} text-green-500`} />,
          label: 'Transcript available',
          className: 'text-green-600'
        };
      case TranscriptionStatus.FAILED:
        return {
          icon: <XCircle className={`${iconSize} text-red-500`} />,
          label: 'Transcription failed',
          className: 'text-red-600'
        };
      default:
        return {
          icon: <AlertCircle className={`${iconSize} text-gray-400`} />,
          label: 'Unknown status',
          className: 'text-gray-500'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center space-x-2 ${config.className}`}>
      {config.icon}
      {showLabel && (
        <span className={textSize}>{config.label}</span>
      )}
    </div>
  );
};