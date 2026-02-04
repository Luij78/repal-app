import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // First, check if table exists by trying to query it
    const { error: checkError } = await supabase
      .from('lead_notes')
      .select('id')
      .limit(1)
    
    if (checkError && checkError.message.includes('does not exist')) {
      return NextResponse.json({
        status: 'error',
        message: 'Table lead_notes does not exist. Please run the SQL in Supabase SQL Editor:',
        sql: `
CREATE TABLE IF NOT EXISTS lead_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own lead notes" ON lead_notes;
DROP POLICY IF EXISTS "Users can insert own lead notes" ON lead_notes;
DROP POLICY IF EXISTS "Users can update own lead notes" ON lead_notes;
DROP POLICY IF EXISTS "Users can delete own lead notes" ON lead_notes;

CREATE POLICY "Users can view own lead notes" ON lead_notes FOR SELECT USING (true);
CREATE POLICY "Users can insert own lead notes" ON lead_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own lead notes" ON lead_notes FOR UPDATE USING (true);
CREATE POLICY "Users can delete own lead notes" ON lead_notes FOR DELETE USING (true);
        `.trim(),
        sqlEditorUrl: 'https://supabase.com/dashboard/project/tptcgnpxwdhurwilpjrs/sql/new'
      }, { status: 400 })
    }
    
    // Table exists, now migrate notes for Doreen
    const leadId = 'aef44307-afbb-438b-85ac-a119d476922b'
    const userId = 'user_39D3ewDvdNHsWSSo1NuTVgpvCfh'
    
    const notesToMigrate = [
      {
        lead_id: leadId,
        user_id: userId,
        content: 'Showed 3827 Eversholt St — she loved it! Kitchen was exactly what she wanted. Husband flying in from Chicago in 2 weeks to see it in person. Very excited about the pool. Coming April, moving by October.',
        created_at: '2026-01-31T14:15:00-05:00'
      },
      {
        lead_id: leadId,
        user_id: userId,
        content: 'Virtual tour scheduled and completed. Doreen says the neighborhood feels right. Wants to see 2-3 more options before husband visits. Prefers Winter Park over Windermere — closer to her sister.',
        created_at: '2026-01-27T10:30:00-05:00'
      },
      {
        lead_id: leadId,
        user_id: userId,
        content: 'Initial call. Moving from Chicago, relocating for husband\'s job. Budget $350-425K. Wants 3BR min, pool is a must. Sister lives in Winter Park — wants to be close. Timeline: April move-in, needs to close by October.',
        created_at: '2026-01-24T09:00:00-05:00'
      },
      {
        lead_id: leadId,
        user_id: userId,
        content: 'Lead came in from Realtor.com. Searched Winter Park 3BR homes. Auto-assigned.',
        created_at: '2026-01-22T16:00:00-05:00'
      }
    ]
    
    const { data, error } = await supabase
      .from('lead_notes')
      .insert(notesToMigrate)
      .select()
    
    if (error) {
      // Check if it's because table doesn't exist
      if (error.message.includes('does not exist') || error.message.includes('not found') || error.message.includes('Could not find the table')) {
        return NextResponse.json({
          status: 'error',
          message: 'Table lead_notes does not exist. Please run the SQL in Supabase SQL Editor first.',
          sql: `
CREATE TABLE IF NOT EXISTS lead_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own lead notes" ON lead_notes;
DROP POLICY IF EXISTS "Users can insert own lead notes" ON lead_notes;
DROP POLICY IF EXISTS "Users can update own lead notes" ON lead_notes;
DROP POLICY IF EXISTS "Users can delete own lead notes" ON lead_notes;

CREATE POLICY "Users can view own lead notes" ON lead_notes FOR SELECT USING (true);
CREATE POLICY "Users can insert own lead notes" ON lead_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own lead notes" ON lead_notes FOR UPDATE USING (true);
CREATE POLICY "Users can delete own lead notes" ON lead_notes FOR DELETE USING (true);
          `.trim(),
          sqlEditorUrl: 'https://supabase.com/dashboard/project/tptcgnpxwdhurwilpjrs/sql/new'
        }, { status: 400 })
      }
      
      return NextResponse.json({ 
        status: 'error',
        message: 'Failed to migrate notes',
        error: error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Notes migrated successfully!',
      count: data.length,
      notes: data
    })
    
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error',
      message: error.message 
    }, { status: 500 })
  }
}
