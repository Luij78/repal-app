# Changelog

All notable changes to REPal will be documented in this file.

## [1.1.0] - 2026-01-25

### Added
- **Database Migration**: New schema with extended lead fields
  - Priority scoring (1-10 scale)
  - Follow-up date tracking
  - Preferred area field
  - Birthday and home anniversary fields
  - New lead types: buyer55, investor, renter
- **Documentation**: Architecture docs, contributing guide, TODO roadmap
- **Sidebar Navigation**: Added missing links (Open House, Important Dates, Commercial Calc)

### Fixed
- Sidebar navigation URLs now match actual page routes
- Schema sync between TypeScript types and database

### Changed
- Schema version updated to 2.0
- Improved SQL comments and documentation

## [1.0.0] - 2026-01-25

### Added
- Initial release with core features
- Lead Manager with priority system and voice notes
- Appointments scheduling
- Transaction tracker with milestones
- Coach with daily checklists
- Investment, Mortgage, Seller Net, Buyer Costs calculators
- Triple Net (NNN) commercial calculator
- Expense tracker for tax deductions
- Mileage logger
- Quick Reply templates
- Drip Campaign builder
- Open House digital sign-in
- Important Dates tracker
- User profile with signature
- Dashboard with AI Daily Digest
- Tile customization and drag-to-reorder
- Mobile responsive navigation
- Dark mode UI

### Technical
- Next.js 14 with App Router
- Supabase backend with RLS
- Clerk authentication
- Tailwind CSS styling
- TypeScript throughout
