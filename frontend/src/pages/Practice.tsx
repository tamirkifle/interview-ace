import { useState, useEffect } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Target, RotateCcw, ArrowRight, BookOpen, MessageCircleQuestion, Users } from 'lucide-react';
import { GET_QUESTIONS, GET_QUESTIONS_FOR_STORIES, GET_STORIES } from '../graphql/queries';
import { LoadingSpinner, Badge } from '../components/ui';
import { CollapsibleText } from '../components/ui/CollapsibleText';
import { PracticeSession } from '../components/practice/PracticeSession';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { GraphQLErrorBoundary } from '../components/GraphQLErrorBoundary';
import { usePersistentPracticeSession } from '../hooks/usePersistentPracticeSession';
import { Question, Story } from '../types';

interface LocationState {
  selectedQuestionIds?: string[];
  selectedStoryIds?: string[];
}

export const Practice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  const { data, loading, error, refetch } = useQuery(GET_QUESTIONS);
  const { data: storiesData } = useQuery(GET_STORIES);
  
  const [questionLimit, setQuestionLimit] = useState<number | 'all'>(5);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [customPracticeInfo, setCustomPracticeInfo] = useState<{
    type: 'questions' | 'stories';
    count: number;
    items: Question[] | Story[];
  } | null>(null);

  const [getQuestionsForStories, { loading: loadingStoryQuestions, error: storyQuestionsError }] = useLazyQuery(GET_QUESTIONS_FOR_STORIES);

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

  const questions = data?.allQuestions || [];
  const stories = storiesData?.stories || [];

  // Handle custom practice setup from navigation state
  useEffect(() => {
    if (state?.selectedQuestionIds || state?.selectedStoryIds) {
      if (state.selectedQuestionIds) {
        // Filter questions by selected IDs
        const selectedQuestions = questions.filter((q: Question) => state.selectedQuestionIds!.includes(q.id));
        setCustomPracticeInfo({
          type: 'questions',
          count: selectedQuestions.length,
          items: selectedQuestions
        });
      } else if (state.selectedStoryIds) {
        // Get selected stories info
        const selectedStories = stories.filter((s: Story) => state.selectedStoryIds!.includes(s.id));
        setCustomPracticeInfo({
          type: 'stories',
          count: selectedStories.length,
          items: selectedStories
        });
      }
    }
  }, [state, questions, stories]);

  const handleStartNewSession = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const questionsForSession = questionLimit === 'all' ? shuffled : shuffled.slice(0, questionLimit);
    startNewSession(questionsForSession);
  };

  const handleStartCustomQuestionSession = () => {
    if (!customPracticeInfo || customPracticeInfo.type !== 'questions') return;
    
    const selectedQuestions = customPracticeInfo.items as Question[];
    startNewSession(selectedQuestions);
  };

  const handleStartCustomStorySession = async () => {
    if (!customPracticeInfo || customPracticeInfo.type !== 'stories') return;
    
    try {
      const selectedStoryIds = (customPracticeInfo.items as Story[]).map(s => s.id);
      
      const { data: questionsData } = await getQuestionsForStories({
        variables: { storyIds: selectedStoryIds }
      });
      
      if (questionsData?.questionsForStories?.length > 0) {
        const matchingQuestions = questionsData.questionsForStories;
        
        // Pre-populate story selections for questions that match our selected stories
        const initialStorySelections: Record<number, string | null> = {};
        matchingQuestions.forEach((question: Question, index: number) => {
          // Find the first story that can answer this question
          const matchingStory = customPracticeInfo.items.find(story => 
            story.categories?.some(cat => 
              question.categories?.some(qCat => qCat.id === cat.id)
            ) || story.traits?.some(trait => 
              question.traits?.some(qTrait => qTrait.id === trait.id)
            )
          ) as Story;
          
          if (matchingStory) {
            initialStorySelections[index] = matchingStory.id;
          }
        });
        
        startNewSession(matchingQuestions);
        
        // Set story selections after session starts
        Object.entries(initialStorySelections).forEach(([index, storyId]) => {
          updateSelectedStory(parseInt(index), storyId);
        });
      } else {
        alert('No questions found that match the selected stories. Try creating questions that align with your story categories and traits.');
      }
    } catch (error) {
      console.error('Failed to start story-based practice:', error);
      alert('Failed to load questions for selected stories.');
    }
  };

  const handleResumeSession = () => {
    const success = resumeSession();
    if (!success) {
      handleStartNewSession();
    }
  };

  const handleEndSession = () => {
    endSession();
    // Clear navigation state
    navigate('/practice', { replace: true });
    setCustomPracticeInfo(null);
  };

  const handleCancelCustomPractice = () => {
    navigate('/practice', { replace: true });
    setCustomPracticeInfo(null);
  };

  const handleRetry = () => {
    refetch();
  };

  if (loading || loadingStoryQuestions) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading questions..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <GraphQLErrorBoundary error={error || storyQuestionsError} onRetry={handleRetry}>
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
            {hasSavedSession && !showResumePrompt && !customPracticeInfo && (
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

            {/* Custom Practice Mode */}
            {customPracticeInfo && (
              <div className="max-w-3xl mx-auto mb-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {customPracticeInfo.type === 'questions' ? (
                        <MessageCircleQuestion className="w-6 h-6 text-green-600" />
                      ) : (
                        <BookOpen className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-lg font-medium text-green-900 mb-2">
                        {customPracticeInfo.type === 'questions' 
                          ? 'Custom Question Practice'
                          : 'Story-Based Practice'
                        }
                      </h3>
                      <p className="text-sm text-green-700 mb-4">
                        {customPracticeInfo.type === 'questions' 
                          ? `Practice with ${customPracticeInfo.count} selected questions from your library.`
                          : `Practice questions that match your ${customPracticeInfo.count} selected stories. Stories will be pre-selected for relevant questions.`
                        }
                      </p>
                      
                      {/* Show selected items preview */}
                      <div className="mb-4">
                        <p className="text-xs font-medium text-green-800 mb-2">
                          Selected {customPracticeInfo.type}:
                        </p>
                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                          {customPracticeInfo.items.slice(0, 6).map((item: any) => (
                            <Badge
                              key={item.id}
                              variant="colored"
                              color="#10B981"
                              size="xs"
                            >
                              {customPracticeInfo.type === 'questions' 
                                ? item.text.length > 30 ? `${item.text.substring(0, 30)}...` : item.text
                                : item.title
                              }
                            </Badge>
                          ))}
                          {customPracticeInfo.items.length > 6 && (
                            <Badge variant="colored" color="#10B981" size="xs">
                              +{customPracticeInfo.items.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={customPracticeInfo.type === 'questions' 
                            ? handleStartCustomQuestionSession 
                            : handleStartCustomStorySession
                          }
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Custom Practice
                        </button>
                        <button
                          onClick={handleCancelCustomPractice}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          Cancel
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
                {customPracticeInfo 
                  ? 'Start your focused practice session with selected items.'
                  : 'Simulate a real interview experience with randomly selected questions from your library.'
                }
              </p>
            </div>

            {/* Practice Session Setup */}
            {!customPracticeInfo && (
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

                  {/* Navigation hint */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-4">
                      💡 <strong>Tip:</strong> Want to practice specific questions or stories?
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => navigate('/questions')}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <MessageCircleQuestion className="w-4 h-4 mr-2" />
                        Select Questions
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                      <button
                        onClick={() => navigate('/stories')}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Select Stories
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Practice Session Setup */}
            {customPracticeInfo && (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  {customPracticeInfo.type === 'questions' ? (
                    <MessageCircleQuestion className="w-16 h-16 text-green-600 mx-auto mb-6" />
                  ) : (
                    <BookOpen className="w-16 h-16 text-green-600 mx-auto mb-6" />
                  )}
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {customPracticeInfo.type === 'questions' 
                      ? 'Custom Question Practice'
                      : 'Story-Based Practice'
                    }
                  </h2>
                  
                  <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                    {customPracticeInfo.type === 'questions' 
                      ? `Practice with your ${customPracticeInfo.count} selected questions. Perfect for focused preparation on specific topics.`
                      : `Practice questions that match your ${customPracticeInfo.count} selected stories. Your stories will be pre-selected for relevant questions.`
                    }
                  </p>

                  {/* Custom Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {customPracticeInfo.count}
                      </div>
                      <div className="text-xs text-gray-500">
                        Selected {customPracticeInfo.type === 'questions' ? 'Questions' : 'Stories'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {customPracticeInfo.type === 'questions' 
                          ? Math.round(customPracticeInfo.count / 3)
                          : '~15'
                        }
                      </div>
                      <div className="text-xs text-gray-500">Est. Minutes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        🎯
                      </div>
                      <div className="text-xs text-gray-500">Focused</div>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={handleCancelCustomPractice}
                      className="inline-flex items-center px-6 py-3 text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={customPracticeInfo.type === 'questions' 
                        ? handleStartCustomQuestionSession 
                        : handleStartCustomStorySession
                      }
                      disabled={customPracticeInfo.items.length === 0}
                      className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-6 h-6 mr-3" />
                      Start Custom Practice
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </GraphQLErrorBoundary>
    </ErrorBoundary>
  );
};