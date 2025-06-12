// frontend/src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Stories } from './pages/Stories';
import { CreateStory } from './pages/CreateStory';
import { Practice } from './pages/Practice';
import { Analytics } from './pages/Analytics';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // You can log to an error reporting service here
        console.error('Global error:', error, errorInfo);
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="stories" element={<Stories />} />
            <Route path="stories/new" element={<CreateStory />} />
            <Route path="practice" element={<Practice />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;