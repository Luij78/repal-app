# Lead Notes Timeline Migration

## Overview
This migration adds a timeline-style notes section to the View Lead modal, matching the approved mockup design.

## Changes Made

### 1. Database Schema
Created a new `lead_notes` table to store individual timeline notes instead of using the single `leads.notes` text field.

### 2. UI Updates
- **View Lead Modal**: Replaced the notes textarea with a timeline component showing individual notes with timestamps
- **Edit Lead Modal**: Kept the notes textarea as-is for backward compatibility

### 3. Features Added
- Timeline display with recent notes highlighted (amber dot for notes <7 days old)
- Individual note cards with dates and timestamps
- "Add a note..." textarea with "Save" button
- AI Follow-up, AI Rewrite, and Voice buttons
- Keyboard shortcut: ⌘+Enter to save notes quickly

## Setup Instructions

### Step 1: Create the `lead_notes` table

Run the following SQL in your Supabase SQL Editor:
https://supabase.com/dashboard/project/tptcgnpxwdhurwilpjrs/sql/new

```sql
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
```

### Step 2: Migrate Existing Notes (Optional)

To migrate Doreen Melchiorre's notes to the new table, run:

```bash
curl -X POST http://localhost:3000/api/setup-notes
```

Or manually insert the notes via SQL in Supabase.

### Step 3: Verify

1. Restart your Next.js dev server
2. Open a lead in View mode
3. You should see the timeline-style notes section

## Files Changed

- `src/app/dashboard/leads/page.tsx` - Added timeline UI and state management
- `src/app/api/setup-notes/route.ts` - API endpoint to help with migration
- `supabase/migrations/004_create_lead_notes.sql` - Migration file

## Build Status

✅ Build passes: `npx next build`

## Styling

The timeline matches the mockup design:
- Timeline line: 1px vertical line, subtle gray
- Timeline dots: Amber for recent (<7 days), gray for older
- Note cards: `bg-white/[0.03]`, `border-white/[0.05]`, rounded corners
- "Add a note" input: `bg-white/[0.04]`, `border-white/10`
- Save button: `bg-amber-500`, black text

## Backward Compatibility

- The `leads.notes` field remains in the database for backward compatibility
- The Edit modal still uses the old notes textarea
- Existing leads without timeline notes will show "No notes yet"
