import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', path: '/', icon: '📊' },
  { name: 'Stories', path: '/stories', icon: '📝' },
  { name: 'Practice', path: '/practice', icon: '🎯' },
  { name: 'Analytics', path: '/analytics', icon: '📈' },
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-20 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1.5 hover:bg-gray-50 shadow-sm text-gray-600 hover:text-gray-900"
      >
        <span className="block w-4 h-4 text-center leading-4">
          {isCollapsed ? '→' : '←'}
        </span>
      </button>
      <nav className="h-full py-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className={`flex-shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'}`}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="truncate">{item.name}</span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
}; 