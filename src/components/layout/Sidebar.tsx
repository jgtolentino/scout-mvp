import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  Package, 
  Users, 
  Bot,
  ChevronLeft, // Added for collapse button
  ChevronRight,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useFilterStore } from '../../store/useFilterStore';
import { clsx } from 'clsx';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { getActiveFilterCount, resetFilters } = useFilterStore();
  const activeFilters = getActiveFilterCount();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { name: 'Overview', href: '/', icon: Home, description: 'Executive dashboard' },
    { name: 'Trends', href: '/trends', icon: TrendingUp, description: 'Regional & temporal analysis' },
    { name: 'Product Mix', href: '/products', icon: Package, description: 'Category & basket analysis' },
    { name: 'Consumers', href: '/consumers', icon: Users, description: 'Demographics & behavior' },
    { name: 'RetailBot', href: '/retailbot', icon: Bot, description: 'AI insights & assistance' },
  ];

  return (
    <nav 
      className={clsx(
        "tbwa-sidebar hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300 ease-in-out",
        isCollapsed ? "lg:w-20" : "lg:w-64"
      )}
      aria-label="Main navigation"
    >
      {/* TBWA Header */}
      <div className={clsx(
        "p-6 border-b border-gray-200 bg-gradient-to-r from-tbwa-navy to-tbwa-navy-800",
        isCollapsed ? "px-3 py-6" : "p-6"
      )}>
        <div className={clsx("flex items-center", isCollapsed ? "justify-center" : "space-x-3")}>
          <div className={clsx(
            "bg-tbwa-yellow rounded-xl flex items-center justify-center",
            isCollapsed ? "w-10 h-10" : "w-10 h-10" // Icon container size remains same
          )}>
            <BarChart3 className={clsx("text-tbwa-navy", isCollapsed ? "h-6 w-6" : "h-6 w-6")} />
          </div>
          {!isCollapsed && (
            <div>
              <div className="text-xl font-bold text-white">Scout</div>
              <div className="text-xs text-tbwa-yellow font-medium uppercase tracking-wider">Analytics</div>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <div className="mt-3 text-xs text-tbwa-navy-100">
            Philippine FMCG Intelligence
          </div>
        )}
      </div>

      {/* Filter Status */}
      {!isCollapsed && activeFilters > 0 && (
        <div className="px-6 py-4 bg-tbwa-navy-50 border-b border-tbwa-navy-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-tbwa-yellow rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-tbwa-navy">
                {activeFilters} filter{activeFilters > 1 ? 's' : ''} active
              </span>
            </div>
            <button
              onClick={resetFilters}
              className="text-xs text-tbwa-navy-600 hover:text-tbwa-navy font-medium hover:underline"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 flex flex-col min-h-0 pt-6 pb-4 overflow-y-auto">
        <div className={clsx("flex-1 space-y-1", isCollapsed ? "px-2" : "px-4")}>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                title={isCollapsed ? item.name : item.description} // Tooltip
                className={clsx(
                  "tbwa-nav-item relative group", // Added group for custom tooltip styling if needed later
                  isActive ? "tbwa-nav-item-active" : "",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                <div className={clsx("flex items-center", isCollapsed ? "" : "space-x-3")}>
                  <item.icon className={clsx("flex-shrink-0 h-5 w-5", isCollapsed ? "mx-auto" : "")} />
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs opacity-75 mt-0.5">{item.description}</div>
                    </div>
                  )}
                  {!isCollapsed && (
                    <ChevronRight className={clsx(
                      "h-4 w-4 transition-transform",
                      isActive ? "rotate-90" : ""
                    )} />
                  )}
                </div>
                {/* Active indicator */}
                {isActive && (
                  <div className={clsx(
                    "absolute top-0 bottom-0 bg-tbwa-yellow rounded-l-full",
                    isCollapsed ? "right-0 w-1" : "right-0 w-1"
                  )}></div>
                )}
                 {/* Basic HTML Tooltip (visible on hover when collapsed) */}
                 {isCollapsed && (
                  <span className="absolute left-full ml-2 -translate-y-1/2 top-1/2
                                   bg-gray-700 text-white text-xs px-2 py-1 rounded
                                   opacity-0 group-hover:opacity-100 transition-opacity
                                   whitespace-nowrap pointer-events-none z-50">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer Actions (Collapse Button & Refresh) */}
        <div className={clsx("px-4 pt-4 space-y-2 border-t border-gray-200", isCollapsed ? "px-2" : "px-4")}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={clsx(
              "w-full tbwa-nav-item",
              isCollapsed ? "justify-center" : "justify-start"
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            {!isCollapsed && (
              <span className="text-sm font-medium ml-2">Collapse</span>
            )}
          </button>

          <button
            onClick={() => window.location.reload()}
            className={clsx("w-full tbwa-nav-item", isCollapsed ? "justify-center" : "justify-start")}
            title="Refresh data"
          >
            <RefreshCw className={clsx("h-4 w-4", isCollapsed ? "" : "mr-2")} />
            {!isCollapsed && (
              <span className="text-sm font-medium">Refresh Data</span>
            )}
          </button>
          
          {/* TBWA Branding */}
          {!isCollapsed && (
            <div className="pt-4 pb-2">
              <div className="text-center">
                <div className="text-xs text-gray-500 font-medium">Powered by</div>
              <div className="tbwa-text-gradient text-sm font-bold mt-1">TBWA Philippines</div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;