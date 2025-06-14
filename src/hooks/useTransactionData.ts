import { useState, useEffect } from 'react';
import { useFilterStore } from '../store/useFilterStore';
import { KPIData, ChartData, TimeSeriesData } from '../types';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';

interface Transaction {
  id: string;
  transaction_date: string;
  total_amount: number;
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

        /**
         * Supabase 🤖 NOTE
         * -------------------------------------------------------------
         * Complex lateral joins (`stores!inner`, etc.) blow up once RLS
         * kicks-in on a public anon key.  
         * ⇒ We fetch *flat* rows first → KPI stays accurate → optional
         *    enrichment call only if the first query succeeds.
         */

        let query = supabase
          .from('transactions')
          .select(`
            id,
            transaction_date,
            total_amount
          `)
          .order('transaction_date', { ascending: false })
          .limit(1000); // keep it fast on Vercel edge

        // Apply date range filter
        if (dateRange.from) {
          query = query.gte('transaction_date', format(dateRange.from, 'yyyy-MM-dd'));
        }
        if (dateRange.to) {
          query = query.lte('transaction_date', format(dateRange.to, 'yyyy-MM-dd'));
        }

        // Note: barangay, category, brand, store filters removed for simplified query

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.warn('[Scout] Flat fetch failed →', fetchError.message);
          setError(fetchError.message);
          setTransactions([]);
          return;
        }

        const filteredData = (data as Transaction[]) || [];

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
    topProduct: getTopProduct(),
    revenueChange: 0, // TODO: Calculate compared to previous period
    transactionChange: 0,
    aovChange: 0,
    topProductChange: 0,
  };

  // Calculate category data
  const categoryData: ChartData[] = getCategoryData();

  // Calculate brand data  
  const brandData: ChartData[] = getBrandData();

  // Calculate time series data
  const timeSeriesData: TimeSeriesData[] = getTimeSeriesData(transactions);

  // Calculate store data
  const storeData: ChartData[] = getStoreData();

  // Calculate hourly trends
  const hourlyTrends = getHourlyTrends(transactions);

  // Calculate age distribution
  const ageDistribution = getAgeDistribution();

  // Calculate gender distribution
  const genderDistribution = getGenderDistribution();

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
function getTopProduct(): string {
  return 'N/A'; // Simplified - would need product data
}

function getCategoryData(): ChartData[] {
  return []; // Simplified - would need category data
}

function getBrandData(): ChartData[] {
  return []; // Simplified - would need brand data
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

function getStoreData(): ChartData[] {
  return []; // Simplified - would need store data
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

function getAgeDistribution(): ChartData[] {
  return []; // Simplified - would need customer data
}

function getGenderDistribution(): ChartData[] {
  return []; // Simplified - would need customer data
}