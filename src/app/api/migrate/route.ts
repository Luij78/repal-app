import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const { migration } = await request.json()
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Read migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', `${migration}.sql`)
    const sql = readFileSync(migrationPath, 'utf-8')
    
    // Execute SQL statements one by one
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s.length > 0)
    
    const results = []
    for (const statement of statements) {
      // Use a hack: execute via insert/update/delete won't work, 
      // so we'll return the SQL for manual execution
      results.push({ statement, status: 'pending' })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Cannot execute raw SQL via REST API. Please run the migration manually.',
      sql,
      instructions: 'Go to Supabase Dashboard > SQL Editor and run the SQL above'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
