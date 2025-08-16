import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Stories } from './pages/Stories';
import { CreateStory } from './pages/CreateStory';
import { StoryDetail } from './pages/StoryDetail';
import { Questions } from './pages/Questions';
import { Practice } from './pages/Practice';
import { Recordings } from './pages/Recordings';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { ErrorBoundary } from './components/ErrorBoundary';
import { EditQuestion } from './pages/EditQuestion';

function App() {  
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Global error:', error, errorInfo);
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="questions" element={<Questions />} />
            <Route path="practice" element={<Practice />} />
            <Route path="stories" element={<Stories />} />
            <Route path="stories/new" element={<CreateStory />} />
            <Route path="stories/:id" element={<StoryDetail />} />
            <Route path="stories/:id/edit" element={<CreateStory />} />
            <Route path="recordings" element={<Recordings />} />
            <Route path="questions/:id/edit" element={<EditQuestion />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;