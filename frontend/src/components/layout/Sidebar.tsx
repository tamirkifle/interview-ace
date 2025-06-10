import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { getIcon } from '../../utils/categoryIcons';

const navigation = [
  { name: 'Dashboard', path: '/' },
  { name: 'Stories', path: '/stories' },
  { name: 'Practice', path: '/practice' },
  { name: 'Analytics', path: '/analytics' },
];

interface SidebarProps {
  onCollapse: (collapsed: boolean) => void;
}

export const Sidebar = ({ onCollapse }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapse(newState);
  };

  return (
    <aside 
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-20 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="h-16 flex items-center px-3 border-b border-gray-200">
        <button
          onClick={handleCollapse}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <span className="w-5 h-5 flex items-center justify-center">
            {isCollapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </span>
        </button>
      </div>
      <nav className="h-[calc(100%-4rem)] py-4 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = getIcon(item.name);
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <span className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isCollapsed ? 'mx-auto' : 'mr-3'
                }`}>
                  <Icon className="w-5 h-5" />
                </span>
                {!isCollapsed && (
                  <span className="truncate transition-transform duration-200 group-hover:translate-x-1">
                    {item.name}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}; 