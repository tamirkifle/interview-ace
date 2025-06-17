import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { LibraryHeader } from '../components/library/LibraryHeader';
import { TabNavigation } from '../components/library/TabNavigation';
import { EmptyState } from '../components/library/EmptyState';
import { QuestionsTable } from '../components/library/QuestionsTable';
import { RecordingsList } from '../components/library/RecordingsList';
import { LoadingSpinner } from '../components/ui';
import { MessageCircleQuestion, BookOpen, Video } from 'lucide-react';
import { GET_QUESTIONS, GET_ALL_RECORDINGS } from '../graphql/queries';

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
    icon: MessageCircleQuestion,
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
  
  // Fetch questions data to determine if we have any
  const { data: questionsData, loading: questionsLoading } = useQuery(GET_QUESTIONS);
  const hasQuestions = (questionsData?.questions?.length || 0) > 0;

  // Fetch recordings data
  const { data: recordingsData, loading: recordingsLoading } = useQuery(GET_ALL_RECORDINGS);
  const hasRecordings = (recordingsData?.recordings?.length || 0) > 0;

  // Placeholder data states for other tabs
  const [hasStories] = useState(false);

  const activeTabConfig = TABS.find(tab => tab.id === activeTab)!;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'questions':
        if (questionsLoading) {
          return (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          );
        }
        
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
        
        return <QuestionsTable />;

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
        if (recordingsLoading) {
          return (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          );
        }
        
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
        
        return <RecordingsList />;

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