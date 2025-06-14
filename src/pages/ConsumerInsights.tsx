import React, { useState, useEffect } from 'react';
import { Users, UserCheck, DollarSign, ShoppingBag } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useTransactionData } from '../hooks/useTransactionData';
import ChartCard from '../components/ui/ChartCard';
import DonutChart from '../components/charts/DonutChart';
import BarChart from '../components/charts/BarChart';
import { supabase } from '../lib/supabase';

const ConsumerInsights: React.FC = () => {
  const { 
    loading, 
    error, 
    ageDistribution, 
    genderDistribution,
    dashboardData 
  } = useSupabaseData();
  
  const mockData = useTransactionData();

  const [incomeData, setIncomeData] = useState<ChartData[]>([]);

  useEffect(() => {
    const fetchIncomeData = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_income_distribution');
        
        if (error) throw error;
        
        setIncomeData(data?.map(item => ({
          name: item.income_bracket,
          value: item.total_revenue || 0
        })) || []);
      } catch (error) {
        console.error('Error fetching income data:', error);
        setIncomeData([]);
      }
    };

    fetchIncomeData();
  }, []);

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
    name: item.gender === 'M' ? 'Male' : 
           item.gender === 'F' ? 'Female' : 
           item.gender === null || item.gender === undefined ? 'Unknown' : 
           item.gender,
    value: item.total_revenue || item.value || 0
  })) : mockData.genderDistribution || [
    { name: 'Female', value: 58 },
    { name: 'Male', value: 41 },
    { name: 'Unknown', value: 1 }
  ];

  // Payment method data from transaction hook
  const paymentMethodData = mockData.paymentMethodData || [];

  // Customer behavior metrics - mapping to useTransactionData KPIs
  const customerMetrics = {
    totalCustomers: dashboardData?.uniqueCustomers || mockData.kpiData.uniqueCustomers || 1000,
    avgItemsPerBasket: dashboardData?.units_per_tx || mockData.kpiData.unitsPerTx || 1.2,
    avgBasketValue: dashboardData?.avg_order_value || mockData.kpiData.avgOrderValue || 21,
    repeatCustomerRate: dashboardData?.repeat_rate || mockData.kpiData.repeatRate || 0.67,
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
              <p className="text-sm font-medium text-gray-600">Avg Items/Basket</p>
              <p className="text-2xl font-bold text-gray-900">{customerMetrics.avgItemsPerBasket.toFixed(1)}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Basket Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ₱{customerMetrics.avgBasketValue.toFixed(0)}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Age Distribution"
          subtitle="Customer count by age group"
        >
          <DonutChart data={ageGroupData} />
        </ChartCard>

        <ChartCard
          title="Gender Distribution"
          subtitle="Customer distribution by gender"
        >
          <DonutChart data={genderData} />
        </ChartCard>
      </div>

      {/* Shopping Behavior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Payment Method Usage"
          subtitle="Revenue by payment method"
        >
          <BarChart 
            data={paymentMethodData.map(item => ({
              name: item.name,
              value: item.value / 1000000 // Convert to millions for readability
            }))} 
            color="#8B5CF6" 
          />
        </ChartCard>

        <ChartCard
          title="Income Bracket Analysis"
          subtitle="Revenue by income level"
        >
          <BarChart data={incomeData} color="#10B981" />
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-600 font-medium">Segment</th>
                  <th className="text-right py-2 text-gray-600 font-medium">Share</th>
                  <th className="text-left py-2 text-gray-600 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                <tr className="border-b border-gray-100">
                  <td className="py-3 font-medium text-gray-900">Premium Shoppers</td>
                  <td className="py-3 text-right text-gray-700">22%</td>
                  <td className="py-3 text-gray-600">High value, frequent purchases</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 font-medium text-gray-900">Regular Customers</td>
                  <td className="py-3 text-right text-gray-700">45%</td>
                  <td className="py-3 text-gray-600">Consistent purchasing behavior</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-gray-900">Occasional Buyers</td>
                  <td className="py-3 text-right text-gray-700">33%</td>
                  <td className="py-3 text-gray-600">Sporadic purchase patterns</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Purchase Patterns</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Peak Shopping Day:</span>
                <br />
                <span className="text-blue-600">Saturday (28% of weekly sales)</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Most Popular Time:</span>
                <br />
                <span className="text-blue-600">12-3 PM (35% of daily sales)</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Preferred Payment:</span>
                <br />
                <span className="text-blue-600">Cash (45% of transactions)</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Avg Visit Duration:</span>
                <br />
                <span className="text-blue-600">23 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Lifetime Value */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Lifetime Value</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">₱12,400</p>
            <p className="text-sm text-gray-600">Average CLV</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">67%</p>
            <p className="text-sm text-gray-600">Customer Retention</p>
            <p className="text-xs text-gray-500">return within 30 days</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">2.3</p>
            <p className="text-sm text-gray-600">Purchase Frequency</p>
            <p className="text-xs text-gray-500">visits per month</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">8.5%</p>
            <p className="text-sm text-gray-600">Churn Rate</p>
            <p className="text-xs text-gray-500">monthly</p>
          </div>
        </div>
      </div>

      {/* Detailed Demographics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Demographics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Age Groups</h4>
            <div className="space-y-2">
              {[
                { name: '55+ years', count: 251, percent: 25 },
                { name: '45-54 years', count: 221, percent: 22 },
                { name: '35-44 years', count: 213, percent: 21 },
                { name: '25-34 years', count: 193, percent: 19 },
                { name: '18-24 years', count: 122, percent: 12 }
              ].map((age) => (
                <div key={age.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{age.name}</span>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">{age.count}</span>
                    <span className="text-xs text-gray-500 ml-1">({age.percent}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Payment Methods by Amount</h4>
            <div className="space-y-2">
              {paymentMethodData.map((payment) => (
                <div key={payment.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{payment.name}</span>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">
                      ₱{(payment.value / 1000000).toFixed(1)}M
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({((payment.value / mockData.kpiData.totalRevenue) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
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