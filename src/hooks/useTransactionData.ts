import { useMemo } from 'react';
import { mockTransactions } from '../data/mockData';
import { useFilterStore } from '../store/useFilterStore';
import { KPIData, ChartData, TimeSeriesData } from '../types';
import { isWithinInterval, format, subDays, parseISO, getHours } from 'date-fns';

export const useTransactionData = () => {
  const { dateRange, barangays, categories, brands, stores } = useFilterStore();

  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter(transaction => {
      // Date filter
      if (dateRange.from || dateRange.to) {
        const transactionDate = parseISO(transaction.created_at);
        if (dateRange.from && dateRange.to) {
          if (!isWithinInterval(transactionDate, { start: dateRange.from, end: dateRange.to })) {
            return false;
          }
        } else if (dateRange.from) {
          if (transactionDate < dateRange.from) return false;
        } else if (dateRange.to) {
          if (transactionDate > dateRange.to) return false;
        }
      }

      // Barangay filter
      if (barangays.length > 0 && !barangays.includes(transaction.store.barangay)) {
        return false;
      }

      // Category filter
      if (categories.length > 0) {
        const hasMatchingCategory = transaction.items.some(item => 
          categories.includes(item.product.category)
        );
        if (!hasMatchingCategory) return false;
      }

      // Brand filter
      if (brands.length > 0) {
        const hasMatchingBrand = transaction.items.some(item => 
          brands.includes(item.product.brand.name)
        );
        if (!hasMatchingBrand) return false;
      }

      // Store filter
      if (stores.length > 0 && !stores.includes(transaction.store.name)) {
        return false;
      }

      return true;
    });
  }, [dateRange, barangays, categories, brands, stores]);

  const kpiData = useMemo((): KPIData => {
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total_amount, 0);
    const totalTransactions = filteredTransactions.length;
    const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    // Get top product
    const productCounts = new Map<string, number>();
    filteredTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        productCounts.set(item.product.name, (productCounts.get(item.product.name) || 0) + item.quantity);
      });
    });
    
    const topProductEntry = Array.from(productCounts.entries()).reduce((max, curr) => 
      curr[1] > max[1] ? curr : max, ['', 0]
    );
    
    // Calculate changes (mock data - in real app would compare with previous period)
    const revenueChange = Math.random() * 20 - 10; // -10% to +10%
    const transactionChange = Math.random() * 15 - 7.5; // -7.5% to +7.5%
    const aovChange = Math.random() * 10 - 5; // -5% to +5%
    const topProductChange = Math.random() * 25 - 12.5; // -12.5% to +12.5%

    return {
      totalRevenue,
      totalTransactions,
      avgOrderValue,
      topProduct: topProductEntry[0] || 'N/A',
      revenueChange,
      transactionChange,
      aovChange,
      topProductChange,
    };
  }, [filteredTransactions]);

  const categoryData = useMemo((): ChartData[] => {
    const categoryRevenue = new Map<string, number>();
    
    filteredTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const category = item.product.category;
        categoryRevenue.set(category, (categoryRevenue.get(category) || 0) + (item.quantity * item.unit_price));
      });
    });

    return Array.from(categoryRevenue.entries()).map(([name, value]) => ({
      name,
      value,
      change: Math.random() * 20 - 10, // Mock change percentage
    })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const brandData = useMemo((): ChartData[] => {
    const brandRevenue = new Map<string, number>();
    
    filteredTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const brand = item.product.brand.name;
        brandRevenue.set(brand, (brandRevenue.get(brand) || 0) + (item.quantity * item.unit_price));
      });
    });

    return Array.from(brandRevenue.entries()).map(([name, value]) => ({
      name,
      value,
      change: Math.random() * 20 - 10,
    })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const timeSeriesData = useMemo((): TimeSeriesData[] => {
    const dailyRevenue = new Map<string, number>();
    
    filteredTransactions.forEach(transaction => {
      const date = format(parseISO(transaction.created_at), 'yyyy-MM-dd');
      dailyRevenue.set(date, (dailyRevenue.get(date) || 0) + transaction.total_amount);
    });

    // Fill in missing dates with 0
    const sortedDates = Array.from(dailyRevenue.keys()).sort();
    const startDate = sortedDates[0] ? parseISO(sortedDates[0]) : subDays(new Date(), 30);
    const endDate = sortedDates[sortedDates.length - 1] ? parseISO(sortedDates[sortedDates.length - 1]) : new Date();
    
    const result: TimeSeriesData[] = [];
    let currentDate = startDate;
    
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      result.push({
        date: dateStr,
        value: dailyRevenue.get(dateStr) || 0,
        label: format(currentDate, 'MMM dd'),
      });
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    }
    
    return result;
  }, [filteredTransactions]);

  const storeData = useMemo((): ChartData[] => {
    const storeRevenue = new Map<string, number>();
    
    filteredTransactions.forEach(transaction => {
      const store = transaction.store.name;
      storeRevenue.set(store, (storeRevenue.get(store) || 0) + transaction.total_amount);
    });

    return Array.from(storeRevenue.entries()).map(([name, value]) => ({
      name,
      value,
      change: Math.random() * 20 - 10,
    })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const hourlyTrends = useMemo(() => {
    const hourlyRevenue = new Map<number, number>();
    
    // Initialize all hours with 0
    for (let i = 0; i < 24; i++) {
      hourlyRevenue.set(i, 0);
    }
    
    filteredTransactions.forEach(transaction => {
      const hour = getHours(parseISO(transaction.created_at));
      hourlyRevenue.set(hour, (hourlyRevenue.get(hour) || 0) + transaction.total_amount);
    });

    return Array.from(hourlyRevenue.entries()).map(([hour, revenue]) => ({
      hour: hour.toString().padStart(2, '0') + ':00',
      revenue,
      transactions: Math.floor(revenue / 100) // Mock transaction count
    })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  }, [filteredTransactions]);

  const ageDistribution = useMemo(() => {
    const ageGroups = new Map<string, number>();
    
    filteredTransactions.forEach(transaction => {
      const ageGroup = transaction.customer.age_group;
      ageGroups.set(ageGroup, (ageGroups.get(ageGroup) || 0) + transaction.total_amount);
    });

    return Array.from(ageGroups.entries()).map(([age_group, revenue]) => ({
      age_group,
      revenue,
      count: Math.floor(revenue / 50) // Mock customer count
    }));
  }, [filteredTransactions]);

  const genderDistribution = useMemo(() => {
    const genderGroups = new Map<string, number>();
    
    filteredTransactions.forEach(transaction => {
      const gender = transaction.customer.gender === 'M' ? 'Male' : 'Female';
      genderGroups.set(gender, (genderGroups.get(gender) || 0) + transaction.total_amount);
    });

    return Array.from(genderGroups.entries()).map(([gender, revenue]) => ({
      gender,
      revenue,
      count: Math.floor(revenue / 50) // Mock customer count
    }));
  }, [filteredTransactions]);

  return {
    transactions: filteredTransactions,
    kpiData,
    categoryData,
    brandData,
    timeSeriesData,
    storeData,
    hourlyTrends,
    ageDistribution,
    genderDistribution,
  };
};