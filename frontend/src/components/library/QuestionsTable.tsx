import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_QUESTIONS, GET_CATEGORIES } from '../../graphql/queries';
import { DELETE_QUESTIONS } from '../../graphql/mutations';
import { Question, Job } from '../../types';
import { Edit3, Trash2, MessageCircleQuestion, ChevronUp, ChevronDown, AlertCircle, X } from 'lucide-react';
import { Badge, LoadingSpinner, ErrorMessage } from '../ui';
import { format, parseISO, isValid } from 'date-fns';

type SortField = 'text' | 'createdAt' | 'recordings' | 'difficulty';
type SortOrder = 'asc' | 'desc';
type FilterSource = 'all' | 'generated' | 'custom';

export const QuestionsTable = () => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<FilterSource>('all');
  const [hasRecordingsFilter, setHasRecordingsFilter] = useState<boolean | null>(null);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { data, loading, error } = useQuery(GET_QUESTIONS, {
    fetchPolicy: 'cache-and-network'
  });
  const { data: categoriesData } = useQuery(GET_CATEGORIES);

  const [deleteQuestions] = useMutation(DELETE_QUESTIONS, {
    refetchQueries: [{ query: GET_QUESTIONS }]
  });
  
  const questions = data?.questions || [];
  const categories = categoriesData?.categories || [];
  
  const uniqueCompanies: string[] = useMemo(() => {
    const companies = new Set<string>();
    questions.forEach((q: Question) => {
      if (q.job?.company) {
        companies.add(q.job.company);
      }
    });
    return Array.from(companies).sort();
  }, [questions]);
  
  const parseDate = (dateValue: any): Date => {
    if (!dateValue) return new Date(0);
    
    if (dateValue && typeof dateValue === 'object') {
      if (dateValue.year && dateValue.month && dateValue.day) {
        return new Date(dateValue.year, dateValue.month - 1, dateValue.day);
      }
      if (dateValue.toString) {
        const dateStr = dateValue.toString();
        const date = parseISO(dateStr);
        if (isValid(date)) return date;
      }
    }
    
    if (typeof dateValue === 'string') {
      const date = parseISO(dateValue);
      if (isValid(date)) return date;
    }
    
    const date = new Date(dateValue);
    if (isValid(date)) return date;
    
    return new Date(0);
  };
  
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return 'N/A';
    try {
      if (dateValue && typeof dateValue === 'object') {
        if (dateValue.year && dateValue.month && dateValue.day) {
          const date = new Date(dateValue.year, dateValue.month - 1, dateValue.day);
          return format(date, 'MMM d, yyyy');
        }
        if (dateValue.toString) {
          const dateStr = dateValue.toString();
          const date = parseISO(dateStr);
          if (isValid(date)) {
            return format(date, 'MMM d, yyyy');
          }
        }
      }
      
      if (typeof dateValue === 'string') {
        const date = parseISO(dateValue);
        if (isValid(date)) {
          return format(date, 'MMM d, yyyy');
        }
      }
      
      const date = new Date(dateValue);
      if (isValid(date)) {
        return format(date, 'MMM d, yyyy');
      }
      
      return 'Invalid date';
    } catch (error) {
      console.error('Date formatting error:', error, dateValue);
      return 'Invalid date';
    }
  };
  
  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = [...questions];

    if (searchTerm) {
      filtered = filtered.filter((q: Question) => 
        q.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((q: Question) => 
        q.categories.some((c: any) => c.id === categoryFilter)
      );
    }
    
    if (companyFilter) {
      filtered = filtered.filter((q: Question) => 
        q.job?.company === companyFilter
      );
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter((q: Question) => {
        const source = q.source || 'generated';
        return source === sourceFilter;
      });
    }

    if (hasRecordingsFilter !== null) {
      filtered = filtered.filter((q: Question) => {
        const hasRecordings = (q.recordings?.length || 0) > 0;
        return hasRecordings === hasRecordingsFilter;
      });
    }

    filtered.sort((a: Question, b: Question) => {
      let comparison = 0;
      switch (sortField) {
        case 'text':
          comparison = a.text.localeCompare(b.text);
          break;
        case 'createdAt':
          const dateA = parseDate(a.createdAt);
          const dateB = parseDate(b.createdAt);
          comparison = dateA.getTime() - dateB.getTime();
          break;
        case 'recordings':
          comparison = (a.recordings?.length || 0) - (b.recordings?.length || 0);
          break;
        case 'difficulty':
          const difficultyOrder: { [key: string]: number } = { easy: 0, medium: 1, hard: 2 };
          comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [questions, searchTerm, categoryFilter, companyFilter, sourceFilter, hasRecordingsFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedQuestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedQuestions.map(q => q.id)));
    }
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const confirmMessage = selectedIds.size === 1 
      ? 'Are you sure you want to delete this question?' 
      : `Are you sure you want to delete ${selectedIds.size} questions?`;
    if (!confirm(confirmMessage)) return;

    setDeleteError(null);

    try {
      await deleteQuestions({
        variables: {
          ids: Array.from(selectedIds)
        }
      });
      setSelectedIds(new Set());
    } catch (error: any) {
      console.error('Failed to delete questions:', error);
      const errorMessage = error.graphQLErrors?.[0]?.message || 
                          error.message || 
                          'Failed to delete questions';
      setDeleteError(errorMessage);
    }
  };

  const getSourceBadge = (question: Question) => {
    const source = question.source || 'generated';
    const displaySource = source === 'seeded' ? 'generated' : source;
    const colors: { [key: string]: string } = {
      generated: 'bg-green-100 text-green-700',
      custom: 'bg-purple-100 text-purple-700'
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[displaySource] || colors.generated}`}>
        {displaySource}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      easy: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      hard: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[difficulty]}`}>
        {difficulty}
      </span>
    );
  };

  if (loading && questions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="Failed to load questions" />;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {deleteError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-sm text-red-700">{deleteError}</span>
            </div>
            <button
              onClick={() => setDeleteError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-4">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          
          <select 
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Companies</option>
            {uniqueCompanies.map((company) => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>

          <select 
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as FilterSource)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Sources</option>
            <option value="generated">Generated</option>
            <option value="custom">Custom</option>
          </select>

          <select 
            value={hasRecordingsFilter === null ? '' : hasRecordingsFilter.toString()}
            onChange={(e) => setHasRecordingsFilter(e.target.value === '' ? null : e.target.value === 'true')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Questions</option>
            <option value="true">With Recordings</option>
            <option value="false">Without Recordings</option>
          </select>
        </div>

        {selectedIds.size > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedIds.size} question{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleDeleteSelected}
              className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete Selected
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredAndSortedQuestions.length && filteredAndSortedQuestions.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </th>
                <th 
                  className="w-1/2 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('text')}
                >
                  <div className="flex items-center">
                    Question
                    {sortField === 'text' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('difficulty')}
                >
                  <div className="flex items-center">
                    Difficulty
                    {sortField === 'difficulty' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('recordings')}
                >
                  <div className="flex items-center">
                    Recordings
                    {sortField === 'recordings' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    Created
                    {sortField === 'createdAt' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedQuestions.map((question: Question) => (
                <tr key={question.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(question.id)}
                      onChange={() => handleSelect(question.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 max-w-sm">
                    <p className="text-sm text-gray-900 mb-2">{question.text}</p>
                    <div className="flex flex-wrap gap-1">
                      {question.categories.map((cat: any) => (
                        <Badge
                          key={cat.id}
                          variant="colored"
                          color={cat.color}
                          size="xs"
                        >
                          {cat.name}
                        </Badge>
                      ))}
                      {question.traits.map((trait: any) => (
                        <Badge
                          key={trait.id}
                          variant="square"
                          size="xs"
                          className="w-max"
                        >
                          {trait.name}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getDifficultyBadge(question.difficulty)}
                  </td>
                  <td className="px-6 py-4">
                    {question.job ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{question.job.company}</span>
                        <span className="text-xs text-gray-500">{question.job.title}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {question.recordings?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {formatDate(question.createdAt)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/library/questions/${question.id}/edit`)}
                        className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded transition-colors"
                        title="Edit question"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this question?')) {
                            deleteQuestions({ 
                              variables: { ids: [question.id] } 
                            }).catch((error: any) => {
                              console.error('Failed to delete question:', error);
                              const errorMessage = error.graphQLErrors?.[0]?.message || 
                                                  error.message || 
                                                  'Failed to delete question';
                              setDeleteError(errorMessage);
                            });
                          }
                        }}
                        className="p-1 text-red-600 hover:text-red-900 hover:bg-red-100 rounded transition-colors"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedQuestions.length === 0 && (
          <div className="text-center py-12">
            <MessageCircleQuestion className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No questions found</p>
          </div>
        )}
      </div>
    </div>
  );
};