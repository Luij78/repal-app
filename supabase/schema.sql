-- REPal Database Schema for Supabase
-- Version: 2.0 (Updated 2026-01-25)
-- Run this in your Supabase SQL Editor for fresh installs

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- LEADS TABLE
-- ============================================
CREATE TABLE leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
  priority INTEGER DEFAULT 5,              -- 1-10 scale (1=hottest)
  follow_up_date DATE,                     -- Next scheduled follow-up
  preferred_area TEXT,                     -- Geographic preference
  birthday DATE,                           -- For relationship building
  home_anniversary DATE,                   -- Date they bought their home
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE leads IS 'CRM leads and prospects';
COMMENT ON COLUMN leads.priority IS 'Lead priority 1-10 (1=hottest, 10=coldest)';
COMMENT ON COLUMN leads.type IS 'buyer, seller, both, buyer55, investor, renter';

-- ============================================
-- APPOINTMENTS TABLE
-- ============================================
CREATE TABLE appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

COMMENT ON TABLE appointments IS 'Scheduled meetings and showings';

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  property_address TEXT NOT NULL,
  sale_price NUMERIC NOT NULL,
  commission_rate NUMERIC DEFAULT 3,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under-contract', 'closed', 'cancelled')),
  closing_date DATE,
  milestone INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE transactions IS 'Real estate deals from contract to close';

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  category TEXT,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE tasks IS 'To-do items and reminders';

-- ============================================
-- EXPENSES TABLE
-- ============================================
CREATE TABLE expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE expenses IS 'Tax-deductible business expenses';

-- ============================================
-- MILEAGE TRIPS TABLE
-- ============================================
CREATE TABLE mileage_trips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  miles NUMERIC NOT NULL,
  purpose TEXT NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE mileage_trips IS 'Business mileage log for tax deductions';

-- ============================================
-- COACH PROGRESS TABLE
-- ============================================
CREATE TABLE coach_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  item_id TEXT NOT NULL,
  completed_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category, item_id, completed_date)
);

COMMENT ON TABLE coach_progress IS 'Daily success checklist progress';

-- ============================================
-- USER PROFILES TABLE
-- ============================================
CREATE TABLE user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  full_name TEXT,
  brokerage TEXT,
  license_number TEXT,
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  signature_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE user_profiles IS 'Agent profile and signature info';

-- ============================================
-- DRIP CAMPAIGNS TABLE
-- ============================================
CREATE TABLE drip_campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  trigger TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE drip_campaigns IS 'Automated email/SMS sequences';

-- ============================================
-- QUICK REPLY TEMPLATES TABLE
-- ============================================
CREATE TABLE quick_reply_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE quick_reply_templates IS 'Pre-built message templates';

-- ============================================
-- OPEN HOUSE SIGN-INS TABLE
-- ============================================
CREATE TABLE open_house_signins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  property_address TEXT NOT NULL,
  event_date DATE NOT NULL,
  visitor_name TEXT NOT NULL,
  visitor_email TEXT,
  visitor_phone TEXT,
  currently_working_with_agent BOOLEAN DEFAULT false,
  interested_in_buying BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE open_house_signins IS 'Open house visitor capture';

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE mileage_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drip_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_reply_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_house_signins ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only access their own data)
CREATE POLICY "Users can manage their own leads" ON leads
  FOR ALL USING (user_id = current_setting('request.jwt.claims')::json->>'sub');

CREATE POLICY "Users can manage their own appointments" ON appointments
  FOR ALL USING (user_id = current_setting('request.jwt.claims')::json->>'sub');

CREATE POLICY "Users can manage their own transactions" ON transactions
  FOR ALL USING (user_id = current_setting('request.jwt.claims')::json->>'sub');

CREATE POLICY "Users can manage their own tasks" ON tasks
  FOR ALL USING (user_id = current_setting('request.jwt.claims')::json->>'sub');

CREATE POLICY "Users can manage their own expenses" ON expenses
  FOR ALL USING (user_id = current_setting('request.jwt.claims')::json->>'sub');

CREATE POLICY "Users can manage their own mileage" ON mileage_trips
  FOR ALL USING (user_id = current_setting('request.jwt.claims')::json->>'sub');

CREATE POLICY "Users can manage their own coach progress" ON coach_progress
  FOR ALL USING (user_id = current_setting('request.jwt.claims')::json->>'sub');

CREATE POLICY "Users can manage their own profile" ON user_profiles
  FOR ALL USING (user_id = current_setting('request.jwt.claims')::json->>'sub');

CREATE POLICY "Users can manage their own drip campaigns" ON drip_campaigns
  FOR ALL USING (user_id = current_setting('request.jwt.claims')::json->>'sub');

CREATE POLICY "Users can manage their own templates" ON quick_reply_templates
  FOR ALL USING (user_id = current_setting('request.jwt.claims')::json->>'sub');

CREATE POLICY "Users can manage their own open house signins" ON open_house_signins
  FOR ALL USING (user_id = current_setting('request.jwt.claims')::json->>'sub');

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_priority ON leads(priority);
CREATE INDEX idx_leads_follow_up_date ON leads(follow_up_date);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_mileage_user_id ON mileage_trips(user_id);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
