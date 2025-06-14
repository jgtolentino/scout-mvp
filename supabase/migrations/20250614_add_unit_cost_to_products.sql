-- Migration: Add unit_cost column to products table
-- Date: 2025-06-14
-- Description: Add unit_cost column to support gross margin calculations

-- Add unit_cost column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(10,2) DEFAULT 0.00;

-- Add comment for documentation
COMMENT ON COLUMN products.unit_cost IS 'Cost per unit for gross margin calculations';

-- Update existing products with sample unit costs (20-80% of typical retail prices)
UPDATE products 
SET unit_cost = CASE 
  WHEN category = 'Electronics' THEN ROUND(RANDOM() * 15000 + 5000, 2)  -- ₱5,000 - ₱20,000
  WHEN category = 'Clothing' THEN ROUND(RANDOM() * 800 + 200, 2)       -- ₱200 - ₱1,000
  WHEN category = 'Food' THEN ROUND(RANDOM() * 150 + 50, 2)            -- ₱50 - ₱200
  WHEN category = 'Books' THEN ROUND(RANDOM() * 300 + 100, 2)          -- ₱100 - ₱400
  WHEN category = 'Home & Garden' THEN ROUND(RANDOM() * 1200 + 300, 2) -- ₱300 - ₱1,500
  WHEN category = 'Sports' THEN ROUND(RANDOM() * 2000 + 500, 2)        -- ₱500 - ₱2,500
  WHEN category = 'Beauty' THEN ROUND(RANDOM() * 400 + 100, 2)         -- ₱100 - ₱500
  WHEN category = 'Toys' THEN ROUND(RANDOM() * 600 + 200, 2)           -- ₱200 - ₱800
  WHEN category = 'Automotive' THEN ROUND(RANDOM() * 5000 + 1000, 2)   -- ₱1,000 - ₱6,000
  WHEN category = 'Health' THEN ROUND(RANDOM() * 300 + 50, 2)          -- ₱50 - ₱350
  ELSE ROUND(RANDOM() * 500 + 100, 2)                                  -- Default: ₱100 - ₱600
END
WHERE unit_cost = 0.00 OR unit_cost IS NULL;

-- Create index on unit_cost for performance
CREATE INDEX IF NOT EXISTS idx_products_unit_cost ON products(unit_cost);

-- Create trigger function to set default unit_cost for new products
CREATE OR REPLACE FUNCTION products_unit_cost_default()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set unit_cost if it's null or 0
  IF NEW.unit_cost IS NULL OR NEW.unit_cost = 0 THEN
    NEW.unit_cost = CASE 
      WHEN NEW.category = 'Electronics' THEN ROUND((RANDOM() * 15000 + 5000)::numeric, 2)
      WHEN NEW.category = 'Clothing' THEN ROUND((RANDOM() * 800 + 200)::numeric, 2)
      WHEN NEW.category = 'Food' THEN ROUND((RANDOM() * 150 + 50)::numeric, 2)
      WHEN NEW.category = 'Books' THEN ROUND((RANDOM() * 300 + 100)::numeric, 2)
      WHEN NEW.category = 'Home & Garden' THEN ROUND((RANDOM() * 1200 + 300)::numeric, 2)
      WHEN NEW.category = 'Sports' THEN ROUND((RANDOM() * 2000 + 500)::numeric, 2)
      WHEN NEW.category = 'Beauty' THEN ROUND((RANDOM() * 400 + 100)::numeric, 2)
      WHEN NEW.category = 'Toys' THEN ROUND((RANDOM() * 600 + 200)::numeric, 2)
      WHEN NEW.category = 'Automotive' THEN ROUND((RANDOM() * 5000 + 1000)::numeric, 2)
      WHEN NEW.category = 'Health' THEN ROUND((RANDOM() * 300 + 50)::numeric, 2)
      ELSE ROUND((RANDOM() * 500 + 100)::numeric, 2)
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set unit_cost on INSERT
DROP TRIGGER IF EXISTS trigger_products_unit_cost_default ON products;
CREATE TRIGGER trigger_products_unit_cost_default
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION products_unit_cost_default();

-- Verify the migration
SELECT 
  category,
  COUNT(*) as product_count,
  MIN(unit_cost) as min_cost,
  MAX(unit_cost) as max_cost,
  AVG(unit_cost) as avg_cost
FROM products 
GROUP BY category
ORDER BY category;