/*
  # Fix function overloading conflicts

  1. Drop existing functions with their exact signatures
  2. Recreate functions with correct return types
  3. Ensure no ambiguity in function resolution
*/

-- Drop all versions of get_age_distribution_simple to avoid conflicts
DROP FUNCTION IF EXISTS public.get_age_distribution_simple(filters jsonb);
DROP FUNCTION IF EXISTS public.get_age_distribution_simple(timestamp with time zone, timestamp with time zone, text[], text[], text[], text[]);

-- Recreate get_age_distribution_simple with correct signature and return type
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
  total_revenue numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.age_group,
    COALESCE(SUM(t.total_amount), 0) as total_revenue
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
  ORDER BY total_revenue DESC;
END;
$$;

-- Drop all versions of get_gender_distribution_simple to avoid conflicts
DROP FUNCTION IF EXISTS public.get_gender_distribution_simple(filters jsonb);
DROP FUNCTION IF EXISTS public.get_gender_distribution_simple(timestamp with time zone, timestamp with time zone, text[], text[], text[], text[]);

-- Recreate get_gender_distribution_simple with correct signature and return type
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
  total_revenue numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.gender,
    COALESCE(SUM(t.total_amount), 0) as total_revenue
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
  ORDER BY total_revenue DESC;
END;
$$;