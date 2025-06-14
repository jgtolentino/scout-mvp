import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useFilterStore } from './store/useFilterStore';
import { LayoutWrapper } from './components/LayoutWrapper';
import Sidebar from './components/layout/Sidebar';
import GlobalFilterBar from './components/filters/GlobalFilterBar';
import Overview from './pages/Overview';
import TransactionTrends from './pages/TransactionTrends';
import ProductMix from './pages/ProductMix';
import ConsumerInsights from './pages/ConsumerInsights';
import Chat from './pages/Chat';
import AllTransactions from './pages/AllTransactions';
import YummyDashboard from './pages/YummyDashboard';
import LearnBot from './pages/LearnBot';
import PersistentChatWidget from './components/chat/PersistentChatWidget';

function App() {
  const { initializeFromURL } = useFilterStore();

  // Demo: Deliberate console error for testing auto-issue workflow
  useEffect(() => {
    if (import.meta.env.VITE_SCOUT_DEMO === 'test-error') {
      console.error('demo-fail: Testing auto-issue creation workflow');
    }
  }, []);

  useEffect(() => {
    initializeFromURL();
  }, [initializeFromURL]);

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
              <Route path="/trends" element={<TransactionTrends />} />
              <Route path="/products" element={<ProductMix />} />
              <Route path="/consumers" element={<ConsumerInsights />} />
              <Route path="/transactions" element={<AllTransactions />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/yummy" element={<YummyDashboard />} />
              <Route path="/learn" element={<LearnBot />} />
            </Routes>
          </main>
        </div>
        
        {/* Persistent RetailBot Chat Widget */}
        <PersistentChatWidget />
      </div>
    </LayoutWrapper>
  );
}

export default App;