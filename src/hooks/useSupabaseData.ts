import { useState, useEffect } from 'react';
import { useFilterStore } from '../store/useFilterStore';
import { useTransactionData } from './useTransactionData';
import {
  getDashboardSummary,
  getLocationDistribution,
  getProductCategoriesSummary,
  getBrandPerformance,
  getHourlyTrends,
  getDailyTrends,
  getAgeDistribution,
  getGenderDistribution,
  getPurchaseBehaviorByAge,
  getPurchasePatternsByTime
} from '../lib/supabase';

export const useSupabaseData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [locationData, setLocationData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [brandData, setBrandData] = useState<any[]>([]);
  const [hourlyTrends, setHourlyTrends] = useState<any[]>([]);
  const [dailyTrends, setDailyTrends] = useState<any[]>([]);
  const [ageDistribution, setAgeDistribution] = useState<any[]>([]);
  const [genderDistribution, setGenderDistribution] = useState<any[]>([]);

  const { dateRange, barangays, categories, brands, stores } = useFilterStore();
  
  // Fallback to mock data
  const mockData = useTransactionData();

  const buildFilters = () => {
    const filters: any = {};
    
    if (dateRange.from) filters.p_start_date = dateRange.from.toISOString();
    if (dateRange.to) filters.p_end_date = dateRange.to.toISOString();
    if (barangays.length > 0) filters.p_barangays = barangays;
    if (categories.length > 0) filters.p_categories = categories;
    if (brands.length > 0) filters.p_brands = brands;
    if (stores.length > 0) filters.p_stores = stores;
    
    return filters;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = buildFilters();
      
      // Try to fetch from Supabase first
      try {
        const [
          dashboard,
          locations,
          categoriesData,
          brandsData,
          hourly,
          daily,
          ages,
          genders
        ] = await Promise.all([
          getDashboardSummary(filters),
          getLocationDistribution(filters),
          getProductCategoriesSummary(filters),
          getBrandPerformance(filters),
          getHourlyTrends(filters),
          getDailyTrends(filters),
          getAgeDistribution(filters),
          getGenderDistribution(filters)
        ]);

        setDashboardData(dashboard);
        setLocationData(locations || []);
        setCategoryData(categoriesData || []);
        setBrandData(brandsData || []);
        setHourlyTrends(hourly || []);
        setDailyTrends(daily || []);
        setAgeDistribution(ages || []);
        setGenderDistribution(genders || []);
        
      } catch (supabaseError) {
        console.warn('Supabase functions not available, falling back to mock data:', supabaseError);
        
        // Fallback to mock data
        setDashboardData(mockData.kpiData);
        setLocationData(mockData.storeData);
        setCategoryData(mockData.categoryData);
        setBrandData(mockData.brandData);
        setHourlyTrends([]);
        setDailyTrends(mockData.timeSeriesData);
        setAgeDistribution([]);
        setGenderDistribution([]);
      }
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // Even on error, provide mock data as fallback
      setDashboardData(mockData.kpiData);
      setLocationData(mockData.storeData);
      setCategoryData(mockData.categoryData);
      setBrandData(mockData.brandData);
      setHourlyTrends([]);
      setDailyTrends(mockData.timeSeriesData);
      setAgeDistribution([]);
      setGenderDistribution([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange, barangays, categories, brands, stores]);

  return {
    loading,
    error,
    dashboardData,
    locationData,
    categoryData,
    brandData,
    hourlyTrends,
    dailyTrends,
    ageDistribution,
    genderDistribution,
    refetch: fetchData
  };
};