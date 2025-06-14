-- Add payment method view to fix payment aggregates
-- This view joins payments with FMCG transactions

DROP VIEW IF EXISTS payments_fmcg CASCADE;

CREATE VIEW payments_fmcg AS
SELECT pay.*
FROM   payments          pay
JOIN   transactions_fmcg t ON t.id = pay.transaction_id;

-- Ensure an index exists for performance
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments (method);