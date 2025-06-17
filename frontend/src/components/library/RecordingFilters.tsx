import { useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useAPIKeys } from '../../hooks/useAPIKeys';

interface RecordingFiltersProps {
  questions: Array<{ id: string; text: string }>;
  stories: Array<{ id: string; title: string }>;
  onFilterChange: (filters: RecordingFilterState) => void;
}

export interface RecordingFilterState {
  startDate: string | null;
  endDate: string | null;
  questionId: string | null;
  storyId: string | null;
  hasMultiple: boolean | null;
  transcriptStatus: string | null;
  searchTerm: string;
}

export const RecordingFilters = ({ 
  questions, 
  stories, 
  onFilterChange 
}: RecordingFiltersProps) => {
  const { hasTranscriptionEnabled } = useAPIKeys();
  const [filters, setFilters] = useState<RecordingFilterState>({
    startDate: null,
    endDate: null,
    questionId: null,
    storyId: null,
    hasMultiple: null,
    transcriptStatus: null,
    searchTerm: ''
  });

  const handleFilterChange = (key: keyof RecordingFilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: RecordingFilterState = {
      startDate: null,
      endDate: null,
      questionId: null,
      storyId: null,
      hasMultiple: null,
      transcriptStatus: null,
      searchTerm: ''
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== null && v !== '');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Transcript Search - Only show if transcription is enabled */}
      {hasTranscriptionEnabled && (
        <div className="mt-4 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Search in Transcripts
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              placeholder="Search transcript content..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {/* Date Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Date Range
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value || null)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value || null)}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Question Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question
          </label>
          <select
            value={filters.questionId || ''}
            onChange={(e) => handleFilterChange('questionId', e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Questions</option>
            {questions.map(q => (
              <option key={q.id} value={q.id}>
                {q.text.length > 50 ? q.text.substring(0, 50) + '...' : q.text}
              </option>
            ))}
          </select>
        </div>

        {/* Story Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Story Used
          </label>
          <select
            value={filters.storyId || ''}
            onChange={(e) => handleFilterChange('storyId', e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Stories</option>
            <option value="none">No Story Used</option>
            {stories.map(s => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        {/* Multiple Recordings Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recording Count
          </label>
          <select
            value={filters.hasMultiple === null ? '' : filters.hasMultiple.toString()}
            onChange={(e) => handleFilterChange('hasMultiple', e.target.value === '' ? null : e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Recordings</option>
            <option value="true">Questions with Multiple Recordings</option>
            <option value="false">Questions with Single Recording</option>
          </select>
        </div>

        {/* Transcription Status Filter - Only show if transcription is enabled */}
        {hasTranscriptionEnabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transcription Status
            </label>
            <select
              value={filters.transcriptStatus || ''}
              onChange={(e) => handleFilterChange('transcriptStatus', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All</option>
              <option value="COMPLETED">With Transcript</option>
              <option value="NONE">Without Transcript</option>
              <option value="FAILED">Failed Transcription</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};