import { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { Sparkles, FileText, AlertCircle, Loader2, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GENERATE_QUESTIONS } from '../../graphql/queries';
import { useCategories } from '../../hooks/useCategories';
import { useTraits } from '../../hooks/useTraits';
import { MultiSelect } from '../ui/MultiSelect';
import { GenerateQuestionsInput, QuestionGenerationResult } from '../../types';

interface QuestionGeneratorProps {
  onQuestionsGenerated: (result: QuestionGenerationResult) => void;
  isConfigured: boolean;
}

export const QuestionGenerator = ({ onQuestionsGenerated, isConfigured }: QuestionGeneratorProps) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'job'>('categories');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [jobDescription, setJobDescription] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<'mixed' | 'easy' | 'medium' | 'hard'>('mixed');
  
  const { categories } = useCategories();
  const { traits } = useTraits();

  const [generateQuestions, { loading, error }] = useLazyQuery(GENERATE_QUESTIONS, {
    onCompleted: (data) => {
      if (data?.generateQuestions) {
        onQuestionsGenerated(data.generateQuestions);
      }
    },
    onError: (error) => {
      console.error('Question generation error:', error);
    }
  });

  const handleGenerate = () => {
    const input: GenerateQuestionsInput = {
      count: questionCount,
      difficulty: difficulty === 'mixed' ? undefined : difficulty
    };

    if (activeTab === 'categories') {
      if (selectedCategories.length === 0 && selectedTraits.length === 0) {
        return;
      }
      input.categoryIds = selectedCategories;
      input.traitIds = selectedTraits;
    } else {
      if (!jobDescription.trim() || !company.trim() || !jobTitle.trim()) {
        return;
      }
      input.jobDescription = jobDescription.trim();
      input.company = company.trim();
      input.title = jobTitle.trim();
    }

    generateQuestions({ variables: { input } });
  };

  // Check if generation is valid
  const canGenerate = activeTab === 'categories' 
    ? (selectedCategories.length > 0 || selectedTraits.length > 0)
    : (jobDescription.trim().length > 0 && company.trim().length > 0 && jobTitle.trim().length > 0);

  if (!isConfigured) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-900 mb-1">
              AI Question Generation Not Configured
            </h3>
            <p className="text-sm text-amber-700 mb-3">
              To generate questions using AI, you need to configure an LLM provider in settings.
            </p>
            <Link
              to="/settings"
              className="inline-flex items-center text-sm font-medium text-amber-900 hover:text-amber-800"
            >
              <Settings className="w-4 h-4 mr-1.5" />
              Configure in Settings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <Sparkles className="w-5 h-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Generate Questions</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'categories'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            By Categories & Traits
          </button>
          <button
            onClick={() => setActiveTab('job')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'job'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-1.5" />
            From Job Description
          </button>
        </nav>
      </div>

      <div className="p-6">
        {/* Category/Trait Selection */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <MultiSelect
                items={categories}
                selectedIds={selectedCategories}
                onChange={setSelectedCategories}
                type="category"
                placeholder="Select categories to focus on..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Traits
              </label>
              <MultiSelect
                items={traits}
                selectedIds={selectedTraits}
                onChange={setSelectedTraits}
                type="trait"
                placeholder="Select traits to assess..."
              />
            </div>
          </div>
        )}

        {/* Job Description */}
        {activeTab === 'job' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value.slice(0, 100))}
                placeholder="e.g., Google"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value.slice(0, 100))}
                placeholder="e.g., Senior Software Engineer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value.slice(0, 5000))}
                placeholder="Paste the job description here..."
                className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 resize-none"
                maxLength={5000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {jobDescription.length}/5000 characters
              </p>
            </div>
          </div>
        )}

        {/* Generation Options */}
        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Questions
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              {[3, 5, 7, 10].map(n => (
                <option key={n} value={n}>{n} questions</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="mixed">Mixed</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-700">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm">
                {error.message.includes('LLM_NOT_CONFIGURED') 
                  ? 'Please configure an LLM provider in settings'
                  : error.message.includes('INVALID_API_KEY')
                  ? 'Invalid API key. Please check your settings.'
                  : 'Failed to generate questions. Please try again.'}
              </span>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="mt-6">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Questions
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};