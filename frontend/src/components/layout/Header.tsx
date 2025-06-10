import { Link } from 'react-router-dom';
import { useHealthCheck } from '../../hooks/useHealthCheck';

export const Header = () => {
  const { isConnected } = useHealthCheck();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            Interview Prep Studio
          </span>
        </Link>
        <div className="flex items-center space-x-6">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {isConnected ? 'Connected ✓' : 'Disconnected ✗'}
          </span>
        </div>
      </div>
    </header>
  );
}; 