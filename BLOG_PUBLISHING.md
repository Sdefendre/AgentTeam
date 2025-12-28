# Blog Publishing Feature

## Overview
Added blog publishing capability to the Agent Team web app. You can now publish blog posts directly to DefendreSolutions.com from the web interface.

## What Was Added

### 1. Blog API Configuration (`lib/config.ts`)
- Added `BLOG_API_KEY` environment variable
- Added `BLOG_API_URL` configuration (defaults to DefendreSolutions.com)
- Updated validation to check for blog API key

### 2. Blog Publishing API Route (`app/api/publish-blog/route.ts`)
New API endpoint that:
- Accepts blog content with frontmatter
- Parses frontmatter (title, description, author, date, tags)
- Sends formatted payload to DefendreSolutions blog API
- Returns success/error response

**Expected blog format:**
```markdown
---
title: Your Post Title
description: Brief description
author: Steve Defendre
date: 2024-12-25
keywords: AI, Technology, Security
---

# Your Blog Post

Content here...
```

### 3. Blog Publish Button (`components/PreviewView.tsx`)
- Added "Publish to Blog" button in the Blog tab
- Button appears when blog content is generated
- Shows publishing status and success/error messages
- Publishes to DefendreSolutions.com with one click

### 4. Environment Variables
Created `.env.local` with your blog API key:
```bash
BLOG_API_KEY=c31d1a90ea319b5a6b270d440b0128762f17b630bde1845b3dfad5a679f830de
BLOG_API_URL=https://defendresolutions.com/api/admin/publish-blog
```

## How It Works

1. **Generate Content**: Create content using the web app (topic → generate)
2. **Preview Blog**: Click the "Blog" tab to see the formatted post
3. **Publish**: Click "Publish to Blog" button
4. **API Call**: App sends blog content to DefendreSolutions API
5. **Success**: Blog post appears on DefendreSolutions.com immediately

## API Integration

The web app sends this payload to DefendreSolutions:
```json
{
  "title": "Post Title",
  "excerpt": "Brief description",
  "author": "Steve Defendre",
  "date": "2024-12-25",
  "readTime": "5 min read",
  "tags": ["AI", "Technology"],
  "content": "# Full markdown content..."
}
```

With headers:
```
Content-Type: application/json
X-API-Key: your-blog-api-key
```

## Files Modified

1. `/web-app/lib/config.ts` - Added blog API configuration
2. `/web-app/app/api/publish-blog/route.ts` - New blog publishing endpoint
3. `/web-app/components/PreviewView.tsx` - Added publish button to blog tab
4. `/web-app/.env.local` - Added blog API credentials
5. `/web-app/README.md` - Updated documentation
6. `/.env.example` - Template for environment variables

## Testing

1. Server is running at http://localhost:3000
2. Generate content for a topic
3. Navigate to Blog tab
4. Click "Publish to Blog"
5. Check DefendreSolutions.com for the new post

## Next Steps

- ✅ Blog publishing implemented
- ✅ Environment configured
- ✅ Server running
- Ready to test!

## Troubleshooting

**Error: Blog API key not configured**
- Check that `BLOG_API_KEY` is set in `.env.local`
- Restart the dev server after adding env variables

**Error: Blog publishing failed**
- Verify the blog API URL is correct
- Check that the API key is valid
- Ensure blog content has required frontmatter (title)

**No publish button**
- Make sure blog content was generated
- Check browser console for errors
