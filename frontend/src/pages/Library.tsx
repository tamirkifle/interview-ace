import { useState } from 'react';
import { LibraryHeader } from '../components/library/LibraryHeader';
import { TabNavigation } from '../components/library/TabNavigation';
import { EmptyState } from '../components/library/EmptyState';
import { LoadingSpinner } from '../components/ui';
import { FileQuestion, BookOpen, Video } from 'lucide-react';

type TabType = 'questions' | 'stories' | 'recordings';

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  emptyTitle: string;
  emptyDescription: string;
}

const TABS: TabConfig[] = [
  {
    id: 'questions',
    label: 'Questions',
    icon: FileQuestion,
    emptyTitle: 'No questions yet',
    emptyDescription: 'Start by generating questions or creating custom ones in the Practice section.'
  },
  {
    id: 'stories',
    label: 'Stories',
    icon: BookOpen,
    emptyTitle: 'No stories yet',
    emptyDescription: 'Create your first STAR story to build your interview response library.'
  },
  {
    id: 'recordings',
    label: 'Recordings',
    icon: Video,
    emptyTitle: 'No recordings yet',
    emptyDescription: 'Practice answering questions and record your responses to track your progress.'
  }
];

export const Library = () => {
  const [activeTab, setActiveTab] = useState<TabType>('questions');
  const [isLoading] = useState(false);

  // Placeholder data states - will be replaced with real data in future commits
  const [hasQuestions] = useState(false);
  const [hasStories] = useState(false);
  const [hasRecordings] = useState(false);

  const activeTabConfig = TABS.find(tab => tab.id === activeTab)!;

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    switch (activeTab) {
      case 'questions':
        if (!hasQuestions) {
          return (
            <EmptyState
              icon={activeTabConfig.icon}
              title={activeTabConfig.emptyTitle}
              description={activeTabConfig.emptyDescription}
              actionLabel="Go to Practice"
              actionHref="/practice"
            />
          );
        }
        return (
          <div className="space-y-4">
            {/* Search and filter section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search questions..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">All Categories</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">All Sources</option>
                  <option value="seeded">Seeded</option>
                  <option value="generated">Generated</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
            
            {/* Questions list placeholder */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-500 text-center">Questions list will be implemented in the next commit</p>
            </div>
          </div>
        );

      case 'stories':
        if (!hasStories) {
          return (
            <EmptyState
              icon={activeTabConfig.icon}
              title={activeTabConfig.emptyTitle}
              description={activeTabConfig.emptyDescription}
              actionLabel="Create Story"
              actionHref="/stories/new"
            />
          );
        }
        return (
          <div className="space-y-4">
            {/* Search section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <input
                type="text"
                placeholder="Search stories..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            {/* Stories grid placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <p className="text-gray-500 text-center">Stories grid will be implemented in a future commit</p>
              </div>
            </div>
          </div>
        );

      case 'recordings':
        if (!hasRecordings) {
          return (
            <EmptyState
              icon={activeTabConfig.icon}
              title={activeTabConfig.emptyTitle}
              description={activeTabConfig.emptyDescription}
              actionLabel="Practice Questions"
              actionHref="/practice"
            />
          );
        }
        return (
          <div className="space-y-4">
            {/* View toggle and filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2">
                  <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg">
                    By Date
                  </button>
                  <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                    By Question
                  </button>
                </div>
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            {/* Recordings list placeholder */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-500 text-center">Recordings list will be implemented in a future commit</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LibraryHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TabNavigation
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as TabType)}
        />
        
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};