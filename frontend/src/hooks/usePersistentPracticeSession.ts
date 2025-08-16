import { useState, useEffect, useCallback } from 'react';
import { Question } from '../types';

interface PracticeSessionState {
  sessionQuestions: Question[];
  currentIndex: number;
  answeredQuestions: number[];
  selectedStories: Record<number, string | null>;
  recordings: Record<number, { blob: Blob; duration: number } | null>;
  sessionId: string;
  startedAt: string;
}

interface RecordingData {
  blob: Blob;
  duration: number;
}

const SESSION_STORAGE_KEY = 'practiceSession';

export const usePersistentPracticeSession = () => {
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [selectedStories, setSelectedStories] = useState<Record<number, string | null>>({});
  const [recordings, setRecordings] = useState<Record<number, RecordingData | null>>({});
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [hasSavedSession, setHasSavedSession] = useState(false);

  // Check for saved session on mount
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      try {
        const parsedSession: PracticeSessionState = JSON.parse(saved);
        // Check if session is recent (within 24 hours)
        const sessionAge = Date.now() - new Date(parsedSession.startedAt).getTime();
        const isRecent = sessionAge < 24 * 60 * 60 * 1000; // 24 hours
        
        if (isRecent && parsedSession.sessionQuestions.length > 0) {
          setHasSavedSession(true);
        } else {
          // Clean up old session
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Failed to parse saved session:', error);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
  }, []);

  // Save session state whenever it changes
  const saveSession = useCallback(() => {
    if (!isSessionActive || sessionQuestions.length === 0) return;

    const sessionState: PracticeSessionState = {
      sessionQuestions,
      currentIndex,
      answeredQuestions: Array.from(answeredQuestions),
      selectedStories,
      recordings: {}, // Don't save blob data, too large for localStorage
      sessionId: Date.now().toString(),
      startedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionState));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }, [isSessionActive, sessionQuestions, currentIndex, answeredQuestions, selectedStories, recordings]);

  // Auto-save when state changes
  useEffect(() => {
    if (isSessionActive) {
      saveSession();
    }
  }, [isSessionActive, saveSession]);

  const startNewSession = (questions: Question[]) => {
    setSessionQuestions(questions);
    setCurrentIndex(0);
    setAnsweredQuestions(new Set());
    setSelectedStories({});
    setRecordings({});
    setIsSessionActive(true);
    setHasSavedSession(false);
    // Clear any existing saved session
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const resumeSession = () => {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!saved) return false;

    try {
      const parsedSession: PracticeSessionState = JSON.parse(saved);
      setSessionQuestions(parsedSession.sessionQuestions);
      setCurrentIndex(parsedSession.currentIndex);
      setAnsweredQuestions(new Set(parsedSession.answeredQuestions));
      setSelectedStories(parsedSession.selectedStories);
      setRecordings({}); // Don't restore recordings (blobs not saved)
      setIsSessionActive(true);
      setHasSavedSession(false);
      return true;
    } catch (error) {
      console.error('Failed to resume session:', error);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return false;
    }
  };

  const endSession = () => {
    setIsSessionActive(false);
    setSessionQuestions([]);
    setCurrentIndex(0);
    setAnsweredQuestions(new Set());
    setSelectedStories({});
    setRecordings({});
    setHasSavedSession(false);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const updateCurrentIndex = (index: number) => {
    setCurrentIndex(index);
  };

  const updateAnsweredQuestions = (questionIndex: number) => {
    setAnsweredQuestions(prev => new Set([...prev, questionIndex]));
  };

  const updateSelectedStory = (questionIndex: number, storyId: string | null) => {
    setSelectedStories(prev => ({
      ...prev,
      [questionIndex]: storyId
    }));
  };

  const updateRecording = (questionIndex: number, recordingData: RecordingData | null) => {
    setRecordings(prev => ({
      ...prev,
      [questionIndex]: recordingData
    }));
  };

  return {
    // State
    sessionQuestions,
    currentIndex,
    answeredQuestions,
    selectedStories,
    recordings,
    isSessionActive,
    hasSavedSession,
    
    // Actions
    startNewSession,
    resumeSession,
    endSession,
    updateCurrentIndex,
    updateAnsweredQuestions,
    updateSelectedStory,
    updateRecording,
  };
};