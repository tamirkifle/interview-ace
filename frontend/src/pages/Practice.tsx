import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Play } from 'lucide-react';
import { GET_QUESTIONS } from '../graphql/queries';
import { LoadingSpinner, ErrorMessage } from '../components/ui';
import { PracticeSession } from '../components/practice/PracticeSession';
import { Question } from '../types';

export const Practice = () => {
  const { data, loading, error } = useQuery(GET_QUESTIONS);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading questions..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <ErrorMessage
          title="Failed to load questions"
          message={error.message}
        />
      </div>
    );
  }

  if (isSessionActive) {
    return (
      <PracticeSession
        questions={sessionQuestions}
        onEndSession={endSession}
      />
    );
  }

  return (
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
          className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
        >
          <Play className="w-6 h-6 mr-3" />
          Start Practice Session
        </button>
        <p className="text-sm text-gray-500 mt-3">
          Questions will be presented randomly to simulate real interview conditions
        </p>
      </div>
    </div>
  );
};