/*
  # Fix Database Functions for New Schema

  1. Updated Functions
    - All analytics functions updated to work with new schema structure
    - Fixed column references and data types
    - Added proper age group calculation from age column
    - Updated transaction date references

  2. Schema Compatibility
    - Works with integer IDs instead of UUIDs
    - Handles different customer structure
    - Uses checkout_time instead of transaction_date
    - Calculates age groups dynamically from age column
*/

-- Drop existing functions to recreate with correct schema
DROP FUNCTION IF EXISTS public.get_dashboard_summary(jsonb);
DROP FUNCTION IF EXISTS public.get_location_distribution(jsonb);
DROP FUNCTION IF EXISTS public.get_product_categories_summary(jsonb);
DROP FUNCTION IF EXISTS public.get_brand_performance(jsonb);
DROP FUNCTION IF EXISTS public.get_daily_trends(jsonb);
DROP FUNCTION IF EXISTS public.get_hourly_trends(jsonb);
DROP FUNCTION IF EXISTS public.get_age_distribution_simple(jsonb);
DROP FUNCTION IF EXISTS public.get_gender_distribution_simple(jsonb);
DROP FUNCTION IF EXISTS public.get_purchase_behavior_by_age(jsonb);
DROP FUNCTION IF EXISTS public.get_purchase_patterns_by_time(jsonb);

