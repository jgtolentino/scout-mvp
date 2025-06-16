import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useFilterStore } from './store/useFilterStore';
import { LayoutWrapper } from './components/LayoutWrapper';
import Sidebar from './components/layout/Sidebar'; // Changed import
import GlobalFilterBar from './components/filters/GlobalFilterBar';
import Overview from './pages/Overview';
import TransactionTrends from './pages/TransactionTrends';
import ProductMix from './pages/ProductMix';
import ConsumerInsights from './pages/ConsumerInsights';
import RetailBot from './pages/RetailBot';
import PersistentChatWidget from './components/chat/PersistentChatWidget'; // <-- Import here
// SnowWhite Sanitized Components
import { ClientSanitizer } from './utils/client-sanitizer';

function App() {
  const { initializeFromURL } = useFilterStore();

  // Initialize SnowWhite client sanitization
  useEffect(() => {
    ClientSanitizer.initializeClientMode();
  }, []);

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
      {/* <TopNavbar /> Replaced by Sidebar */}
      <div className="flex"> {/* Added flex container for sidebar and main content */}
        <Sidebar /> {/* Sidebar added here */}
        <div className="dashboard-container flex-1"> {/* Added flex-1 to allow content to take remaining space */}
          <div className="filter-bar">
            <GlobalFilterBar />
          </div>
          
          <main className="flex-1 p-6 lg:ml-64"> {/* Added lg:ml-64 for expanded sidebar */}
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/trends" element={<TransactionTrends />} />
              <Route path="/products" element={<ProductMix />} />
              <Route path="/consumers" element={<ConsumerInsights />} />
              <Route path="/retailbot" element={<RetailBot />} />
            </Routes>
          </main>
        </div>
      </div>
      <PersistentChatWidget />
    </LayoutWrapper>
  );
}

export default App;