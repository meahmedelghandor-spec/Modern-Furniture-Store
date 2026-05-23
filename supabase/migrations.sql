-- =====================================================
-- Add missing columns to orders table
-- Run this in Supabase SQL Editor if not already present
-- =====================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_address TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Also ensure created_at exists
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Update RLS policies (run if not done yet)
-- Allow authenticated users to INSERT orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can insert orders'
  ) THEN
    CREATE POLICY "Users can insert orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Allow authenticated users to INSERT order_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Users can insert order items'
  ) THEN
    CREATE POLICY "Users can insert order items" ON order_items FOR INSERT
    WITH CHECK (
      EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
    );
  END IF;
END $$;

-- Allow users to read their own orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can read own orders'
  ) THEN
    CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Allow users to read their order items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Users can read own order items'
  ) THEN
    CREATE POLICY "Users can read own order items" ON order_items FOR SELECT
    USING (
      EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
    );
  END IF;
END $$;

-- Allow users to read/write their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can manage own profile'
  ) THEN
    CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Public read on products and categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Public read products'
  ) THEN
    CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Public read categories'
  ) THEN
    CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
  END IF;
END $$;
