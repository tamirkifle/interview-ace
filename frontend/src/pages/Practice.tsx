// frontend/src/pages/Practice.tsx

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Play } from 'lucide-react';
import { GET_QUESTIONS } from '../graphql/queries';
import { LoadingSpinner } from '../components/ui';
import { PracticeSession } from '../components/practice/PracticeSession';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { GraphQLErrorBoundary } from '../components/GraphQLErrorBoundary';
import { Question } from '../types';

export const Practice = () => {
  const { data, loading, error, refetch } = useQuery(GET_QUESTIONS);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);

  const questions = data?.questions || [];

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
          </div>
        )}
      </GraphQLErrorBoundary>
    </ErrorBoundary>
  );
};