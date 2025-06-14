import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  Package, 
  Users, 
  ChevronRight,
  BarChart3,
  RefreshCw,
  MessageCircle,
  Database
} from 'lucide-react';
import { useFilterStore } from '../../store/useFilterStore';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { getActiveFilterCount, resetFilters } = useFilterStore();
  const activeFilters = getActiveFilterCount();

  const navigation = [
    { name: 'Overview', href: '/', icon: Home, description: 'Executive dashboard' },
    { name: 'Transaction Trends', href: '/trends', icon: TrendingUp, description: 'Temporal analysis' },
    { name: 'Product Mix', href: '/products', icon: Package, description: 'Category performance' },
    { name: 'Consumer Insights', href: '/consumers', icon: Users, description: 'Demographics' },
    { name: 'All Transactions', href: '/transactions', icon: Database, description: 'Complete records (5K)' },
    { name: 'Chat', href: '/chat', icon: MessageCircle, description: 'Scout AI Assistant' },
  ];

  return (
    <nav 
      className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200 lg:shadow-sm"
      aria-label="Main navigation"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">Scout Analytics</span>
        </div>
      </div>

      {/* Filter Status */}
      {activeFilters > 0 && (
        <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-700">
              {activeFilters} filter{activeFilters > 1 ? 's' : ''} active
            </div>
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 flex flex-col min-h-0 pt-6 pb-4 overflow-y-auto">
        <div className="flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                </div>
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${
                    isActive ? 'text-blue-600 rotate-90' : 'text-gray-300 group-hover:text-gray-400'
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="px-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;