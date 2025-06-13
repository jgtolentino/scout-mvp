-- Initial schema for Scout MVP
-- This creates all tables, functions, and policies

BEGIN;

-- Create core tables
CREATE TABLE IF NOT EXISTS public.brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  category VARCHAR,
  alias TEXT,
  is_tbwa BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  brand_id INTEGER REFERENCES public.brands(id),
  category VARCHAR,
  unit_price NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stores (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  location TEXT,
  barangay TEXT,
  city TEXT,
  region TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id SERIAL PRIMARY KEY,
  age INTEGER,
  age_group TEXT,
  gender TEXT,
  income_bracket TEXT DEFAULT 'Medium',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id SERIAL PRIMARY KEY,
  customer_id UUID,
  store_id UUID,
  total_amount NUMERIC DEFAULT 0,
  transaction_date TIMESTAMPTZ DEFAULT now(),
  checkout_time TIMESTAMPTZ DEFAULT now(),
  customer_age INTEGER,
  customer_gender TEXT,
  device_id TEXT,
  request_type VARCHAR DEFAULT 'branded',
  suggestion_accepted BOOLEAN DEFAULT false,
  is_weekend BOOLEAN,
  nlp_processed BOOLEAN DEFAULT false,
  nlp_processed_at TIMESTAMPTZ,
  nlp_confidence_score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transaction_items (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER REFERENCES public.transactions(id),
  product_id INTEGER REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  unit_price NUMERIC(10,2),
  total_price NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_customer_age ON public.transactions(customer_age);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_gender ON public.transactions(customer_gender);
CREATE INDEX IF NOT EXISTS idx_transactions_checkout_time ON public.transactions(checkout_time);
CREATE INDEX IF NOT EXISTS idx_transactions_store_id ON public.transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_stores_barangay ON public.stores(barangay);

-- Enable Row Level Security
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Public read access" ON public.brands FOR SELECT TO public USING (true);
CREATE POLICY "Public read access" ON public.products FOR SELECT TO public USING (true);
CREATE POLICY "Public read access" ON public.stores FOR SELECT TO public USING (true);
CREATE POLICY "Public read access" ON public.customers FOR SELECT TO public USING (true);
CREATE POLICY "Public read access" ON public.transactions FOR SELECT TO public USING (true);
CREATE POLICY "Public read access" ON public.transaction_items FOR SELECT TO public USING (true);

-- Create admin policies for service role
CREATE POLICY "Service role full access" ON public.brands FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.products FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.stores FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.customers FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.transactions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.transaction_items FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMIT;