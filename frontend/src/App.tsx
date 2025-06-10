import { useHealthCheck } from './hooks/useHealthCheck';

function App() {
  const { isConnected, isLoading, error } = useHealthCheck();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-8">
          Interview Prep Studio
        </h1>
        <div className="text-center">
          {isLoading ? (
            <p className="text-gray-600">Checking backend connection...</p>
          ) : isConnected ? (
            <p className="text-green-600 font-medium">
              Connected to Backend ✓
            </p>
          ) : (
            <p className="text-red-600 font-medium">
              Backend Connection Error: {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
