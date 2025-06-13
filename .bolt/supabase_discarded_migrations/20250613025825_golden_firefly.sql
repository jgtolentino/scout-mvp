/*
  # Align Database Schema with Application

  This migration aligns the existing database schema with what the application expects.
  
  ## Changes Made:
  1. Update transactions table to match expected columns
  2. Update customers table to match expected structure  
  3. Update products table to match expected structure
  4. Update transaction_items table to match expected structure
  5. Add missing indexes for performance
  6. Update RLS policies

  ## Key Alignments:
  - Ensure transaction_date column exists (currently using checkout_time)
  - Ensure customer demographics are properly structured
  - Ensure product categories and brands are properly linked
  - Ensure transaction_items has unit_price and total_price columns
*/

-- First, let's add missing columns to transactions table if they don't exist
DO $$
BEGIN
  -- Add transaction_date column if it doesn't exist (map from checkout_time)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'transaction_date'
  ) THEN
    ALTER TABLE transactions ADD COLUMN transaction_date timestamptz DEFAULT now();
    -- Copy checkout_time to transaction_date for existing records
    UPDATE transactions SET transaction_date = checkout_time WHERE checkout_time IS NOT NULL;
  END IF;

  -- Ensure customer_id column exists in transactions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN customer_id integer;
  END IF;
END $$;

-- Update customers table to match expected structure
DO $$
BEGIN
  -- Add age_group column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'age_group'
  ) THEN
    ALTER TABLE customers ADD COLUMN age_group text;
    -- Populate age_group based on age
    UPDATE customers SET age_group = 
      CASE 
        WHEN age BETWEEN 18 AND 25 THEN '18-25'
        WHEN age BETWEEN 26 AND 35 THEN '26-35'
        WHEN age BETWEEN 36 AND 45 THEN '36-45'
        WHEN age BETWEEN 46 AND 55 THEN '46-55'
        WHEN age > 55 THEN '56+'
        ELSE '18-25'
      END;
  END IF;

  -- Add income_bracket column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'income_bracket'
  ) THEN
    ALTER TABLE customers ADD COLUMN income_bracket text DEFAULT 'Medium';
  END IF;
END $$;

-- Update transaction_items table to match expected structure
DO $$
BEGIN
  -- Add unit_price column if it doesn't exist (map from price)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transaction_items' AND column_name = 'unit_price'
  ) THEN
    ALTER TABLE transaction_items ADD COLUMN unit_price numeric(10,2);
    -- Copy price to unit_price for existing records
    UPDATE transaction_items SET unit_price = price WHERE price IS NOT NULL;
  END IF;

  -- Add total_price column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transaction_items' AND column_name = 'total_price'
  ) THEN
    ALTER TABLE transaction_items ADD COLUMN total_price numeric(10,2);
    -- Calculate total_price for existing records
    UPDATE transaction_items SET total_price = quantity * COALESCE(unit_price, price, 0);
  END IF;
END $$;

-- Update products table to ensure brand relationship
DO $$
BEGIN
  -- Add unit_price column to products if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'unit_price'
  ) THEN
    ALTER TABLE products ADD COLUMN unit_price numeric(10,2) DEFAULT 0;
  END IF;
END $$;

-- Update stores table to match expected structure
DO $$
BEGIN
  -- Ensure barangay column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' AND column_name = 'barangay'
  ) THEN
    ALTER TABLE stores ADD COLUMN barangay text;
    -- If location exists, try to extract barangay from it
    UPDATE stores SET barangay = COALESCE(barangay, location, 'Poblacion');
  END IF;

  -- Ensure city column has default
  UPDATE stores SET city = COALESCE(city, 'Makati') WHERE city IS NULL;
  
  -- Ensure region column has default
  UPDATE stores SET region = COALESCE(region, 'NCR') WHERE region IS NULL;
END $$;

-- Add constraints and checks
DO $$
BEGIN
  -- Add age_group constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'customers_age_group_check'
  ) THEN
    ALTER TABLE customers ADD CONSTRAINT customers_age_group_check 
    CHECK (age_group = ANY (ARRAY['18-25'::text, '26-35'::text, '36-45'::text, '46-55'::text, '56+'::text]));
  END IF;

  -- Add income_bracket constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'customers_income_bracket_check'
  ) THEN
    ALTER TABLE customers ADD CONSTRAINT customers_income_bracket_check 
    CHECK (income_bracket = ANY (ARRAY['Low'::text, 'Medium'::text, 'High'::text]));
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_age ON transactions(customer_age);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_gender ON transactions(customer_gender);
CREATE INDEX IF NOT EXISTS idx_transactions_store_id ON transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_customers_age_group ON customers(age_group);
CREATE INDEX IF NOT EXISTS idx_customers_gender ON customers(gender);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_stores_barangay ON stores(barangay);

-- Enable RLS on all tables if not already enabled
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
DO $$
BEGIN
  -- Brands policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'brands' AND policyname = 'Allow public read access to brands') THEN
    CREATE POLICY "Allow public read access to brands" ON brands FOR SELECT TO public USING (true);
  END IF;

  -- Products policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Allow public read access to products') THEN
    CREATE POLICY "Allow public read access to products" ON products FOR SELECT TO public USING (true);
  END IF;

  -- Stores policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stores' AND policyname = 'Allow public read access to stores') THEN
    CREATE POLICY "Allow public read access to stores" ON stores FOR SELECT TO public USING (true);
  END IF;

  -- Customers policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Allow public read access to customers') THEN
    CREATE POLICY "Allow public read access to customers" ON customers FOR SELECT TO public USING (true);
  END IF;

  -- Transactions policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Allow public read access to transactions') THEN
    CREATE POLICY "Allow public read access to transactions" ON transactions FOR SELECT TO public USING (true);
  END IF;

  -- Transaction items policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transaction_items' AND policyname = 'Allow public read access to transaction_items') THEN
    CREATE POLICY "Allow public read access to transaction_items" ON transaction_items FOR SELECT TO public USING (true);
  END IF;
END $$;