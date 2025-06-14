import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Folder } from 'lucide-react';
import { Question } from '../../types';
import { Badge } from '../ui';
import { MatchingStories } from './MatchingStories';
import { SelectedStoryDetails } from './SelectedStoryDetails';
import { VideoRecorder } from '../recording';

interface PracticeSessionProps {
  questions: Question[];
  onEndSession: () => void;
}

export const PracticeSession = ({ questions, onEndSession }: PracticeSessionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [selectedStories, setSelectedStories] = useState<Record<number, string | null>>({});
  const [recordings, setRecordings] = useState<Record<number, { blob: Blob; duration: number } | null>>({});

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  const nextQuestion = () => {
    if (!isLastQuestion) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (!isFirstQuestion) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const markAsAnswered = () => {
    setAnsweredQuestions(prev => new Set([...prev, currentIndex]));
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
    setSelectedStories(prev => ({
      ...prev,
      [currentIndex]: storyId
    }));
  };

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setRecordings(prev => ({
      ...prev,
      [currentIndex]: { blob, duration }
    }));
    console.log('Recording completed:', { duration, size: blob.size });
  };

  // Get selected story details for context
  const selectedStoryId = selectedStories[currentIndex];
  const selectedStoryTitle = selectedStoryId ? 
    // This would need to be fetched from your story data
    `Story ${selectedStoryId}` : undefined;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
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
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{answeredQuestions.size} / {questions.length} answered</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(answeredQuestions.size / questions.length) * 100}%` }}
          />
        </div>
      </div>

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
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-6 leading-relaxed">
          {currentQuestion.text}
        </h2>

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

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={previousQuestion}
          disabled={isFirstQuestion}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </button>

        <div className="flex space-x-2">
          {questions.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, idx) => {
            const actualIndex = Math.max(0, currentIndex - 2) + idx;
            const hasRecording = recordings[actualIndex];
            
            return (
              <button
                key={actualIndex}
                onClick={() => setCurrentIndex(actualIndex)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors relative ${
                  actualIndex === currentIndex
                    ? 'bg-primary-600 text-white'
                    : answeredQuestions.has(actualIndex)
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {actualIndex + 1}
                {hasRecording && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
                )}
              </button>
            );
          })}
        </div>

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
  );
};