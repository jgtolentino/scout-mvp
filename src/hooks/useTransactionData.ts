import { useState, useEffect } from 'react';
import { useFilterStore } from '../store/useFilterStore';
import { KPIData, ChartData, TimeSeriesData } from '../types';
import { format, subDays } from 'date-fns';
import { supabase } from '../lib/supabase';

interface Transaction {
  id: number;
  customer_id: number;
  store_id: number;
  transaction_date: string;
  total_amount: number;
  store?: {
    name: string;
    barangay: string;
    city: string;
    region: string;
  };
  customer?: {
    gender: string;
    age_group: string;
  };
  transaction_items?: Array<{
    quantity: number;
    unit_price: number;
    total_price: number;
    product?: {
      name: string;
      category: string;
      brand?: {
        name: string;
      };
    };
  }>;
}

export const useTransactionData = () => {
  const { dateRange, barangays, categories, brands, stores } = useFilterStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query with filters
        let query = supabase
          .from('transactions')
          .select(`
            id,
            customer_id,
            store_id,
            transaction_date,
            total_amount,
            stores!inner (
              name,
              barangay,
              city,
              region
            ),
            customers!inner (
              gender,
              age_group
            ),
            transaction_items!inner (
              quantity,
              unit_price,
              total_price,
              products!inner (
                name,
                category,
                brands!inner (
                  name
                )
              )
            )
          `)
          .order('transaction_date', { ascending: false })
          .limit(1000); // Limit for performance

        // Apply date range filter
        if (dateRange.from) {
          query = query.gte('transaction_date', format(dateRange.from, 'yyyy-MM-dd'));
        }
        if (dateRange.to) {
          query = query.lte('transaction_date', format(dateRange.to, 'yyyy-MM-dd'));
        }

        // Apply barangay filter
        if (barangays.length > 0) {
          query = query.in('stores.barangay', barangays);
        }

        // Apply store filter
        if (stores.length > 0) {
          query = query.in('stores.name', stores);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        // Filter by categories and brands on the frontend (since they're in nested relationships)
        let filteredData = data || [];

        if (categories.length > 0 || brands.length > 0) {
          filteredData = filteredData.filter(transaction => {
            return transaction.transaction_items?.some(item => {
              const categoryMatch = categories.length === 0 || categories.includes(item.product?.category || '');
              const brandMatch = brands.length === 0 || brands.includes(item.product?.brand?.name || '');
              return categoryMatch && brandMatch;
            });
          });
        }

        setTransactions(filteredData);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [dateRange, barangays, categories, brands, stores]);

  // Calculate KPI data from real transactions
  const kpiData: KPIData = {
    totalRevenue: transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0),
    totalTransactions: transactions.length,
    avgOrderValue: transactions.length > 0 
      ? transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0) / transactions.length 
      : 0,
    topProduct: getTopProduct(transactions),
    revenueChange: 0, // TODO: Calculate compared to previous period
    transactionChange: 0,
    aovChange: 0,
    topProductChange: 0,
  };

  // Calculate category data
  const categoryData: ChartData[] = getCategoryData(transactions);

  // Calculate brand data  
  const brandData: ChartData[] = getBrandData(transactions);

  // Calculate time series data
  const timeSeriesData: TimeSeriesData[] = getTimeSeriesData(transactions);

  // Calculate store data
  const storeData: ChartData[] = getStoreData(transactions);

  // Calculate hourly trends
  const hourlyTrends = getHourlyTrends(transactions);

  // Calculate age distribution
  const ageDistribution = getAgeDistribution(transactions);

  // Calculate gender distribution
  const genderDistribution = getGenderDistribution(transactions);

  return {
    transactions,
    kpiData,
    categoryData,
    brandData,
    timeSeriesData,
    storeData,
    hourlyTrends,
    ageDistribution,
    genderDistribution,
    loading,
    error,
  };
};

// Helper functions to calculate chart data
function getTopProduct(transactions: Transaction[]): string {
  const productCounts: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    transaction.transaction_items?.forEach(item => {
      const productName = item.product?.name || 'Unknown';
      productCounts[productName] = (productCounts[productName] || 0) + item.quantity;
    });
  });

  const topProduct = Object.entries(productCounts)
    .sort(([,a], [,b]) => b - a)[0];
  
  return topProduct ? topProduct[0] : 'N/A';
}

function getCategoryData(transactions: Transaction[]): ChartData[] {
  const categoryRevenue: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    transaction.transaction_items?.forEach(item => {
      const category = item.product?.category || 'Unknown';
      categoryRevenue[category] = (categoryRevenue[category] || 0) + (item.total_price || 0);
    });
  });

  return Object.entries(categoryRevenue)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function getBrandData(transactions: Transaction[]): ChartData[] {
  const brandRevenue: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    transaction.transaction_items?.forEach(item => {
      const brand = item.product?.brand?.name || 'Unknown';
      brandRevenue[brand] = (brandRevenue[brand] || 0) + (item.total_price || 0);
    });
  });

  return Object.entries(brandRevenue)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 brands
}

function getTimeSeriesData(transactions: Transaction[]): TimeSeriesData[] {
  const dailyRevenue: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    const date = transaction.transaction_date.split('T')[0]; // Get date part
    dailyRevenue[date] = (dailyRevenue[date] || 0) + (transaction.total_amount || 0);
  });

  return Object.entries(dailyRevenue)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getStoreData(transactions: Transaction[]): ChartData[] {
  const storeRevenue: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    const storeName = transaction.store?.name || 'Unknown';
    storeRevenue[storeName] = (storeRevenue[storeName] || 0) + (transaction.total_amount || 0);
  });

  return Object.entries(storeRevenue)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 stores
}

function getHourlyTrends(transactions: Transaction[]): ChartData[] {
  const hourlyData: Record<number, number> = {};
  
  // Initialize all hours
  for (let i = 0; i < 24; i++) {
    hourlyData[i] = 0;
  }
  
  transactions.forEach(transaction => {
    const hour = new Date(transaction.transaction_date).getHours();
    hourlyData[hour] = (hourlyData[hour] || 0) + (transaction.total_amount || 0);
  });

  return Object.entries(hourlyData)
    .map(([hour, value]) => ({ 
      name: `${hour}:00`, 
      value 
    }));
}

function getAgeDistribution(transactions: Transaction[]): ChartData[] {
  const ageData: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    const ageGroup = transaction.customer?.age_group || 'Unknown';
    ageData[ageGroup] = (ageData[ageGroup] || 0) + 1;
  });

  return Object.entries(ageData)
    .map(([name, value]) => ({ name, value }));
}

function getGenderDistribution(transactions: Transaction[]): ChartData[] {
  const genderData: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    const gender = transaction.customer?.gender || 'Unknown';
    genderData[gender] = (genderData[gender] || 0) + 1;
  });

  return Object.entries(genderData)
    .map(([name, value]) => ({ name, value }));
}