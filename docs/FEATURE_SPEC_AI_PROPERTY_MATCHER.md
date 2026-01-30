# REPAL Feature Spec: AI Property Matcher

**Created:** 2026-01-30
**Status:** Concept
**Priority:** HIGH — Core Differentiator

---

## Overview

An AI agent that proactively searches for properties matching each lead's criteria and surfaces them to the agent with personalized outreach drafts ready to send.

**Tagline:** "The AI does the hunting, you close the deals."

---

## The Problem

Real estate agents spend hours:
- Manually searching MLS for each client's criteria
- Cross-referencing what clients have rejected (HOA too high, wrong area, etc.)
- Writing personalized messages for each property send
- Keeping track of who wants what

Most CRMs just *store* data — they don't *work* it.

---

## The Solution

### Core Features

**1. Lead Criteria Capture**
- Budget (min/max, cash vs financed)
- Property type (SFH, condo, townhouse, land)
- Beds/baths/sq ft requirements
- Location preferences (cities, zip codes, neighborhoods)
- Deal-breakers (max HOA, no flood zone, must have pool, etc.)
- Investment goals (rental income, fix & flip, primary residence)
- Language preference (English, Spanish, Portuguese, etc.)

**2. Automated Property Scanning**
- Connects to MLS/IDX feed
- Runs searches based on each lead's criteria
- Filters OUT properties that match known deal-breakers
- Scores matches based on fit (exact match vs close match)

**3. Smart Matching Logic**
- Learns from rejections ("Client rejected $500 HOA → filter HOA > $200")
- Considers viewing history (what they've looked at before)
- Prioritizes new listings and price drops
- Flags "hot deals" (price below market, motivated seller keywords)

**4. Proactive Outreach Drafts**
- Auto-generates personalized message for each match
- Uses lead's preferred language
- References their specific criteria ("Found a 3/2 under $250K with NO HOA like you wanted")
- Agent reviews and sends with one click

**5. Agent Dashboard**
- Morning report: "5 new matches for your leads today"
- Per-lead view: "Arturo Davalos — 3 new properties match his criteria"
- One-click send or dismiss
- Track which sends convert to showings

---

## User Flow

```
1. Agent adds lead with criteria
2. REPAL AI scans listings overnight
3. Morning: Agent sees "12 matches found for 8 leads"
4. Agent clicks lead → sees matched properties + draft messages
5. Agent reviews, edits if needed, hits SEND
6. Lead receives personalized property alert
7. REPAL tracks opens, replies, showing requests
```

---

## Competitive Advantage

| Feature | Traditional CRM | REPAL |
|---------|-----------------|-------|
| Stores lead criteria | ✅ | ✅ |
| Searches for matches | ❌ (manual) | ✅ (automated) |
| Remembers rejections | ❌ | ✅ |
| Drafts outreach | ❌ | ✅ |
| Multi-language | ❌ | ✅ |
| Learns preferences | ❌ | ✅ |

---

## Technical Requirements

- MLS/IDX API integration (RETS, Spark, Bridge, etc.)
- Lead criteria database schema
- AI/LLM for message generation
- Scheduling system for daily/hourly scans
- Notification system (email, push, SMS)

---

## MVP Scope

**Phase 1 (MVP):**
- Manual criteria entry per lead
- Daily property scan against criteria
- Basic match notifications
- Draft message generation

**Phase 2:**
- Auto-extract criteria from conversation history
- Learning from rejections
- Multi-language support
- One-click send integration

**Phase 3:**
- Predictive matching ("leads like this usually want...")
- Market trend alerts
- ROI calculator for investors
- Automated follow-up sequences

---

## Success Metrics

- Time saved per agent per day (target: 2+ hours)
- Lead response rate to AI-matched properties
- Showing conversion rate
- Agent retention/satisfaction

---

## Notes from Luis (2026-01-30)

> "This is exactly the type of information I want for the REPAL app. An AI agent that's proactively looking for investment properties or properties based on the leads' demands. Real up-to-date information and you're doing all the heavy lifting."

This is the core differentiator. Build this well and REPAL becomes indispensable.

---

*Document maintained by Skipper*
