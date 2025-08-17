import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_CATEGORIES } from '../../graphql/queries';
import { DELETE_QUESTIONS } from '../../graphql/mutations';
import { Question } from '../../types';
import { Edit3, Trash2, MessageCircleQuestion, ChevronUp, ChevronDown, AlertCircle, X, Briefcase, Code, Building2 } from 'lucide-react';
import { Badge, LoadingSpinner, ErrorMessage } from '../ui';
import { Pagination } from '../ui/Pagination';
import { CollapsibleText } from '../ui/CollapsibleText';

import { QuestionsData } from '../../hooks/useQuestions';

interface QuestionsTableProps {
  questionsData: QuestionsData;
}

export const QuestionsTable = ({ questionsData }: QuestionsTableProps) => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    questions,
    totalCount,
    loading,
    error,
    currentPage,
    itemsPerPage,
    totalPages,
    searchTerm,
    categoryFilter,
    companyFilter,
    jobTitleFilter,
    sourceFilter,
    hasRecordingsFilter,
    sortField,
    sortOrder,
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
  } = questionsData;

  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const categories = categoriesData?.categories || [];

  const [deleteQuestions] = useMutation(DELETE_QUESTIONS, {
    onCompleted: () => {
      setSelectedIds(new Set());
      refetch();
    }
  });

  // Extract unique companies and job titles from current questions  
  const uniqueCompanies: string[] = useMemo(() => {
    const companies = new Set<string>();
    questions.forEach((q: Question) => {
      if (q.job?.company) {
        companies.add(q.job.company);
      }
    });
    return Array.from(companies).sort();
  }, [questions]);

  const uniqueJobTitles: string[] = useMemo(() => {
    const titles = new Set<string>();
    questions.forEach((q: Question) => {
      if (q.job?.title) {
        titles.add(q.job.title);
      }
    });
    return Array.from(titles).sort();
  }, [questions]);

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map(q => q.id)));
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
    } catch (error: any) {
      console.error('Failed to delete questions:', error);
      const errorMessage = error.graphQLErrors?.[0]?.message || 
                          error.message || 
                          'Failed to delete questions';
      setDeleteError(errorMessage);
    }
  };

  const getSourceBadge = (question: any) => {
    const sourceInfo = question.sourceInfo;
    if (!sourceInfo) return null;

    const getSourceConfig = () => {
      switch (sourceInfo.type) {
        case 'job':
          return {
            icon: <Building2 className="w-3 h-3" />,
            color: '#3B82F6',
            label: sourceInfo.displayName
          };
        case 'experience':
          return {
            icon: <Briefcase className="w-3 h-3" />,
            color: '#8B5CF6',
            label: sourceInfo.displayName
          };
        case 'project':
          return {
            icon: <Code className="w-3 h-3" />,
            color: '#10B981',
            label: sourceInfo.displayName
          };
        case 'custom':
          return {
            icon: null,
            color: '#F59E0B',
            label: 'Custom'
          };
        default:
          return {
            icon: null,
            color: '#6B7280',
            label: 'Generated'
          };
      }
    };

    const config = getSourceConfig();
    
    return (
      <Badge
        variant="square"
        color={config.color}
        size="xs"
        className="flex items-center gap-1"
      >
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      easy: '#059669',
      medium: '#EA580C',
      hard: '#DC2626'
    };
    return (
      <Badge
        variant="colored"
        color={colors[difficulty]}
        size="xs"
      >
        {difficulty}
      </Badge>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:col-span-2 lg:col-span-1 xl:col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            value={jobTitleFilter}
            onChange={(e) => setJobTitleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Job Titles</option>
            {uniqueJobTitles.map((title) => (
              <option key={title} value={title}>{title}</option>
            ))}
          </select>

          <select 
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Sources</option>
            <option value="custom">Custom</option>
            <option value="job">Job Description</option>
            <option value="experience">Experience</option>
            <option value="project">Project</option>
            <option value="generated">Generated</option>
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
                    checked={selectedIds.size === questions.length && questions.length > 0}
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
              {questions.map((question: Question) => (
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
                    
                    {/* AI Reasoning - Collapsible */}
                    {(question as any).reasoning && (
                      <div className="mb-2">
                        <CollapsibleText 
                          text={(question as any).reasoning} 
                          wordLimit={15}
                          className="text-xs text-blue-600 italic"
                        />
                      </div>
                    )}
                    
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
                    {getSourceBadge(question)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {question.recordings?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {new Date(question.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/questions/${question.id}/edit`)}
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

        {questions.length === 0 && (
          <div className="text-center py-12">
            <MessageCircleQuestion className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No questions found</p>
            {totalCount > 0 && (
              <p className="text-sm text-gray-400 mt-2">
                Try a different page or adjust your filters
              </p>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalCount}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
};