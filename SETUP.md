# Setup Guide for Agent Team Web App

## Quick Start

### 1. Install Dependencies

```bash
cd web-app
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the SQL to create the tables
5. Go to Settings > API to get your:
   - Project URL
   - Anon key

### 3. Configure Environment Variables

Create a `.env.local` file in the `web-app` directory:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Image Generation (Google API)
NANO_BANANA_API_KEY=your-google-api-key
# OR
GEMINI_API_KEY=your-google-api-key

# Publishing (Typefully)
TYPEFULLY_API_KEY=your-typefully-api-key
TYPEFULLY_SOCIAL_SET_ID=273516
```

### 4. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## What's Different from the Desktop App?

### ✅ Simplified Architecture

- **Single Language**: Everything in TypeScript (no Python)
- **Web-Based**: Runs in browser, no Electron needed
- **Database**: Supabase instead of file system
- **Direct APIs**: No CLI spawning, direct API calls

### ✅ Easier Deployment

- Deploy to Vercel in minutes
- No build process for desktop apps
- Access from anywhere
- Automatic HTTPS

### ✅ Better Maintainability

- One codebase to maintain
- TypeScript for type safety
- Modern React patterns
- Easy to extend

## Next Steps

### 1. Integrate Content Generation

The `/api/generate-content` route currently returns placeholder content. You need to integrate it with your content generation service:

**Option A: Claude API**
```typescript
// In app/api/generate-content/route.ts
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-3-opus-20240229',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Write a blog post about ${topic}...`
    }]
  })
})
```

**Option B: OpenAI**
```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{
      role: 'user',
      content: `Write a blog post about ${topic}...`
    }]
  })
})
```

### 2. Add Authentication (Optional)

If you want to secure the app:

1. Enable Supabase Auth
2. Add login page
3. Protect API routes with middleware

### 3. Add Content History

Create a page to view all generated content:

```typescript
// app/history/page.tsx
const { data } = await supabase
  .from('content')
  .select('*')
  .order('created_at', { ascending: false })
```

### 4. Improve Image Handling

Currently images are stored as base64 data URLs. Consider:

- Uploading to Supabase Storage
- Using a CDN
- Optimizing image sizes

## Troubleshooting

### Supabase Connection Issues

- Check your `.env.local` file has correct values
- Verify Supabase project is active
- Check RLS policies if you get permission errors

### Image Generation Fails

- Verify `NANO_BANANA_API_KEY` or `GEMINI_API_KEY` is set
- Check API quota/limits
- Review error logs in browser console

### Publishing Fails

- Verify `TYPEFULLY_API_KEY` is correct
- Check `TYPEFULLY_SOCIAL_SET_ID` matches your account
- Ensure content is properly formatted

## Migration from Desktop App

If you have existing content in the file system:

1. Export content from old system
2. Create a migration script to import into Supabase
3. Update any hardcoded paths

## Support

For issues or questions:
- Check the main README.md
- Review API documentation
- Check Supabase logs

