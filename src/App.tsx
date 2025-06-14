import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useFilterStore } from './store/useFilterStore';
import Sidebar from './components/layout/Sidebar';
import GlobalFilterBar from './components/filters/GlobalFilterBar';
import Overview from './pages/Overview';
import TransactionTrends from './pages/TransactionTrends';
import ProductMix from './pages/ProductMix';
import ConsumerInsights from './pages/ConsumerInsights';
import Chat from './pages/Chat';
import ChatLauncher from './components/chat/ChatLauncher';

function App() {
  const { initializeFromURL } = useFilterStore();

  useEffect(() => {
    initializeFromURL();
  }, [initializeFromURL]);

  useEffect(() => {
    // Test audit bot - will be removed before merge
    console.error('audit-smoke');
  }, []);

  return (
    <div className="dashboard-container min-h-screen bg-gray-50">
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
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </main>
      </div>
      
      {/* Global chat widget */}
      <ChatLauncher />
    </div>
  );
}

export default App;