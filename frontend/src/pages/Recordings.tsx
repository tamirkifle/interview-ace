import { useQuery } from '@apollo/client';
import { Video } from 'lucide-react';
import { GET_ALL_RECORDINGS } from '../graphql/queries';
import { LoadingSpinner, ErrorMessage } from '../components/ui';
import { RecordingsList } from '../components/library/RecordingsList';
import { EmptyState } from '../components/library/EmptyState';

export const Recordings = () => {
  const { data, loading, error } = useQuery(GET_ALL_RECORDINGS);
  const hasRecordings = (data?.recordings?.length || 0) > 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading recordings..." />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="Failed to load recordings" />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Video className="w-6 h-6 text-primary-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Recordings</h1>
        </div>
        <p className="text-gray-600">
          View and manage all your practice recordings
        </p>
      </div>

      {/* Content */}
      {!hasRecordings ? (
        <EmptyState
          icon={Video}
          title="No recordings yet"
          description="Practice answering questions and record your responses to track your progress."
          actionLabel="Start Practice"
          actionHref="/practice"
        />
      ) : (
        <RecordingsList />
      )}
    </div>
  );
};