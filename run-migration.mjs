import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = 'https://tptcgnpxwdhurwilpjrs.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwdGNnbnB4d2RodXJ3aWxwanJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE3MTkzNiwiZXhwIjoyMDg0NzQ3OTM2fQ.cCNZc1GXGJnLcW33fcdt97R4045xLzvrrQB9TPRfclA'

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const migrationSQL = readFileSync('./supabase/migrations/004_create_lead_notes.sql', 'utf-8')

console.log('Running migration...')
console.log('SQL:', migrationSQL)

// Split by semicolons and execute each statement
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'))

for (const statement of statements) {
  if (statement) {
    console.log('\nExecuting:', statement.substring(0, 100) + '...')
    const { data, error } = await supabase.rpc('exec', { sql: statement })
    
    if (error) {
      console.error('Error:', error.message)
      // Try alternative approach - create table via REST API
      break
    } else {
      console.log('✓ Success')
    }
  }
}

// Verify table was created
console.log('\nVerifying table creation...')
const { data, error } = await supabase.from('lead_notes').select('*').limit(1)

if (error && error.code === 'PGRST116') {
  console.log('✗ Table does not exist yet. Manual SQL execution required.')
  console.log('\nPlease run the following SQL in your Supabase SQL Editor:')
  console.log('\n' + migrationSQL)
  process.exit(1)
} else if (error) {
  console.error('✗ Error:', error)
  process.exit(1)
} else {
  console.log('✓ Table created successfully!')
  process.exit(0)
}
