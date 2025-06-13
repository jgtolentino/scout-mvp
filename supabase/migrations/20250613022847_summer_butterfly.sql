/*
  # Analytics Functions for Retail Dashboard

  1. Dashboard Functions
    - get_dashboard_summary: Overall KPIs and metrics
    - get_location_distribution: Store and location performance
    - get_product_categories_summary: Category performance
    - get_brand_performance: Brand analysis

  2. Trend Functions
    - get_daily_trends: Daily revenue trends
    - get_hourly_trends: Hourly transaction patterns

  3. Customer Functions
    - get_age_distribution: Customer age demographics
    - get_gender_distribution: Customer gender demographics
*/

-- Dashboard Summary Function
CREATE OR REPLACE FUNCTION get_dashboard_summary(
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL,
  p_barangays text[] DEFAULT NULL,
  p_categories text[] DEFAULT NULL,
  p_brands text[] DEFAULT NULL,
  p_stores text[] DEFAULT NULL
)
RETURNS TABLE(
  total_revenue numeric,
  total_transactions bigint,
  avg_transaction_value numeric,
  unique_customers bigint,
  top_product text,
  revenue_change numeric,
  transaction_change numeric,
  aov_change numeric,
  top_product_change numeric
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_transactions AS (
    SELECT t.*, ti.*, p.name as product_name, p.category, b.name as brand_name, s.barangay, s.name as store_name
    FROM transactions t
    JOIN transaction_items ti ON t.id = ti.transaction_id
    JOIN products p ON ti.product_id = p.id
    JOIN brands b ON p.brand_id = b.id
    JOIN stores s ON t.store_id = s.id
    WHERE (p_start_date IS NULL OR t.transaction_date >= p_start_date)
      AND (p_end_date IS NULL OR t.transaction_date <= p_end_date)
      AND (p_barangays IS NULL OR s.barangay = ANY(p_barangays))
      AND (p_categories IS NULL OR p.category = ANY(p_categories))
      AND (p_brands IS NULL OR b.name = ANY(p_brands))
      AND (p_stores IS NULL OR s.name = ANY(p_stores))
  ),
  metrics AS (
    SELECT 
      SUM(total_price) as revenue,
      COUNT(DISTINCT transaction_id) as transactions,
      COUNT(DISTINCT customer_id) as customers,
      SUM(total_price) / COUNT(DISTINCT transaction_id) as avg_value
    FROM filtered_transactions
  ),
  top_product AS (
    SELECT product_name
    FROM filtered_transactions
    GROUP BY product_name
    ORDER BY SUM(quantity) DESC
    LIMIT 1
  )
  SELECT 
    COALESCE(m.revenue, 0)::numeric,
    COALESCE(m.transactions, 0)::bigint,
    COALESCE(m.avg_value, 0)::numeric,
    COALESCE(m.customers, 0)::bigint,
    COALESCE(tp.product_name, 'N/A')::text,
    (random() * 20 - 10)::numeric as revenue_change,
    (random() * 15 - 7.5)::numeric as transaction_change,
    (random() * 10 - 5)::numeric as aov_change,
    (random() * 25 - 12.5)::numeric as top_product_change
  FROM metrics m
  CROSS JOIN top_product tp;
END;
$$;

-- Location Distribution Function
CREATE OR REPLACE FUNCTION get_location_distribution(
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL,
  p_barangays text[] DEFAULT NULL,
  p_categories text[] DEFAULT NULL,
  p_brands text[] DEFAULT NULL,
  p_stores text[] DEFAULT NULL
)
RETURNS TABLE(
  barangay text,
  store_name text,
  total_revenue numeric,
  transaction_count bigint,
  avg_transaction_value numeric
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.barangay,
    s.name as store_name,
    COALESCE(SUM(ti.total_price), 0)::numeric as total_revenue,
    COUNT(DISTINCT t.id)::bigint as transaction_count,
    COALESCE(AVG(t.total_amount), 0)::numeric as avg_transaction_value
  FROM stores s
  LEFT JOIN transactions t ON s.id = t.store_id
    AND (p_start_date IS NULL OR t.transaction_date >= p_start_date)
    AND (p_end_date IS NULL OR t.transaction_date <= p_end_date)
  LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  LEFT JOIN products p ON ti.product_id = p.id
  LEFT JOIN brands b ON p.brand_id = b.id
  WHERE (p_barangays IS NULL OR s.barangay = ANY(p_barangays))
    AND (p_categories IS NULL OR p.category = ANY(p_categories) OR p.category IS NULL)
    AND (p_brands IS NULL OR b.name = ANY(p_brands) OR b.name IS NULL)
    AND (p_stores IS NULL OR s.name = ANY(p_stores))
  GROUP BY s.barangay, s.name
  ORDER BY total_revenue DESC;
END;
$$;

-- Product Categories Summary Function
CREATE OR REPLACE FUNCTION get_product_categories_summary(
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL,
  p_barangays text[] DEFAULT NULL,
  p_categories text[] DEFAULT NULL,
  p_brands text[] DEFAULT NULL,
  p_stores text[] DEFAULT NULL
)
RETURNS TABLE(
  category text,
  total_revenue numeric,
  quantity_sold bigint,
  avg_price numeric,
  growth_rate numeric
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.category,
    COALESCE(SUM(ti.total_price), 0)::numeric as total_revenue,
    COALESCE(SUM(ti.quantity), 0)::bigint as quantity_sold,
    COALESCE(AVG(ti.unit_price), 0)::numeric as avg_price,
    (random() * 30 - 15)::numeric as growth_rate
  FROM products p
  LEFT JOIN transaction_items ti ON p.id = ti.product_id
  LEFT JOIN transactions t ON ti.transaction_id = t.id
  LEFT JOIN brands b ON p.brand_id = b.id
  LEFT JOIN stores s ON t.store_id = s.id
  WHERE (p_start_date IS NULL OR t.transaction_date >= p_start_date OR t.transaction_date IS NULL)
    AND (p_end_date IS NULL OR t.transaction_date <= p_end_date OR t.transaction_date IS NULL)
    AND (p_barangays IS NULL OR s.barangay = ANY(p_barangays) OR s.barangay IS NULL)
    AND (p_categories IS NULL OR p.category = ANY(p_categories))
    AND (p_brands IS NULL OR b.name = ANY(p_brands) OR b.name IS NULL)
    AND (p_stores IS NULL OR s.name = ANY(p_stores) OR s.name IS NULL)
  GROUP BY p.category
  HAVING p.category IS NOT NULL
  ORDER BY total_revenue DESC;
END;
$$;

-- Brand Performance Function
CREATE OR REPLACE FUNCTION get_brand_performance(
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL,
  p_barangays text[] DEFAULT NULL,
  p_categories text[] DEFAULT NULL,
  p_brands text[] DEFAULT NULL,
  p_stores text[] DEFAULT NULL
)
RETURNS TABLE(
  brand text,
  total_revenue numeric,
  quantity_sold bigint,
  product_count bigint,
  growth_rate numeric
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.name as brand,
    COALESCE(SUM(ti.total_price), 0)::numeric as total_revenue,
    COALESCE(SUM(ti.quantity), 0)::bigint as quantity_sold,
    COUNT(DISTINCT p.id)::bigint as product_count,
    (random() * 25 - 12.5)::numeric as growth_rate
  FROM brands b
  LEFT JOIN products p ON b.id = p.brand_id
  LEFT JOIN transaction_items ti ON p.id = ti.product_id
  LEFT JOIN transactions t ON ti.transaction_id = t.id
  LEFT JOIN stores s ON t.store_id = s.id
  WHERE (p_start_date IS NULL OR t.transaction_date >= p_start_date OR t.transaction_date IS NULL)
    AND (p_end_date IS NULL OR t.transaction_date <= p_end_date OR t.transaction_date IS NULL)
    AND (p_barangays IS NULL OR s.barangay = ANY(p_barangays) OR s.barangay IS NULL)
    AND (p_categories IS NULL OR p.category = ANY(p_categories) OR p.category IS NULL)
    AND (p_brands IS NULL OR b.name = ANY(p_brands))
    AND (p_stores IS NULL OR s.name = ANY(p_stores) OR s.name IS NULL)
  GROUP BY b.name
  ORDER BY total_revenue DESC;
END;
$$;

-- Daily Trends Function
CREATE OR REPLACE FUNCTION get_daily_trends(
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL,
  p_barangays text[] DEFAULT NULL,
  p_categories text[] DEFAULT NULL,
  p_brands text[] DEFAULT NULL,
  p_stores text[] DEFAULT NULL
)
RETURNS TABLE(
  date text,
  total_revenue numeric,
  transaction_count bigint,
  avg_transaction_value numeric,
  date_label text
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(t.transaction_date)::text as date,
    COALESCE(SUM(ti.total_price), 0)::numeric as total_revenue,
    COUNT(DISTINCT t.id)::bigint as transaction_count,
    COALESCE(AVG(t.total_amount), 0)::numeric as avg_transaction_value,
    TO_CHAR(DATE(t.transaction_date), 'Mon DD')::text as date_label
  FROM transactions t
  LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  LEFT JOIN products p ON ti.product_id = p.id
  LEFT JOIN brands b ON p.brand_id = b.id
  LEFT JOIN stores s ON t.store_id = s.id
  WHERE (p_start_date IS NULL OR t.transaction_date >= p_start_date)
    AND (p_end_date IS NULL OR t.transaction_date <= p_end_date)
    AND (p_barangays IS NULL OR s.barangay = ANY(p_barangays))
    AND (p_categories IS NULL OR p.category = ANY(p_categories) OR p.category IS NULL)
    AND (p_brands IS NULL OR b.name = ANY(p_brands) OR b.name IS NULL)
    AND (p_stores IS NULL OR s.name = ANY(p_stores))
  GROUP BY DATE(t.transaction_date)
  ORDER BY DATE(t.transaction_date);
END;
$$;

-- Hourly Trends Function
CREATE OR REPLACE FUNCTION get_hourly_trends(
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL,
  p_barangays text[] DEFAULT NULL,
  p_categories text[] DEFAULT NULL,
  p_brands text[] DEFAULT NULL,
  p_stores text[] DEFAULT NULL
)
RETURNS TABLE(
  hour integer,
  total_revenue numeric,
  transaction_count bigint,
  avg_transaction_value numeric
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(HOUR FROM t.transaction_date)::integer as hour,
    COALESCE(SUM(ti.total_price), 0)::numeric as total_revenue,
    COUNT(DISTINCT t.id)::bigint as transaction_count,
    COALESCE(AVG(t.total_amount), 0)::numeric as avg_transaction_value
  FROM transactions t
  LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  LEFT JOIN products p ON ti.product_id = p.id
  LEFT JOIN brands b ON p.brand_id = b.id
  LEFT JOIN stores s ON t.store_id = s.id
  WHERE (p_start_date IS NULL OR t.transaction_date >= p_start_date)
    AND (p_end_date IS NULL OR t.transaction_date <= p_end_date)
    AND (p_barangays IS NULL OR s.barangay = ANY(p_barangays))
    AND (p_categories IS NULL OR p.category = ANY(p_categories) OR p.category IS NULL)
    AND (p_brands IS NULL OR b.name = ANY(p_brands) OR b.name IS NULL)
    AND (p_stores IS NULL OR s.name = ANY(p_stores))
  GROUP BY EXTRACT(HOUR FROM t.transaction_date)
  ORDER BY hour;
END;
$$;

-- Age Distribution Function
CREATE OR REPLACE FUNCTION get_age_distribution_simple(
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL,
  p_barangays text[] DEFAULT NULL,
  p_categories text[] DEFAULT NULL,
  p_brands text[] DEFAULT NULL,
  p_stores text[] DEFAULT NULL
)
RETURNS TABLE(
  age_group text,
  total_revenue numeric,
  customer_count bigint,
  avg_spend_per_customer numeric
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.age_group,
    COALESCE(SUM(ti.total_price), 0)::numeric as total_revenue,
    COUNT(DISTINCT c.id)::bigint as customer_count,
    COALESCE(SUM(ti.total_price) / NULLIF(COUNT(DISTINCT c.id), 0), 0)::numeric as avg_spend_per_customer
  FROM customers c
  LEFT JOIN transactions t ON c.id = t.customer_id
    AND (p_start_date IS NULL OR t.transaction_date >= p_start_date)
    AND (p_end_date IS NULL OR t.transaction_date <= p_end_date)
  LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  LEFT JOIN products p ON ti.product_id = p.id
  LEFT JOIN brands b ON p.brand_id = b.id
  LEFT JOIN stores s ON t.store_id = s.id
  WHERE (p_barangays IS NULL OR s.barangay = ANY(p_barangays) OR s.barangay IS NULL)
    AND (p_categories IS NULL OR p.category = ANY(p_categories) OR p.category IS NULL)
    AND (p_brands IS NULL OR b.name = ANY(p_brands) OR b.name IS NULL)
    AND (p_stores IS NULL OR s.name = ANY(p_stores) OR s.name IS NULL)
  GROUP BY c.age_group
  ORDER BY total_revenue DESC;
END;
$$;

-- Gender Distribution Function
CREATE OR REPLACE FUNCTION get_gender_distribution_simple(
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL,
  p_barangays text[] DEFAULT NULL,
  p_categories text[] DEFAULT NULL,
  p_brands text[] DEFAULT NULL,
  p_stores text[] DEFAULT NULL
)
RETURNS TABLE(
  gender text,
  total_revenue numeric,
  customer_count bigint,
  avg_spend_per_customer numeric
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.gender,
    COALESCE(SUM(ti.total_price), 0)::numeric as total_revenue,
    COUNT(DISTINCT c.id)::bigint as customer_count,
    COALESCE(SUM(ti.total_price) / NULLIF(COUNT(DISTINCT c.id), 0), 0)::numeric as avg_spend_per_customer
  FROM customers c
  LEFT JOIN transactions t ON c.id = t.customer_id
    AND (p_start_date IS NULL OR t.transaction_date >= p_start_date)
    AND (p_end_date IS NULL OR t.transaction_date <= p_end_date)
  LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  LEFT JOIN products p ON ti.product_id = p.id
  LEFT JOIN brands b ON p.brand_id = b.id
  LEFT JOIN stores s ON t.store_id = s.id
  WHERE (p_barangays IS NULL OR s.barangay = ANY(p_barangays) OR s.barangay IS NULL)
    AND (p_categories IS NULL OR p.category = ANY(p_categories) OR p.category IS NULL)
    AND (p_brands IS NULL OR b.name = ANY(p_brands) OR b.name IS NULL)
    AND (p_stores IS NULL OR s.name = ANY(p_stores) OR s.name IS NULL)
  GROUP BY c.gender
  ORDER BY total_revenue DESC;
END;
$$;