import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_QUESTIONS_PAGINATED } from '../graphql/queries';
import { Question } from '../types';

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
}

export const useQuestionsPaginated = (): QuestionsData => {
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [jobTitleFilter, setJobTitleFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [hasRecordingsFilter, setHasRecordingsFilter] = useState<boolean | null>(null);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // GraphQL Query
  const { data, loading, error, refetch } = useQuery(GET_QUESTIONS_PAGINATED, {
    variables: {
      limit: parseInt(itemsPerPage.toString()),
      offset: parseInt(((currentPage - 1) * itemsPerPage).toString()),
      filters: {
        searchTerm: searchTerm || undefined,
        categoryId: categoryFilter || undefined,
        companyFilter: companyFilter || undefined,
        jobTitleFilter: jobTitleFilter || undefined,
        sourceFilter: sourceFilter !== 'all' ? sourceFilter : undefined,
        hasRecordings: hasRecordingsFilter
      },
      sort: {
        field: sortField,
        order: sortOrder
      }
    },
    fetchPolicy: 'cache-and-network'
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, companyFilter, jobTitleFilter, sourceFilter, hasRecordingsFilter]);

  // Derived values
  const questions = data?.questions?.questions || [];
  const totalCount = data?.questions?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const hasNextPage = data?.questions?.hasNextPage || false;
  const hasPreviousPage = data?.questions?.hasPreviousPage || false;

  return {
    // Data
    questions,
    totalCount,
    loading,
    error,
    
    // Pagination
    currentPage,
    itemsPerPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    
    // Filters
    searchTerm,
    categoryFilter,
    companyFilter,
    jobTitleFilter,
    sourceFilter,
    hasRecordingsFilter,
    
    // Sorting
    sortField,
    sortOrder,
    
    // Actions
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
    refetch,
  };
};