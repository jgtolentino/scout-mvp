import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Some features may not work.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// Database function calls with error handling
export const getDashboardSummary = async (filters: any = {}) => {
  try {
    const { data, error } = await supabase.rpc('get_dashboard_summary', { filters })
    if (error) throw error
    return data
  } catch (error) {
    console.error('getDashboardSummary error:', error)
    throw error
  }
}

export const getLocationDistribution = async (filters: any = {}) => {
  try {
    const { data, error } = await supabase.rpc('get_location_distribution', { filters })
    if (error) throw error
    return data
  } catch (error) {
    console.error('getLocationDistribution error:', error)
    throw error
  }
}

export const getProductCategoriesSummary = async (filters: any = {}) => {
  try {
    const { data, error } = await supabase.rpc('get_product_categories_summary', { filters })
    if (error) throw error
    return data
  } catch (error) {
    console.error('getProductCategoriesSummary error:', error)
    throw error
  }
}

export const getBrandPerformance = async (filters: any = {}) => {
  try {
    const { data, error } = await supabase.rpc('get_brand_performance', { filters })
    if (error) throw error
    return data
  } catch (error) {
    console.error('getBrandPerformance error:', error)
    throw error
  }
}

export const getHourlyTrends = async (filters: any = {}) => {
  try {
    const { data, error } = await supabase.rpc('get_hourly_trends', { filters })
    if (error) throw error
    return data
  } catch (error) {
    console.error('getHourlyTrends error:', error)
    throw error
  }
}

export const getDailyTrends = async (filters: any = {}) => {
  try {
    const { data, error } = await supabase.rpc('get_daily_trends', { filters })
    if (error) throw error
    return data
  } catch (error) {
    console.error('getDailyTrends error:', error)
    throw error
  }
}

export const getAgeDistribution = async (filters: any = {}) => {
  try {
    const { data, error } = await supabase.rpc('get_age_distribution_simple', { filters })
    if (error) throw error
    return data
  } catch (error) {
    console.error('getAgeDistribution error:', error)
    throw error
  }
}

export const getGenderDistribution = async (filters: any = {}) => {
  try {
    const { data, error } = await supabase.rpc('get_gender_distribution_simple', { filters })
    if (error) throw error
    return data
  } catch (error) {
    console.error('getGenderDistribution error:', error)
    throw error
  }
}

export const getPurchaseBehaviorByAge = async (filters: any = {}) => {
  try {
    const { data, error } = await supabase.rpc('get_purchase_behavior_by_age', { filters })
    if (error) throw error
    return data
  } catch (error) {
    console.error('getPurchaseBehaviorByAge error:', error)
    throw error
  }
}

export const getPurchasePatternsByTime = async (filters: any = {}) => {
  try {
    const { data, error } = await supabase.rpc('get_purchase_patterns_by_time', { filters })
    if (error) throw error
    return data
  } catch (error) {
    console.error('getPurchasePatternsByTime error:', error)
    throw error
  }
}