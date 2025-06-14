-- ************************************************************
--  Flag FMCG / sari-sari-friendly products and expose a
--  clean view (transactions_fmcg) for the dashboard.
-- ************************************************************

-- 1. Add boolean flag on products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_fmcg boolean NOT NULL DEFAULT false;

-- 2. Back-fill flag (simple category whitelist)
UPDATE products
   SET is_fmcg = true
 WHERE category IN (
   'Beverages', 'Snacks', 'Personal Care', 'Household',
   'Dairy', 'Canned Goods', 'Condiments', 'Bakery'
 );

-- 3. Optional brand override (if a brand should be kept although its
--    category is "Other", list it here)
UPDATE products
   SET is_fmcg = true
 WHERE brand_id IN (
   SELECT id FROM brands 
   WHERE name IN ('Nestlé', 'San Miguel', 'Monde Nissin')
 );

-- 4. Create view with transactions that ONLY contain FMCG items
DROP VIEW IF EXISTS transactions_fmcg CASCADE;

CREATE VIEW transactions_fmcg AS
SELECT t.*
  FROM transactions t
 WHERE NOT EXISTS (
   SELECT 1
     FROM transaction_items ti
     JOIN products p ON p.id = ti.product_id
    WHERE ti.transaction_id = t.id
      AND p.is_fmcg = false
 );

COMMENT ON VIEW transactions_fmcg IS
  'Transactions where *all* line-items are FMCG / sari-sari-friendly';