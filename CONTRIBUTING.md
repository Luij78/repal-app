# Contributing to REPal

Thanks for your interest in contributing! This document outlines the development workflow.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Supabase account (for database)
- Clerk account (for auth)

### Local Setup

```bash
# Clone the repo
git clone https://github.com/Luij78/repal-app.git
cd repal-app

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local
# Then fill in your Clerk + Supabase credentials

# Run development server
npm run dev
```

## Development Workflow

### Branch Naming
- `feature/` - New features (e.g., `feature/calendar-sync`)
- `fix/` - Bug fixes (e.g., `fix/lead-delete-error`)
- `docs/` - Documentation updates
- `refactor/` - Code improvements without behavior changes

### Commit Messages
Use conventional commits:
```
feat: add calendar sync integration
fix: resolve lead deletion error in modal
docs: update API documentation
refactor: extract lead form into component
```

### Code Style
- TypeScript for all new code
- Tailwind for styling (avoid custom CSS when possible)
- Components in `src/components/`
- Pages in `src/app/`
- Types in `src/types/`

## Database Changes

### Schema Migrations
When modifying the database schema:

1. Add migration file to `supabase/migrations/` with naming: `XXX_description.sql`
2. Update `supabase/schema.sql` to reflect final state
3. Update `src/types/database.ts` to match

Example migration:
```sql
-- 002_add_lead_tags.sql
ALTER TABLE leads ADD COLUMN tags TEXT[];
CREATE INDEX idx_leads_tags ON leads USING GIN(tags);
```

### Testing Migrations
Test migrations against a fresh Supabase project before merging.

## Testing

Currently using manual testing. Future plans:
- Jest for unit tests
- Playwright for E2E tests

### Manual Test Checklist
Before submitting a PR, verify:
- [ ] Feature works as expected
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Works with empty state (no data)
- [ ] Works with existing data

## Pull Request Process

1. Create feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Push and open PR
5. Wait for review
6. Address feedback
7. Merge when approved

### PR Description Template
```markdown
## What
Brief description of changes

## Why
Motivation for the change

## How to Test
Steps to verify the change works

## Screenshots
If UI changes, include before/after
```

## Architecture Decisions

See `docs/ARCHITECTURE.md` for system design.

### Key Principles
1. **Client-first**: Most logic runs in browser for snappy UX
2. **RLS for security**: Never trust client-side auth checks alone
3. **Progressive enhancement**: Core features work without JS where possible
4. **Mobile-first**: Design for small screens, enhance for large

## Questions?

Open an issue or reach out to the maintainers.

---

Built with ❤️ for real estate professionals