-- Dashboard Summary Function
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(filters jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  start_date timestamptz;
  end_date timestamptz;
  filter_barangays text[];
  filter_categories text[];
  filter_brands text[];
  filter_stores text[];
BEGIN
  -- Extract filters
  start_date := COALESCE((filters->>'p_start_date')::timestamptz, '2024-01-01'::timestamptz);
  end_date := COALESCE((filters->>'p_end_date')::timestamptz, NOW());
  filter_barangays := CASE WHEN filters->'p_barangays' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_barangays')) ELSE NULL END;
  filter_categories := CASE WHEN filters->'p_categories' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_categories')) ELSE NULL END;
  filter_brands := CASE WHEN filters->'p_brands' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_brands')) ELSE NULL END;
  filter_stores := CASE WHEN filters->'p_stores' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_stores')) ELSE NULL END;

  WITH filtered_transactions AS (
    SELECT DISTINCT t.*, s.barangay, p.category, b.name as brand_name
    FROM transactions t
    LEFT JOIN stores s ON t.store_id = s.id
    LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
    LEFT JOIN products p ON ti.product_id = p.id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE t.checkout_time >= start_date 
      AND t.checkout_time <= end_date
      AND (filter_barangays IS NULL OR s.barangay = ANY(filter_barangays))
      AND (filter_categories IS NULL OR p.category = ANY(filter_categories))
      AND (filter_brands IS NULL OR b.name = ANY(filter_brands))
      AND (filter_stores IS NULL OR s.name = ANY(filter_stores))
  )
  SELECT jsonb_build_object(
    'total_revenue', COALESCE(SUM(total_amount), 0),
    'total_transactions', COUNT(DISTINCT id),
    'unique_customers', COUNT(DISTINCT COALESCE(device_id, id::text)),
    'avg_transaction_value', COALESCE(AVG(total_amount), 0),
    'avg_transactions_per_customer', CASE WHEN COUNT(DISTINCT COALESCE(device_id, id::text)) > 0 
      THEN COUNT(DISTINCT id)::float / COUNT(DISTINCT COALESCE(device_id, id::text)) ELSE 0 END,
    'avg_spend_per_customer', CASE WHEN COUNT(DISTINCT COALESCE(device_id, id::text)) > 0 
      THEN SUM(total_amount) / COUNT(DISTINCT COALESCE(device_id, id::text)) ELSE 0 END,
    'repeat_customer_rate', CASE WHEN COUNT(DISTINCT COALESCE(device_id, id::text)) > 0 
      THEN (COUNT(*) - COUNT(DISTINCT COALESCE(device_id, id::text)))::float / COUNT(DISTINCT COALESCE(device_id, id::text)) ELSE 0 END
  ) INTO result
  FROM filtered_transactions;

  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Location Distribution Function
CREATE OR REPLACE FUNCTION public.get_location_distribution(filters jsonb DEFAULT '{}'::jsonb)
RETURNS TABLE(
  barangay text,
  store_name text,
  total_revenue numeric,
  transaction_count bigint,
  avg_transaction_value numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date timestamptz;
  end_date timestamptz;
  filter_barangays text[];
  filter_categories text[];
  filter_brands text[];
  filter_stores text[];
BEGIN
  -- Extract filters
  start_date := COALESCE((filters->>'p_start_date')::timestamptz, '2024-01-01'::timestamptz);
  end_date := COALESCE((filters->>'p_end_date')::timestamptz, NOW());
  filter_barangays := CASE WHEN filters->'p_barangays' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_barangays')) ELSE NULL END;
  filter_categories := CASE WHEN filters->'p_categories' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_categories')) ELSE NULL END;
  filter_brands := CASE WHEN filters->'p_brands' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_brands')) ELSE NULL END;
  filter_stores := CASE WHEN filters->'p_stores' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_stores')) ELSE NULL END;

  RETURN QUERY
  SELECT 
    s.barangay,
    s.name as store_name,
    COALESCE(SUM(t.total_amount), 0) as total_revenue,
    COUNT(t.id) as transaction_count,
    COALESCE(AVG(t.total_amount), 0) as avg_transaction_value
  FROM stores s
  LEFT JOIN transactions t ON s.id = t.store_id
    AND t.checkout_time >= start_date 
    AND t.checkout_time <= end_date
  LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  LEFT JOIN products p ON ti.product_id = p.id
  LEFT JOIN brands b ON p.brand_id = b.id
  WHERE (filter_barangays IS NULL OR s.barangay = ANY(filter_barangays))
    AND (filter_categories IS NULL OR p.category = ANY(filter_categories))
    AND (filter_brands IS NULL OR b.name = ANY(filter_brands))
    AND (filter_stores IS NULL OR s.name = ANY(filter_stores))
  GROUP BY s.barangay, s.name
  ORDER BY total_revenue DESC;
END;
$$;

-- Product Categories Summary Function
CREATE OR REPLACE FUNCTION public.get_product_categories_summary(filters jsonb DEFAULT '{}'::jsonb)
RETURNS TABLE(
  category text,
  total_revenue numeric,
  transaction_count bigint,
  avg_price numeric,
  total_quantity bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date timestamptz;
  end_date timestamptz;
  filter_barangays text[];
  filter_categories text[];
  filter_brands text[];
  filter_stores text[];
BEGIN
  -- Extract filters
  start_date := COALESCE((filters->>'p_start_date')::timestamptz, '2024-01-01'::timestamptz);
  end_date := COALESCE((filters->>'p_end_date')::timestamptz, NOW());
  filter_barangays := CASE WHEN filters->'p_barangays' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_barangays')) ELSE NULL END;
  filter_categories := CASE WHEN filters->'p_categories' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_categories')) ELSE NULL END;
  filter_brands := CASE WHEN filters->'p_brands' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_brands')) ELSE NULL END;
  filter_stores := CASE WHEN filters->'p_stores' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_stores')) ELSE NULL END;

  RETURN QUERY
  SELECT 
    p.category,
    COALESCE(SUM(ti.price * ti.quantity), 0) as total_revenue,
    COUNT(DISTINCT t.id) as transaction_count,
    COALESCE(AVG(ti.price), 0) as avg_price,
    COALESCE(SUM(ti.quantity), 0) as total_quantity
  FROM products p
  LEFT JOIN transaction_items ti ON p.id = ti.product_id
  LEFT JOIN transactions t ON ti.transaction_id = t.id
    AND t.checkout_time >= start_date 
    AND t.checkout_time <= end_date
  LEFT JOIN stores s ON t.store_id = s.id
  LEFT JOIN brands b ON p.brand_id = b.id
  WHERE (filter_barangays IS NULL OR s.barangay = ANY(filter_barangays))
    AND (filter_categories IS NULL OR p.category = ANY(filter_categories))
    AND (filter_brands IS NULL OR b.name = ANY(filter_brands))
    AND (filter_stores IS NULL OR s.name = ANY(filter_stores))
  GROUP BY p.category
  ORDER BY total_revenue DESC;
END;
$$;

-- Brand Performance Function
CREATE OR REPLACE FUNCTION public.get_brand_performance(filters jsonb DEFAULT '{}'::jsonb)
RETURNS TABLE(
  brand text,
  total_revenue numeric,
  transaction_count bigint,
  avg_price numeric,
  total_quantity bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date timestamptz;
  end_date timestamptz;
  filter_barangays text[];
  filter_categories text[];
  filter_brands text[];
  filter_stores text[];
BEGIN
  -- Extract filters
  start_date := COALESCE((filters->>'p_start_date')::timestamptz, '2024-01-01'::timestamptz);
  end_date := COALESCE((filters->>'p_end_date')::timestamptz, NOW());
  filter_barangays := CASE WHEN filters->'p_barangays' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_barangays')) ELSE NULL END;
  filter_categories := CASE WHEN filters->'p_categories' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_categories')) ELSE NULL END;
  filter_brands := CASE WHEN filters->'p_brands' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_brands')) ELSE NULL END;
  filter_stores := CASE WHEN filters->'p_stores' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_stores')) ELSE NULL END;

  RETURN QUERY
  SELECT 
    b.name as brand,
    COALESCE(SUM(ti.price * ti.quantity), 0) as total_revenue,
    COUNT(DISTINCT t.id) as transaction_count,
    COALESCE(AVG(ti.price), 0) as avg_price,
    COALESCE(SUM(ti.quantity), 0) as total_quantity
  FROM brands b
  LEFT JOIN products p ON b.id = p.brand_id
  LEFT JOIN transaction_items ti ON p.id = ti.product_id
  LEFT JOIN transactions t ON ti.transaction_id = t.id
    AND t.checkout_time >= start_date 
    AND t.checkout_time <= end_date
  LEFT JOIN stores s ON t.store_id = s.id
  WHERE (filter_barangays IS NULL OR s.barangay = ANY(filter_barangays))
    AND (filter_categories IS NULL OR p.category = ANY(filter_categories))
    AND (filter_brands IS NULL OR b.name = ANY(filter_brands))
    AND (filter_stores IS NULL OR s.name = ANY(filter_stores))
  GROUP BY b.name
  ORDER BY total_revenue DESC;
END;
$$;

-- Daily Trends Function
CREATE OR REPLACE FUNCTION public.get_daily_trends(filters jsonb DEFAULT '{}'::jsonb)
RETURNS TABLE(
  date date,
  date_label text,
  total_revenue numeric,
  transaction_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date timestamptz;
  end_date timestamptz;
  filter_barangays text[];
  filter_categories text[];
  filter_brands text[];
  filter_stores text[];
BEGIN
  -- Extract filters
  start_date := COALESCE((filters->>'p_start_date')::timestamptz, '2024-01-01'::timestamptz);
  end_date := COALESCE((filters->>'p_end_date')::timestamptz, NOW());
  filter_barangays := CASE WHEN filters->'p_barangays' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_barangays')) ELSE NULL END;
  filter_categories := CASE WHEN filters->'p_categories' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_categories')) ELSE NULL END;
  filter_brands := CASE WHEN filters->'p_brands' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_brands')) ELSE NULL END;
  filter_stores := CASE WHEN filters->'p_stores' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_stores')) ELSE NULL END;

  RETURN QUERY
  SELECT 
    t.checkout_time::date as date,
    TO_CHAR(t.checkout_time::date, 'Mon DD') as date_label,
    COALESCE(SUM(t.total_amount), 0) as total_revenue,
    COUNT(t.id) as transaction_count
  FROM transactions t
  LEFT JOIN stores s ON t.store_id = s.id
  LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  LEFT JOIN products p ON ti.product_id = p.id
  LEFT JOIN brands b ON p.brand_id = b.id
  WHERE t.checkout_time >= start_date 
    AND t.checkout_time <= end_date
    AND (filter_barangays IS NULL OR s.barangay = ANY(filter_barangays))
    AND (filter_categories IS NULL OR p.category = ANY(filter_categories))
    AND (filter_brands IS NULL OR b.name = ANY(filter_brands))
    AND (filter_stores IS NULL OR s.name = ANY(filter_stores))
  GROUP BY t.checkout_time::date
  ORDER BY date;
END;
$$;

-- Hourly Trends Function
CREATE OR REPLACE FUNCTION public.get_hourly_trends(filters jsonb DEFAULT '{}'::jsonb)
RETURNS TABLE(
  hour integer,
  total_revenue numeric,
  transaction_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date timestamptz;
  end_date timestamptz;
  filter_barangays text[];
  filter_categories text[];
  filter_brands text[];
  filter_stores text[];
BEGIN
  -- Extract filters
  start_date := COALESCE((filters->>'p_start_date')::timestamptz, '2024-01-01'::timestamptz);
  end_date := COALESCE((filters->>'p_end_date')::timestamptz, NOW());
  filter_barangays := CASE WHEN filters->'p_barangays' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_barangays')) ELSE NULL END;
  filter_categories := CASE WHEN filters->'p_categories' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_categories')) ELSE NULL END;
  filter_brands := CASE WHEN filters->'p_brands' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_brands')) ELSE NULL END;
  filter_stores := CASE WHEN filters->'p_stores' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_stores')) ELSE NULL END;

  RETURN QUERY
  SELECT 
    EXTRACT(HOUR FROM t.checkout_time)::integer as hour,
    COALESCE(SUM(t.total_amount), 0) as total_revenue,
    COUNT(t.id) as transaction_count
  FROM transactions t
  LEFT JOIN stores s ON t.store_id = s.id
  LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  LEFT JOIN products p ON ti.product_id = p.id
  LEFT JOIN brands b ON p.brand_id = b.id
  WHERE t.checkout_time >= start_date 
    AND t.checkout_time <= end_date
    AND (filter_barangays IS NULL OR s.barangay = ANY(filter_barangays))
    AND (filter_categories IS NULL OR p.category = ANY(filter_categories))
    AND (filter_brands IS NULL OR b.name = ANY(filter_brands))
    AND (filter_stores IS NULL OR s.name = ANY(filter_stores))
  GROUP BY EXTRACT(HOUR FROM t.checkout_time)
  ORDER BY hour;
END;
$$;

-- Age Distribution Function (calculate age groups from age column)
CREATE OR REPLACE FUNCTION public.get_age_distribution_simple(filters jsonb DEFAULT '{}'::jsonb)
RETURNS TABLE(
  age_group text,
  total_revenue numeric,
  customer_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date timestamptz;
  end_date timestamptz;
  filter_barangays text[];
  filter_categories text[];
  filter_brands text[];
  filter_stores text[];
BEGIN
  -- Extract filters
  start_date := COALESCE((filters->>'p_start_date')::timestamptz, '2024-01-01'::timestamptz);
  end_date := COALESCE((filters->>'p_end_date')::timestamptz, NOW());
  filter_barangays := CASE WHEN filters->'p_barangays' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_barangays')) ELSE NULL END;
  filter_categories := CASE WHEN filters->'p_categories' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_categories')) ELSE NULL END;
  filter_brands := CASE WHEN filters->'p_brands' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_brands')) ELSE NULL END;
  filter_stores := CASE WHEN filters->'p_stores' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_stores')) ELSE NULL END;

  RETURN QUERY
  SELECT 
    CASE 
      WHEN t.customer_age BETWEEN 18 AND 25 THEN '18-25'
      WHEN t.customer_age BETWEEN 26 AND 35 THEN '26-35'
      WHEN t.customer_age BETWEEN 36 AND 45 THEN '36-45'
      WHEN t.customer_age BETWEEN 46 AND 55 THEN '46-55'
      WHEN t.customer_age > 55 THEN '56+'
      ELSE 'Unknown'
    END as age_group,
    COALESCE(SUM(t.total_amount), 0) as total_revenue,
    COUNT(DISTINCT t.device_id) as customer_count
  FROM transactions t
  LEFT JOIN stores s ON t.store_id = s.id
  LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  LEFT JOIN products p ON ti.product_id = p.id
  LEFT JOIN brands b ON p.brand_id = b.id
  WHERE t.checkout_time >= start_date 
    AND t.checkout_time <= end_date
    AND t.customer_age IS NOT NULL
    AND (filter_barangays IS NULL OR s.barangay = ANY(filter_barangays))
    AND (filter_categories IS NULL OR p.category = ANY(filter_categories))
    AND (filter_brands IS NULL OR b.name = ANY(filter_brands))
    AND (filter_stores IS NULL OR s.name = ANY(filter_stores))
  GROUP BY age_group
  ORDER BY total_revenue DESC;
END;
$$;

-- Gender Distribution Function
CREATE OR REPLACE FUNCTION public.get_gender_distribution_simple(filters jsonb DEFAULT '{}'::jsonb)
RETURNS TABLE(
  gender text,
  total_revenue numeric,
  customer_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date timestamptz;
  end_date timestamptz;
  filter_barangays text[];
  filter_categories text[];
  filter_brands text[];
  filter_stores text[];
BEGIN
  -- Extract filters
  start_date := COALESCE((filters->>'p_start_date')::timestamptz, '2024-01-01'::timestamptz);
  end_date := COALESCE((filters->>'p_end_date')::timestamptz, NOW());
  filter_barangays := CASE WHEN filters->'p_barangays' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_barangays')) ELSE NULL END;
  filter_categories := CASE WHEN filters->'p_categories' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_categories')) ELSE NULL END;
  filter_brands := CASE WHEN filters->'p_brands' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_brands')) ELSE NULL END;
  filter_stores := CASE WHEN filters->'p_stores' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_stores')) ELSE NULL END;

  RETURN QUERY
  SELECT 
    t.customer_gender as gender,
    COALESCE(SUM(t.total_amount), 0) as total_revenue,
    COUNT(DISTINCT t.device_id) as customer_count
  FROM transactions t
  LEFT JOIN stores s ON t.store_id = s.id
  LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  LEFT JOIN products p ON ti.product_id = p.id
  LEFT JOIN brands b ON p.brand_id = b.id
  WHERE t.checkout_time >= start_date 
    AND t.checkout_time <= end_date
    AND t.customer_gender IS NOT NULL
    AND (filter_barangays IS NULL OR s.barangay = ANY(filter_barangays))
    AND (filter_categories IS NULL OR p.category = ANY(filter_categories))
    AND (filter_brands IS NULL OR b.name = ANY(filter_brands))
    AND (filter_stores IS NULL OR s.name = ANY(filter_stores))
  GROUP BY t.customer_gender
  ORDER BY total_revenue DESC;
END;
$$;

-- Purchase Behavior by Age Function
CREATE OR REPLACE FUNCTION public.get_purchase_behavior_by_age(filters jsonb DEFAULT '{}'::jsonb)
RETURNS TABLE(
  age_group text,
  avg_transaction_value numeric,
  avg_items_per_transaction numeric,
  purchase_frequency numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date timestamptz;
  end_date timestamptz;
  filter_barangays text[];
  filter_categories text[];
  filter_brands text[];
  filter_stores text[];
BEGIN
  -- Extract filters
  start_date := COALESCE((filters->>'p_start_date')::timestamptz, '2024-01-01'::timestamptz);
  end_date := COALESCE((filters->>'p_end_date')::timestamptz, NOW());
  filter_barangays := CASE WHEN filters->'p_barangays' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_barangays')) ELSE NULL END;
  filter_categories := CASE WHEN filters->'p_categories' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_categories')) ELSE NULL END;
  filter_brands := CASE WHEN filters->'p_brands' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_brands')) ELSE NULL END;
  filter_stores := CASE WHEN filters->'p_stores' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_stores')) ELSE NULL END;

  RETURN QUERY
  SELECT 
    CASE 
      WHEN t.customer_age BETWEEN 18 AND 25 THEN '18-25'
      WHEN t.customer_age BETWEEN 26 AND 35 THEN '26-35'
      WHEN t.customer_age BETWEEN 36 AND 45 THEN '36-45'
      WHEN t.customer_age BETWEEN 46 AND 55 THEN '46-55'
      WHEN t.customer_age > 55 THEN '56+'
      ELSE 'Unknown'
    END as age_group,
    COALESCE(AVG(t.total_amount), 0) as avg_transaction_value,
    COALESCE(AVG(item_counts.item_count), 0) as avg_items_per_transaction,
    CASE WHEN COUNT(DISTINCT t.device_id) > 0 
      THEN COUNT(t.id)::numeric / COUNT(DISTINCT t.device_id) 
      ELSE 0 END as purchase_frequency
  FROM transactions t
  LEFT JOIN stores s ON t.store_id = s.id
  LEFT JOIN (
    SELECT ti.transaction_id, COUNT(*) as item_count
    FROM transaction_items ti
    GROUP BY ti.transaction_id
  ) item_counts ON t.id = item_counts.transaction_id
  LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  LEFT JOIN products p ON ti.product_id = p.id
  LEFT JOIN brands b ON p.brand_id = b.id
  WHERE t.checkout_time >= start_date 
    AND t.checkout_time <= end_date
    AND t.customer_age IS NOT NULL
    AND (filter_barangays IS NULL OR s.barangay = ANY(filter_barangays))
    AND (filter_categories IS NULL OR p.category = ANY(filter_categories))
    AND (filter_brands IS NULL OR b.name = ANY(filter_brands))
    AND (filter_stores IS NULL OR s.name = ANY(filter_stores))
  GROUP BY age_group
  ORDER BY avg_transaction_value DESC;
END;
$$;

-- Purchase Patterns by Time Function
CREATE OR REPLACE FUNCTION public.get_purchase_patterns_by_time(filters jsonb DEFAULT '{}'::jsonb)
RETURNS TABLE(
  time_period text,
  total_revenue numeric,
  transaction_count bigint,
  avg_transaction_value numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date timestamptz;
  end_date timestamptz;
  filter_barangays text[];
  filter_categories text[];
  filter_brands text[];
  filter_stores text[];
BEGIN
  -- Extract filters
  start_date := COALESCE((filters->>'p_start_date')::timestamptz, '2024-01-01'::timestamptz);
  end_date := COALESCE((filters->>'p_end_date')::timestamptz, NOW());
  filter_barangays := CASE WHEN filters->'p_barangays' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_barangays')) ELSE NULL END;
  filter_categories := CASE WHEN filters->'p_categories' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_categories')) ELSE NULL END;
  filter_brands := CASE WHEN filters->'p_brands' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_brands')) ELSE NULL END;
  filter_stores := CASE WHEN filters->'p_stores' IS NOT NULL THEN 
    ARRAY(SELECT jsonb_array_elements_text(filters->'p_stores')) ELSE NULL END;

  RETURN QUERY
  SELECT 
    CASE 
      WHEN EXTRACT(HOUR FROM t.checkout_time) BETWEEN 6 AND 11 THEN 'Morning'
      WHEN EXTRACT(HOUR FROM t.checkout_time) BETWEEN 12 AND 17 THEN 'Afternoon'
      WHEN EXTRACT(HOUR FROM t.checkout_time) BETWEEN 18 AND 21 THEN 'Evening'
      ELSE 'Night'
    END as time_period,
    COALESCE(SUM(t.total_amount), 0) as total_revenue,
    COUNT(t.id) as transaction_count,
    COALESCE(AVG(t.total_amount), 0) as avg_transaction_value
  FROM transactions t
  LEFT JOIN stores s ON t.store_id = s.id
  LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  LEFT JOIN products p ON ti.product_id = p.id
  LEFT JOIN brands b ON p.brand_id = b.id
  WHERE t.checkout_time >= start_date 
    AND t.checkout_time <= end_date
    AND (filter_barangays IS NULL OR s.barangay = ANY(filter_barangays))
    AND (filter_categories IS NULL OR p.category = ANY(filter_categories))
    AND (filter_brands IS NULL OR b.name = ANY(filter_brands))
    AND (filter_stores IS NULL OR s.name = ANY(filter_stores))
  GROUP BY time_period
  ORDER BY total_revenue DESC;
END;
$$;

-- Grant execute permissions to public role for dashboard access
GRANT EXECUTE ON FUNCTION public.get_dashboard_summary(jsonb) TO public;
GRANT EXECUTE ON FUNCTION public.get_location_distribution(jsonb) TO public;
GRANT EXECUTE ON FUNCTION public.get_product_categories_summary(jsonb) TO public;
GRANT EXECUTE ON FUNCTION public.get_brand_performance(jsonb) TO public;
GRANT EXECUTE ON FUNCTION public.get_daily_trends(jsonb) TO public;
GRANT EXECUTE ON FUNCTION public.get_hourly_trends(jsonb) TO public;
GRANT EXECUTE ON FUNCTION public.get_age_distribution_simple(jsonb) TO public;
GRANT EXECUTE ON FUNCTION public.get_gender_distribution_simple(jsonb) TO public;
GRANT EXECUTE ON FUNCTION public.get_purchase_behavior_by_age(jsonb) TO public;
GRANT EXECUTE ON FUNCTION public.get_purchase_patterns_by_time(jsonb) TO public;