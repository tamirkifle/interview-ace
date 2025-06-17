import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_QUESTIONS, GET_CATEGORIES } from '../../graphql/queries';
import { UPDATE_QUESTION, DELETE_QUESTIONS } from '../../graphql/mutations';
import { Question } from '../../types';
import { Edit2, Trash2, Check, X, FileQuestion, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';
import { Badge, LoadingSpinner, ErrorMessage } from '../ui';
import { format, parseISO, isValid } from 'date-fns';

type SortField = 'text' | 'createdAt' | 'recordings' | 'difficulty';
type SortOrder = 'asc' | 'desc';
type FilterSource = 'all' | 'seeded' | 'generated' | 'custom';

export const QuestionsTable = () => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<FilterSource>('all');
  const [hasRecordingsFilter, setHasRecordingsFilter] = useState<boolean | null>(null);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, loading, error } = useQuery(GET_QUESTIONS, {
    fetchPolicy: 'cache-and-network'
  });
  const { data: categoriesData } = useQuery(GET_CATEGORIES);

  const [updateQuestion] = useMutation(UPDATE_QUESTION);
  const [deleteQuestions] = useMutation(DELETE_QUESTIONS, {
    refetchQueries: [{ query: GET_QUESTIONS }]
  });

  const questions = data?.questions || [];
  const categories = categoriesData?.categories || [];

  // Helper functions
  const parseDate = (dateValue: any): Date => {
    if (!dateValue) return new Date(0); // Return epoch for null dates
    
    // Handle Neo4j DateTime objects
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
    
    // Handle string dates
    if (typeof dateValue === 'string') {
      const date = parseISO(dateValue);
      if (isValid(date)) return date;
    }
    
    // Try direct conversion
    const date = new Date(dateValue);
    if (isValid(date)) return date;
    
    return new Date(0); // Return epoch for invalid dates
  };

  const formatDate = (dateValue: any): string => {
    if (!dateValue) return 'N/A';
    
    try {
      // Handle Neo4j DateTime objects
      if (dateValue && typeof dateValue === 'object') {
        // Neo4j DateTime might have year, month, day properties
        if (dateValue.year && dateValue.month && dateValue.day) {
          const date = new Date(dateValue.year, dateValue.month - 1, dateValue.day);
          return format(date, 'MMM d, yyyy');
        }
        // Or it might be a Neo4j temporal type with toString()
        if (dateValue.toString) {
          const dateStr = dateValue.toString();
          const date = parseISO(dateStr);
          if (isValid(date)) {
            return format(date, 'MMM d, yyyy');
          }
        }
      }
      
      // Handle string dates
      if (typeof dateValue === 'string') {
        const date = parseISO(dateValue);
        if (isValid(date)) {
          return format(date, 'MMM d, yyyy');
        }
      }
      
      // Try direct Date conversion as last resort
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

  // Filter and sort questions
  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = [...questions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(q => 
        q.categories.some((c: any) => c.id === categoryFilter)
      );
    }

    // Source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(q => {
        // Determine source based on question properties
        const source = q.source || (q.id.startsWith('generated-') ? 'generated' : 'seeded');
        return source === sourceFilter;
      });
    }

    // Has recordings filter
    if (hasRecordingsFilter !== null) {
      filtered = filtered.filter(q => {
        const hasRecordings = (q.recordings?.length || 0) > 0;
        return hasRecordings === hasRecordingsFilter;
      });
    }

    // Sort
    filtered.sort((a, b) => {
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
  }, [questions, searchTerm, categoryFilter, sourceFilter, hasRecordingsFilter, sortField, sortOrder]);

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

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setEditText(question.text);
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editText.trim()) return;

    // Frontend validation
    if (editText.trim().length < 20) {
      setEditError('Question must be at least 20 characters long');
      return;
    }

    setEditError(null);

    try {
      await updateQuestion({
        variables: {
          id: editingId,
          text: editText.trim()
        },
        optimisticResponse: {
          updateQuestion: {
            __typename: 'Question',
            id: editingId,
            text: editText.trim(),
            difficulty: questions.find((q: Question) => q.id === editingId)?.difficulty || 'medium',
            commonality: questions.find((q: Question) => q.id === editingId)?.commonality || 5,
            updatedAt: new Date().toISOString(),
            categories: questions.find((q: Question) => q.id === editingId)?.categories || [],
            traits: questions.find((q: Question) => q.id === editingId)?.traits || []
          }
        }
      });
      setEditingId(null);
      setEditText('');
      setEditError(null);
    } catch (error: any) {
      console.error('Failed to update question:', error);
      // Extract error message from Apollo error
      const errorMessage = error.graphQLErrors?.[0]?.message || 
                          error.message || 
                          'Failed to update question';
      setEditError(errorMessage);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditError(null);
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
    const source = question.source || (question.id.startsWith('generated-') ? 'generated' : 'seeded');
    const colors: { [key: string]: string } = {
      seeded: 'bg-blue-100 text-blue-700',
      generated: 'bg-green-100 text-green-700',
      custom: 'bg-purple-100 text-purple-700'
    };

    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[source]}`}>
        {source}
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
      {/* Filters */}
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
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as FilterSource)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Sources</option>
            <option value="seeded">Seeded</option>
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

      {/* Table */}
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('text')}
                >
                  <div className="flex items-center">
                    Question
                    {sortField === 'text' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categories
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
                  Source
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
              {filteredAndSortedQuestions.map((question) => (
                <tr key={question.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(question.id)}
                      onChange={() => handleSelect(question.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    {editingId === question.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => {
                            setEditText(e.target.value);
                            // Clear error when user types
                            if (editError) setEditError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit();
                            } else if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                          className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            editError ? 'border-red-300' : 'border-gray-300'
                          }`}
                          autoFocus
                        />
                        {editError && (
                          <p className="text-xs text-red-600">{editError}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-900 max-w-xl">{question.text}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
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
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getDifficultyBadge(question.difficulty)}
                  </td>
                  <td className="px-6 py-4">
                    {getSourceBadge(question)}
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
                    {editingId === question.id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(question)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Edit2 className="w-4 h-4" />
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
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedQuestions.length === 0 && (
          <div className="text-center py-12">
            <FileQuestion className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No questions found</p>
          </div>
        )}
      </div>
    </div>
  );
};