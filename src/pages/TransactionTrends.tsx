import React, { useState, useEffect } from 'react';
import { TrendingUp, MapPin, Calendar, BarChart3, Users, Activity, Map } from 'lucide-react'; // Added Map icon
import { useTransactionData } from '../hooks/useTransactionData';
import { useFilterStore } from '../store/useFilterStore';
import { getDataProvider } from '../lib/dataProvider';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import BarChart from '../components/charts/BarChart'; // Added BarChart import
import { ChartData } from '../types'; // Added ChartData import

// Updated to reflect fields from geo_revenue_view
interface RegionalData {
  region: string; // province or region name
  city?: string; // city name
  barangay?: string; // barangay name
  revenue: number;
  population?: number; // from geo_revenue_view
  transactions?: number; // if available from view, otherwise calculate
  customers?: number; // if available from view, otherwise calculate
  growth?: number; // if available from view, otherwise mock/calculate
}

interface CityRevenueData {
  city: string;
  revenue: number;
  barangays?: string[]; // For drilldown logging
}

interface TimeSeriesData {
  date: string;
  revenue: number;
  transactions: number;
}

const PHILIPPINE_REGIONS = [
  'NCR', 'Region I', 'Region II', 'Region III', 'Region IV-A', 'Region IV-B',
  'Region V', 'Region VI', 'Region VII', 'Region VIII', 'Region IX', 'Region X',
  'Region XI', 'Region XII', 'Region XIII', 'BARMM', 'CAR'
];

