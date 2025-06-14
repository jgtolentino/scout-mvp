import { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useFilterStore } from './store/useFilterStore';
import { LayoutWrapper } from './components/LayoutWrapper';
import Sidebar from './components/layout/Sidebar';
import GlobalFilterBar from './components/filters/GlobalFilterBar';
import Overview from './pages/Overview';
import Performance from './pages/Performance';
import PromoCompetition from './pages/PromoCompetition';
import ScoutAI from './pages/Chat';
import PersistentChatWidget from './components/chat/PersistentChatWidget';
import LearnBotModal from './components/LearnBotModal';

function shouldShowLearnBot() {
  return localStorage.getItem('learnbot_seen') !== 'true';
}

function App() {
  const { initializeFromURL } = useFilterStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [learnBotOpen, setLearnBotOpen] = useState(false);

  // Demo: Deliberate console error for testing auto-issue workflow
  useEffect(() => {
    if (import.meta.env.VITE_SCOUT_DEMO === 'test-error') {
      console.error('demo-fail: Testing auto-issue creation workflow');
    }
  }, []);

  useEffect(() => {
    initializeFromURL();
  }, [initializeFromURL]);

  // Open LearnBot if ?learn=1 or on first visit
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('learn') === '1') {
      setLearnBotOpen(true);
    } else if (shouldShowLearnBot()) {
      setLearnBotOpen(true);
      localStorage.setItem('learnbot_seen', 'true');
    }
  }, [location.search]);

  return (
    <LayoutWrapper>
      <div className="dashboard-container">
        <div className="filter-bar">
          <GlobalFilterBar />
        </div>
        
        <div className="flex">
          <Sidebar />
          
          <main className="flex-1 lg:ml-64 p-6">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/promo" element={<PromoCompetition />} />
              <Route path="/ai" element={<ScoutAI />} />
            </Routes>
          </main>
        </div>
        
        {/* Persistent RetailBot Chat Widget */}
        <PersistentChatWidget />

        {/* LearnBot Modal */}
        <LearnBotModal isOpen={learnBotOpen} onClose={() => {
          setLearnBotOpen(false);
          // Remove ?learn=1 from URL if present
          const params = new URLSearchParams(location.search);
          if (params.get('learn') === '1') {
            params.delete('learn');
            navigate({ search: params.toString() }, { replace: true });
          }
        }} />
      </div>
    </LayoutWrapper>
  );
}

export default App;