import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_STORIES } from '../graphql/queries';
import { LoadingSpinner, ErrorMessage } from '../components/ui';
import { StoryForm } from '../components/story/StoryForm';

export const CreateStory = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const { data, loading, error } = useQuery(GET_STORIES, {
    skip: !isEditMode
  });

  // Find the specific story for edit mode
  const story = isEditMode ? data?.stories?.find((s: any) => s.id === id) : undefined;

  if (isEditMode && loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading story..." />
      </div>
    );
  }

  if (isEditMode && (error || !story)) {
    return <ErrorMessage message="Story not found" />;
  }

  return (
    <StoryForm 
      mode={isEditMode ? 'edit' : 'create'}
      story={story}
    />
  );
};