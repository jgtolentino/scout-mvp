import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useFilterStore } from './store/useFilterStore';
import Sidebar from './components/layout/Sidebar';
import GlobalFilterBar from './components/filters/GlobalFilterBar';
import Overview from './pages/Overview';
import TransactionTrends from './pages/TransactionTrends';
import ProductMix from './pages/ProductMix';
import ConsumerInsights from './pages/ConsumerInsights';

function App() {
  const { initializeFromURL } = useFilterStore();

  useEffect(() => {
    initializeFromURL();
  }, [initializeFromURL]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <GlobalFilterBar />
        
        <div className="flex">
          <Sidebar />
          
          <main className="flex-1 lg:ml-64 p-6">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/trends" element={<TransactionTrends />} />
              <Route path="/products" element={<ProductMix />} />
              <Route path="/consumers" element={<ConsumerInsights />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;