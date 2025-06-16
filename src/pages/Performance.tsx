// Performance.tsx
// Combines Product Mix, Transaction Trends, and Consumer Insights into a single dashboard page
import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, Zap, Users, TrendingUp, Maximize2 } from 'lucide-react'; // Added icons
import { Treemap, ResponsiveContainer } from 'recharts'; // Added Treemap
import BarChart from '../components/charts/BarChart'; // Assuming BarChart component exists
import { ChartData } from '../types'; // Assuming ChartData type exists
import { getDataProvider } from '../lib/dataProvider'; // For Supabase
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'; // For date calculations

// --- Interfaces for Product Mix Data ---
interface CategoryRevenue {
  name: string; // Category name
  value: number; // Revenue
}

interface BasketSizeData {
  name: string; // Basket size range (e.g., "1-2 items", "3-5 items")
  value: number; // Count of transactions in this basket size
}

interface CoPurchaseItem {
  originalSKU: string;
  coPurchasedSKU: string;
  frequency: number;
}

interface TreemapNode {
  name: string;
  size: number; // Represents volume/transaction share
  children?: TreemapNode[];
  // color based on performance delta (placeholder for now)
}

const Performance: React.FC = () => {
  // --- State for Product Mix ---
  const [categoryRevenue, setCategoryRevenue] = useState<CategoryRevenue[]>([]);
  const [basketDistribution, setBasketDistribution] = useState<BasketSizeData[]>([]);
  const [coPurchaseData, setCoPurchaseData] = useState<CoPurchaseItem[]>([]);
  const [productTreemapData, setProductTreemapData] = useState<TreemapNode[]>([]);

  const [loadingProductMix, setLoadingProductMix] = useState(true);
  const [errorProductMix, setErrorProductMix] = useState<string | null>(null);

  // --- Data Fetching for Product Mix ---
  useEffect(() => {
    const fetchProductMixData = async () => {
      setLoadingProductMix(true);
      setErrorProductMix(null);
      const db = getDataProvider();

      try {
        // 1. Category Revenue (Top 10)
        // Assuming 'category_revenue_summary' view exists with 'category_name' and 'total_revenue'
        const { data: catRevenueData, error: catRevenueError } = await db
          .from('category_revenue_summary')
          .select('category_name, total_revenue')
          .order('total_revenue', { ascending: false })
          .limit(10);

        if (catRevenueError) {
          console.warn("Error fetching category revenue, view 'category_revenue_summary' might be missing. Using placeholder.", catRevenueError);
          setCategoryRevenue([
            { name: 'Placeholder Category A', value: 15000 },
            { name: 'Placeholder Category B', value: 12000 },
          ]);
        } else {
          setCategoryRevenue(catRevenueData.map(item => ({ name: item.category_name, value: item.total_revenue })));
        }

        // 2. Basket Size Distribution
        // Assuming 'basket_size_distribution' view exists with 'basket_range' and 'transaction_count'
        const { data: basketData, error: basketError } = await db
          .from('basket_size_distribution')
          .select('basket_range, transaction_count')
          .order('transaction_count', { ascending: false });

        if (basketError) {
          console.warn("Error fetching basket distribution, view 'basket_size_distribution' might be missing. Using placeholder.", basketError);
          setBasketDistribution([
            { name: '1-2 items', value: 300 },
            { name: '3-5 items', value: 450 },
            { name: '6+ items', value: 200 },
          ]);
        } else {
          setBasketDistribution(basketData.map(item => ({ name: item.basket_range, value: item.transaction_count })));
        }

        // 3. Co-purchase Data (Top 5) - Placeholder due to complexity
        // This would require complex self-join on transaction_items_fmcg
        console.warn("Co-purchase data fetching is complex and not implemented. Using placeholder.");
        setCoPurchaseData([
          { originalSKU: 'SKU001', coPurchasedSKU: 'SKU002', frequency: 120 },
          { originalSKU: 'SKU003', coPurchasedSKU: 'SKU004', frequency: 90 },
          { originalSKU: 'SKU001', coPurchasedSKU: 'SKU005', frequency: 85 },
        ]);

        // 4. Treemap Data (Transaction Share by Category - Volume)
        // This is a simplified version focusing on category volume.
        // Performance delta coloring is not implemented in this step.
        // A more complete implementation would involve brands as children and performance delta.
        const { data: categoryVolumeData, error: categoryVolumeError } = await db
          .from('transaction_items_fmcg')
          .select('products!inner(category), quantity')
          .limit(5000); // Limiting for performance, adjust as needed

        if (categoryVolumeError) {
            console.warn("Error fetching category volume for treemap. Using placeholder.", categoryVolumeError);
            setProductTreemapData([
                { name: 'Electronics', size: 1200 },
                { name: 'Clothing', size: 800 },
                { name: 'Groceries', size: 1500 },
            ]);
        } else {
            const volumeByCategory = categoryVolumeData.reduce((acc, item) => {
                const category = item.products?.category || 'Unknown';
                acc[category] = (acc[category] || 0) + (item.quantity || 0);
                return acc;
            }, {} as Record<string, number>);

            const treemapDataFormatted: TreemapNode[] = Object.entries(volumeByCategory)
                .map(([name, size]) => ({ name, size }))
                .sort((a,b) => b.size - a.size); // Sort for better visualization
            setProductTreemapData(treemapDataFormatted);
        }

      } catch (err: any) {
        console.error("Error fetching product mix data:", err);
        setErrorProductMix(err.message || "An unexpected error occurred.");
        // Set placeholder data on general error as well
        setCategoryRevenue([{ name: 'Error Category', value: 0 }]);
        setBasketDistribution([{ name: 'Error Basket', value: 0 }]);
        setCoPurchaseData([{ originalSKU: 'ERR', coPurchasedSKU: 'ERR', frequency: 0 }]);
        setProductTreemapData([{ name: 'Error Treemap', size: 100 }]);
      } finally {
        setLoadingProductMix(false);
      }
    };

    fetchProductMixData();
  }, []);


  // Custom content renderer for Treemap for better label display
  const TreemapCustomizedContent = (props: any) => {
    const { depth, x, y, width, height, index, name, value } = props; // `value` is `size` here
    const isParent = props.children && props.children.length > 0;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: depth === 1 ? '#A78BFA' : depth === 2 ? '#C4B5FD' : '#DDD6FE', // Different colors for depth
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
        {width * height > 2000 && width > 80 && height > 20 ? ( // Check size before rendering text
          <text
            x={x + width / 2}
            y={y + height / 2 + 7}
            textAnchor="middle"
            fill="#333"
            fontSize={14}
            fontWeight={isParent ? "bold" : "normal"}
          >
            {name}
          </text>
        ) : null}
         {width * height > 1000 && width > 60 && height > 40 ? ( // Show value if space permits
          <text
            x={x + width / 2}
            y={y + height / 2 + 24}
            textAnchor="middle"
            fill="#555"
            fontSize={12}
          >
            {value?.toLocaleString()}
          </text>
        ) : null}
      </g>
    );
  };


  return (
  <div className="space-y-12 p-6 bg-gray-50 min-h-screen">
    {/* Product Mix Section */}
    <section id="product-mix">
      <div className="flex items-center space-x-3 mb-6">
        <Package className="h-8 w-8 text-purple-600" />
        <h2 className="text-3xl font-bold text-gray-800">Product Mix Analysis</h2>
      </div>

      {loadingProductMix && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-lg animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {errorProductMix && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md" role="alert">
          <p className="font-bold">Error Loading Product Mix Data</p>
          <p>{errorProductMix}. Some data might be placeholder.</p>
        </div>
      )}

      {!loadingProductMix && !errorProductMix && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Category Revenue Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg col-span-1 md:col-span-1 xl:col-span-1">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
              Top Categories by Revenue
            </h3>
            <div className="h-80">
              {categoryRevenue.length > 0 ? (
                <BarChart data={categoryRevenue} color="#3B82F6" />
              ) : <p className="text-center text-gray-500">No category revenue data.</p>}
            </div>
          </div>

          {/* Basket Size Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-lg col-span-1 md:col-span-1 xl:col-span-1">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2 text-green-500" />
              Basket Size Distribution
            </h3>
            <div className="h-80">
              {basketDistribution.length > 0 ? (
                 <BarChart data={basketDistribution} color="#10B981" />
              ) : <p className="text-center text-gray-500">No basket distribution data.</p>}
            </div>
          </div>

          {/* Co-purchase Table */}
          <div className="bg-white p-6 rounded-xl shadow-lg col-span-1 md:col-span-2 xl:col-span-1">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              Top Co-purchased Items
            </h3>
            <div className="overflow-x-auto max-h-80">
              {coPurchaseData.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original SKU</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Co-purchased SKU</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {coPurchaseData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.originalSKU}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.coPurchasedSKU}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.frequency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p className="text-center text-gray-500">No co-purchase data available.</p>}
               <p className="mt-2 text-xs text-gray-400">Note: Co-purchase data is currently placeholder.</p>
            </div>
          </div>
        </div>
      )}

      {!loadingProductMix && ( // Show Treemap even if there was a partial error for other components
        <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <Maximize2 className="h-5 w-5 mr-2 text-purple-500" />
                Product Volume Share by Category (Treemap)
            </h3>
            <div className="h-96 md:h-[500px]">
                {productTreemapData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                            data={productTreemapData}
                            dataKey="size"
                            ratio={4 / 3}
                            stroke="#fff"
                            fill="#8884d8"
                            content={<TreemapCustomizedContent />}
                        />
                    </ResponsiveContainer>
                ) : <p className="text-center text-gray-500 pt-10">No data available for treemap. This might be due to missing views or an error during data fetching.</p>}
                 <p className="mt-2 text-xs text-gray-400">
                    Note: Treemap node colors are currently based on depth. Performance delta coloring is a future enhancement.
                 </p>
            </div>
        </div>
      )}
    </section>

    {/* Transaction Trends Section Placeholder */}
    <section id="transaction-trends">
      <div className="flex items-center space-x-3 mb-6">
        <TrendingUp className="h-8 w-8 text-teal-600" />
        <h2 className="text-3xl font-bold text-gray-800">Transaction Trends</h2>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <p className="text-gray-600">Transaction Trends components will be integrated here.</p>
        {/* Placeholder for content from TransactionTrends.tsx */}
      </div>
    </section>

    {/* Consumer Insights Section Placeholder */}
    <section id="consumer-insights">
      <div className="flex items-center space-x-3 mb-6">
        <Users className="h-8 w-8 text-pink-600" />
        <h2 className="text-3xl font-bold text-gray-800">Consumer Insights</h2>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <p className="text-gray-600">Consumer Insights components will be integrated here.</p>
        {/* Placeholder for content from ConsumerInsights.tsx */}
      </div>
    </section>
  </div>
);

export default Performance;
      <h2 className="text-2xl font-bold mb-4">Transaction Trends</h2>
      {/* Insert Transaction Trends charts/components here */}
    </section>
    {/* Consumer Insights Section */}
    <section>
      <h2 className="text-2xl font-bold mb-4">Consumer Insights</h2>
      {/* Insert Consumer Insights charts/components here */}
    </section>
  </div>
);

export default Performance;
