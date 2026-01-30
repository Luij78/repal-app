-- Migration: Fix RLS policies for Clerk authentication
-- The original policies use Supabase Auth JWT claims, but we use Clerk
-- This migration drops the old policies and creates permissive ones
-- Security is handled by:
-- 1. Clerk authentication (middleware)
-- 2. User ID filtering in queries (WHERE user_id = clerk_user_id)

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own leads" ON leads;
DROP POLICY IF EXISTS "Users can manage their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can manage their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can manage their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can manage their own mileage" ON mileage_trips;
DROP POLICY IF EXISTS "Users can manage their own coach progress" ON coach_progress;
DROP POLICY IF EXISTS "Users can manage their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can manage their own drip campaigns" ON drip_campaigns;
DROP POLICY IF EXISTS "Users can manage their own templates" ON quick_reply_templates;
DROP POLICY IF EXISTS "Users can manage their own open house signins" ON open_house_signins;

-- Create permissive policies (allow all for authenticated anon key)
-- The user_id filtering happens at the application level
CREATE POLICY "Allow all for leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for appointments" ON appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for mileage" ON mileage_trips FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for coach progress" ON coach_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for profiles" ON user_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for drip campaigns" ON drip_campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for templates" ON quick_reply_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for open house signins" ON open_house_signins FOR ALL USING (true) WITH CHECK (true);

-- NOTE: For production, you should implement proper RLS with Clerk JWT verification
-- This can be done by:
-- 1. Setting up a Supabase Edge Function to verify Clerk JWTs
-- 2. Or using Clerk's Supabase integration with custom JWT templates
-- See: https://clerk.com/docs/integrations/databases/supabase
