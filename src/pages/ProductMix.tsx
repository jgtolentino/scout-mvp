import React from 'react';
import { Package, Star, TrendingUp, AlertCircle } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import ChartCard from '../components/ui/ChartCard';
import DonutChart from '../components/charts/DonutChart';
import BarChart from '../components/charts/BarChart';
import { useFilterStore } from '../store/useFilterStore';
import { ChartData } from '../types';

const ProductMix: React.FC = () => {
  const { 
    loading, 
    error, 
    categoryData, 
    brandData 
  } = useSupabaseData();
  
  const { setBrands, setCategories } = useFilterStore();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Product Mix Analysis</h1>
          <p className="text-orange-100">Loading category performance and insights...</p>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 h-80"></div>
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
          <h1 className="text-2xl font-bold mb-2">Error Loading Product Mix</h1>
          <p className="text-red-100">{error}</p>
        </div>
      </div>
    );
  }

  // Transform data for charts
  const chartCategoryData = categoryData.map(item => ({
    name: item.category || item.name,
    value: item.total_revenue || item.value || 0,
    change: item.growth_rate || 0
  }));

  const chartBrandData = brandData.map(item => ({
    name: item.brand || item.name,
    value: item.total_revenue || item.value || 0,
    change: item.growth_rate || 0
  })).slice(0, 8);

  // Mock product data since we don't have individual product breakdown yet
  const productData = [
    { name: 'Nescafé Original', value: 125000, quantity: 450 },
    { name: 'Coca-Cola Classic', value: 98000, quantity: 380 },
    { name: 'Lucky Me! Instant Noodles', value: 87000, quantity: 520 },
    { name: 'Dove Soap', value: 76000, quantity: 290 },
    { name: 'Tide Detergent', value: 65000, quantity: 180 },
    { name: 'Head & Shoulders', value: 54000, quantity: 160 },
    { name: 'Del Monte Corned Beef', value: 48000, quantity: 140 },
    { name: 'Colgate Toothpaste', value: 42000, quantity: 210 },
  ];

  const handleCategoryClick = (category: ChartData) => {
    setCategories([category.name]);
  };

  const handleBrandClick = (brand: ChartData) => {
    setBrands([brand.name]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Product Mix Analysis</h1>
        <p className="text-orange-100">
          Category performance and product substitution insights
        </p>
      </div>

      {/* Category and Brand Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Category Performance"
          subtitle="Revenue distribution by category"
        >
          <DonutChart
            data={chartCategoryData}
            onSegmentClick={handleCategoryClick}
          />
        </ChartCard>

        <ChartCard
          title="Brand Performance"
          subtitle="Top performing brands"
        >
          <BarChart
            data={chartBrandData}
            onBarClick={handleBrandClick}
            color="#F97316"
          />
        </ChartCard>
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Top Products"
          subtitle="Best performing individual products"
        >
          <BarChart
            data={productData}
            color="#F97316"
          />
        </ChartCard>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Rankings</h3>
          <div className="space-y-3">
            {productData.slice(0, 8).map((product, index) => (
              <div
                key={product.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                    <p className="text-xs text-gray-600">{product.quantity} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {new Intl.NumberFormat('en-PH', {
                      style: 'currency',
                      currency: 'PHP',
                      notation: 'compact',
                    }).format(product.value)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {chartCategoryData.slice(0, 3).map((category) => (
          <div key={category.name} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
              </div>
              <div className={`text-sm px-2 py-1 rounded-full ${
                category.change && category.change >= 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {category.change && category.change >= 0 ? '+' : ''}{category.change?.toFixed(1)}%
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('en-PH', {
                    style: 'currency',
                    currency: 'PHP',
                    notation: 'compact',
                  }).format(category.value)}
                </p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
              
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Market Share</span>
                  <span className="font-medium">
                    {((category.value / chartCategoryData.reduce((sum, c) => sum + c.value, 0)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Star className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Top Performer</p>
                <p className="text-xs text-gray-600">
                  {chartCategoryData[0]?.name} leads with {((chartCategoryData[0]?.value / chartCategoryData.reduce((sum, c) => sum + c.value, 0)) * 100).toFixed(1)}% market share
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Growth Opportunity</p>
                <p className="text-xs text-gray-600">
                  Cross-selling potential between top 3 categories
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Package className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Product Diversity</p>
                <p className="text-xs text-gray-600">
                  {productData.length} products contribute to 80% of revenue
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Expand High-Performers</p>
                  <p className="text-xs text-blue-700">
                    Increase inventory for top 3 categories by 20%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Star className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">Bundle Opportunities</p>
                  <p className="text-xs text-green-700">
                    Create combo packages with complementary products
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Underperformers</p>
                  <p className="text-xs text-yellow-700">
                    Review pricing strategy for bottom 20% of products
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductMix;