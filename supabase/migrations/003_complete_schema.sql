-- Complete REPal Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- LEADS TABLE (already exists, ensure complete)
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT DEFAULT 'manual',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'negotiating', 'closed', 'lost')),
  type TEXT DEFAULT 'buyer' CHECK (type IN ('buyer', 'seller', 'both', 'buyer55', 'investor', 'renter')),
  notes TEXT,
  property_interest TEXT,
  budget_min NUMERIC,
  budget_max NUMERIC,
  timeline TEXT,
  priority INTEGER DEFAULT 5,
  follow_up_date DATE,
  preferred_area TEXT,
  birthday DATE,
  home_anniversary DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT,
  type TEXT DEFAULT 'showing' CHECK (type IN ('showing', 'listing', 'meeting', 'open-house', 'closing', 'other')),
  notes TEXT,
  reminder BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  category TEXT DEFAULT 'general',
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  transaction_id UUID,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  property_address TEXT NOT NULL,
  sale_price NUMERIC NOT NULL,
  commission_rate NUMERIC DEFAULT 3.0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under-contract', 'closed', 'cancelled')),
  closing_date DATE,
  contract_date DATE,
  inspection_date DATE,
  appraisal_date DATE,
  milestone INTEGER DEFAULT 0,
  notes TEXT,
  client_name TEXT,
  client_type TEXT DEFAULT 'buyer' CHECK (client_type IN ('buyer', 'seller')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EXPENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  receipt_url TEXT,
  tax_deductible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MILEAGE TRIPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS mileage_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  miles NUMERIC NOT NULL,
  purpose TEXT,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- QUICK REPLY TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quick_reply_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DRIP CAMPAIGNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS drip_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  trigger_type TEXT DEFAULT 'manual',
  messages JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- OPEN HOUSE SIGNINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS open_house_signins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  event_id TEXT,
  property_address TEXT NOT NULL,
  event_date DATE NOT NULL,
  visitor_name TEXT NOT NULL,
  visitor_email TEXT,
  visitor_phone TEXT,
  buyer_status TEXT,
  agent_represented BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  full_name TEXT,
  brokerage TEXT,
  license_number TEXT,
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  signature_url TEXT,
  bio TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COACH PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS coach_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  item_id TEXT NOT NULL,
  completed_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category, item_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_leads_user ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_follow_up ON leads(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_mileage_user ON mileage_trips(user_id);
CREATE INDEX IF NOT EXISTS idx_mileage_date ON mileage_trips(date);
CREATE INDEX IF NOT EXISTS idx_templates_user ON quick_reply_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_openhouse_user ON open_house_signins(user_id);

-- ============================================
-- ENABLE RLS (Row Level Security)
-- ============================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE mileage_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_reply_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE drip_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_house_signins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PERMISSIVE POLICIES (Clerk handles auth)
-- ============================================
DROP POLICY IF EXISTS "Allow all for leads" ON leads;
DROP POLICY IF EXISTS "Allow all for appointments" ON appointments;
DROP POLICY IF EXISTS "Allow all for tasks" ON tasks;
DROP POLICY IF EXISTS "Allow all for transactions" ON transactions;
DROP POLICY IF EXISTS "Allow all for expenses" ON expenses;
DROP POLICY IF EXISTS "Allow all for mileage" ON mileage_trips;
DROP POLICY IF EXISTS "Allow all for templates" ON quick_reply_templates;
DROP POLICY IF EXISTS "Allow all for drip" ON drip_campaigns;
DROP POLICY IF EXISTS "Allow all for openhouse" ON open_house_signins;
DROP POLICY IF EXISTS "Allow all for profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow all for coach" ON coach_progress;

CREATE POLICY "Allow all for leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for appointments" ON appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for mileage" ON mileage_trips FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for templates" ON quick_reply_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for drip" ON drip_campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for openhouse" ON open_house_signins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for profiles" ON user_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for coach" ON coach_progress FOR ALL USING (true) WITH CHECK (true);

-- Success message
SELECT 'REPal database schema created successfully!' as status;
