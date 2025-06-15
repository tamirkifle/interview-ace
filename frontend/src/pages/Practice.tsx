import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Play, Sparkles, BookOpen } from 'lucide-react';
import { GET_QUESTIONS } from '../graphql/queries';
import { LoadingSpinner } from '../components/ui';
import { PracticeSession } from '../components/practice/PracticeSession';
import { QuestionGenerator } from '../components/practice/QuestionGenerator';
import { GeneratedQuestions } from '../components/practice/GeneratedQuestions';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { GraphQLErrorBoundary } from '../components/GraphQLErrorBoundary';
import { Question, QuestionGenerationResult, GeneratedQuestion } from '../types';
import { useAPIKeys } from '../hooks/useAPIKeys';

export const Practice = () => {
  const { data, loading, error, refetch } = useQuery(GET_QUESTIONS);
  const { getAPIKeyStatus } = useAPIKeys();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'bank' | 'generate'>('bank');
  const [generationResult, setGenerationResult] = useState<QuestionGenerationResult | null>(null);

  const questions = data?.questions || [];
  const apiKeyStatus = getAPIKeyStatus();
  const isLLMConfigured = apiKeyStatus.llm.available;

  const startPracticeSession = () => {
    // Shuffle questions for variety
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setSessionQuestions(shuffled);
    setIsSessionActive(true);
  };

  const endSession = () => {
    setIsSessionActive(false);
    setSessionQuestions([]);
  };

  const handleRetry = () => {
    refetch();
  };

  const handleQuestionsGenerated = (result: QuestionGenerationResult) => {
    setGenerationResult(result);
  };

  const handleSaveGeneratedQuestion = (question: GeneratedQuestion) => {
    // In a real implementation, this would save to the database
    console.log('Saving question:', question);
    // You would call a mutation here to save the question
  };

  const handleRecordAnswer = (question: GeneratedQuestion) => {
    // Convert generated question to regular question format and start practice session
    const practiceQuestion: Question = {
      id: `generated-${Date.now()}`,
      text: question.text,
      difficulty: question.difficulty,
      commonality: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categories: question.suggestedCategories,
      traits: question.suggestedTraits
    };
    
    setSessionQuestions([practiceQuestion]);
    setIsSessionActive(true);
    setGenerationResult(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading questions..." />
      </div>
    );
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Practice page error:', error, errorInfo);
      }}
    >
      <GraphQLErrorBoundary
        error={error}
        onRetry={handleRetry}
      >
        {isSessionActive ? (
          <ErrorBoundary
            fallback={
              <div className="max-w-md mx-auto mt-16 p-6 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-lg font-medium text-red-800 mb-2">
                  Practice Session Error
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  Something went wrong during your practice session.
                </p>
                <button
                  onClick={endSession}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                  End Session
                </button>
              </div>
            }
          >
            <PracticeSession
              questions={sessionQuestions}
              onEndSession={endSession}
            />
          </ErrorBoundary>
        ) : (
          <div>
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Practice Mode</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Practice answering behavioral interview questions using your story collection. 
                Get suggestions for relevant stories and improve your responses.
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('bank')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'bank'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Question Bank
                  </button>
                  <button
                    onClick={() => setActiveTab('generate')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'generate'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Generate
                    {!isLLMConfigured && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                        Setup Required
                      </span>
                    )}
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'bank' ? (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {questions.filter((q: Question) => q.difficulty === 'easy').length}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      Easy Questions
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {questions.filter((q: Question) => q.difficulty === 'medium').length}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      Medium Questions
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {questions.filter((q: Question) => q.difficulty === 'hard').length}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      Hard Questions
                    </div>
                  </div>
                </div>

                {/* Start Practice */}
                <div className="text-center">
                  <button
                    onClick={startPracticeSession}
                    disabled={questions.length === 0}
                    className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-6 h-6 mr-3" />
                    Start Practice Session
                  </button>
                  <p className="text-sm text-gray-500 mt-3">
                    {questions.length === 0 
                      ? 'No questions available to practice with'
                      : 'Questions will be presented randomly to simulate real interview conditions'
                    }
                  </p>
                </div>
              </>
            ) : (
              <div className="max-w-4xl mx-auto">
                {generationResult ? (
                  <GeneratedQuestions
                    result={generationResult}
                    onClose={() => setGenerationResult(null)}
                    onSaveQuestion={handleSaveGeneratedQuestion}
                    onRecordAnswer={handleRecordAnswer}
                  />
                ) : (
                  <QuestionGenerator
                    onQuestionsGenerated={handleQuestionsGenerated}
                    isConfigured={isLLMConfigured}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </GraphQLErrorBoundary>
    </ErrorBoundary>
  );
};