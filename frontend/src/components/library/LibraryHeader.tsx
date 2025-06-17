import { Library } from 'lucide-react';

export const LibraryHeader = () => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Library className="w-6 h-6 text-primary-600 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">Content Library</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Manage your interview preparation content
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};