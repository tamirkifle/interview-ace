import { cn } from '../../utils/cn';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabNavigation = ({ tabs, activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <nav className="flex flex-col sm:flex-row">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center px-6 py-4 text-sm font-medium transition-colors relative",
                "hover:bg-gray-50 focus:outline-none focus:bg-gray-50",
                isActive ? "text-primary-600" : "text-gray-700",
                index > 0 && "sm:border-l border-gray-200"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 mr-2",
                isActive ? "text-primary-600" : "text-gray-400"
              )} />
              {tab.label}
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};