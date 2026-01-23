# REPal - Real Estate Professional Assistant

A comprehensive real estate toolkit built with Next.js 14, Supabase, and Clerk authentication.

![REPal Dashboard](https://via.placeholder.com/800x400?text=REPal+Dashboard)

## Features

- 👥 **Lead Manager** - CRM with AI assistant & speech-to-text
- 📅 **Appointments** - Schedule and manage showings
- 📋 **Transaction Tracker** - Track deals from contract to close
- 🎯 **Coach** - Personal success guide with scripts and checklists
- 📊 **Investment Calculator** - Analyze ROI, cash flow & cap rates
- 🏦 **Mortgage Calculator** - Monthly payment estimator
- 💰 **Seller Net Sheet** - Calculate seller proceeds
- 💵 **Buyer Closing Costs** - Estimate cash to close
- 🧾 **Expense Tracker** - Track tax-deductible expenses
- 🚗 **Mileage Tracker** - Log business miles driven
- 📧 **Drip Campaigns** - Automated follow-up sequences
- ⚡ **Quick Replies** - Pre-built response templates
- 🏡 **Open House Sign-In** - Capture leads at open houses

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Clerk account

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/repal-app.git
cd repal-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Clerk

1. Go to [clerk.com](https://clerk.com) and create a new application
2. Copy your API keys from the Clerk dashboard
3. Configure sign-in/sign-up URLs in Clerk dashboard:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/dashboard`

### 4. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key
3. Run the database schema:
   - Go to SQL Editor in Supabase dashboard
   - Copy contents of `supabase/schema.sql`
   - Run the SQL to create all tables

### 5. Configure environment variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
repal-app/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── coach/
│   │   │   ├── mortgage/
│   │   │   ├── leads/
│   │   │   └── ...
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── dashboard/
│   │   └── ui/
│   ├── lib/
│   │   └── supabase/
│   └── types/
├── supabase/
│   └── schema.sql
├── public/
└── ...config files
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add all environment variables
5. Deploy!

### Environment Variables for Production

Make sure to update:
- `NEXT_PUBLIC_APP_URL` to your production URL
- Use production Clerk keys
- Enable RLS policies in Supabase

## Database Schema

The app uses the following main tables:

- `leads` - Customer/prospect information
- `appointments` - Scheduled meetings and showings
- `transactions` - Real estate deals
- `tasks` - To-do items
- `expenses` - Business expenses for tax tracking
- `mileage_trips` - Business mileage logs
- `coach_progress` - Daily checklist progress
- `user_profiles` - Agent profile information
- `drip_campaigns` - Automated email sequences
- `quick_reply_templates` - Message templates
- `open_house_signins` - Open house visitor logs

All tables have Row Level Security (RLS) enabled so users can only access their own data.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Open a Pull Request

## License

MIT License - feel free to use this for your own projects!

## Support

If you have questions or need help:
- Open an issue on GitHub
- Email: support@repal.app

---

Built with ❤️ for real estate professionals
