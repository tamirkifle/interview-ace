import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Folder, Plus } from 'lucide-react';
import { Question } from '../../types';
import { Badge } from '../ui';
import { CollapsibleText } from '../ui/CollapsibleText';
import { MatchingStories } from './MatchingStories';
import { SelectedStoryDetails } from './SelectedStoryDetails';
import { VideoRecorder } from '../recording';
import { StoryCreationModal } from './StoryCreationModal';

interface RecordingData {
  blob: Blob;
  duration: number;
}

interface PracticeSessionProps {
  questions: Question[];
  currentIndex: number;
  answeredQuestions: Set<number>;
  selectedStories: Record<number, string | null>;
  recordings: Record<number, RecordingData | null>;
  onEndSession: () => void;
  onUpdateCurrentIndex: (index: number) => void;
  onUpdateAnsweredQuestions: (questionIndex: number) => void;
  onUpdateSelectedStory: (questionIndex: number, storyId: string | null) => void;
  onUpdateRecording: (questionIndex: number, recordingData: RecordingData | null) => void;
}

export const PracticeSession = ({ 
  questions, 
  currentIndex,
  answeredQuestions,
  selectedStories,
  recordings,
  onEndSession,
  onUpdateCurrentIndex,
  onUpdateAnsweredQuestions,
  onUpdateSelectedStory,
  onUpdateRecording
}: PracticeSessionProps) => {
  const [isNewStoryModalOpen, setIsNewStoryModalOpen] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  const nextQuestion = () => {
    if (!isLastQuestion) {
      onUpdateCurrentIndex(currentIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (!isFirstQuestion) {
      onUpdateCurrentIndex(currentIndex - 1);
    }
  };

  const markAsAnswered = () => {
    onUpdateAnsweredQuestions(currentIndex);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#059669';
      case 'medium': return '#EA580C';
      case 'hard': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const handleStorySelect = (storyId: string | null) => {
    onUpdateSelectedStory(currentIndex, storyId);
  };

  const handleAddNewStory = () => {
    setIsNewStoryModalOpen(true);
  };

  const handleStoryCreated = (storyId: string) => {
    setIsNewStoryModalOpen(false);
    handleStorySelect(storyId);
  };

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    onUpdateRecording(currentIndex, { blob, duration });
    console.log('Recording completed:', { duration, size: blob.size });
  };

  // Get selected story details for context
  const selectedStoryId = selectedStories[currentIndex];
  const selectedStoryTitle = selectedStoryId ? 
    // This would need to be fetched from your story data
    `Story ${selectedStoryId}` : undefined;

  return (
    <div>
      {/* Sticky Header Navigation */}
      <div className="sticky top-16 z-10 bg-white border-b border-gray-200 py-4 flex items-center justify-between px-6 -mx-6">
        <button
          onClick={onEndSession}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          End Session
        </button>
  
        <div className="text-sm text-gray-500">
          Question {currentIndex + 1} of {questions.length}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={previousQuestion}
            disabled={isFirstQuestion}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </button>
          
          <button
            onClick={nextQuestion}
            disabled={isLastQuestion}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="mt-8">
        {/* Question Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Badge 
                variant="colored" 
                color={getDifficultyColor(currentQuestion.difficulty)}
                size="sm"
              >
                {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
              </Badge>
              <span className="text-sm text-gray-500">
                Commonality: {currentQuestion.commonality}/10
              </span>
              {answeredQuestions.has(currentIndex) && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Answered</span>
                </div>
              )}
            </div>
            <button
              onClick={handleAddNewStory}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Story
            </button>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-6 leading-relaxed">
            {currentQuestion.text}
          </h2>

          {/* AI Reasoning */}
          {(currentQuestion as any).reasoning && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-2">💡 Why this question:</p>
              <CollapsibleText 
                text={(currentQuestion as any).reasoning}
                wordLimit={25}
                className="text-sm text-blue-700"
              />
            </div>
          )}

          {/* Categories */}
          {currentQuestion.categories && currentQuestion.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-auto mb-6">
              {currentQuestion.categories.map((category) => (
                <Badge
                  key={category.id}
                  variant="colored"
                  color={category.color}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Folder className="w-3 h-3" />
                  {category.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Matching Stories */}
          <div className="mb-6">
            <MatchingStories 
              questionId={currentQuestion.id} 
              onStorySelect={handleStorySelect}
              selectedStoryId={selectedStories[currentIndex]}
            />
          </div>

          {/* Selected Story Details */}
          {selectedStories[currentIndex] && (
            <div className="mb-6">
              <SelectedStoryDetails storyId={selectedStories[currentIndex] as string} />
            </div>
          )}

          {/* Video Recording Section */}
          <div className="mb-6">
            <VideoRecorder 
              onRecordingComplete={handleRecordingComplete}
              questionText={currentQuestion.text}
              storyTitle={selectedStoryTitle}
              questionId={currentQuestion.id}
              storyId={selectedStories[currentIndex]}
              onRecordingSaved={(recordingId) => {
                console.log('Recording saved with ID:', recordingId);
                // You could update UI to show saved status
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center mt-8">
            <button
              onClick={markAsAnswered}
              disabled={answeredQuestions.has(currentIndex)}
              className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {answeredQuestions.has(currentIndex) ? 'Answered' : 'Mark as Answered'}
            </button>
          </div>
        </div>
      </div>
      
      <StoryCreationModal
        isOpen={isNewStoryModalOpen}
        onClose={() => setIsNewStoryModalOpen(false)}
        onStoryCreated={handleStoryCreated}
        initialCategoryIds={currentQuestion.categories?.map(c => c.id) || []}
        initialTraitIds={currentQuestion.traits?.map(t => t.id) || []}
      />
    </div>
  );
};