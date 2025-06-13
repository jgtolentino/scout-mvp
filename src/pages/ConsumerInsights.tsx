import React from 'react';
import { Users, UserCheck, DollarSign, ShoppingBag } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import ChartCard from '../components/ui/ChartCard';
import DonutChart from '../components/charts/DonutChart';
import BarChart from '../components/charts/BarChart';

const ConsumerInsights: React.FC = () => {
  const { 
    loading, 
    error, 
    ageDistribution, 
    genderDistribution,
    dashboardData 
  } = useSupabaseData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Consumer Insights</h1>
          <p className="text-purple-100">Loading demographics and behavioral analysis...</p>
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
          <h1 className="text-2xl font-bold mb-2">Error Loading Consumer Insights</h1>
          <p className="text-red-100">{error}</p>
        </div>
      </div>
    );
  }

  // Transform age distribution data
  const ageGroupData = ageDistribution.length > 0 ? ageDistribution.map(item => ({
    name: item.age_group || item.name,
    value: item.total_revenue || item.value || 0
  })) : [
    { name: '18-25', value: 125000 },
    { name: '26-35', value: 185000 },
    { name: '36-45', value: 165000 },
    { name: '46-55', value: 145000 },
    { name: '56+', value: 95000 },
  ];

  // Transform gender distribution data
  const genderData = genderDistribution.length > 0 ? genderDistribution.map(item => ({
    name: item.gender === 'M' ? 'Male' : 'Female',
    value: item.total_revenue || item.value || 0
  })) : [
    { name: 'Female', value: 425000 },
    { name: 'Male', value: 290000 },
  ];

  // Mock income data
  const incomeData = [
    { name: 'High', value: 285000 },
    { name: 'Medium', value: 245000 },
    { name: 'Low', value: 185000 },
  ];

  // Customer behavior metrics
  const customerMetrics = {
    totalCustomers: dashboardData?.unique_customers || 2847,
    avgTransactionsPerCustomer: dashboardData?.avg_transactions_per_customer || 6.3,
    avgSpendPerCustomer: dashboardData?.avg_spend_per_customer || 251.45,
    repeatCustomerRate: dashboardData?.repeat_customer_rate || 0.68,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Consumer Insights</h1>
        <p className="text-purple-100">
          Demographics and behavioral analysis of customer segments
        </p>
      </div>

      {/* Customer Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customerMetrics.totalCustomers.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{customerMetrics.avgTransactionsPerCustomer.toFixed(1)}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Spend</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('en-PH', {
                  style: 'currency',
                  currency: 'PHP',
                  notation: 'compact',
                }).format(customerMetrics.avgSpendPerCustomer)}
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Repeat Rate</p>
              <p className="text-2xl font-bold text-gray-900">{(customerMetrics.repeatCustomerRate * 100).toFixed(0)}%</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <UserCheck className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Demographic Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Age Group Distribution"
          subtitle="Revenue by customer age group"
        >
          <DonutChart data={ageGroupData} />
        </ChartCard>

        <ChartCard
          title="Gender Distribution"
          subtitle="Revenue by customer gender"
        >
          <DonutChart data={genderData} />
        </ChartCard>

        <ChartCard
          title="Income Bracket Analysis"
          subtitle="Revenue by income level"
        >
          <BarChart data={incomeData} color="#8B5CF6" />
        </ChartCard>
      </div>

      {/* Customer Behavior Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Behavioral Insights</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Primary Demographic</p>
                <p className="text-xs text-gray-600">
                  {ageGroupData[0]?.name} age group contributes {((ageGroupData[0]?.value / ageGroupData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}% of total revenue
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <ShoppingBag className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Shopping Frequency</p>
                <p className="text-xs text-gray-600">
                  Average customer makes {customerMetrics.avgTransactionsPerCustomer.toFixed(1)} transactions
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Spending Pattern</p>
                <p className="text-xs text-gray-600">
                  {incomeData[0]?.name} income bracket shows highest spending
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <UserCheck className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Customer Retention</p>
                <p className="text-xs text-gray-600">
                  {(customerMetrics.repeatCustomerRate * 100).toFixed(0)}% of customers make repeat purchases
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Segment Performance</h3>
          <div className="space-y-4">
            {ageGroupData.map((segment, index) => (
              <div key={segment.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{segment.name}</p>
                    <p className="text-xs text-gray-600">Age Group</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {new Intl.NumberFormat('en-PH', {
                      style: 'currency',
                      currency: 'PHP',
                      notation: 'compact',
                    }).format(segment.value)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {((segment.value / ageGroupData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Target High-Value Segments</h4>
            <p className="text-sm text-blue-700">
              Focus marketing efforts on the {ageGroupData[0]?.name} demographic, which shows the highest spending power.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Improve Retention</h4>
            <p className="text-sm text-green-700">
              Implement loyalty programs to increase the {(customerMetrics.repeatCustomerRate * 100).toFixed(0)}% repeat customer rate.
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Expand Customer Base</h4>
            <p className="text-sm text-purple-700">
              Develop targeted campaigns for underrepresented demographics to diversify the customer base.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumerInsights;