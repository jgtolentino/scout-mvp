/*
  # Fix Analytics Functions Column References

  1. Functions Updated
    - `get_age_distribution_simple` - Fix customer_age to age_group
    - `get_gender_distribution_simple` - Fix customer_gender to gender
    - `get_hourly_trends` - Fix checkout_time to transaction_date
    - `get_product_categories_summary` - Fix checkout_time to transaction_date

  2. Changes Made
    - Updated column references to match actual database schema
    - Fixed JOIN conditions and SELECT statements
    - Maintained existing function signatures and return types

  3. Security
    - Functions maintain existing security context
    - No changes to RLS policies needed
*/

-- Drop existing functions first
DROP FUNCTION IF EXISTS get_age_distribution_simple();
DROP FUNCTION IF EXISTS get_gender_distribution_simple();
DROP FUNCTION IF EXISTS get_hourly_trends();
DROP FUNCTION IF EXISTS get_product_categories_summary();

-- Recreate get_age_distribution_simple with correct column reference
CREATE OR REPLACE FUNCTION get_age_distribution_simple()
RETURNS TABLE(age_group text, count bigint)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    c.age_group,
    COUNT(*)::bigint as count
  FROM transactions t
  JOIN customers c ON t.customer_id = c.id
  GROUP BY c.age_group
  ORDER BY c.age_group;
$$;

-- Recreate get_gender_distribution_simple with correct column reference
CREATE OR REPLACE FUNCTION get_gender_distribution_simple()
RETURNS TABLE(gender text, count bigint)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    c.gender,
    COUNT(*)::bigint as count
  FROM transactions t
  JOIN customers c ON t.customer_id = c.id
  GROUP BY c.gender
  ORDER BY c.gender;
$$;

-- Recreate get_hourly_trends with correct column reference
CREATE OR REPLACE FUNCTION get_hourly_trends()
RETURNS TABLE(hour integer, transaction_count bigint, total_amount numeric)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    EXTRACT(HOUR FROM t.transaction_date)::integer as hour,
    COUNT(*)::bigint as transaction_count,
    SUM(t.total_amount) as total_amount
  FROM transactions t
  WHERE t.transaction_date IS NOT NULL
  GROUP BY EXTRACT(HOUR FROM t.transaction_date)
  ORDER BY hour;
$$;

-- Recreate get_product_categories_summary with correct column reference
CREATE OR REPLACE FUNCTION get_product_categories_summary()
RETURNS TABLE(category text, total_sales numeric, transaction_count bigint)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.category,
    SUM(ti.total_price) as total_sales,
    COUNT(DISTINCT t.id)::bigint as transaction_count
  FROM transactions t
  JOIN transaction_items ti ON t.id = ti.transaction_id
  JOIN products p ON ti.product_id = p.id
  WHERE t.transaction_date IS NOT NULL
  GROUP BY p.category
  ORDER BY total_sales DESC;
$$;