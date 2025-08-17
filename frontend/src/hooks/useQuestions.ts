import { useQuery } from '@apollo/client';
import { GET_QUESTIONS_PAGINATED } from '../graphql/queries';
import { Question } from '../types';
import { useQuestionsState } from './useQuestionsState';

export interface QuestionsData {
  // Data
  questions: Question[];
  totalCount: number;
  loading: boolean;
  error: any;
  
  // Pagination
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  
  // Filters
  searchTerm: string;
  categoryFilter: string;
  companyFilter: string;
  jobTitleFilter: string;
  sourceFilter: string;
  hasRecordingsFilter: boolean | null;
  
  // Sorting
  sortField: string;
  sortOrder: string;
  
  // Actions
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  setSearchTerm: (term: string) => void;
  setCategoryFilter: (category: string) => void;
  setCompanyFilter: (company: string) => void;
  setJobTitleFilter: (title: string) => void;
  setSourceFilter: (source: string) => void;
  setHasRecordingsFilter: (hasRecordings: boolean | null) => void;
  setSortField: (field: string) => void;
  setSortOrder: (order: string) => void;
  refetch: () => void;
  resetState: () => void;
}

export const useQuestionsPaginated = (): QuestionsData => {
  // Use persistent state hook
  const persistentState = useQuestionsState();

  // GraphQL Query with persistent state
  const { data, loading, error, refetch } = useQuery(GET_QUESTIONS_PAGINATED, {
    variables: {
      limit: parseInt(persistentState.itemsPerPage.toString()),
      offset: parseInt(((persistentState.currentPage - 1) * persistentState.itemsPerPage).toString()),
      filters: {
        searchTerm: persistentState.searchTerm || undefined,
        categoryId: persistentState.categoryFilter || undefined,
        companyFilter: persistentState.companyFilter || undefined,
        jobTitleFilter: persistentState.jobTitleFilter || undefined,
        sourceFilter: persistentState.sourceFilter !== 'all' ? persistentState.sourceFilter : undefined,
        hasRecordings: persistentState.hasRecordingsFilter
      },
      sort: {
        field: persistentState.sortField,
        order: persistentState.sortOrder
      }
    },
    fetchPolicy: 'cache-first', // Use cache first for better performance
    errorPolicy: 'all'
  });

  // Derived values
  const questions = data?.questions?.questions || [];
  const totalCount = data?.questions?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / persistentState.itemsPerPage);
  const hasNextPage = data?.questions?.hasNextPage || false;
  const hasPreviousPage = data?.questions?.hasPreviousPage || false;

  return {
    // Data
    questions,
    totalCount,
    loading,
    error,
    
    // Pagination
    currentPage: persistentState.currentPage,
    itemsPerPage: persistentState.itemsPerPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    
    // Filters
    searchTerm: persistentState.searchTerm,
    categoryFilter: persistentState.categoryFilter,
    companyFilter: persistentState.companyFilter,
    jobTitleFilter: persistentState.jobTitleFilter,
    sourceFilter: persistentState.sourceFilter,
    hasRecordingsFilter: persistentState.hasRecordingsFilter,
    
    // Sorting
    sortField: persistentState.sortField,
    sortOrder: persistentState.sortOrder,
    
    // Actions
    setCurrentPage: persistentState.setCurrentPage,
    setItemsPerPage: persistentState.setItemsPerPage,
    setSearchTerm: persistentState.setSearchTerm,
    setCategoryFilter: persistentState.setCategoryFilter,
    setCompanyFilter: persistentState.setCompanyFilter,
    setJobTitleFilter: persistentState.setJobTitleFilter,
    setSourceFilter: persistentState.setSourceFilter,
    setHasRecordingsFilter: persistentState.setHasRecordingsFilter,
    setSortField: persistentState.setSortField,
    setSortOrder: persistentState.setSortOrder,
    refetch,
    resetState: persistentState.resetState,
  };
};