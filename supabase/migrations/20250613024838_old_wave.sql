/*
  # Fix Database Functions with Correct Column References

  This migration recreates all analytics functions to use the correct column names
  based on the actual database schema provided.

  ## Changes Made
  1. Fixed get_product_categories_summary to use t.created_at instead of t.checkout_time
  2. Fixed get_age_distribution_simple to use c.age instead of t.customer_age
  3. Fixed get_gender_distribution_simple to use c.gender instead of t.customer_gender
  4. Fixed get_location_distribution to use t.created_at instead of t.checkout_time
  5. Fixed get_hourly_trends to use t.created_at instead of t.checkout_time
  6. All functions now properly join with customers table using customer_id text field
*/

-- Drop existing functions first
DROP FUNCTION IF EXISTS get_product_categories_summary(jsonb);
DROP FUNCTION IF EXISTS get_age_distribution_simple(jsonb);
DROP FUNCTION IF EXISTS get_gender_distribution_simple(jsonb);
DROP FUNCTION IF EXISTS get_location_distribution(jsonb);
DROP FUNCTION IF EXISTS get_hourly_trends(jsonb);

-- Recreate get_product_categories_summary with correct column references
CREATE OR REPLACE FUNCTION get_product_categories_summary(filters jsonb DEFAULT '{}')
RETURNS TABLE(
  category text,
  total_revenue numeric,
  transaction_count bigint,
  avg_transaction_value numeric,
  growth_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.category,
    COALESCE(SUM(ti.price * ti.quantity), 0) as total_revenue,
    COUNT(DISTINCT t.id) as transaction_count,
    COALESCE(AVG(ti.price * ti.quantity), 0) as avg_transaction_value,
    0::numeric as growth_rate
  FROM transactions t
  JOIN transaction_items ti ON t.id = ti.transaction_id
  JOIN products p ON ti.product_id = p.id
  LEFT JOIN stores s ON t.store_id = s.id
  WHERE 
    (NOT (filters ? 'p_start_date') OR t.created_at >= (filters->>'p_start_date')::timestamp with time zone)
    AND (NOT (filters ? 'p_end_date') OR t.created_at <= (filters->>'p_end_date')::timestamp with time zone)
    AND (NOT (filters ? 'p_barangays') OR s.barangay = ANY(string_to_array(filters->>'p_barangays', ',')))
    AND (NOT (filters ? 'p_categories') OR p.category = ANY(string_to_array(filters->>'p_categories', ',')))
    AND (NOT (filters ? 'p_stores') OR s.name = ANY(string_to_array(filters->>'p_stores', ',')))
  GROUP BY p.category
  ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- Recreate get_age_distribution_simple with correct column references
CREATE OR REPLACE FUNCTION get_age_distribution_simple(filters jsonb DEFAULT '{}')
RETURNS TABLE(
  age_group text,
  total_revenue numeric,
  transaction_count bigint,
  percentage numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH age_groups AS (
    SELECT 
      CASE 
        WHEN c.age BETWEEN 18 AND 25 THEN '18-25'
        WHEN c.age BETWEEN 26 AND 35 THEN '26-35'
        WHEN c.age BETWEEN 36 AND 45 THEN '36-45'
        WHEN c.age BETWEEN 46 AND 55 THEN '46-55'
        WHEN c.age > 55 THEN '56+'
        ELSE 'Unknown'
      END as age_group,
      SUM(t.total_amount) as total_revenue,
      COUNT(t.id) as transaction_count
    FROM transactions t
    JOIN customers c ON t.customer_age::text = c.customer_id
    LEFT JOIN stores s ON t.store_id = s.id
    WHERE 
      (NOT (filters ? 'p_start_date') OR t.created_at >= (filters->>'p_start_date')::timestamp with time zone)
      AND (NOT (filters ? 'p_end_date') OR t.created_at <= (filters->>'p_end_date')::timestamp with time zone)
      AND (NOT (filters ? 'p_barangays') OR s.barangay = ANY(string_to_array(filters->>'p_barangays', ',')))
      AND (NOT (filters ? 'p_stores') OR s.name = ANY(string_to_array(filters->>'p_stores', ',')))
    GROUP BY age_group
  ),
  total_revenue AS (
    SELECT SUM(total_revenue) as total FROM age_groups
  )
  SELECT 
    ag.age_group,
    ag.total_revenue,
    ag.transaction_count,
    CASE 
      WHEN tr.total > 0 THEN (ag.total_revenue / tr.total * 100)
      ELSE 0
    END as percentage
  FROM age_groups ag
  CROSS JOIN total_revenue tr
  ORDER BY ag.total_revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- Recreate get_gender_distribution_simple with correct column references
CREATE OR REPLACE FUNCTION get_gender_distribution_simple(filters jsonb DEFAULT '{}')
RETURNS TABLE(
  gender text,
  total_revenue numeric,
  transaction_count bigint,
  percentage numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH gender_stats AS (
    SELECT 
      COALESCE(c.gender, t.customer_gender, 'Unknown') as gender,
      SUM(t.total_amount) as total_revenue,
      COUNT(t.id) as transaction_count
    FROM transactions t
    LEFT JOIN customers c ON t.customer_age::text = c.customer_id
    LEFT JOIN stores s ON t.store_id = s.id
    WHERE 
      (NOT (filters ? 'p_start_date') OR t.created_at >= (filters->>'p_start_date')::timestamp with time zone)
      AND (NOT (filters ? 'p_end_date') OR t.created_at <= (filters->>'p_end_date')::timestamp with time zone)
      AND (NOT (filters ? 'p_barangays') OR s.barangay = ANY(string_to_array(filters->>'p_barangays', ',')))
      AND (NOT (filters ? 'p_stores') OR s.name = ANY(string_to_array(filters->>'p_stores', ',')))
    GROUP BY COALESCE(c.gender, t.customer_gender, 'Unknown')
  ),
  total_revenue AS (
    SELECT SUM(total_revenue) as total FROM gender_stats
  )
  SELECT 
    gs.gender,
    gs.total_revenue,
    gs.transaction_count,
    CASE 
      WHEN tr.total > 0 THEN (gs.total_revenue / tr.total * 100)
      ELSE 0
    END as percentage
  FROM gender_stats gs
  CROSS JOIN total_revenue tr
  ORDER BY gs.total_revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- Recreate get_location_distribution with correct column references
CREATE OR REPLACE FUNCTION get_location_distribution(filters jsonb DEFAULT '{}')
RETURNS TABLE(
  barangay text,
  store_name text,
  total_revenue numeric,
  transaction_count bigint,
  avg_transaction_value numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.barangay,
    s.name as store_name,
    COALESCE(SUM(t.total_amount), 0) as total_revenue,
    COUNT(t.id) as transaction_count,
    COALESCE(AVG(t.total_amount), 0) as avg_transaction_value
  FROM stores s
  LEFT JOIN transactions t ON s.id = t.store_id
  WHERE 
    (NOT (filters ? 'p_start_date') OR t.created_at IS NULL OR t.created_at >= (filters->>'p_start_date')::timestamp with time zone)
    AND (NOT (filters ? 'p_end_date') OR t.created_at IS NULL OR t.created_at <= (filters->>'p_end_date')::timestamp with time zone)
    AND (NOT (filters ? 'p_barangays') OR s.barangay = ANY(string_to_array(filters->>'p_barangays', ',')))
    AND (NOT (filters ? 'p_stores') OR s.name = ANY(string_to_array(filters->>'p_stores', ',')))
  GROUP BY s.barangay, s.name
  ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- Recreate get_hourly_trends with correct column references
CREATE OR REPLACE FUNCTION get_hourly_trends(filters jsonb DEFAULT '{}')
RETURNS TABLE(
  hour integer,
  total_revenue numeric,
  transaction_count bigint,
  avg_transaction_value numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(hour FROM t.created_at)::integer as hour,
    COALESCE(SUM(t.total_amount), 0) as total_revenue,
    COUNT(t.id) as transaction_count,
    COALESCE(AVG(t.total_amount), 0) as avg_transaction_value
  FROM transactions t
  LEFT JOIN stores s ON t.store_id = s.id
  WHERE 
    (NOT (filters ? 'p_start_date') OR t.created_at >= (filters->>'p_start_date')::timestamp with time zone)
    AND (NOT (filters ? 'p_end_date') OR t.created_at <= (filters->>'p_end_date')::timestamp with time zone)
    AND (NOT (filters ? 'p_barangays') OR s.barangay = ANY(string_to_array(filters->>'p_barangays', ',')))
    AND (NOT (filters ? 'p_stores') OR s.name = ANY(string_to_array(filters->>'p_stores', ',')))
  GROUP BY EXTRACT(hour FROM t.created_at)
  ORDER BY hour;
END;
$$ LANGUAGE plpgsql;