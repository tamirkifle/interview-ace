import React, { ReactNode } from 'react';
import { ApolloError } from '@apollo/client';
import { WifiOff, AlertCircle, RefreshCw } from 'lucide-react';

interface GraphQLErrorBoundaryProps {
  children: ReactNode;
  loading?: boolean;
  error?: ApolloError;
  onRetry?: () => void;
  fallback?: ReactNode;
}

export const GraphQLErrorBoundary: React.FC<GraphQLErrorBoundaryProps> = ({
  children,
  error,
  onRetry,
  fallback,
}) => {
  // If there's an error, show error UI
  if (error) {
    // If a custom fallback is provided, use it
    if (fallback) {
      return <>{fallback}</>;
    }

    // Determine error type and message
    const isNetworkError = error.networkError;
    const isGraphQLError = error.graphQLErrors?.length > 0;
    
    let title = 'Something went wrong';
    let message = 'An unexpected error occurred while loading data.';
    let icon = <AlertCircle className="w-6 h-6 text-red-600" />;
    
    if (isNetworkError) {
      title = 'Connection Error';
      message = 'Unable to connect to the server. Please check your internet connection.';
      icon = <WifiOff className="w-6 h-6 text-red-600" />;
    } else if (isGraphQLError) {
      title = 'Data Error';
      message = error.graphQLErrors[0]?.message || 'Failed to load data from the server.';
    }

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              {title}
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {message}
            </p>
            
            {import.meta.env.NODE_ENV === 'development' && (
              <details className="mt-3">
                <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                  Error Details (Development)
                </summary>
                <div className="mt-2 bg-red-100 rounded p-2 text-xs font-mono text-red-800 overflow-auto max-h-32">
                  {isNetworkError && (
                    <div className="mb-2">
                      <strong>Network Error:</strong> {error.networkError?.message}
                    </div>
                  )}
                  {isGraphQLError && (
                    <div className="mb-2">
                      <strong>GraphQL Errors:</strong>
                      {error.graphQLErrors.map((err, index) => (
                        <div key={index} className="ml-2">
                          • {err.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </details>
            )}
            
            {onRetry && (
              <div className="mt-4">
                <button
                  onClick={onRetry}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-800 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // No error, render children normally
  return <>{children}</>;
};