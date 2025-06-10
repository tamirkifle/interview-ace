import { cn } from '../../utils/cn';

interface SkeletonLoaderProps {
  variant?: 'card' | 'list';
  className?: string;
}

export const SkeletonLoader = ({ variant = 'card', className }: SkeletonLoaderProps) => {
  if (variant === 'card') {
    return (
      <div
        className={cn(
          'rounded-lg border border-gray-200 bg-white p-4',
          'animate-pulse',
          className
        )}
      >
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
          <div className="h-3 bg-gray-200 rounded w-4/6" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-4 animate-pulse"
        >
          <div className="h-12 w-12 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}; 