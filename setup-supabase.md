# Setting Up Supabase for Agent Team

## Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase project**: https://wmyptvcnwmmspknmeooy.supabase.co
2. **Open SQL Editor** (left sidebar)
3. **Create a new query**
4. **Copy and paste** the contents of `supabase/migration.sql`
5. **Click "Run"** to execute the migration

## Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
cd web-app
supabase db push
```

## Option 3: Manual Table Creation

If the above don't work, you can create tables one by one in the SQL Editor:

1. Create `content` table
2. Create `publishing_history` table  
3. Create `settings` table
4. Create indexes
5. Create functions and triggers
6. Enable RLS and create policies

## Verify Setup

After applying the migration, verify the tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('content', 'publishing_history', 'settings');
```

You should see all three tables listed.

## Get Your Connection Details

1. Go to **Settings** > **API** in your Supabase dashboard
2. Copy:
   - **Project URL**: `https://wmyptvcnwmmspknmeooy.supabase.co`
   - **anon/public key**: (starts with `eyJ...`)

3. Add these to your `.env.local` file:
```
NEXT_PUBLIC_SUPABASE_URL=https://wmyptvcnwmmspknmeooy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Troubleshooting

### Connection Timeout
- Your Supabase project might be paused (free tier)
- Go to your Supabase dashboard and "Resume" the project
- Wait a minute for it to wake up, then try again

### Permission Errors
- Check that RLS policies are created correctly
- Verify your anon key is correct
- Make sure tables exist (check with the verify query above)
