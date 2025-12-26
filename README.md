# Agent Team Web App

A simplified Next.js web application for creating and publishing social media content.

## Features

- **Single Codebase**: Everything in TypeScript/Next.js
- **Web-Based**: No desktop app build process needed
- **No Database Required**: Uses in-memory storage (data persists during server runtime)
- **Modern UI**: Clean, responsive interface
- **API Integration**: Direct API calls instead of CLI spawning

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env.local` file in the `web-app` directory:

```bash
# Image Generation (Google API)
NANO_BANANA_API_KEY=your_google_api_key
# OR
GEMINI_API_KEY=your_google_api_key

# Publishing (Typefully)
TYPEFULLY_API_KEY=your_typefully_api_key
TYPEFULLY_SOCIAL_SET_ID=273516

# Blog Publishing (DefendreSolutions.com)
BLOG_API_KEY=your_blog_api_key
BLOG_API_URL=https://defendresolutions.com/api/admin/publish-blog

# Optional: App URL (for image generation in production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note**: Supabase is optional. The app works without it using in-memory storage. Data will persist only while the server is running.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
web-app/
├── app/
│   ├── api/              # API routes
│   │   ├── content/      # Content CRUD operations (in-memory)
│   │   ├── publish/      # Publishing to social media
│   │   ├── generate-image/ # AI image generation
│   │   └── generate-content/ # Content generation
│   ├── page.tsx          # Main app page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── CreateView.tsx    # Content creation form
│   ├── ProgressView.tsx  # Generation progress
│   └── PreviewView.tsx   # Content preview
├── lib/                  # Utility functions
│   ├── config.ts         # Configuration
│   ├── storage.ts        # In-memory storage (no database)
│   └── utils.ts          # Helper functions
└── store/                # State management
    └── useStore.ts       # Zustand store
```

## Storage

The app currently uses **in-memory storage** - no database required! This means:

- ✅ Works immediately without setup
- ✅ No database configuration needed
- ⚠️ Data is lost when server restarts
- ⚠️ Data is not shared between server instances

For production use, you can:
- Add Supabase (see `supabase/schema.sql`)
- Use a different database
- Add file-based storage
- Use localStorage for client-side persistence

## API Routes

### POST /api/content
Create new content entry (stored in memory)

### GET /api/content
List all content (with optional filters)

### PUT /api/content
Update existing content

### POST /api/publish
Publish content to X and/or LinkedIn

### POST /api/publish-blog
Publish blog post to DefendreSolutions.com

### POST /api/generate-image
Generate AI image from prompt

### POST /api/generate-content
Generate all content (blog, social posts, image)

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The app will automatically deploy on every push to main.

**Note**: With in-memory storage, each server instance has its own data. For production, consider adding a database.

## Differences from Desktop App

- **No Electron**: Runs in browser instead
- **No Python**: All logic in TypeScript
- **No File System**: Uses in-memory storage (can add database later)
- **No CLI Spawning**: Direct API calls
- **Simpler Deployment**: Just deploy to Vercel

## Next Steps

- [x] Basic app structure
- [x] In-memory storage
- [x] Publishing to social media
- [x] Image generation
- [ ] Add content generation API integration (Claude/OpenAI)
- [ ] Add database for persistence (optional)
- [ ] Add content history page
- [ ] Add settings page for API keys

## Troubleshooting

### Image Generation Fails
- Verify `NANO_BANANA_API_KEY` or `GEMINI_API_KEY` is set
- Check API quota/limits
- Review error logs in browser console

### Publishing Fails
- Verify `TYPEFULLY_API_KEY` is correct
- Check `TYPEFULLY_SOCIAL_SET_ID` matches your account
- Ensure content is properly formatted

### Data Lost After Restart
- This is expected with in-memory storage
- Add a database (Supabase, PostgreSQL, etc.) for persistence
- Or use file-based storage for simple persistence
