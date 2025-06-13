import React from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Star } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import KpiCard from '../components/ui/KpiCard';
import ChartCard from '../components/ui/ChartCard';
import DonutChart from '../components/charts/DonutChart';
import LineChart from '../components/charts/LineChart';
import AIInsightsPanel from '../components/insights/AIInsightsPanel';
import { useNavigate } from 'react-router-dom';
import { useFilterStore } from '../store/useFilterStore';
import { ChartData } from '../types';

const Overview: React.FC = () => {
  const { 
    loading, 
    error, 
    dashboardData, 
    categoryData, 
    dailyTrends 
  } = useSupabaseData();
  
  const navigate = useNavigate();
  const { setCategories } = useFilterStore();

  const handleCategoryClick = (category: ChartData) => {
    setCategories([category.name]);
    navigate('/products');
  };

  const handleKpiClick = (type: string) => {
    switch (type) {
      case 'revenue':
        navigate('/trends');
        break;
      case 'transactions':
        navigate('/trends');
        break;
      case 'aov':
        navigate('/consumers');
        break;
      case 'product':
        navigate('/products');
        break;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Executive Dashboard</h1>
          <p className="text-blue-100">Loading real-time insights...</p>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Error Loading Dashboard</h1>
          <p className="text-red-100">{error}</p>
        </div>
      </div>
    );
  }

  // Transform Supabase data to match component expectations
  const kpiData = dashboardData ? {
    totalRevenue: dashboardData.total_revenue || 0,
    totalTransactions: dashboardData.total_transactions || 0,
    avgOrderValue: dashboardData.avg_transaction_value || 0,
    topProduct: dashboardData.top_product || 'N/A',
    revenueChange: dashboardData.revenue_change || 0,
    transactionChange: dashboardData.transaction_change || 0,
    aovChange: dashboardData.aov_change || 0,
    topProductChange: dashboardData.top_product_change || 0,
  } : {
    totalRevenue: 0,
    totalTransactions: 0,
    avgOrderValue: 0,
    topProduct: 'N/A',
    revenueChange: 0,
    transactionChange: 0,
    aovChange: 0,
    topProductChange: 0,
  };

  // Transform category data for charts
  const chartCategoryData = categoryData.map(item => ({
    name: item.category || item.name,
    value: item.total_revenue || item.value || 0,
    change: item.growth_rate || 0
  }));

  // Transform daily trends for line chart
  const timeSeriesData = dailyTrends.map(item => ({
    date: item.date,
    value: item.total_revenue || item.value || 0,
    label: item.date_label || item.label || item.date
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Executive Dashboard</h1>
        <p className="text-blue-100">
          Real-time insights from {kpiData.totalTransactions.toLocaleString()} transactions
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Revenue"
          value={new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            notation: 'compact',
          }).format(kpiData.totalRevenue)}
          change={kpiData.revenueChange}
          icon={<DollarSign className="h-5 w-5 text-blue-600" />}
          onClick={() => handleKpiClick('revenue')}
        />
        <KpiCard
          title="Total Transactions"
          value={kpiData.totalTransactions.toLocaleString()}
          change={kpiData.transactionChange}
          icon={<ShoppingCart className="h-5 w-5 text-blue-600" />}
          onClick={() => handleKpiClick('transactions')}
        />
        <KpiCard
          title="Avg Order Value"
          value={new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
          }).format(kpiData.avgOrderValue)}
          change={kpiData.aovChange}
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          onClick={() => handleKpiClick('aov')}
        />
        <KpiCard
          title="Top Product"
          value={kpiData.topProduct}
          change={kpiData.topProductChange}
          icon={<Star className="h-5 w-5 text-blue-600" />}
          onClick={() => handleKpiClick('product')}
        />
      </div>

      {/* Charts and AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Revenue Trend"
            subtitle="Daily revenue over time"
          >
            <LineChart
              data={timeSeriesData}
              onPointClick={() => navigate('/trends')}
            />
          </ChartCard>
        </div>

        {/* AI Insights */}
        <div>
          <AIInsightsPanel />
        </div>
      </div>

      {/* Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Category Performance"
          subtitle="Revenue by product category"
        >
          <DonutChart
            data={chartCategoryData}
            onSegmentClick={handleCategoryClick}
          />
        </ChartCard>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Categories</h3>
          <div className="space-y-3">
            {chartCategoryData.slice(0, 5).map((category, index) => (
              <div
                key={category.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {new Intl.NumberFormat('en-PH', {
                      style: 'currency',
                      currency: 'PHP',
                      notation: 'compact',
                    }).format(category.value)}
                  </div>
                  <div className={`text-xs ${category.change && category.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {category.change && category.change >= 0 ? '+' : ''}{category.change?.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;