const TransactionTrends: React.FC = () => {
  const { kpiData, loading, error: kpiError } = useTransactionData(); // Renamed error to kpiError
  const { setBarangays, dateRange: currentFilters } = useFilterStore(); // Removed setDateRange, using currentFilters
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [topCitiesData, setTopCitiesData] = useState<ChartData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loadingRegional, setLoadingRegional] = useState(true);
  const [regionalError, setRegionalError] = useState<string | null>(null);


  useEffect(() => {
    fetchRegionalData();
    fetchTimeSeriesData();
  }, [currentFilters.start, currentFilters.end]); // Re-fetch if date range changes

  const fetchRegionalData = async () => {
    try {
      setLoadingRegional(true);
      setRegionalError(null);
      const db = getDataProvider();
      
      // Attempt to fetch from geo_revenue_view
      // Adjust select query based on actual fields in geo_revenue_view
      const { data, error } = await db
        .from('geo_revenue_view') // Querying the new view
        .select('region, city, barangay, revenue, population, transactions_count, unique_customers_count') // Example fields
        .gte('transaction_date', format(new Date(currentFilters.start), 'yyyy-MM-dd')) // Apply date filters
        .lte('transaction_date', format(new Date(currentFilters.end), 'yyyy-MM-dd'));


      if (error) {
        console.error('Error fetching from geo_revenue_view:', error);
        // Fallback or specific error handling if view doesn't exist
        if (error.message.includes("relation \"geo_revenue_view\" does not exist")) {
          setRegionalError("The 'geo_revenue_view' is not available. Please ensure it's created and populated. Displaying mock data or limited functionality.");
          // To keep the page somewhat functional, you might load mock data here
          // For now, we'll let it show an error and potentially empty charts.
          setRegionalData([]);
          setTopCitiesData([]);
        } else {
          throw error; // Rethrow other errors
        }
      } else if (data) {
        // Process data from geo_revenue_view
        const processedData: RegionalData[] = data.map((item: any) => ({
          region: item.region || 'Unknown Region',
          city: item.city || 'Unknown City',
          barangay: item.barangay || 'Unknown Barangay',
          revenue: item.revenue || 0,
          population: item.population || 0,
          transactions: item.transactions_count || 0, // from view
          customers: item.unique_customers_count || 0, // from view
          growth: Math.random() * 10 - 5, // Mock growth for now
        }));
        setRegionalData(processedData);

        // Prepare data for Top 5 Cities Bar Chart
        const cityRevenueMap = new Map<string, { revenue: number; barangays: Set<string> }>();
        processedData.forEach(item => {
          if (item.city && item.revenue) {
            const current = cityRevenueMap.get(item.city) || { revenue: 0, barangays: new Set() };
            current.revenue += item.revenue;
            if(item.barangay) current.barangays.add(item.barangay);
            cityRevenueMap.set(item.city, current);
          }
        });

        const sortedCities: CityRevenueData[] = Array.from(cityRevenueMap.entries())
          .map(([city, data]) => ({ city, revenue: data.revenue, barangays: Array.from(data.barangays) }))
          .sort((a, b) => b.revenue - a.revenue);

        setTopCitiesData(
          sortedCities.slice(0, 5).map(c => ({ name: c.city, value: c.revenue, barangays: c.barangays }))
        );
      }
    } catch (err: any) {
      console.error('Error processing regional data:', err);
      setRegionalError(err.message || 'An unexpected error occurred while fetching regional data.');
      setRegionalData([]);
      setTopCitiesData([]);
    } finally {
      setLoadingRegional(false);
    }
  };

  const fetchTimeSeriesData = async () => {
    try {
      const db = getDataProvider();
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), 29 - i);
        return {
          date: format(date, 'yyyy-MM-dd'),
          start: startOfDay(date),
          end: endOfDay(date)
        };
      });

      const timeSeriesPromises = last30Days.map(async ({ date, start, end }) => {
        const { data } = await db
          .from('transactions_fmcg')
          .select('total_amount')
          .gte('transaction_date', start.toISOString())
          .lte('transaction_date', end.toISOString());

        const revenue = data?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;
        const transactions = data?.length || 0;

        return { date, revenue, transactions };
      });

      const results = await Promise.all(timeSeriesPromises);
      setTimeSeriesData(results);
    } catch (error) {
      console.error('Error fetching time series data:', error);
    }
  };

  const handleRegionClick = (regionName: string) => {
    // This function is for clicking on the region in the heatmap or list
    // It should filter by the region name.
    // If geo_revenue_view provides distinct regions, this can be used directly.
    // If regions are provinces, and filters expect barangays, this might need adjustment
    // For now, assuming regionName is a valid filter input for setBarangays
    setBarangays([regionName]);
  };

  const handleCityBarClick = (data: ChartData) => {
    console.log('Clicked City:', data.name, 'Revenue:', data.value);
    if (data.barangays && Array.isArray(data.barangays)) {
      console.log('Associated Barangays:', data.barangays);
      // Future: setBarangays(data.barangays) or a new setCities filter
      // For now, just logging. If we want to filter by city,
      // we might need to adjust useFilterStore or how regions/cities/barangays are handled.
      // This example assumes 'data.name' (city name) can be used as a filter term.
      // setBarangays([data.name]); // Example: if city name can be a filter value
    }
  };

  const getRegionColor = (revenue: number, maxRevenue: number) => {
    const intensity = revenue / maxRevenue;
    if (intensity > 0.8) return 'bg-red-600';
    if (intensity > 0.6) return 'bg-red-500';
    if (intensity > 0.4) return 'bg-yellow-500';
    if (intensity > 0.2) return 'bg-yellow-400';
    return 'bg-gray-300';
  };

  const maxRevenueInView = Math.max(...regionalData.map(r => r.revenue), 0); // Ensure it's not -Infinity

  if (loading || loadingRegional) {
    // Skeleton loader for the entire page or specific sections
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-gray-300 rounded-xl p-6 h-24"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-300 rounded-lg h-24"></div>)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-gray-300 rounded-xl h-96"></div>
          <div className="bg-gray-300 rounded-xl h-96"></div>
        </div>
        <div className="bg-gray-300 rounded-xl h-80"></div> {/* For City Bar Chart */}
        <div className="bg-gray-300 rounded-xl h-80"></div> {/* For Time Series */}
      </div>
    );
  }

  // Combined error display for KPI and Regional data
  const pageError = kpiError || regionalError;
  if (pageError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="text-red-800">
          <h3 className="font-semibold">Error loading trends data</h3>
          <p className="mt-2 text-sm">{typeof pageError === 'string' ? pageError : JSON.stringify(pageError)}</p>
          {regionalError && regionalError.includes("geo_revenue_view") && (
            <p className="mt-2 text-sm font-medium">
              Please ensure the `geo_revenue_view` is correctly set up in Supabase for full functionality.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Transaction Trends</h1>
            <p className="text-purple-100">Regional performance and temporal analysis</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₱{kpiData?.totalRevenue?.toLocaleString() || '0'}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {kpiData?.totalTransactions?.toLocaleString() || '0'}
              </p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Regions</p>
              <p className="text-2xl font-bold text-gray-900">{regionalData.length}</p>
            </div>
            <MapPin className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {kpiData?.uniqueCustomers?.toLocaleString() || '0'}
              </p>
            </div>
            <Users className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Regional Heatmap Placeholder */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/*
            TODO: Replace this placeholder with a true GeoHeatMap component.
            This requires:
            1. A mapping library (e.g., Leaflet, Mapbox GL JS) and its React wrapper.
            2. GeoJSON data for Philippine geographical boundaries.
            3. The 'geo_revenue_view' to be fully populated with region/city/barangay boundaries,
               revenue, and population data for weighting.
            The current display is a simplified color-coded grid of regions.
          */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-purple-600" />
              Regional Performance (Placeholder Heatmap)
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>Low</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gray-300 rounded"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <div className="w-3 h-3 bg-red-600 rounded"></div>
              </div>
              <span>High</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {/* Display regions from geo_revenue_view, or fallback if empty */}
            {(regionalData.length > 0 ? regionalData : PHILIPPINE_REGIONS.map(r => ({ region: r, revenue: 0, transactions: 0, customers: 0, growth: 0 }))).slice(0, 15).map((item) => (
              <button
                key={item.region}
                onClick={() => handleRegionClick(item.region)}
                className={`p-3 rounded-lg border-2 border-transparent hover:border-gray-300 transition-all text-left ${getRegionColor(item.revenue, maxRevenueInView)}`}
              >
                <div className="text-white text-xs font-medium">{item.region}</div>
                <div className="text-white text-xs opacity-90">
                  ₱{item.revenue.toLocaleString()}
                </div>
                <div className="text-white text-xs opacity-75">
                  {item.transactions || 0} txns
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Top Regions Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Top Performing Regions
          </h3>
          
          <div className="space-y-3">
            {/* Display regions from geo_revenue_view, or fallback if empty */}
            {(regionalData.length > 0 ? regionalData : PHILIPPINE_REGIONS.map(r => ({ region: r, revenue: 0, transactions: 0, customers: 0, growth: 0 }))).slice(0, 8).map((item, index) => (
              <div
                key={item.region}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => handleRegionClick(item.region)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.region}</div>
                    <div className="text-sm text-gray-500">
                      {item.transactions || 0} transactions • {item.customers || 0} customers
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    ₱{item.revenue.toLocaleString()}
                  </div>
                  <div className={`text-sm ${item.growth && item.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.growth && item.growth >= 0 ? '+' : ''}{(item.growth || 0).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time Series Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-green-600" />
          Revenue Trend (Last 30 Days)
        </h3>
        <div className="h-64"> {/* Ensure BarChart has a container with defined height */}
          {timeSeriesData.length > 0 ? (
             <BarChart
                data={timeSeriesData.map(p => ({ name: format(new Date(p.date), 'MM/dd'), value: p.revenue }))}
                color="#22C55E" // Green color for revenue trend
             />
          ) : <p className="text-center text-gray-500">No time series data available.</p>}
        </div>
      </div>

      {/* Top 5 Cities by Revenue */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Map className="h-5 w-5 mr-2 text-indigo-600" /> {/* Changed icon */}
          Top 5 Cities by Revenue
        </h3>
        <div className="h-80"> {/* Ensure BarChart has a container with defined height */}
          {topCitiesData.length > 0 ? (
            <BarChart
              data={topCitiesData}
              onBarClick={handleCityBarClick}
              color="#4F46E5" // Indigo color
            />
          ) : <p className="text-center text-gray-500">No city revenue data available. This might be due to missing 'geo_revenue_view' or no data for the selected period.</p>}
        </div>
      </div>
    </div>
  );
};

export default TransactionTrends;