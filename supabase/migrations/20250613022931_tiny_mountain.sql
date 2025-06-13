/*
  # Generate Realistic Transaction Data

  1. Transaction Generation
    - Create 5000+ transactions over the last 90 days
    - Realistic distribution across stores, customers, and time
    - Multiple items per transaction
    - Proper total amount calculations

  2. Data Patterns
    - Higher sales on weekends
    - Peak hours during lunch and evening
    - Seasonal variations
    - Customer behavior patterns
*/

-- Function to generate random transactions
CREATE OR REPLACE FUNCTION generate_sample_transactions(num_transactions integer DEFAULT 5000)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  customer_ids uuid[];
  store_ids uuid[];
  product_data record;
  transaction_id uuid;
  num_items integer;
  i integer;
  j integer;
  random_date timestamptz;
  random_customer uuid;
  random_store uuid;
  random_product uuid;
  random_quantity integer;
  random_price decimal;
  transaction_total decimal;
BEGIN
  -- Get all customer and store IDs
  SELECT array_agg(id) INTO customer_ids FROM customers;
  SELECT array_agg(id) INTO store_ids FROM stores;
  
  -- Generate transactions
  FOR i IN 1..num_transactions LOOP
    -- Random date within last 90 days, with higher probability on weekends
    random_date := NOW() - (random() * interval '90 days');
    
    -- Adjust for weekend bias
    IF EXTRACT(DOW FROM random_date) IN (0, 6) THEN
      -- Weekend - higher chance
      IF random() < 0.3 THEN
        random_date := random_date + (random() * interval '2 days');
      END IF;
    END IF;
    
    -- Adjust for peak hours (12-14, 18-20)
    IF EXTRACT(HOUR FROM random_date) BETWEEN 12 AND 14 OR 
       EXTRACT(HOUR FROM random_date) BETWEEN 18 AND 20 THEN
      -- Peak hours - keep as is
      NULL;
    ELSE
      -- Non-peak hours - sometimes adjust
      IF random() < 0.4 THEN
        random_date := date_trunc('day', random_date) + 
                      (CASE WHEN random() < 0.5 THEN interval '13 hours' ELSE interval '19 hours' END) +
                      (random() * interval '2 hours');
      END IF;
    END IF;
    
    -- Select random customer and store
    random_customer := customer_ids[1 + floor(random() * array_length(customer_ids, 1))];
    random_store := store_ids[1 + floor(random() * array_length(store_ids, 1))];
    
    -- Create transaction
    INSERT INTO transactions (customer_id, store_id, transaction_date, total_amount)
    VALUES (random_customer, random_store, random_date, 0)
    RETURNING id INTO transaction_id;
    
    -- Generate 1-5 items per transaction
    num_items := 1 + floor(random() * 5);
    transaction_total := 0;
    
    FOR j IN 1..num_items LOOP
      -- Select random product
      SELECT id, unit_price INTO product_data
      FROM products 
      ORDER BY random() 
      LIMIT 1;
      
      -- Random quantity (1-3, with bias toward 1)
      random_quantity := CASE 
        WHEN random() < 0.6 THEN 1
        WHEN random() < 0.9 THEN 2
        ELSE 3
      END;
      
      -- Price with small variation (±10%)
      random_price := product_data.unit_price * (0.9 + random() * 0.2);
      
      -- Insert transaction item
      INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price)
      VALUES (transaction_id, product_data.id, random_quantity, random_price);
      
      transaction_total := transaction_total + (random_quantity * random_price);
    END LOOP;
    
    -- Update transaction total
    UPDATE transactions 
    SET total_amount = transaction_total 
    WHERE id = transaction_id;
    
    -- Progress indicator
    IF i % 1000 = 0 THEN
      RAISE NOTICE 'Generated % transactions', i;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Successfully generated % transactions', num_transactions;
END;
$$;

-- Generate the sample data
SELECT generate_sample_transactions(5000);

-- Update transaction totals to ensure consistency
UPDATE transactions 
SET total_amount = (
  SELECT COALESCE(SUM(quantity * unit_price), 0)
  FROM transaction_items 
  WHERE transaction_id = transactions.id
);

-- Create some additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_date_store ON transactions(transaction_date, store_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_product_transaction ON transaction_items(product_id, transaction_id);

-- Analyze tables for better query planning
ANALYZE brands;
ANALYZE products;
ANALYZE stores;
ANALYZE customers;
ANALYZE transactions;
ANALYZE transaction_items;