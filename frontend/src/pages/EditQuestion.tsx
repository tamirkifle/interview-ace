import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { ArrowLeft, Save } from 'lucide-react';
import { GET_QUESTIONS, GET_CATEGORIES, GET_TRAITS } from '../graphql/queries';
import { UPDATE_QUESTION_FULL } from '../graphql/mutations';
import { LoadingSpinner, ErrorMessage, MultiSelect } from '../components/ui';
import { useCategories } from '../hooks/useCategories';
import { useTraits } from '../hooks/useTraits';

export const EditQuestion = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { categories, loading: categoriesLoading } = useCategories();
  const { traits, loading: traitsLoading } = useTraits();
  
  const [formData, setFormData] = useState({
    text: '',
    difficulty: 'medium',
    categoryIds: [] as string[],
    traitIds: [] as string[]
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch question data
  const { data, loading: questionLoading, error } = useQuery(GET_QUESTIONS, {
    variables: { id },
    skip: !id
  });

  // Get the specific question
  const question = data?.allQuestions?.find((q: any) => q.id === id);

  // Update mutation
  const [updateQuestion, { loading: updating }] = useMutation(UPDATE_QUESTION_FULL, {
    refetchQueries: [{ query: GET_QUESTIONS }],
    onCompleted: () => {
      navigate('/questions');
    },
    onError: (error) => {
      setValidationError(error.message);
    }
  });

  // Initialize form data when question loads
  useEffect(() => {
    if (question) {
      setFormData({
        text: question.text,
        difficulty: question.difficulty,
        categoryIds: question.categories.map((c: any) => c.id),
        traitIds: question.traits.map((t: any) => t.id)
      });
    }
  }, [question]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (formData.text.trim().length < 20) {
      setValidationError('Question must be at least 20 characters long');
      return;
    }

    if (formData.categoryIds.length === 0 && formData.traitIds.length === 0) {
      setValidationError('At least one category or trait must be selected');
      return;
    }

    try {
      await updateQuestion({
        variables: {
          id,
          input: {
            text: formData.text.trim(),
            difficulty: formData.difficulty,
            categoryIds: formData.categoryIds,
            traitIds: formData.traitIds
          }
        }
      });
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear validation error when user makes changes
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

  if (questionLoading || categoriesLoading || traitsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading question..." />
      </div>
    );
  }

  if (error || !question) {
    return <ErrorMessage message="Question not found" />;
  }

  const isFormValid = formData.text.trim().length >= 20 && 
                     (formData.categoryIds.length > 0 || formData.traitIds.length > 0);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/questions')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Questions
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-2xl font-bold text-gray-900">Edit Question</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate('/questions')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || updating}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {updating ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
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

          <div className="space-y-6">
            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text *
              </label>
              <textarea
                value={formData.text}
                onChange={(e) => handleChange('text', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
                placeholder="Enter your interview question..."
              />
              <p className="text-xs text-gray-500 mt-2">
                Minimum 20 characters required. Current: {formData.text.length}
              </p>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level *
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories *
              </label>
              <MultiSelect
                items={categories}
                selectedIds={formData.categoryIds}
                onChange={handleCategoryChange}
                type="category"
                placeholder="Search and select categories..."
              />
              <p className="text-xs text-gray-500 mt-2">
                Choose categories that this question tests
              </p>
            </div>

            {/* Traits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Traits *
              </label>
              <MultiSelect
                items={traits}
                selectedIds={formData.traitIds}
                onChange={handleTraitChange}
                type="trait"
                placeholder="Search and select traits..."
              />
              <p className="text-xs text-gray-500 mt-2">
                Select the traits this question evaluates
              </p>
            </div>

            {/* Question Metadata */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Question Information</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-gray-500">Source</dt>
                  <dd className="text-sm text-gray-900">{question.source || 'Generated'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Recordings</dt>
                  <dd className="text-sm text-gray-900">{question.recordings?.length || 0}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Created</dt>
                  <dd className="text-sm text-gray-900">
                    {question.createdAt ? new Date(question.createdAt).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Last Updated</dt>
                  <dd className="text-sm text-gray-900">
                    {question.updatedAt ? new Date(question.updatedAt).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/questions')}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid || updating}
            className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {updating ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
};