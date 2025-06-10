import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 ml-64 pt-16 transition-all duration-300">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}; 