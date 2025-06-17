import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Stories } from './pages/Stories';
import { CreateStory } from './pages/CreateStory';
import { Practice } from './pages/Practice';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Library } from './pages/Library';
import { ErrorBoundary } from './components/ErrorBoundary';
import { EditQuestion } from './pages/EditQuestion';
import { RecordingView } from './pages/RecordingView';


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
            <Route path="library" element={<Library />} />
            <Route path="library/questions/:id/edit" element={<EditQuestion />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          {/* Recording view is outside the main layout for full-width video */}
          <Route path="recordings/:id" element={<RecordingView />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;