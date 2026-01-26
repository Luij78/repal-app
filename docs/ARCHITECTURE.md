# REPal Architecture

## Overview

REPal (Real Estate Professional Assistant) is a Next.js 14 application with Supabase backend and Clerk authentication.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS, Custom CSS Variables |
| Auth | Clerk (user management, session handling) |
| Database | Supabase (PostgreSQL + RLS) |
| Deployment | Vercel (recommended) |

## Directory Structure

```
repal-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Protected dashboard routes
│   │   │   ├── leads/          # Lead management
│   │   │   ├── appointments/   # Scheduling
│   │   │   ├── transactions/   # Deal tracking
│   │   │   ├── coach/          # Success guide
│   │   │   ├── expenses/       # Expense tracker
│   │   │   ├── mileage/        # Mileage logger
│   │   │   └── ...             # Other tools
│   │   ├── sign-in/            # Clerk sign-in
│   │   ├── sign-up/            # Clerk sign-up
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── dashboard/          # Dashboard-specific components
│   │   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   │   └── MobileNav.tsx   # Mobile navigation
│   │   └── ui/                 # Reusable UI components
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts       # Browser Supabase client
│   │       └── server.ts       # Server Supabase client
│   └── types/
│       └── database.ts         # TypeScript interfaces
├── supabase/
│   ├── schema.sql              # Full database schema
│   └── migrations/             # Incremental migrations
├── public/
│   └── manifest.json           # PWA manifest
└── docs/                       # Documentation
```

## Data Flow

```
User → Clerk Auth → Next.js App Router → Supabase (RLS enforced)
```

1. **Authentication**: Clerk handles sign-in/sign-up and session management
2. **Authorization**: Supabase Row Level Security ensures users only see their own data
3. **Data Access**: Client-side Supabase calls with user's JWT for real-time updates

## Key Patterns

### 1. Client-Side Data Fetching
Pages use `useEffect` + Supabase client for data:
```typescript
const { user } = useUser()
const supabase = createClient()

useEffect(() => {
  if (user) {
    supabase.from('leads').select('*').eq('user_id', user.id)
  }
}, [user])
```

### 2. Local Storage Fallback
Dashboard uses localStorage for tile preferences:
```typescript
const savedOrder = localStorage.getItem('repal_tile_order')
```

### 3. Optimistic Updates
Forms update local state immediately, then sync to DB:
```typescript
setLeads([data, ...leads]) // Optimistic
await supabase.from('leads').insert(data) // Persist
```

## Database Schema

See `supabase/schema.sql` for full schema. Key tables:
- `leads` - CRM contacts with priority scoring
- `appointments` - Scheduled meetings
- `transactions` - Real estate deals
- `tasks` - To-do items
- `expenses` / `mileage_trips` - Tax tracking

All tables have:
- `user_id` column (Clerk user ID)
- RLS policies restricting access to owner
- Indexes on common query patterns

## Feature Modules

| Module | Purpose | Key Features |
|--------|---------|--------------|
| Lead Manager | CRM | Priority scoring (1-10), follow-up dates, quick messages |
| Appointments | Scheduling | Calendar integration, reminders |
| Transactions | Deal tracking | Milestone progress, commission calc |
| Coach | Success guide | Daily checklists, scripts, tips |
| Calculators | Number crunching | Investment ROI, mortgage, closing costs |
| Trackers | Expense/Mileage | Tax deduction logging |

## Security

- **Clerk**: Handles authentication, session tokens
- **Supabase RLS**: Database-level access control
- **Environment Variables**: Secrets never exposed to client
- **HTTPS**: All traffic encrypted in production

## Performance

- **Next.js App Router**: Server components where possible
- **Database Indexes**: On frequently queried columns
- **Client-side Caching**: localStorage for preferences
- **Lazy Loading**: Components load on demand
