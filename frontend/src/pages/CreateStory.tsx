import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { CREATE_STORY, GET_STORIES } from '../graphql/queries';
import { useCategories } from '../hooks/useCategories';
import { LoadingSpinner, MultiSelect } from '../components/ui';

export const CreateStory = () => {
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading } = useCategories();
  
  const [formData, setFormData] = useState({
    title: '',
    situation: '',
    task: '',
    action: '',
    result: '',
    categoryIds: [] as string[]
  });

  const [createStory, { loading }] = useMutation(CREATE_STORY, {
    refetchQueries: [{ query: GET_STORIES }],
    onCompleted: () => {
      navigate('/stories');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

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
          <h1 className="text-2xl font-bold text-gray-900">Create New Story</h1>
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
            disabled={!isFormValid || loading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Story
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Title & Categories */}
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
                    categories={categories}
                    selectedIds={formData.categoryIds}
                    onChange={(categoryIds) => setFormData(prev => ({ ...prev, categoryIds }))}
                    placeholder="Search and select categories..."
                  />
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Choose categories that best describe what this story demonstrates
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
                Creating Story...
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
    </>
  );
};