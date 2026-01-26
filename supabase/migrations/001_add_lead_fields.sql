-- Migration: Add extended lead fields
-- Run this in Supabase SQL Editor to update the leads table

-- Update the type constraint to include new lead types
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_type_check;
ALTER TABLE leads ADD CONSTRAINT leads_type_check 
  CHECK (type IN ('buyer', 'seller', 'both', 'buyer55', 'investor', 'renter'));

-- Add new columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 5;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS follow_up_date DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS preferred_area TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS home_anniversary DATE;

-- Add index for follow-up queries
CREATE INDEX IF NOT EXISTS idx_leads_follow_up_date ON leads(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);

-- Comment for documentation
COMMENT ON COLUMN leads.priority IS 'Lead priority 1-10 (1=hottest, 10=coldest)';
COMMENT ON COLUMN leads.follow_up_date IS 'Next scheduled follow-up date';
COMMENT ON COLUMN leads.preferred_area IS 'Geographic area preference';
COMMENT ON COLUMN leads.birthday IS 'Client birthday for relationship building';
COMMENT ON COLUMN leads.home_anniversary IS 'Date client purchased their home';
