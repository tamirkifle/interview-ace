import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Stories } from './pages/Stories';
import { Practice } from './pages/Practice';
import { Analytics } from './pages/Analytics';
import { CreateStory } from './pages/CreateStory';

function App() {
  return (
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
  );
}

export default App;
