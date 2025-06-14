-- Create dashboard snapshot function for CI
-- This function returns the current KPI values for the snapshot

CREATE OR REPLACE FUNCTION public.dashboard_snapshot()
RETURNS TABLE(
  total_revenue      numeric,
  txn_cnt            int,
  avg_order_value    numeric,
  units_sold         int,
  unique_customers   int,
  gm_pct             numeric
) 
LANGUAGE sql 
STABLE 
AS $$
  WITH base AS (
    SELECT
      SUM(total_amount)                        AS total_revenue,
      COUNT(*)                                 AS txn_cnt,
      AVG(total_amount)                        AS avg_order_value
    FROM transactions_fmcg
  ),
  items AS (
    SELECT SUM(quantity) AS units_sold
    FROM transaction_items ti
    JOIN transactions_fmcg t ON t.id = ti.transaction_id
  ),
  cust AS (
    SELECT COUNT(DISTINCT customer_id) AS unique_customers
    FROM transactions_fmcg
  ),
  gm AS (
    SELECT
      SUM((ti.unit_price - COALESCE(p.unit_cost,0))*ti.quantity) /
      NULLIF(SUM(t.total_amount),0) * 100 AS gm_pct
    FROM transaction_items ti
    JOIN products p ON p.id = ti.product_id
    JOIN transactions_fmcg t ON t.id = ti.transaction_id
  )
  SELECT 
    base.total_revenue,
    base.txn_cnt,
    base.avg_order_value,
    items.units_sold,
    cust.unique_customers,
    gm.gm_pct
  FROM base, items, cust, gm;
$$;