import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Plus } from 'lucide-react';
import { useMutation } from '@apollo/client';
import { CREATE_STORY, GET_STORIES } from '../../graphql/queries';
import { LoadingSpinner, MultiSelect } from '../ui';
import { useCategories } from '../../hooks/useCategories';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateStoryModal = ({ isOpen, onClose }: CreateStoryModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    situation: '',
    task: '',
    action: '',
    result: '',
    categoryIds: [] as string[]
  });

  const { categories, loading: categoriesLoading } = useCategories();


  const [createStory, { loading }] = useMutation(CREATE_STORY, {
    refetchQueries: [{ query: GET_STORIES }],
    onCompleted: () => {
      onClose();
      setFormData({
        title: '',
        situation: '',
        task: '',
        action: '',
        result: '',
        categoryIds: []
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.situation.trim()) return;

    try {
      await createStory({
        variables: {
          input: {
            ...formData,
            categoryIds: formData.categoryIds.length > 0 ? formData.categoryIds : undefined
          }
        }
      });
    } catch (error) {
      console.error('Error creating story:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = formData.title.trim() && formData.situation.trim() && 
                     formData.task.trim() && formData.action.trim() && 
                     formData.result.trim();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Create New Story
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Story Title
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
                        categories={categories}
                        selectedIds={formData.categoryIds}
                        onChange={(categoryIds) => setFormData(prev => ({ ...prev, categoryIds }))}
                        placeholder="Search and select categories..."
                        />
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        Choose categories that best describe what this story demonstrates
                    </p>
                    </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Situation
                    </label>
                    <textarea
                      value={formData.situation}
                      onChange={(e) => handleChange('situation', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
                      placeholder="Describe the context and background..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Task
                    </label>
                    <textarea
                      value={formData.task}
                      onChange={(e) => handleChange('task', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
                      placeholder="What was your responsibility or goal?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Action
                    </label>
                    <textarea
                      value={formData.action}
                      onChange={(e) => handleChange('action', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
                      placeholder="What specific steps did you take?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Result
                    </label>
                    <textarea
                      value={formData.result}
                      onChange={(e) => handleChange('result', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
                      placeholder="What was the outcome? Include metrics if possible..."
                    />
                  </div>


                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!isFormValid || loading}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Story
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};