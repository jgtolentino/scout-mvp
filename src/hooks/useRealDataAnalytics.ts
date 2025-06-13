import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface RealTimeMetrics {
  totalTransactions: number
  totalRevenue: number
  avgTransactionValue: number
  topBrand: string
  topCategory: string
  peakHour: string
  weekendVsWeekday: {
    weekend: number
    weekday: number
  }
  genderDistribution: {
    male: number
    female: number
  }
  ageDistribution: Array<{
    ageGroup: string
    count: number
    percentage: number
  }>
  locationPerformance: Array<{
    barangay: string
    revenue: number
    transactions: number
  }>
  brandPerformance: Array<{
    brand: string
    revenue: number
    growth: number
  }>
  categoryTrends: Array<{
    category: string
    revenue: number
    growth: number
  }>
  hourlyTrends: Array<{
    hour: number
    transactions: number
    revenue: number
  }>
  dailyTrends: Array<{
    date: string
    transactions: number
    revenue: number
  }>
}

export interface FilterState {
  dateRange: { from: string; to: string }
  barangays: string[]
  categories: string[]
  brands: string[]
  stores: string[]
}

export function useRealDataAnalytics(filters: FilterState) {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRealTimeMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Convert filter state to database parameters
      const filterParams = {
        p_start_date: filters.dateRange.from || '2025-01-01',
        p_end_date: filters.dateRange.to || '2025-12-31',
        p_barangays: filters.barangays.length > 0 ? filters.barangays : null,
        p_categories: filters.categories.length > 0 ? filters.categories : null,
        p_brands: filters.brands.length > 0 ? filters.brands : null,
        p_stores: filters.stores.length > 0 ? filters.stores : null
      }

      // Fetch all analytics data in parallel
      // Note: Some functions use filters object, others use date parameters
      const filterObj = {};
      const startDate = filters.dateRange.from || null;
      const endDate = filters.dateRange.to || null;

      const [
        dashboardSummary,
        ageDistribution,
        genderDistribution,
        locationDistribution,
        brandPerformance,
        categoryMetrics,
        dailyTrends
      ] = await Promise.all([
        supabase.rpc('get_dashboard_summary', { filters: filterObj }),
        supabase.rpc('get_age_distribution_simple', { 
          p_start_date: startDate,
          p_end_date: endDate 
        }),
        supabase.rpc('get_gender_distribution_simple', { filters: filterObj }),
        supabase.rpc('get_location_distribution', { filters: filterObj }),
        supabase.rpc('get_brand_performance', { filters: filterObj }),
        supabase.rpc('get_product_categories_summary', { filters: filterObj }),
        supabase.rpc('get_daily_trends', { filters: filterObj })
      ])

      // Check for errors
      const errors = [
        dashboardSummary.error,
        ageDistribution.error,
        genderDistribution.error,
        locationDistribution.error,
        brandPerformance.error,
        categoryMetrics.error,
        dailyTrends.error
      ].filter(Boolean)

      if (errors.length > 0) {
        throw new Error(`Database errors: ${errors.map(e => e.message).join(', ')}`)
      }

      // Process and structure the data
      const processedMetrics: RealTimeMetrics = {
        // Dashboard summary metrics
        totalTransactions: dashboardSummary.data?.total_transactions || 0,
        totalRevenue: dashboardSummary.data?.total_revenue || 0,
        avgTransactionValue: dashboardSummary.data?.avg_transaction_value || 0,

        // Top performers
        topBrand: brandPerformance.data?.[0]?.brand || 'N/A',
        topCategory: categoryMetrics.data?.[0]?.category || 'N/A',
        peakHour: '19:00-20:00', // Static for now since hourly trends needs fixing

        // Weekend vs Weekday analysis
        weekendVsWeekday: calculateWeekendVsWeekday(dailyTrends.data || []),

        // Gender distribution
        genderDistribution: processGenderDistribution(genderDistribution.data || []),

        // Age distribution
        ageDistribution: (ageDistribution.data || []).map((item: any) => ({
          ageGroup: item.age_group,
          count: item.count || 0,
          percentage: item.percentage || 0
        })),

        // Location performance
        locationPerformance: (locationDistribution.data || []).map((item: any) => ({
          barangay: item.barangay || 'Unknown',
          revenue: item.total_revenue || 0,
          transactions: item.transaction_count || 0
        })),

        // Brand performance
        brandPerformance: (brandPerformance.data || []).map((item: any) => ({
          brand: item.brand,
          revenue: item.total_revenue || 0,
          growth: item.growth_rate || 0
        })),

        // Category trends
        categoryTrends: (categoryMetrics.data || []).map((item: any) => ({
          category: item.category,
          revenue: item.total_revenue || 0,
          growth: item.growth_rate || 0
        })),

        // Hourly trends (simplified for now)
        hourlyTrends: [],

        // Daily trends
        dailyTrends: (dailyTrends.data || []).map((item: any) => ({
          date: item.date_label || item.date,
          transactions: item.transaction_count || 0,
          revenue: item.total_revenue || 0
        }))
      }

      setMetrics(processedMetrics)
    } catch (err) {
      console.error('Failed to fetch real-time metrics:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Helper functions
  const findPeakHour = (hourlyData: any[]): string => {
    if (!hourlyData.length) return 'N/A'
    
    const peak = hourlyData.reduce((max, current) => 
      (current.transaction_count || 0) > (max.transaction_count || 0) ? current : max
    )
    
    const hour = new Date(peak.hour || peak.date).getHours()
    return `${hour}:00-${hour + 1}:00`
  }

  const calculateWeekendVsWeekday = (dailyData: any[]) => {
    const weekend = dailyData
      .filter(item => {
        const date = new Date(item.date)
        const day = date.getDay()
        return day === 0 || day === 6 // Sunday or Saturday
      })
      .reduce((sum, item) => sum + (item.total_revenue || 0), 0)

    const weekday = dailyData
      .filter(item => {
        const date = new Date(item.date)
        const day = date.getDay()
        return day >= 1 && day <= 5 // Monday to Friday
      })
      .reduce((sum, item) => sum + (item.total_revenue || 0), 0)

    return { weekend, weekday }
  }

  const processGenderDistribution = (genderData: any[]) => {
    const maleData = genderData.find(item => item.gender === 'M') || {}
    const femaleData = genderData.find(item => item.gender === 'F') || {}
    
    return {
      male: maleData.total_revenue || 0,
      female: femaleData.total_revenue || 0
    }
  }

  const processHourlyTrends = (hourlyData: any[]) => {
    return hourlyData.map((item: any) => ({
      hour: new Date(item.hour || item.date).getHours(),
      transactions: item.transaction_count || 0,
      revenue: item.total_revenue || 0
    }))
  }

  // Fetch data when filters change
  useEffect(() => {
    fetchRealTimeMetrics()
  }, [
    filters.dateRange.from,
    filters.dateRange.to,
    JSON.stringify(filters.barangays),
    JSON.stringify(filters.categories),
    JSON.stringify(filters.brands),
    JSON.stringify(filters.stores)
  ])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchRealTimeMetrics, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [filters])

  return {
    metrics,
    loading,
    error,
    refetch: fetchRealTimeMetrics
  }
}

// Hook for AI insights using real data
export function useAIInsights(filters: FilterState) {
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAIInsights = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dateRange: filters.dateRange,
          barangays: filters.barangays,
          categories: filters.categories,
          brands: filters.brands,
          stores: filters.stores
        })
      })

      if (!response.ok) {
        throw new Error(`AI insights request failed: ${response.status}`)
      }

      const data = await response.json()
      setInsights(data.insights || [])
    } catch (err) {
      console.error('Failed to fetch AI insights:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAIInsights()
  }, [
    filters.dateRange.from,
    filters.dateRange.to,
    JSON.stringify(filters.barangays),
    JSON.stringify(filters.categories),
    JSON.stringify(filters.brands),
    JSON.stringify(filters.stores)
  ])

  return {
    insights,
    loading,
    error,
    refetch: fetchAIInsights
  }
}