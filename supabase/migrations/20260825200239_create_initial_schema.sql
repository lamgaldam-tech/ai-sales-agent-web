/*
# Create Initial Schema for AI Sales Agent

## Overview
This migration creates the complete database schema for the AI Sales Agent platform — a WhatsApp-based sales automation tool for businesses.

## New Tables

### businesses
- Primary table linking a Supabase auth user to their business profile.
- `id` (uuid, PK) — defaults to auth.uid(), references auth.users(id). One business per user.
- `name`, `phone`, `type`, `country`, `currency`, `language` — business profile fields.
- `plan` — enum: free, basic, pro (defaults to free).

### prompts
- Stores the AI system prompt / instructions for a business.
- `business_id` references businesses(id).

### integrations
- Stores third-party integration credentials (Shopify, YouCan, Google Sheets).
- `type` — enum: shopify, youcan, google_sheets.
- `access_token`, `refresh_token` — sensitive credentials.
- NO RLS policies — only accessible via edge functions using the service role key.

### customers
- Customers belonging to a business, identified by phone number.
- `business_id` references businesses(id).

### messages
- Chat messages between customers and the AI assistant.
- `customer_id` references customers(id).
- `role` — enum: system, assistant, user.

### orders
- Orders placed by customers, with revenue tracking.
- `customer_id` references customers(id).
- `revenue` — numeric, defaults to 0.

## Security

### RLS Enabled on ALL tables
- **businesses**: owner-scoped (id = auth.uid())
- **prompts**: scoped through business_id → businesses
- **integrations**: RLS enabled, NO policies (locked down — only service role can access)
- **customers**: scoped through business_id → businesses
- **messages**: scoped through customer_id → customers → businesses
- **orders**: scoped through customer_id → customers → businesses

All owner-scoped policies use `TO authenticated` with ownership checks via auth.uid().
*/

-- Create enums
DO $$ BEGIN
  CREATE TYPE business_plan AS ENUM ('free', 'basic', 'pro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE integration_type AS ENUM ('shopify', 'youcan', 'google_sheets');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE message_role AS ENUM ('system', 'assistant', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  type text NOT NULL,
  country text NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  language text NOT NULL DEFAULT 'en',
  plan business_plan NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_business" ON businesses;
CREATE POLICY "select_own_business" ON businesses FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_business" ON businesses;
CREATE POLICY "insert_own_business" ON businesses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_business" ON businesses;
CREATE POLICY "update_own_business" ON businesses FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_business" ON businesses;
CREATE POLICY "delete_own_business" ON businesses FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_prompts" ON prompts;
CREATE POLICY "select_own_prompts" ON prompts FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = prompts.business_id AND businesses.id = auth.uid()));

DROP POLICY IF EXISTS "insert_own_prompts" ON prompts;
CREATE POLICY "insert_own_prompts" ON prompts FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = prompts.business_id AND businesses.id = auth.uid()));

DROP POLICY IF EXISTS "update_own_prompts" ON prompts;
CREATE POLICY "update_own_prompts" ON prompts FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = prompts.business_id AND businesses.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = prompts.business_id AND businesses.id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_prompts" ON prompts;
CREATE POLICY "delete_own_prompts" ON prompts FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = prompts.business_id AND businesses.id = auth.uid()));

-- integrations table (NO RLS policies — locked down)
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  type integration_type NOT NULL,
  name text NOT NULL,
  identifier text NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  phone text NOT NULL,
  name text,
  country text,
  city text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_customers" ON customers;
CREATE POLICY "select_own_customers" ON customers FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = customers.business_id AND businesses.id = auth.uid()));

DROP POLICY IF EXISTS "insert_own_customers" ON customers;
CREATE POLICY "insert_own_customers" ON customers FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = customers.business_id AND businesses.id = auth.uid()));

DROP POLICY IF EXISTS "update_own_customers" ON customers;
CREATE POLICY "update_own_customers" ON customers FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = customers.business_id AND businesses.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = customers.business_id AND businesses.id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_customers" ON customers;
CREATE POLICY "delete_own_customers" ON customers FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = customers.business_id AND businesses.id = auth.uid()));

-- messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  content text NOT NULL,
  role message_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_messages" ON messages;
CREATE POLICY "select_own_messages" ON messages FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM customers
      JOIN businesses ON businesses.id = customers.business_id
      WHERE customers.id = messages.customer_id AND businesses.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_messages" ON messages;
CREATE POLICY "insert_own_messages" ON messages FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      JOIN businesses ON businesses.id = customers.business_id
      WHERE customers.id = messages.customer_id AND businesses.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_messages" ON messages;
CREATE POLICY "update_own_messages" ON messages FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM customers
      JOIN businesses ON businesses.id = customers.business_id
      WHERE customers.id = messages.customer_id AND businesses.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      JOIN businesses ON businesses.id = customers.business_id
      WHERE customers.id = messages.customer_id AND businesses.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_messages" ON messages;
CREATE POLICY "delete_own_messages" ON messages FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM customers
      JOIN businesses ON businesses.id = customers.business_id
      WHERE customers.id = messages.customer_id AND businesses.id = auth.uid()
    )
  );

-- orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  revenue numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM customers
      JOIN businesses ON businesses.id = customers.business_id
      WHERE customers.id = orders.customer_id AND businesses.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      JOIN businesses ON businesses.id = customers.business_id
      WHERE customers.id = orders.customer_id AND businesses.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_orders" ON orders;
CREATE POLICY "update_own_orders" ON orders FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM customers
      JOIN businesses ON businesses.id = customers.business_id
      WHERE customers.id = orders.customer_id AND businesses.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      JOIN businesses ON businesses.id = customers.business_id
      WHERE customers.id = orders.customer_id AND businesses.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_orders" ON orders;
CREATE POLICY "delete_own_orders" ON orders FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM customers
      JOIN businesses ON businesses.id = customers.business_id
      WHERE customers.id = orders.customer_id AND businesses.id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompts_business_id ON prompts(business_id);
CREATE INDEX IF NOT EXISTS idx_integrations_business_id ON integrations(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_messages_customer_id ON messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_businesses_updated_at ON businesses;
CREATE TRIGGER trigger_businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_prompts_updated_at ON prompts;
CREATE TRIGGER trigger_prompts_updated_at BEFORE UPDATE ON prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_integrations_updated_at ON integrations;
CREATE TRIGGER trigger_integrations_updated_at BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_customers_updated_at ON customers;
CREATE TRIGGER trigger_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_messages_updated_at ON messages;
CREATE TRIGGER trigger_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON orders;
CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();