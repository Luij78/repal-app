-- REPal Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Leads Table
CREATE TABLE leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT DEFAULT 'manual',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'negotiating', 'closed', 'lost')),
  type TEXT DEFAULT 'buyer' CHECK (type IN ('buyer', 'seller', 'both')),
  notes TEXT,
  property_interest TEXT,
  budget_min NUMERIC,
  budget_max NUMERIC,
  timeline TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments Table
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

-- Transactions Table
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

-- Tasks Table
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

-- Expenses Table
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

-- Mileage Trips Table
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

-- Coach Progress Table
CREATE TABLE coach_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  item_id TEXT NOT NULL,
  completed_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category, item_id, completed_date)
);

-- User Profiles Table
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

-- Drip Campaigns Table
CREATE TABLE drip_campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  trigger TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quick Reply Templates Table
CREATE TABLE quick_reply_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Open House Sign-Ins Table
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

-- Row Level Security (RLS) Policies
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

-- Create policies for each table (users can only access their own data)
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

-- Create indexes for better performance
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_mileage_user_id ON mileage_trips(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
