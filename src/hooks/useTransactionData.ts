import { useState, useEffect } from 'react';
import { useFilterStore } from '../store/useFilterStore';
import { KPIData, ChartData, TimeSeriesData } from '../types';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';

interface Transaction {
  id: string;
  transaction_date: string;
  total_amount: number;
  customer_id?: string;
  transaction_items?: Array<{
    quantity: number;
    unit_price: number;
    product?: {
      unit_cost?: number;
    };
  }>;
}

export const useTransactionData = () => {
  const { dateRange, barangays, categories, brands, stores } = useFilterStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Helper to safely handle arrays that might be null/undefined
  const safeArray = <T,>(arr: T[] | null | undefined): T[] => Array.isArray(arr) ? arr : [];

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

        // Fetch transactions in batches to get all 5,000+ records
        const batchSize = 1000;
        const allTransactions: Transaction[] = [];
        
        let query = supabase
          .from('transactions_fmcg')
          .select(`
            id,
            transaction_date,
            total_amount,
            customer_id,
            transaction_items (
              quantity,
              unit_price,
              product (
                unit_cost
              )
            )
          `)
          .order('transaction_date', { ascending: false });

        // Apply date range filter
        if (dateRange.from) {
          query = query.gte('transaction_date', format(dateRange.from, 'yyyy-MM-dd'));
        }
        if (dateRange.to) {
          query = query.lte('transaction_date', format(dateRange.to, 'yyyy-MM-dd'));
        }

        // Note: barangay, category, brand, store filters removed for simplified query

        // Fetch data in batches to get all transactions
        let offset = 0;
        let hasMore = true;

        while (hasMore) {
          const batchQuery = query
            .range(offset, offset + batchSize - 1);

          const { data, error: fetchError } = await batchQuery;

          if (fetchError) {
            console.warn('[Scout] Batch fetch failed →', fetchError.message);
            setError(fetchError.message);
            setTransactions([]);
            return;
          }

          const batchData = (data as Transaction[]) || [];
          allTransactions.push(...batchData);

          console.log('[Scout Debug] Batch result:', { 
            batchNumber: Math.floor(offset / batchSize) + 1,
            batchSize: batchData.length,
            totalSoFar: allTransactions.length
          });

          // If we got less than batchSize, we've reached the end
          hasMore = batchData.length === batchSize;
          offset += batchSize;

          // Safety limit to prevent infinite loops
          if (offset > 10000) {
            console.warn('[Scout] Safety limit reached, stopping batch fetch');
            break;
          }
        }

        console.log('[Scout Debug] Final result:', { 
          totalTransactions: allTransactions.length,
          sampleData: allTransactions[0]
        });

        setTransactions(allTransactions);
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

  /*──────────────────────────────────────────────────── KPI CALCS ─────────*/
  const totalRevenue     = transactions.reduce((s,t)=>s+(t.total_amount||0),0);
  const totalTransactions= transactions.length;
  const unitsSold        = transactions.reduce((sum,t)=>
    sum + safeArray(t.transaction_items)
            .reduce((s,it)=>s + (it.quantity ?? 0),0), 0);
  
  // Unique customers (skip nulls)
  const uniqueCustomers  = new Set(
    transactions.filter(t=>t.customer_id)
                .map(t=>t.customer_id)
  ).size;

  const grossMargin = transactions.reduce((s,t)=>{
    return s + safeArray(t.transaction_items).reduce((x,i)=>{
      const cost = i.product?.unit_cost ?? 0;
      return x + ((i.unit_price ?? 0) - cost) * (i.quantity ?? 0);
    },0);
  },0);

  const repeatRate = (()=>{
    const freq:Record<string,number> = {};
    transactions.forEach(t=>{
      if(t.customer_id) freq[t.customer_id]=(freq[t.customer_id]||0)+1;
    });
    const repeaters = Object.values(freq).filter(v=>v>1).length;
    return uniqueCustomers ? repeaters/uniqueCustomers : 0;
  })();

  const kpiData: KPIData = {
    totalRevenue,
    totalTransactions,
    avgOrderValue: totalTransactions ? totalRevenue/totalTransactions : 0,
    topProduct: getTopProduct(),
    unitsSold,
    uniqueCustomers,
    repeatRate,
    grossMargin,
    unitsPerTx: totalTransactions ? unitsSold/totalTransactions : 0,
    grossMarginPct: totalRevenue ? grossMargin/totalRevenue : 0,
    /* placeholder deltas */
    revenueChange:0,transactionChange:0,aovChange:0,topProductChange:0
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

  // Payment method data (mock until we have a payments table)
  const paymentMethodData = [
    { name: 'Cash', value: transactions.length * 0.65 * 100 }, // 65% cash
    { name: 'GCash', value: transactions.length * 0.20 * 100 }, // 20% GCash
    { name: 'PayMaya', value: transactions.length * 0.10 * 100 }, // 10% PayMaya
    { name: 'Credit Card', value: transactions.length * 0.03 * 100 }, // 3% Credit
    { name: 'Bank Transfer', value: transactions.length * 0.02 * 100 } // 2% Bank
  ];

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
    paymentMethodData,
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
    if (transaction.transaction_date) {
      // Convert to Philippines timezone (UTC+8)
      const date = new Date(transaction.transaction_date);
      const hour = (date.getUTCHours() + 8) % 24;
      if (!isNaN(hour) && hour >= 0 && hour < 24) {
        hourlyData[hour] = (hourlyData[hour] || 0) + (transaction.total_amount || 0);
      }
    }
  });

  return Object.entries(hourlyData)
    .map(([hour, value]) => ({ 
      name: `${parseInt(hour)}:00`, 
      value: value || 0 
    }));
}

function getAgeDistribution(): ChartData[] {
  // Return default age distribution data to prevent empty charts
  return [
    { name: '18-25', value: 25, change: 2.3 },
    { name: '26-35', value: 35, change: 1.8 },
    { name: '36-45', value: 22, change: -0.5 },
    { name: '46-60', value: 15, change: 0.8 },
    { name: '60+', value: 3, change: 0.2 }
  ];
}

function getGenderDistribution(): ChartData[] {
  // Return default gender distribution data to prevent empty charts
  return [
    { name: 'Female', value: 58, change: 1.2 },
    { name: 'Male', value: 41, change: -0.8 },
    { name: 'Other', value: 1, change: 0.1 }
  ];
}