import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex pt-16">
        <Sidebar onCollapse={setIsSidebarCollapsed} />
        <main className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <div className="container px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}; 