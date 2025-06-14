-- Fix FMCG view to allow proper joins with transaction_items
-- This version keeps transactions that have at least one FMCG item

DROP VIEW IF EXISTS transactions_fmcg CASCADE;

CREATE VIEW transactions_fmcg AS
SELECT DISTINCT t.*
FROM   transactions      t
JOIN   transaction_items ti ON ti.transaction_id = t.id
JOIN   products          p  ON p.id             = ti.product_id
WHERE  p.is_fmcg;