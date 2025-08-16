import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_STORIES, GET_CATEGORIES } from '../../graphql/queries';
import { Story, Category } from '../../types';
import { Edit3, Trash2, BookOpen, ChevronUp, ChevronDown, AlertCircle, X, Search } from 'lucide-react';
import { Badge, LoadingSpinner, ErrorMessage } from '../ui';
import { format, parseISO, isValid } from 'date-fns';

type SortField = 'title' | 'createdAt' | 'recordings';
type SortOrder = 'asc' | 'desc';

export const StoriesList = () => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, loading, error } = useQuery(GET_STORIES, {
    fetchPolicy: 'cache-and-network'
  });
  const { data: categoriesData } = useQuery(GET_CATEGORIES);

  const stories = data?.stories || [];
  const categories = categoriesData?.categories || [];

  const parseDate = (dateValue: any): Date => {
    if (!dateValue) return new Date(0);
    
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
  
  const filteredAndSortedStories = useMemo(() => {
    let filtered = [...stories];

    if (searchTerm) {
      filtered = filtered.filter((s: Story) => 
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.situation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((s: Story) => 
        s.categories.some((c: Category) => c.id === categoryFilter)
      );
    }

    filtered.sort((a: Story, b: Story) => {
      let comparison = 0;
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
          const dateA = parseDate(a.createdAt);
          const dateB = parseDate(b.createdAt);
          comparison = dateA.getTime() - dateB.getTime();
          break;
        case 'recordings':
          comparison = (a.recordings?.length || 0) - (b.recordings?.length || 0);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [stories, searchTerm, categoryFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedStories.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedStories.map(s => s.id)));
    }
  };

  const handleSelect = (id: string, event: React.ChangeEvent) => {
    event.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleRowClick = (storyId: string) => {
    navigate(`/stories/${storyId}`);
  };

  const handleEditClick = (storyId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/stories/${storyId}/edit`);
  };

  if (loading && stories.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="Failed to load stories" />;
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
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search stories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat: Category) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {selectedIds.size > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedIds.size} stor{selectedIds.size !== 1 ? 'ies' : 'y'} selected
            </span>
            <button
              className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Stories Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredAndSortedStories.length && filteredAndSortedStories.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </th>
                <th 
                  className="w-1/2 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center">
                    Story
                    {sortField === 'title' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categories & Traits
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
              {filteredAndSortedStories.map((story: Story) => (
                <tr 
                  key={story.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(story.id)}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(story.id)}
                      onChange={(e) => handleSelect(story.id, e)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 max-w-sm">
                    <div className="font-medium text-gray-900 mb-1">{story.title}</div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {story.situation.length > 120 
                        ? `${story.situation.substring(0, 120)}...` 
                        : story.situation}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {story.categories && story.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {story.categories.slice(0, 3).map((cat: Category) => (
                            <Badge
                              key={cat.id}
                              variant="colored"
                              color={cat.color}
                              size="xs"
                            >
                              {cat.name}
                            </Badge>
                          ))}
                          {story.categories.length > 3 && (
                            <Badge variant="colored" color="#6B7280" size="xs">
                              +{story.categories.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      {story.traits && story.traits.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {story.traits.slice(0, 4).map((trait: any) => (
                            <Badge
                              key={trait.id}
                              variant="square"
                              size="xs"
                            >
                              {trait.name}
                            </Badge>
                          ))}
                          {story.traits.length > 4 && (
                            <Badge variant="square" size="xs">
                              +{story.traits.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {story.recordings?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {formatDate(story.createdAt)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => handleEditClick(story.id, e)}
                        className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded transition-colors"
                        title="Edit story"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this story?')) {
                            // TODO: Implement delete mutation
                            console.log('Delete story:', story.id);
                          }
                        }}
                        className="p-1 text-red-600 hover:text-red-900 hover:bg-red-100 rounded transition-colors"
                        title="Delete story"
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

        {filteredAndSortedStories.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchTerm || categoryFilter ? 'No stories match your filters' : 'No stories found'}
            </p>
            {!searchTerm && !categoryFilter && (
              <button
                onClick={() => navigate('/stories/new')}
                className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
              >
                Create Your First Story
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};