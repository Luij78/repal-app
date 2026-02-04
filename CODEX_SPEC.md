# Repal Leads Page Redesign — Codex Spec

## Overview
Redesign the leads page (`src/app/dashboard/leads/page.tsx`) with approved mockup designs.
Keep ALL existing functionality. Change only the visual design and component structure.

## Reference Files
- **Current code:** `src/app/dashboard/leads/page.tsx` (1500+ lines, full CRUD + AI)
- **Mockup - List:** `mockup-leads-list.html`
- **Mockup - View Modal:** `mockup-leads-modal.html` (click "View Lead" button)
- **Mockup - Edit Modal:** `mockup-leads-modal.html` (click "Edit Lead" button)
- **Types:** `src/types/database.ts`
- **Supabase client:** `src/lib/supabase/client.ts`
- **AI endpoint:** `src/app/api/coach/route.ts`

## Design System (from mockups)
- Background: `#0a0a0f`
- Card bg: `rgba(255,255,255,0.02)`, border: `rgba(255,255,255,0.05)`
- Accent color: `#f59e0b` (amber/gold)
- Hot: `#ef4444` → `#f97316` gradient
- Warm: `#f59e0b` → `#eab308` gradient  
- Cold: `#374151` → `#6b7280` gradient
- Border radius: 12px cards, 10px avatars, 8px inputs
- Font: system fonts (already in place)

## 1. Leads List Page

### Layout
- Page header: "👥 Lead Manager" + subtitle "X contacts" + "+ Add Lead" button
- Stats row: 4 cards (Total, Hot 🔥, Warm ☀️, Follow-ups Today) — clickable to filter
- Follow-up banner: amber, shows names of leads due today
- Search bar + Status filter + Priority filter
- Lead list: vertical cards with 6px gap

### Lead Card Design
- Position: relative (for pencil icon)
- Left: Avatar (42x42, rounded-10, gradient based on priority)
  - Hot (P1-3): red→orange gradient
  - Warm (P4-6): amber→yellow gradient
  - Cold (P7-10): gray gradient
  - Initials from name (first letter of first + last name)
- Middle: Name (14px semibold) + Priority badge (P1-P10, colored)
- Below name: Meta row — intent icon + area + budget range
- Right: Status pill (colored) + Follow-up date
- Top-right corner: ✏️ pencil icon (13px, absolute positioned top:10px right:10px)
  - Pencil click → opens Edit modal
  - Card click (anywhere else) → opens View modal

### Responsive
- Mobile: 2-col stats, hide follow-up dates, smaller avatars

## 2. View Lead Modal

### Structure
- Centered overlay with backdrop blur
- Panel: 680px width, centered, rounded-16 top corners
- Smooth fade-in animation (translateY + opacity)

### Header
- Avatar (56x56, rounded-14) + Name (22px bold) + badges row (status, intent, stage)
- Quick action buttons: 📱 Text, 📧 Email, 📞 Call, ✏️ Edit
  - Text → opens SMS with phone
  - Email → opens mailto
  - Call → opens tel:
  - Edit → switches to Edit modal

### Tabs
- Overview | Activity | Properties
- Amber underline on active tab

### Overview Tab
- Info grid (2 columns): Preferred Area, Budget, Property Interest, Follow-up, Source, Language
- "Recent Notes" section header with AI buttons: ✨ AI Follow-up, 🔄 AI Rewrite, 🎤 Voice
- Notes displayed as TIMELINE (not raw textarea):
  - Parse notes by timestamp pattern: `[MM/DD/YYYY @ HH:MM AM/PM]` or `[M/DD/YYYY HH:MM AM/PM]`
  - Each entry: dot + date label + text bubble (rounded card with left border)
  - Most recent first
  - Latest 2 entries have amber dots, older ones have gray
- "Add a note..." textarea at bottom with Save button

### Activity Tab  
- Info grid: Last Contact, Total Interactions, Web Visits, DNC Status

### Properties Tab
- Placeholder: "Property tracking coming soon"

