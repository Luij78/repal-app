# Neighborhood Position Feature

## Overview
The Neighborhood Position feature allows users to search for any address and see where a property sits relative to its neighborhood median value. This helps identify "progression" properties (worst house/best block) with high upside potential vs. "regression" properties (best house/worst block) with limited upside.

## What Was Built

### 1. API Route: `/api/neighborhood`
**File:** `src/app/api/neighborhood/route.ts`

- **Endpoint:** `GET /api/neighborhood?address={address}`
- **Integrations:** RentCast API
  - Property details endpoint: `https://api.rentcast.io/v1/properties?address={address}`
  - Comparable sales endpoint: `https://api.rentcast.io/v1/comparable-sales?address={address}&limit=5`
- **Returns:**
  ```json
  {
    "property": {
      "address": "123 Main St, Orlando, FL 32801",
      "estimatedValue": 350000,
      "bedrooms": 3,
      "bathrooms": 2,
      "squareFootage": 1500
    },
    "comps": [
      {
        "address": "456 Oak Ave, Orlando, FL 32801",
        "price": 380000,
        "date": "2024-01-15",
        "bedrooms": 3,
        "bathrooms": 2,
        "squareFootage": 1600,
        "distance": 0.2
      }
    ],
    "median": 375000,
    "position": "progression",
    "percentage": 6.7
  }
  ```

### 2. Component: `NeighborhoodPosition`
**File:** `src/components/NeighborhoodPosition.tsx`

- Accepts an `address` prop
- Auto-fetches data from the API route when address changes
- Displays a professional dark-themed card with:
  - **Header:** Property address with bedroom/bath/sqft info + Progression/Regression badge
  - **Value Comparison:** Property value vs. neighborhood median (side by side)
  - **Visual Bar:** Interactive bar chart showing where property sits on the value spectrum
  - **Position Indicator:** Color-coded explanation box:
    - 🟢 **Green (Progression):** "Worst house in the best block" — High upside potential
    - 🔴 **Red (Regression):** "Best house in the worst block" — Limited upside
  - **Comparable Sales List:** 5 nearby sales with prices, dates, and property details
- **Loading state:** Skeleton placeholder with pulsing animation
- **Error handling:** Clear error message with retry button

### 3. Leads Page Integration
**File:** `src/app/dashboard/leads/page.tsx`

Added a search bar at the top of the Leads page (after stats, before follow-ups section):
- Input field with placeholder "Search Address for Neighborhood Position..."
- Clear button (X) when input has text
- Search button (green, matches design)
- Enter key support
- Results appear below search bar when submitted
- UX features:
  - Loading state during API call
  - Error handling with retry
  - Clear button to reset search

### 4. Environment Configuration
**Files:** `.env.local`, `.env.example`

Added `RENTCAST_API_KEY` environment variable:
```bash
RENTCAST_API_KEY=your_rentcast_api_key_here
```

## Setup Instructions

1. **Get a RentCast API Key:**
   - Visit [RentCast.io](https://www.rentcast.io/)
   - Sign up for an account
   - Get your API key from the dashboard

2. **Add the API Key:**
   - Open `.env.local`
   - Replace `your_rentcast_api_key_here` with your actual RentCast API key

3. **Restart the dev server:**
   ```bash
   npm run dev
   ```

## Design System

### Colors
- Background: `#1a1b23` (dark)
- Borders: `white/10` (subtle white transparency)
- Progression (Green): `#34d399`
- Regression (Red): `#fb7185`
- Text: White with varying opacity for hierarchy

### Components
- Matches existing Repal dark theme
- Rounded cards with subtle borders
- Smooth transitions and hover states
- Responsive layout (mobile-friendly)

## Usage Example

1. Navigate to **Dashboard → Leads**
2. At the top of the page, find the search bar labeled "Search Address for Neighborhood Position"
3. Enter an address (e.g., "123 Main St, Orlando, FL 32801")
4. Click **Search** or press **Enter**
5. View the neighborhood position card with:
   - Property value vs median
   - Visual bar chart
   - Progression/Regression indicator
   - List of comparable sales

## Technical Notes

- **Next.js 14:** Uses App Router with API routes
- **Dynamic Route:** API route is marked as `force-dynamic` to handle query parameters
- **Client Component:** NeighborhoodPosition is a client component (uses React hooks)
- **Error Handling:** Graceful error states for API failures, missing data, or invalid addresses
- **TypeScript:** Fully typed interfaces for API responses and component props

## Future Enhancements

Potential improvements for v2:
- Save favorite searches
- Historical trend data (if available via RentCast)
- Export to PDF for client presentations
- Attach neighborhood analysis to specific leads
- Bulk address analysis (CSV upload)

---

**Build Status:** ✅ Passing (no errors)
**Last Updated:** 2026-02-06
