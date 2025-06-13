/*
  # Fix Column References in Analytics Functions

  This migration fixes column reference errors in analytics functions by updating them to use the correct column names from the actual database schema.

  ## Changes Made
  1. Fix get_age_distribution_simple - use customers.age instead of non-existent customer_age
  2. Fix get_gender_distribution_simple - use customers.gender instead of non-existent customer_gender  
  3. Fix get_hourly_trends - use transactions.checkout_time (which exists) or created_at
  4. Fix get_product_categories_summary - use correct timestamp column

  ## Notes
  - Functions are dropped and recreated to ensure clean state
  - All functions use proper joins to access customer data
  - Time-based functions use existing timestamp columns
*/

-- Drop existing functions that have column reference errors
DROP FUNCTION IF EXISTS public.get_age_distribution_simple(timestamp with time zone, timestamp with time zone, text[], text[], text[], text[]);
DROP FUNCTION IF EXISTS public.get_gender_distribution_simple(timestamp with time zone, timestamp with time zone, text[], text[], text[], text[]);
DROP FUNCTION IF EXISTS public.get_hourly_trends(timestamp with time zone, timestamp with time zone, text[], text[], text[], text[]);
DROP FUNCTION IF EXISTS public.get_product_categories_summary(timestamp with time zone, timestamp with time zone, text[], text[], text[], text[]);

-- Recreate get_age_distribution_simple with correct column references
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
    CASE 
      WHEN c.age BETWEEN 18 AND 25 THEN '18-25'
      WHEN c.age BETWEEN 26 AND 35 THEN '26-35'
      WHEN c.age BETWEEN 36 AND 45 THEN '36-45'
      WHEN c.age BETWEEN 46 AND 55 THEN '46-55'
      WHEN c.age > 55 THEN '56+'
      ELSE 'Unknown'
    END as age_group,
    COUNT(DISTINCT c.id)::bigint as customer_count,
    COALESCE(SUM(t.total_amount), 0) as total_spent,
    COALESCE(AVG(t.total_amount), 0) as avg_transaction_value
  FROM customers c
  LEFT JOIN transactions t ON c.customer_id = t.customer_id
  LEFT JOIN stores s ON t.store_id = s.id
  LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  LEFT JOIN products p ON ti.product_id = p.id
  LEFT JOIN brands b ON p.brand_id = b.id
  WHERE 
    (p_start_date IS NULL OR t.created_at >= p_start_date)
    AND (p_end_date IS NULL OR t.created_at <= p_end_date)
    AND (p_barangays IS NULL OR s.barangay = ANY(p_barangays))
    AND (p_categories IS NULL OR p.category = ANY(p_categories))
    AND (p_brands IS NULL OR b.name = ANY(p_brands))
    AND (p_stores IS NULL OR s.name = ANY(p_stores))
  GROUP BY 
    CASE 
      WHEN c.age BETWEEN 18 AND 25 THEN '18-25'
      WHEN c.age BETWEEN 26 AND 35 THEN '26-35'
      WHEN c.age BETWEEN 36 AND 45 THEN '36-45'
      WHEN c.age BETWEEN 46 AND 55 THEN '46-55'
      WHEN c.age > 55 THEN '56+'
      ELSE 'Unknown'
    END
  ORDER BY customer_count DESC;
END;
$$;

-- Recreate get_gender_distribution_simple with correct column references
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
  LEFT JOIN transactions t ON c.customer_id = t.customer_id
  LEFT JOIN stores s ON t.store_id = s.id
  LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  LEFT JOIN products p ON ti.product_id = p.id
  LEFT JOIN brands b ON p.brand_id = b.id
  WHERE 
    (p_start_date IS NULL OR t.created_at >= p_start_date)
    AND (p_end_date IS NULL OR t.created_at <= p_end_date)
    AND (p_barangays IS NULL OR s.barangay = ANY(p_barangays))
    AND (p_categories IS NULL OR p.category = ANY(p_categories))
    AND (p_brands IS NULL OR b.name = ANY(p_brands))
    AND (p_stores IS NULL OR s.name = ANY(p_stores))
  GROUP BY c.gender
  ORDER BY customer_count DESC;
END;
$$;

-- Recreate get_hourly_trends with correct column references
CREATE OR REPLACE FUNCTION public.get_hourly_trends(
  p_start_date timestamp with time zone DEFAULT NULL,
  p_end_date timestamp with time zone DEFAULT NULL,
  p_barangays text[] DEFAULT NULL,
  p_categories text[] DEFAULT NULL,
  p_brands text[] DEFAULT NULL,
  p_stores text[] DEFAULT NULL
)
RETURNS TABLE(
  hour integer,
  transaction_count bigint,
  total_revenue numeric,
  avg_transaction_value numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(hour FROM t.checkout_time)::integer as hour,
    COUNT(t.id)::bigint as transaction_count,
    COALESCE(SUM(t.total_amount), 0) as total_revenue,
    COALESCE(AVG(t.total_amount), 0) as avg_transaction_value
  FROM transactions t
  LEFT JOIN stores s ON t.store_id = s.id
  LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  LEFT JOIN products p ON ti.product_id = p.id
  LEFT JOIN brands b ON p.brand_id = b.id
  WHERE 
    (p_start_date IS NULL OR t.checkout_time >= p_start_date)
    AND (p_end_date IS NULL OR t.checkout_time <= p_end_date)
    AND (p_barangays IS NULL OR s.barangay = ANY(p_barangays))
    AND (p_categories IS NULL OR p.category = ANY(p_categories))
    AND (p_brands IS NULL OR b.name = ANY(p_brands))
    AND (p_stores IS NULL OR s.name = ANY(p_stores))
  GROUP BY EXTRACT(hour FROM t.checkout_time)
  ORDER BY hour;
END;
$$;

-- Recreate get_product_categories_summary with correct column references
CREATE OR REPLACE FUNCTION public.get_product_categories_summary(
  p_start_date timestamp with time zone DEFAULT NULL,
  p_end_date timestamp with time zone DEFAULT NULL,
  p_barangays text[] DEFAULT NULL,
  p_categories text[] DEFAULT NULL,
  p_brands text[] DEFAULT NULL,
  p_stores text[] DEFAULT NULL
)
RETURNS TABLE(
  category text,
  product_count bigint,
  total_revenue numeric,
  avg_transaction_value numeric,
  total_quantity bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.category,
    COUNT(DISTINCT p.id)::bigint as product_count,
    COALESCE(SUM(ti.price * ti.quantity), 0) as total_revenue,
    COALESCE(AVG(t.total_amount), 0) as avg_transaction_value,
    COALESCE(SUM(ti.quantity), 0)::bigint as total_quantity
  FROM products p
  LEFT JOIN transaction_items ti ON p.id = ti.product_id
  LEFT JOIN transactions t ON ti.transaction_id = t.id
  LEFT JOIN stores s ON t.store_id = s.id
  LEFT JOIN brands b ON p.brand_id = b.id
  WHERE 
    (p_start_date IS NULL OR t.checkout_time >= p_start_date)
    AND (p_end_date IS NULL OR t.checkout_time <= p_end_date)
    AND (p_barangays IS NULL OR s.barangay = ANY(p_barangays))
    AND (p_categories IS NULL OR p.category = ANY(p_categories))
    AND (p_brands IS NULL OR b.name = ANY(p_brands))
    AND (p_stores IS NULL OR s.name = ANY(p_stores))
  GROUP BY p.category
  ORDER BY total_revenue DESC;
END;
$$;