import { AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage = ({
  title = 'Error',
  message,
  onRetry,
  className,
}: ErrorMessageProps) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-red-200 bg-red-50 p-4',
        'flex flex-col items-center text-center',
        className
      )}
    >
      <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
      <h3 className="text-lg font-semibold text-red-700 mb-1">{title}</h3>
      <p className="text-sm text-red-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
        >
          Try Again
        </button>
      )}
    </div>
  );
}; 