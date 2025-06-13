/*
  # Fix function overloading conflict for get_age_distribution_simple

  1. Problem
    - Two versions of get_age_distribution_simple function exist
    - One with jsonb parameter, one with individual named parameters
    - This creates ambiguity for the Supabase API

  2. Solution
    - Drop the jsonb version of the function
    - Keep only the version with named parameters that matches our client code
    - Ensure consistent function signature across all analytics functions

  3. Security
    - No changes to RLS or policies needed
    - Function permissions remain unchanged
*/

-- Drop the conflicting function with jsonb parameter
DROP FUNCTION IF EXISTS public.get_age_distribution_simple(filters jsonb);

-- Ensure we have the correct function with named parameters
-- This should already exist from previous migrations, but we'll recreate it to be safe
CREATE OR REPLACE FUNCTION public.get_age_distribution_simple(
  p_start_date timestamp with time zone DEFAULT NULL,
  p_end_date timestamp with time zone DEFAULT NULL,
  p_barangays text[] DEFAULT NULL,
  p_categories text[] DEFAULT NULL,
  p_brands text[] DEFAULT NULL,
  p_stores text[] DEFAULT NULL
)
RETURNS TABLE(
  age_group text,
  customer_count bigint,
  total_spent numeric,
  avg_transaction_value numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.age_group,
    COUNT(DISTINCT c.id)::bigint as customer_count,
    COALESCE(SUM(t.total_amount), 0) as total_spent,
    COALESCE(AVG(t.total_amount), 0) as avg_transaction_value
  FROM customers c
  LEFT JOIN transactions t ON c.id = t.customer_id
  LEFT JOIN stores s ON t.store_id = s.id
  LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  LEFT JOIN products p ON ti.product_id = p.id
  LEFT JOIN brands b ON p.brand_id = b.id
  WHERE 
    (p_start_date IS NULL OR t.transaction_date >= p_start_date)
    AND (p_end_date IS NULL OR t.transaction_date <= p_end_date)
    AND (p_barangays IS NULL OR s.barangay = ANY(p_barangays))
    AND (p_categories IS NULL OR p.category = ANY(p_categories))
    AND (p_brands IS NULL OR b.name = ANY(p_brands))
    AND (p_stores IS NULL OR s.name = ANY(p_stores))
  GROUP BY c.age_group
  ORDER BY customer_count DESC;
END;
$$;

-- Also check and fix get_gender_distribution_simple if it has the same issue
DROP FUNCTION IF EXISTS public.get_gender_distribution_simple(filters jsonb);

CREATE OR REPLACE FUNCTION public.get_gender_distribution_simple(
  p_start_date timestamp with time zone DEFAULT NULL,
  p_end_date timestamp with time zone DEFAULT NULL,
  p_barangays text[] DEFAULT NULL,
  p_categories text[] DEFAULT NULL,
  p_brands text[] DEFAULT NULL,
  p_stores text[] DEFAULT NULL
)
RETURNS TABLE(
  gender text,
  customer_count bigint,
  total_spent numeric,
  avg_transaction_value numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.gender,
    COUNT(DISTINCT c.id)::bigint as customer_count,
    COALESCE(SUM(t.total_amount), 0) as total_spent,
    COALESCE(AVG(t.total_amount), 0) as avg_transaction_value
  FROM customers c
  LEFT JOIN transactions t ON c.id = t.customer_id
  LEFT JOIN stores s ON t.store_id = s.id
  LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  LEFT JOIN products p ON ti.product_id = p.id
  LEFT JOIN brands b ON p.brand_id = b.id
  WHERE 
    (p_start_date IS NULL OR t.transaction_date >= p_start_date)
    AND (p_end_date IS NULL OR t.transaction_date <= p_end_date)
    AND (p_barangays IS NULL OR s.barangay = ANY(p_barangays))
    AND (p_categories IS NULL OR p.category = ANY(p_categories))
    AND (p_brands IS NULL OR b.name = ANY(p_brands))
    AND (p_stores IS NULL OR s.name = ANY(p_stores))
  GROUP BY c.gender
  ORDER BY customer_count DESC;
END;
$$;