import { useState, useEffect, useCallback } from 'react';

interface QuestionsListState {
  currentPage: number;
  itemsPerPage: number;
  searchTerm: string;
  categoryFilter: string;
  companyFilter: string;
  jobTitleFilter: string;
  sourceFilter: string;
  hasRecordingsFilter: boolean | null;
  sortField: string;
  sortOrder: string;
}

const DEFAULT_STATE: QuestionsListState = {
  currentPage: 1,
  itemsPerPage: 25,
  searchTerm: '',
  categoryFilter: '',
  companyFilter: '',
  jobTitleFilter: '',
  sourceFilter: 'all',
  hasRecordingsFilter: null,
  sortField: 'createdAt',
  sortOrder: 'desc',
};

const STORAGE_KEY = 'questionsListState';

export const useQuestionsState = () => {
  const [state, setState] = useState<QuestionsListState>(DEFAULT_STATE);

  // Load state on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        setState({ ...DEFAULT_STATE, ...parsedState });
      } catch (error) {
        console.error('Failed to parse saved questions state:', error);
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save state whenever it changes
  const saveState = useCallback((newState: QuestionsListState) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      setState(newState);
    } catch (error) {
      console.error('Failed to save questions state:', error);
    }
  }, []);

  // Update methods
  const updateState = useCallback((updates: Partial<QuestionsListState>) => {
    const newState = { ...state, ...updates };
    saveState(newState);
  }, [state, saveState]);

  const setCurrentPage = useCallback((page: number) => {
    updateState({ currentPage: page });
  }, [updateState]);

  const setItemsPerPage = useCallback((items: number) => {
    updateState({ itemsPerPage: items, currentPage: 1 });
  }, [updateState]);

  const setSearchTerm = useCallback((term: string) => {
    updateState({ searchTerm: term, currentPage: 1 });
  }, [updateState]);

  const setCategoryFilter = useCallback((category: string) => {
    updateState({ categoryFilter: category, currentPage: 1 });
  }, [updateState]);

  const setCompanyFilter = useCallback((company: string) => {
    updateState({ companyFilter: company, currentPage: 1 });
  }, [updateState]);

  const setJobTitleFilter = useCallback((title: string) => {
    updateState({ jobTitleFilter: title, currentPage: 1 });
  }, [updateState]);

  const setSourceFilter = useCallback((source: string) => {
    updateState({ sourceFilter: source, currentPage: 1 });
  }, [updateState]);

  const setHasRecordingsFilter = useCallback((hasRecordings: boolean | null) => {
    updateState({ hasRecordingsFilter: hasRecordings, currentPage: 1 });
  }, [updateState]);

  const setSortField = useCallback((field: string) => {
    updateState({ sortField: field });
  }, [updateState]);

  const setSortOrder = useCallback((order: string) => {
    updateState({ sortOrder: order });
  }, [updateState]);

  const resetState = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setState(DEFAULT_STATE);
  }, []);

  return {
    ...state,
    setCurrentPage,
    setItemsPerPage,
    setSearchTerm,
    setCategoryFilter,
    setCompanyFilter,
    setJobTitleFilter,
    setSourceFilter,
    setHasRecordingsFilter,
    setSortField,
    setSortOrder,
    resetState,
  };
};