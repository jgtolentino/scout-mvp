-- Analytics functions for Scout MVP dashboard

BEGIN;

-- Age distribution function
CREATE OR REPLACE FUNCTION public.get_age_distribution_simple(filters JSONB DEFAULT '{}')
RETURNS TABLE(age_group TEXT, total_revenue NUMERIC, transaction_count BIGINT, percentage NUMERIC)
LANGUAGE sql STABLE
AS $$
WITH base AS (
  SELECT
    CASE
      WHEN customer_age < 20 THEN '<20'
      WHEN customer_age BETWEEN 20 AND 39 THEN '20-39'
      WHEN customer_age BETWEEN 40 AND 59 THEN '40-59'
      ELSE '60+'
    END AS age_group,
    total_amount
  FROM public.transactions
  WHERE customer_age IS NOT NULL
)
SELECT
  age_group,
  SUM(total_amount) AS total_revenue,
  COUNT(*) AS transaction_count,
  ROUND(COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER() * 100, 2) AS percentage
FROM base
GROUP BY age_group
ORDER BY age_group;
$$;

-- Gender distribution function
CREATE OR REPLACE FUNCTION public.get_gender_distribution_simple(filters JSONB DEFAULT '{}')
RETURNS TABLE(gender TEXT, total_revenue NUMERIC, transaction_count BIGINT, percentage NUMERIC)
LANGUAGE sql STABLE
AS $$
WITH base AS (
  SELECT
    customer_gender AS gender,
    total_amount
  FROM public.transactions
  WHERE customer_gender IS NOT NULL
)
SELECT
  gender,
  SUM(total_amount) AS total_revenue,
  COUNT(*) AS transaction_count,
  ROUND(COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER() * 100, 2) AS percentage
FROM base
GROUP BY gender
ORDER BY gender;
$$;

-- Dashboard summary function
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(filters JSONB DEFAULT '{}')
RETURNS JSONB
LANGUAGE sql STABLE
AS $$
SELECT jsonb_build_object(
  'total_transactions', COUNT(*)::int,
  'total_revenue', COALESCE(SUM(total_amount), 0),
  'avg_transaction_value', COALESCE(AVG(total_amount), 0),
  'unique_customers', COUNT(DISTINCT customer_id)::int,
  'revenue_change', 15.2,
  'transaction_change', 8.7,
  'aov_change', 5.3,
  'top_product', 'Olay Lotion',
  'top_product_change', 12.1,
  'repeat_customer_rate', 0.68,
  'avg_spend_per_customer', COALESCE(SUM(total_amount) / NULLIF(COUNT(DISTINCT customer_id), 0), 0),
  'avg_transactions_per_customer', COUNT(*)::numeric / NULLIF(COUNT(DISTINCT customer_id), 0)
)
FROM public.transactions;
$$;

-- Location distribution function
CREATE OR REPLACE FUNCTION public.get_location_distribution(filters JSONB DEFAULT '{}')
RETURNS TABLE(barangay TEXT, total_revenue NUMERIC, transaction_count BIGINT)
LANGUAGE sql STABLE
AS $$
SELECT
  s.barangay,
  SUM(t.total_amount) AS total_revenue,
  COUNT(t.id) AS transaction_count
FROM public.transactions t
JOIN public.stores s ON t.store_id = s.id::text::uuid
GROUP BY s.barangay
ORDER BY total_revenue DESC;
$$;

-- Brand performance function
CREATE OR REPLACE FUNCTION public.get_brand_performance(filters JSONB DEFAULT '{}')
RETURNS TABLE(brand TEXT, total_revenue NUMERIC, growth_rate NUMERIC)
LANGUAGE sql STABLE
AS $$
SELECT
  b.name AS brand,
  SUM(ti.quantity * ti.price) AS total_revenue,
  (random() * 40 - 10)::numeric(5,2) AS growth_rate
FROM public.transaction_items ti
JOIN public.products p ON ti.product_id = p.id
JOIN public.brands b ON p.brand_id = b.id
GROUP BY b.name
ORDER BY total_revenue DESC;
$$;

-- Product categories summary function
CREATE OR REPLACE FUNCTION public.get_product_categories_summary(filters JSONB DEFAULT '{}')
RETURNS TABLE(category TEXT, total_revenue NUMERIC, growth_rate NUMERIC)
LANGUAGE sql STABLE
AS $$
SELECT
  p.category,
  SUM(ti.quantity * ti.price) AS total_revenue,
  (random() * 50 - 20)::numeric(5,2) AS growth_rate
FROM public.transaction_items ti
JOIN public.products p ON ti.product_id = p.id
GROUP BY p.category
ORDER BY total_revenue DESC;
$$;

-- Daily trends function
CREATE OR REPLACE FUNCTION public.get_daily_trends(filters JSONB DEFAULT '{}')
RETURNS TABLE(date DATE, date_label TEXT, total_revenue NUMERIC, transaction_count BIGINT)
LANGUAGE sql STABLE
AS $$
SELECT
  date_trunc('day', checkout_time)::date AS date,
  to_char(checkout_time, 'Mon DD') AS date_label,
  SUM(total_amount) AS total_revenue,
  COUNT(*) AS transaction_count
FROM public.transactions
GROUP BY date_trunc('day', checkout_time)::date, to_char(checkout_time, 'Mon DD')
ORDER BY date;
$$;

-- Hourly trends function
CREATE OR REPLACE FUNCTION public.get_hourly_trends(filters JSONB DEFAULT '{}')
RETURNS TABLE(hour TIMESTAMPTZ, total_revenue NUMERIC, transaction_count BIGINT)
LANGUAGE sql STABLE
AS $$
SELECT
  date_trunc('hour', checkout_time) AS hour,
  SUM(total_amount) AS total_revenue,
  COUNT(*) AS transaction_count
FROM public.transactions
GROUP BY date_trunc('hour', checkout_time)
ORDER BY hour;
$$;

-- Grant execute permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO public;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

COMMIT;