import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Save, X, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { CREATE_STORY } from '../../graphql/queries';
import { GET_STORIES } from '../../graphql/queries';
import { LoadingSpinner, MultiSelect } from '../ui';
import { useTraits } from '../../hooks/useTraits';
import { useCategories } from '../../hooks/useCategories';
import { Category, Trait } from '../../types';

interface StoryCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: (storyId: string) => void;
  initialCategoryIds: string[];
  initialTraitIds: string[];
}

export const StoryCreationModal = ({
  isOpen,
  onClose,
  onStoryCreated,
  initialCategoryIds,
  initialTraitIds,
}: StoryCreationModalProps) => {
  const { categories } = useCategories();
  const { traits } = useTraits();

  const [formData, setFormData] = useState({
    title: '',
    situation: '',
    task: '',
    action: '',
    result: '',
    categoryIds: initialCategoryIds,
    traitIds: initialTraitIds,
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);
  const [createStory, { loading }] = useMutation(CREATE_STORY, {
    refetchQueries: [{ query: GET_STORIES }],
    onCompleted: (data) => {
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
        onStoryCreated(data.createStory.id);
      }, 2000);
      setFormData({
        title: '',
        situation: '',
        task: '',
        action: '',
        result: '',
        categoryIds: initialCategoryIds,
        traitIds: initialTraitIds,
      });
      setValidationError(null);
    },
    onError: (error) => {
      setValidationError(error.message || 'Failed to create story.');
    },
  });

  if (!isOpen) return null;

  const handleFormChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (validationError) setValidationError(null);
  };

  const isFormValid =
    formData.title.trim() &&
    formData.situation.trim() &&
    formData.task.trim() &&
    formData.action.trim() &&
    formData.result.trim();

  const handleSubmit = async () => {
    if (!isFormValid) {
      setValidationError('All STAR fields and title are required.');
      return;
    }
    await createStory({
      variables: {
        input: {
          ...formData,
        },
      },
    });
  };

  const title = `Add Story for "${
    (categories?.find((c: Category) => c.id === initialCategoryIds[0])?.name ||
      traits?.find((t: Trait) => t.id === initialTraitIds[0])?.name) ||
    'Selected Question'
  }"`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            This story will be automatically tagged with the current question's categories and traits.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-700">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{validationError}</span>
              </div>
            </div>
          )}
          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-green-700">
                <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-sm">Story saved successfully! Redirecting...</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Give your story a memorable title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories
                </label>
                <MultiSelect
                  items={categories}
                  selectedIds={formData.categoryIds}
                  onChange={(ids) => handleFormChange('categoryIds', ids)}
                  type="category"
                  placeholder="Search and select categories..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Traits
                </label>
                <MultiSelect
                  items={traits}
                  selectedIds={formData.traitIds}
                  onChange={(ids) => handleFormChange('traitIds', ids)}
                  type="trait"
                  placeholder="Search and select traits..."
                />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="border-l-4 border-primary-500 pl-4 mb-4">
                <h4 className="text-lg font-medium text-gray-900">STAR Framework</h4>
                <p className="text-sm text-gray-600">
                  Structure your story using the Situation, Task, Action, Result framework
                </p>
              </div>
              <textarea
                rows={3}
                placeholder="Situation *"
                value={formData.situation}
                onChange={(e) => handleFormChange('situation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <textarea
                rows={2}
                placeholder="Task *"
                value={formData.task}
                onChange={(e) => handleFormChange('task', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <textarea
                rows={4}
                placeholder="Action *"
                value={formData.action}
                onChange={(e) => handleFormChange('action', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <textarea
                rows={3}
                placeholder="Result *"
                value={formData.result}
                onChange={(e) => handleFormChange('result', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 sticky bottom-0 bg-white z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Save Story
          </button>
        </div>
      </div>
    </div>
  );
};