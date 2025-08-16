import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Play, Sparkles, BookOpen, Library, Plus } from 'lucide-react';
import { GET_QUESTIONS } from '../graphql/queries';
import { LoadingSpinner } from '../components/ui';
import { PracticeSession } from '../components/practice/PracticeSession';
import { QuestionGenerator } from '../components/practice/QuestionGenerator';
import { GeneratedQuestions } from '../components/practice/GeneratedQuestions';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { GraphQLErrorBoundary } from '../components/GraphQLErrorBoundary';
import { Question, ResolvedGeneratedQuestion, QuestionGenerationResult } from '../types';
import { useAPIKeys } from '../hooks/useAPIKeys';
import { CustomQuestion } from '../components/practice/CustomQuestion';

export const Practice = () => {
  const { data, loading, error, refetch } = useQuery(GET_QUESTIONS);
  const { getAPIKeyStatus } = useAPIKeys();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'library' | 'practice' | 'generate' | 'custom'>('library');
  const [questionLimit, setQuestionLimit] = useState<number | 'all'>(5);

  const [generationResult, setGenerationResult] = useState<QuestionGenerationResult | null>(null);
  const questions = data?.questions || [];
  const apiKeyStatus = getAPIKeyStatus();
  const isLLMConfigured = apiKeyStatus.llm.available;

  const startPracticeSession = () => {
    // Shuffle questions for variety
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const questionsForSession = questionLimit === 'all' ? shuffled : shuffled.slice(0, questionLimit);
    setSessionQuestions(questionsForSession);
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

  const handleSaveGeneratedQuestion = (question: ResolvedGeneratedQuestion) => {
    // In a real implementation, this would save to the database
    console.log('Saving question:', question);
    // You would call a mutation here to save the question
  };

  const handleRecordAnswer = (question: ResolvedGeneratedQuestion) => {
    // Convert generated question to regular question format and start practice session
    const practiceQuestion: Question = {
      id: question.id || `generated-${Date.now()}`,
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Interview Questions Hub</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore your question library, practice with behavioral questions, or generate new ones tailored to your target roles.
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="max-w-5xl mx-auto mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('library')}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'library'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Library className="w-4 h-4 inline mr-2" />
                    Question Library
                  </button>
                  <button
                    onClick={() => setActiveTab('practice')}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'practice'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Play className="w-4 h-4 inline mr-2" />
                    Practice Mode
                  </button>
                  <button
                    onClick={() => setActiveTab('generate')}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'generate'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Generate Questions
                    {!isLLMConfigured && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                        Setup Required
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('custom')}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'custom'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Custom Question
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-5xl mx-auto">
              {activeTab === 'library' && (
                <div>
                  {/* Question Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {questions.length}
                      </div>
                      <div className="text-sm text-gray-600">Total Questions</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {questions.filter((q: Question) => q.difficulty === 'easy').length}
                      </div>
                      <div className="text-sm text-gray-600">Easy</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        {questions.filter((q: Question) => q.difficulty === 'medium').length}
                      </div>
                      <div className="text-sm text-gray-600">Medium</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {questions.filter((q: Question) => q.difficulty === 'hard').length}
                      </div>
                      <div className="text-sm text-gray-600">Hard</div>
                    </div>
                  </div>

                  {/* Question List */}
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">All Questions</h3>
                    </div>
                    <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                      {questions.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No questions in your library yet.</p>
                          <p className="text-sm text-gray-400 mt-2">
                            Generate some questions or add them from practice sessions.
                          </p>
                        </div>
                      ) : (
                        questions.map((question: Question) => (
                          <div key={question.id} className="px-6 py-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{question.text}</p>
                                <div className="mt-2 flex items-center space-x-4 text-xs">
                                  <span className={`px-2 py-1 rounded-full font-medium ${
                                    question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                    question.difficulty === 'medium' ? 'bg-orange-100 text-orange-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {question.difficulty}
                                  </span>
                                  <span className="text-gray-500">
                                    Commonality: {question.commonality}/10
                                  </span>
                                </div>
                              </div>
                              <button className="ml-4 text-primary-600 hover:text-primary-700 text-sm font-medium">
                                Practice
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'practice' && (
                <div className="max-w-3xl mx-auto">
                  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <Play className="w-16 h-16 text-primary-600 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Practice Interview Questions
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                      Simulate a real interview experience with randomly selected questions. Practice your responses and get matched with relevant stories from your collection.
                    </p>
                    
                    {/* New dropdown menu for question limit */}
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
                          {Math.round(questions.length / 5)}
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
                      onClick={startPracticeSession}
                      disabled={questions.length === 0}
                      className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-6 h-6 mr-3" />
                      Start Practice Session
                    </button>
                    <p className="text-sm text-gray-500 mt-4">
                      {questions.length === 0 
                        ? 'Add questions to your library first'
                        : 'Questions will be shuffled to simulate real interview conditions'
                      }
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'generate' && (
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

              {activeTab === 'custom' && (
                <div className="max-w-3xl mx-auto">
                  <CustomQuestion
                    onQuestionCreated={(questionId) => {
                      // Optionally switch to library tab to show the new question
                      setActiveTab('library');
                      // Or start a practice session with the new question
                      // You could fetch the question and start practice here
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </GraphQLErrorBoundary>
    </ErrorBoundary>
  );
};