import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { CREATE_STORY, GET_STORIES } from '../../graphql/queries';
import { UPDATE_STORY } from '../../graphql/mutations';
import { useCategories } from '../../hooks/useCategories';
import { useTraits } from '../../hooks/useTraits';
import { LoadingSpinner, MultiSelect } from '../ui';
import { Story } from '../../types';

interface StoryFormProps {
  mode: 'create' | 'edit';
  story?: Story;
  onSuccess?: () => void;
}

export const StoryForm = ({ mode, story, onSuccess }: StoryFormProps) => {
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading } = useCategories();
  const { traits, loading: traitsLoading } = useTraits();
  
  const [formData, setFormData] = useState({
    title: '',
    situation: '',
    task: '',
    action: '',
    result: '',
    categoryIds: [] as string[],
    traitIds: [] as string[]
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const [createStory, { loading }] = useMutation(CREATE_STORY, {
    refetchQueries: [{ query: GET_STORIES }],
    onCompleted: () => {
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/stories');
      }
    },
    onError: (error) => {
      setValidationError(error.message);
    }
  });

  const [updateStory, { loading: updating }] = useMutation(UPDATE_STORY, {
    refetchQueries: [{ query: GET_STORIES }],
    onCompleted: () => {
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/stories');
      }
    },
    onError: (error) => {
      setValidationError(error.message);
    }
  });

  // Initialize form data when story loads (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && story) {
      setFormData({
        title: story.title,
        situation: story.situation,
        task: story.task,
        action: story.action,
        result: story.result,
        categoryIds: story.categories?.map(c => c.id) || [],
        traitIds: story.traits?.map(t => t.id) || []
      });
    }
  }, [mode, story]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!isFormValid) {
      setValidationError('All STAR fields and title are required.');
      return;
    }

    try {
      if (mode === 'edit') {
        await updateStory({
          variables: {
            id: story?.id,
            input: {
              ...formData,
              categoryIds: formData.categoryIds.length > 0 ? formData.categoryIds : undefined,
              traitIds: formData.traitIds.length > 0 ? formData.traitIds : undefined
            }
          }
        });
      } else {
        await createStory({
          variables: {
            input: {
              ...formData,
              categoryIds: formData.categoryIds.length > 0 ? formData.categoryIds : undefined,
              traitIds: formData.traitIds.length > 0 ? formData.traitIds : undefined
            }
          }
        });
      }
    } catch (error) {
      console.error('Error saving story:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleCategoryChange = (categoryIds: string[]) => {
    setFormData(prev => ({ ...prev, categoryIds }));
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleTraitChange = (traitIds: string[]) => {
    setFormData(prev => ({ ...prev, traitIds }));
    if (validationError) {
      setValidationError(null);
    }
  };

  const isFormValid = formData.title.trim() && formData.situation.trim() && 
                     formData.task.trim() && formData.action.trim() && 
                     formData.result.trim();

  const pageTitle = mode === 'edit' ? 'Edit Story' : 'Create New Story';
  const submitLabel = mode === 'edit' ? 'Save Changes' : 'Create Story';

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/stories')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Stories
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate('/stories')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || loading || updating}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {(loading || updating) ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {mode === 'edit' ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              <>
                {mode === 'edit' ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {validationError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{validationError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Title, Categories, & Traits */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Give your story a memorable title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories
                  <span className="text-xs text-gray-500 font-normal ml-1">(optional)</span>
                </label>
                {categoriesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <LoadingSpinner size="sm" text="Loading categories..." />
                  </div>
                ) : (
                  <MultiSelect
                    items={categories}
                    selectedIds={formData.categoryIds}
                    onChange={handleCategoryChange}
                    type="category"
                    placeholder="Search and select categories..."
                  />
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Choose categories that best describe what this story demonstrates
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Traits
                  <span className="text-xs text-gray-500 font-normal ml-1">(optional)</span>
                </label>
                {traitsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <LoadingSpinner size="sm" text="Loading traits..." />
                  </div>
                ) : (
                  <MultiSelect
                    items={traits}
                    selectedIds={formData.traitIds}
                    onChange={handleTraitChange}
                    type="trait"
                    placeholder="Search and select traits..."
                  />
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Select the specific traits this story demonstrates
                </p>
              </div>
            </div>

            {/* Right Column - STAR Framework */}
            <div className="lg:col-span-2 space-y-6">
              <div className="border-l-4 border-primary-500 pl-4">
                <h3 className="text-lg font-medium text-gray-900 mb-1">STAR Framework</h3>
                <p className="text-sm text-gray-600">
                  Structure your story using the Situation, Task, Action, Result framework
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Situation *
                </label>
                <textarea
                  value={formData.situation}
                  onChange={(e) => handleChange('situation', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
                  placeholder="Describe the context and background. What was happening? What was the challenge or opportunity?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task *
                </label>
                <textarea
                  value={formData.task}
                  onChange={(e) => handleChange('task', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
                  placeholder="What was your responsibility or goal? What did you need to accomplish?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action *
                </label>
                <textarea
                  value={formData.action}
                  onChange={(e) => handleChange('action', e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
                  placeholder="What specific steps did you take? Focus on YOUR actions, not the team's. Be detailed about your approach."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Result *
                </label>
                <textarea
                  value={formData.result}
                  onChange={(e) => handleChange('result', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
                  placeholder="What was the outcome? Include specific metrics, numbers, or measurable results when possible."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/stories')}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {mode === 'edit' ? 'Saving Changes...' : 'Creating Story...'}
              </>
            ) : (
              <>
                {mode === 'edit' ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
};