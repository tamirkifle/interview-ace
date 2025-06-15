import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Plus, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { useTraits } from '../../hooks/useTraits';
import { MultiSelect } from '../ui/MultiSelect';
import { CREATE_CUSTOM_QUESTION } from '../../graphql/mutations';
import { GET_QUESTIONS } from '../../graphql/queries';

interface CustomQuestionProps {
  onQuestionCreated?: (questionId: string) => void;
}

export const CustomQuestion = ({ onQuestionCreated }: CustomQuestionProps) => {
  const [questionText, setQuestionText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

  const { categories } = useCategories();
  const { traits } = useTraits();

  const [createQuestion, { loading }] = useMutation(CREATE_CUSTOM_QUESTION, {
    refetchQueries: [{ query: GET_QUESTIONS }],
    onCompleted: (data) => {
      // Clear form
      setQuestionText('');
      setSelectedCategories([]);
      setSelectedTraits([]);
      setDifficulty('medium');
      setValidationError(null);
      
      // Show success message
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);

      // Call callback if provided
      if (onQuestionCreated && data.createCustomQuestion?.id) {
        onQuestionCreated(data.createCustomQuestion.id);
      }
    },
    onError: (error) => {
      if (error.message.includes('duplicate')) {
        setValidationError('This question already exists in your library.');
      } else {
        setValidationError('Failed to save question. Please try again.');
      }
    }
  });

  const validateQuestion = (): boolean => {
    // Reset validation error
    setValidationError(null);

    // Check minimum length
    const trimmedText = questionText.trim();
    if (trimmedText.length < 20) {
      setValidationError('Question must be at least 20 characters long.');
      return false;
    }

    // Check for behavioral question patterns
    const behavioralPatterns = [
      'tell me about',
      'describe a',
      'give me an example',
      'walk me through',
      'share a time',
      'have you ever',
      'when did you'
    ];
    
    const startsWithBehavioral = behavioralPatterns.some(pattern => 
      trimmedText.toLowerCase().startsWith(pattern)
    );

    if (!startsWithBehavioral) {
      setValidationError('Question should start with a behavioral phrase like "Tell me about..." or "Describe a time..."');
      return false;
    }

    // Check for categories or traits
    if (selectedCategories.length === 0 && selectedTraits.length === 0) {
      setValidationError('Please select at least one category or trait.');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateQuestion()) {
      return;
    }

    createQuestion({
      variables: {
        input: {
          text: questionText.trim(),
          categoryIds: selectedCategories,
          traitIds: selectedTraits,
          difficulty
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <Plus className="w-5 h-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Create Custom Question</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Add your own behavioral interview questions to your practice library
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Text
          </label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Tell me about a time when you..."
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 resize-none"
            maxLength={500}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500">
              Start with phrases like "Tell me about...", "Describe a time...", etc.
            </p>
            <p className="text-xs text-gray-500">
              {questionText.length}/500
            </p>
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categories <span className="text-red-500">*</span>
          </label>
          <MultiSelect
            items={categories}
            selectedIds={selectedCategories}
            onChange={setSelectedCategories}
            type="category"
            placeholder="What does this question assess?"
          />
        </div>

        {/* Traits */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Traits <span className="text-red-500">*</span>
          </label>
          <MultiSelect
            items={traits}
            selectedIds={selectedTraits}
            onChange={setSelectedTraits}
            type="trait"
            placeholder="What traits does it evaluate?"
          />
          <p className="text-xs text-gray-500 mt-1">
            * Select at least one category or trait
          </p>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  difficulty === level
                    ? level === 'easy' 
                      ? 'bg-green-50 border-green-300 text-green-700'
                      : level === 'medium'
                      ? 'bg-orange-50 border-orange-300 text-orange-700'
                      : 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-700">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{validationError}</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-700">
              <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm">Question saved successfully!</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={loading || !questionText.trim()}
            className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Question
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};