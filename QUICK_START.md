# Quick Start Guide

## 1. Database Setup

1. Go to your Supabase project: https://oosbdrmzatptvvrqwqku.supabase.co
2. Navigate to the SQL Editor
3. Copy and paste the contents of `SUPABASE_SETUP.sql`
4. Run the SQL script

## 2. Disable Email Confirmation (Already Done)

The email confirmation is already disabled in your Supabase project settings.

## 3. Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:4321

## 4. First Time Use

1. Go to http://localhost:4321/register
2. Create an account with your email and password
3. You'll be redirected to login
4. Login and start using the timer!

## Features at a Glance

### Timer Page (/)
- Start/Pause/Resume work sessions
- Complete tasks with automatic duration tracking
- View current session tasks

### History (/history)
- See all completed work sessions
- View tasks for each session
- See total time worked

### Weekly Report (/weekly)
- Visual chart of daily hours
- Total hours and earnings estimate
- Day-by-day breakdown

### Theme Toggle
- Click the sun/moon icon in the sidebar
- Persists across sessions
- Beautiful light and dark modes

## Troubleshooting

### Can't login?
- Make sure you ran the SQL setup script
- Check that your Supabase credentials in `.env` are correct

### No data showing?
- Make sure you've started a work session
- Complete it with "End Day" to see it in history

### Charts not showing?
- Make sure Chart.js is installed: `npm install chart.js`
- Check browser console for errors

## Customization

### Change Hourly Rate
Edit `src/pages/weekly.astro` line ~28:
```typescript
const hourlyRate = 10; // Change to your rate
```

### Change Theme Colors
Edit `src/styles/global.css` CSS variables starting at line 7.

Enjoy tracking your time! 🎉

