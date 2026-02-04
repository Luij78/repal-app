-- Create lead_notes table for timeline-style notes
CREATE TABLE IF NOT EXISTS lead_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own lead notes" ON lead_notes;
DROP POLICY IF EXISTS "Users can insert own lead notes" ON lead_notes;
DROP POLICY IF EXISTS "Users can update own lead notes" ON lead_notes;
DROP POLICY IF EXISTS "Users can delete own lead notes" ON lead_notes;

-- Permissive policies (app handles filtering by user_id since we use Clerk)
CREATE POLICY "Users can view own lead notes" ON lead_notes FOR SELECT USING (true);
CREATE POLICY "Users can insert own lead notes" ON lead_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own lead notes" ON lead_notes FOR UPDATE USING (true);
CREATE POLICY "Users can delete own lead notes" ON lead_notes FOR DELETE USING (true);
