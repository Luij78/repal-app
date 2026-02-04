#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = 'https://tptcgnpxwdhurwilpjrs.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwdGNnbnB4d2RodXJ3aWxwanJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE3MTkzNiwiZXhwIjoyMDg0NzQ3OTM2fQ.cCNZc1GXGJnLcW33fcdt97R4045xLzvrrQB9TPRfclA'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('📋 Checking if lead_notes table exists...\n')

// Try to query the table
const { data, error } = await supabase.from('lead_notes').select('id').limit(1)

if (error && (error.code === 'PGRST116' || error.message.includes('Could not find the table'))) {
  console.log('❌ Table lead_notes does not exist.\n')
  console.log('📝 Please run the following SQL in your Supabase SQL Editor:')
  console.log('   https://supabase.com/dashboard/project/tptcgnpxwdhurwilpjrs/sql\n')
  
  const sql = readFileSync('./create-lead-notes-table.sql', 'utf-8')
  console.log('━'.repeat(80))
  console.log(sql)
  console.log('━'.repeat(80))
  console.log('\n✅ After running the SQL, run this script again to migrate notes.\n')
  process.exit(1)
} else if (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
} else {
  console.log('✅ Table lead_notes exists!\n')
  
  // Now migrate notes for Doreen Melchiorre
  console.log('📝 Migrating notes for Doreen Melchiorre...\n')
  
  const leadId = 'aef44307-afbb-438b-85ac-a119d476922b'
  const userId = 'user_39D3ewDvdNHsWSSo1NuTVgpvCfh'
  
  const notesData = [
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
  
  for (const note of notesData) {
    const { error: insertError } = await supabase
      .from('lead_notes')
      .insert(note)
    
    if (insertError) {
      console.error('❌ Error inserting note:', insertError.message)
    } else {
      const date = new Date(note.created_at).toLocaleString()
      console.log(`✓ Created note: ${date} - ${note.content.substring(0, 50)}...`)
    }
  }
  
  console.log('\n✅ Migration complete!\n')
  process.exit(0)
}