### Footer
- Left: 🗑️ Delete button (red, with confirm dialog)
- Right: Close button

### AI Features (preserve existing logic)
- AI Follow-up: calls `/api/coach` with lead notes, generates follow-up text
- AI Rewrite: calls `/api/coach` with lead notes, generates cleaned version
- Show AI response in purple card with Copy + "Add to Notes" buttons
- `cleanAiResponse()` function — keep exactly as-is

### Voice Input (preserve existing)
- useSpeechToText hook — keep exactly as-is
- 🎤 Voice button toggles listening
- Transcript appends to notes

## 3. Edit Lead Modal

### Structure  
- Same overlay/panel as View modal
- Header: Avatar + "Edit Contact" title + lead name subtitle

### Form Sections (with dividers)
**Contact Info:**
- First Name + Last Name (2-col)
- Personal Email + Work Email (2-col)
- Mobile Phone + Home Phone (2-col)

**Status & Priority:**
- Status: Clickable pills (not dropdown) — Hot, New, Nurture, Watch, Pending, Past Client, Inactive
  - Selected pill gets colored background
- Intent + Stage (2-col dropdowns)
- Priority: Number track 1-10 (clickable boxes, color changes by range)
  - 1-3: red, 4-6: amber, 7-10: gray

**Property Preferences:**
- Preferred Area + Follow-up Date (2-col)
- Budget Min + Budget Max (2-col)
- Property Interest (full width)

**Personal Details:**
- Birthday + Home Anniversary (2-col)
- Company (full width)
- Source (dropdown)

### Footer
- Left: 🗑️ Delete
- Right: Cancel + 💾 Save Contact (amber)

## 4. Notes Timeline Parser

The key new feature. Notes are currently stored as raw text with timestamps like:
```
[1/27/2026 @ 9:00 AM] Met at open house, very interested in Winter Park area.

[1/31/2026 @ 2:15 PM] Showed 3827 Eversholt — she loved it!
```

Need a function `parseNotesToTimeline(notes: string)` that returns:
```ts
interface TimelineEntry {
  date: string      // formatted date
  time: string      // formatted time  
  text: string      // note content
  isRecent: boolean // true for latest 2 entries
}
```

Pattern matching: `\[(\d{1,2}\/\d{1,2}\/\d{4})[\s@]*(\d{1,2}:\d{2}\s*[AP]M)\]`

If notes don't have timestamps, show as single block.

## 5. Inline Notes Saving

When user adds a note in the View modal:
1. Auto-prepend timestamp: `[M/DD/YYYY @ HH:MM AM/PM] `
2. Append to existing notes (new note goes at END)
3. Save to Supabase
4. Update local state
5. Re-render timeline

## 6. Important Constraints

- Keep ALL existing state management (useState hooks)
- Keep ALL Supabase queries exactly as-is
- Keep the `useSpeechToText` hook exactly as-is
- Keep the `cleanAiResponse` function exactly as-is
- Keep the `generateAiFollowup` and `generateAiRewrite` functions exactly as-is
- Keep all filter/sort logic
- Do NOT change the Supabase schema
- Do NOT change the API routes
- Do NOT change any other pages
- Use Tailwind classes where the app already uses them, inline styles for new mockup-specific styling
- File should remain a single page component (no splitting into sub-files)

## 7. Testing Checklist

After building:
- [ ] All 172 leads render in list
- [ ] Search filters work
- [ ] Status/Priority filters work
- [ ] Stats cards show correct counts and filter on click
- [ ] Click lead name → View modal opens (centered, animated)
- [ ] Click ✏️ → Edit modal opens
- [ ] Notes display as timeline
- [ ] Add note works (with timestamp)
- [ ] AI Follow-up generates response
- [ ] AI Rewrite generates response
- [ ] Voice input works
- [ ] Edit form saves to Supabase
- [ ] Delete works with confirmation
- [ ] Mobile responsive
- [ ] Follow-up banner shows correct leads
