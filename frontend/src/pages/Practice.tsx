import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Play, Target, RotateCcw, ArrowRight } from 'lucide-react';
import { GET_QUESTIONS } from '../graphql/queries';
import { LoadingSpinner, Badge } from '../components/ui';
import { CollapsibleText } from '../components/ui/CollapsibleText';
import { PracticeSession } from '../components/practice/PracticeSession';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { GraphQLErrorBoundary } from '../components/GraphQLErrorBoundary';
import { usePersistentPracticeSession } from '../hooks/usePersistentPracticeSession';
import { Question } from '../types';

export const Practice = () => {
  const { data, loading, error, refetch } = useQuery(GET_QUESTIONS);
  const [questionLimit, setQuestionLimit] = useState<number | 'all'>(5);
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  const {
    sessionQuestions,
    currentIndex,
    answeredQuestions,
    selectedStories,
    recordings,
    isSessionActive,
    hasSavedSession,
    startNewSession,
    resumeSession,
    endSession,
    updateCurrentIndex,
    updateAnsweredQuestions,
    updateSelectedStory,
    updateRecording,
  } = usePersistentPracticeSession();

  const questions = data?.questions || [];

  const handleStartNewSession = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const questionsForSession = questionLimit === 'all' ? shuffled : shuffled.slice(0, questionLimit);
    startNewSession(questionsForSession);
  };

  const handleResumeSession = () => {
    const success = resumeSession();
    if (!success) {
      // If resume fails, start new session
      handleStartNewSession();
    }
  };

  const handleEndSession = () => {
    endSession();
  };

  const handleRetry = () => {
    refetch();
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
      <GraphQLErrorBoundary error={error} onRetry={handleRetry}>
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
              currentIndex={currentIndex}
              answeredQuestions={answeredQuestions}
              selectedStories={selectedStories}
              recordings={recordings}
              onEndSession={handleEndSession}
              onUpdateCurrentIndex={updateCurrentIndex}
              onUpdateAnsweredQuestions={updateAnsweredQuestions}
              onUpdateSelectedStory={updateSelectedStory}
              onUpdateRecording={updateRecording}
            />
          </ErrorBoundary>
        ) : (
          <div>
            {/* Resume Session Prompt */}
            {hasSavedSession && !showResumePrompt && (
              <div className="max-w-3xl mx-auto mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <RotateCcw className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-lg font-medium text-blue-900 mb-2">
                        Resume Previous Session?
                      </h3>
                      <p className="text-sm text-blue-700 mb-4">
                        You have an unfinished practice session. Would you like to continue where you left off?
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleResumeSession}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Resume Session
                        </button>
                        <button
                          onClick={() => setShowResumePrompt(true)}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          Start New Session
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Practice Mode</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Simulate a real interview experience with randomly selected questions from your library.
              </p>
            </div>

            {/* Practice Session Setup */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Target className="w-16 h-16 text-primary-600 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {hasSavedSession && !showResumePrompt ? 'Start New Session' : 'Start Practice Session'}
                </h2>
                <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                  Practice with randomly selected questions. Use your stories as reference and record your responses to track improvement.
                </p>
                
                {/* Question Limit Selector */}
                <div className="flex items-center justify-center mb-6 space-x-4">
                  <label htmlFor="question-limit" className="text-sm font-medium text-gray-700">
                    Questions per session:
                  </label>
                  <select
                    id="question-limit"
                    value={questionLimit}
                    onChange={(e) => setQuestionLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value="all">All ({questions.length})</option>
                  </select>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {questions.length}
                    </div>
                    <div className="text-xs text-gray-500">Total Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round((typeof questionLimit === 'number' ? questionLimit : questions.length) / 3)}
                    </div>
                    <div className="text-xs text-gray-500">Est. Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      ∞
                    </div>
                    <div className="text-xs text-gray-500">Practice</div>
                  </div>
                </div>

                <button
                  onClick={handleStartNewSession}
                  disabled={questions.length === 0}
                  className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-6 h-6 mr-3" />
                  {hasSavedSession && !showResumePrompt ? 'Start New Session' : 'Start Practice Session'}
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  {questions.length === 0 
                    ? 'Add questions to your library first'
                    : 'Questions will be shuffled to simulate real interview conditions'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </GraphQLErrorBoundary>
    </ErrorBoundary>
  );
};