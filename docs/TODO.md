# REPal Development Roadmap

## Priority 1: Core Fixes

### Database Sync
- [ ] Run migration `001_add_lead_fields.sql` in Supabase to sync schema with code
- [ ] Verify all lead types work (buyer55, investor, renter added)

### Bug Fixes
- [ ] Lead detail modal - ensure all new fields display correctly
- [ ] Dashboard stats - verify "hot leads" count uses priority system
- [ ] Follow-up date filtering on dashboard

## Priority 2: Missing Functionality

### Lead Manager Enhancements
- [ ] Bulk import leads from CSV
- [ ] Lead activity log (track all touchpoints)
- [ ] Lead scoring automation (based on engagement)
- [ ] Duplicate lead detection

### Appointments
- [ ] Google Calendar sync
- [ ] Apple Calendar sync
- [ ] Automated reminder emails/SMS
- [ ] Recurring appointments

### Transactions
- [ ] Document checklist per transaction
- [ ] Commission split tracking (co-listing)
- [ ] Timeline visualization
- [ ] Email notifications at milestones

### Coach
- [ ] Custom checklist items
- [ ] Script library with copy button
- [ ] Progress trends/charts
- [ ] Weekly goal setting

### Communications
- [ ] Email sending integration (SendGrid/Resend)
- [ ] SMS integration (Twilio)
- [ ] Drip campaign automation
- [ ] Template variables ({{name}}, {{property}})

## Priority 3: Nice to Have

### Analytics Dashboard
- [ ] Lead conversion funnel
- [ ] Revenue tracking
- [ ] Source attribution
- [ ] Year-over-year comparison

### Mobile PWA
- [ ] Add to home screen prompt
- [ ] Offline mode for key features
- [ ] Push notifications

### Integrations
- [ ] IDX/MLS feed ingestion
- [ ] Zillow lead capture webhook
- [ ] Realtor.com integration
- [ ] DocuSign for signatures

### Team Features
- [ ] Multi-user accounts
- [ ] Lead assignment
- [ ] Team leaderboard
- [ ] Shared templates

## Priority 4: Technical Debt

### Code Quality
- [ ] Extract form logic into custom hooks
- [ ] Add loading states consistently
- [ ] Error boundary components
- [ ] Centralized error handling

### Testing
- [ ] Set up Jest for unit tests
- [ ] Add Playwright for E2E
- [ ] Test coverage for critical paths

### Performance
- [ ] Image optimization
- [ ] Bundle size analysis
- [ ] Lazy load heavy components
- [ ] Database query optimization

### Security
- [ ] Rate limiting on API routes
- [ ] Input sanitization audit
- [ ] CSRF protection review
- [ ] Dependency vulnerability scan

---

## Completed ✅

- [x] Lead priority scoring (1-10 scale)
- [x] Speech-to-text for notes
- [x] Quick message generation
- [x] Dashboard tile customization
- [x] AI daily digest
- [x] Mobile navigation
- [x] Basic CRUD for all entities

---

*Last updated: 2026-01-25 by Skipper*
