import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction
}: EmptyStateProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-12">
      <div className="text-center max-w-md mx-auto">
        <div className="mx-auto flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-6">{description}</p>
        
        {(actionLabel && (actionHref || onAction)) && (
          <div>
            {actionHref ? (
              <Link
                to={actionHref}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                {actionLabel}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            ) : (
              <button
                onClick={onAction}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                {actionLabel}
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};