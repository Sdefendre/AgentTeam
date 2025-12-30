# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Agent Team is a dual-mode social media content system for DefendreSolutions.com:
1. **Web App** (Next.js): Browser-based content generation with AI
2. **CLI Tools** (Python): Command-line publishing for pre-generated content

Both modes create complete content packages: blog post, X post, LinkedIn post, and AI-generated images.

## Project Structure

```
Agent Team/
├── Web App (Next.js)
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Main UI with view routing
│   │   ├── layout.tsx          # Root layout + theme init
│   │   ├── globals.css         # Theme system + CSS variables
│   │   ├── changelog/          # Changelog page
│   │   └── api/                # API routes
│   │       ├── generate-content/  # AI content generation (SSE)
│   │       ├── suggest-topics/    # AI topic suggestions
│   │       ├── publish/           # X & LinkedIn publishing
│   │       ├── publish-blog/      # Blog publishing
│   │       └── settings/          # Environment variable fallbacks
│   ├── components/             # React components
│   │   ├── CreateView.tsx         # Topic input + suggestions
│   │   ├── ProgressView.tsx       # Generation progress
│   │   ├── PreviewView.tsx        # Content preview + publish
│   │   ├── HistoryView.tsx        # Post history
│   │   ├── CalendarView.tsx       # Drag-and-drop scheduler
│   │   ├── SettingsView.tsx       # API key config
│   │   └── PlatformPreviews/      # X & LinkedIn preview cards
│   └── store/                  # Zustand state management
│
├── CLI Tools (Python)
│   ├── config.py               # Configuration & API keys
│   ├── blog_publisher.py       # Blog publishing module
│   └── publish.py              # Main publishing script
│
├── Documentation
│   └── docs/
│       └── blog-publishing-api.md  # Blog API reference
│
└── Content/                    # Generated content archive
    └── YYYY-MM/
        └── topic-slug/
            ├── blog-post.md
            ├── x-post.txt
            ├── linkedin-post.txt
            └── image.jpg
```

## Workflows

### Workflow 1: Web App (Browser-Based)

```
User enters topic in browser
         │
         ▼
1. AI generates content (Gemini)
   ├── Blog post (800-1500 words)
   ├── X post (optimized for Twitter)
   ├── LinkedIn post (professional tone)
   └── Stock image (auto-fetched)
         │
         ▼
2. Preview in browser
         │
         ▼
3. One-click publish to:
   ├── X (via Typefully)
   ├── LinkedIn (via Typefully)
   └── Blog (via DefendreSolutions API)
```

**Commands:**
```bash
npm install
npm run dev       # Start at http://localhost:3000
npm run build     # Production build
```

### Workflow 2: CLI Tools (Command-Line)

```
Pre-generated content in Content/YYYY-MM/topic-slug/
         │
         ▼
Run: python3 publish.py Content/2025-12/topic-slug/
         │
         ▼
Publishes to:
   ├── X (via Typefully)
   ├── LinkedIn (via Typefully)
   └── Blog (via DefendreSolutions API)
```

**Commands:**
```bash
# Publish with next free slot scheduling
python3 publish.py Content/2025-12/topic-slug/ -s next-free-slot

# Publish immediately
python3 publish.py Content/2025-12/topic-slug/ -s now

# Skip blog publishing
python3 publish.py Content/2025-12/topic-slug/ --skip-blog

# List recent content
python3 publish.py --list-recent

# Publish blog only
python3 blog_publisher.py Content/2025-12/topic-slug/blog-post.md
```

## Configuration

### Environment Variables (.env.local)

```bash
# Image Generation (Google Gemini)
GEMINI_API_KEY=your_key

# Social Media Publishing (Typefully)
TYPEFULLY_API_KEY=your_key
TYPEFULLY_SOCIAL_SET_ID=your_id  # optional

# Blog Publishing (DefendreSolutions)
BLOG_API_KEY=your_key
BLOG_API_URL=https://defendre-solutions.vercel.app/api/admin/publish-blog

# App URL (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Setup:**
1. Copy `.env.example` to `.env.local`
2. Fill in your API keys
3. For web app: Configure via Settings UI (alternative to .env.local)
4. For CLI: Install dependencies: `pip install requests python-dotenv`

## Content Formats

### Blog Post (Markdown)

```markdown
---
title: "Your Post Title"
excerpt: "Brief description (120-160 chars)"
author: "Steve Defendre"
date: "2025-12-28"
readTime: "5 min read"
tags: ["AI", "Technology", "Innovation"]
slug: "optional-custom-slug"
---

# Your Post Title

Introduction paragraph...

## Section 1

Content here...

## Section 2

More content...

## Conclusion

Final thoughts...
```

**Guidelines:**
- 800-1500 words
- Use H2/H3 headings for structure
- Include frontmatter for metadata
- SEO-friendly title and excerpt

### X Post (Twitter)

```
Hook first line

Short sentences.

Line breaks for readability.

Key points:
→ Point 1
→ Point 2
→ Point 3

CTA: DefendreSolutions.com

#AI #Tech (max 1-2 hashtags)
```

**Guidelines:**
- Hook in first line
- Short sentences, line breaks
- Use `\n\n\n\n` to separate thread tweets
- Max 1-2 hashtags
- CTA with arrow (→)

### LinkedIn Post

```
Professional storytelling opening that hooks the reader...

Share insights:
• Insight 1
• Insight 2
• Insight 3

Professional context and industry relevance.

What's your experience with this?

#Technology #AI #Innovation #BusinessStrategy #DigitalTransformation
```

**Guidelines:**
- 1000-1500 characters
- Professional storytelling tone
- End with engaging question
- 3-5 hashtags at bottom

## APIs & Integration

### Blog Publishing API

**Endpoint:** `https://defendre-solutions.vercel.app/api/admin/publish-blog`

**Authentication:** `X-API-Key: <your_blog_api_key>`

**Request:**
```json
{
  "title": "Post Title",
  "excerpt": "Brief description",
  "author": "Steve Defendre",
  "date": "2025-12-28",
  "readTime": "5 min read",
  "tags": ["AI", "Technology"],
  "content": "# Markdown content..."
}
```

**Response:**
```json
{
  "success": true,
  "post": {
    "slug": "post-title",
    "url": "/blog/post-title"
  }
}
```

See `docs/blog-publishing-api.md` for complete API documentation.

### Typefully API (X & LinkedIn)

**Endpoint:** `https://api.typefully.com/v1/drafts/`

**Authentication:** `X-API-KEY: <your_typefully_key>`

**Request:**
```json
{
  "content": "Post content...",
  "share": "twitter",  // or "linkedin"
  "schedule-date": "next-free-slot"  // or "now"
}
```

## Python Modules

### config.py
Central configuration management:
- Loads API keys from `.env.local`
- Defines default settings (author, tags, paths)
- Validates configuration
- Calculates read time from word count

### blog_publisher.py
Blog publishing functionality:
- Parses markdown frontmatter
- Extracts title/excerpt from content
- Publishes to DefendreSolutions API
- Handles errors and validation

**Usage:**
```python
from blog_publisher import BlogPublisher

publisher = BlogPublisher()
result = publisher.publish_from_file('blog-post.md')
```

### publish.py
Main publishing orchestrator:
- Publishes to X, LinkedIn, and Blog
- Reads content from directories
- Handles scheduling options
- Provides CLI interface

## Development

### Web App Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:3000

# Build for production
npm run build
npm start
```

### CLI Tools Development

```bash
# Install Python dependencies
pip install requests python-dotenv

# Test configuration
python3 config.py

# Test blog publishing
python3 blog_publisher.py test-blog-post.md

# Test full publishing workflow
python3 publish.py Content/2025-12/test-topic/
```

### Testing Blog API

```bash
curl -X POST https://defendre-solutions.vercel.app/api/admin/publish-blog \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_key" \
  -d '{
    "title": "Test Post",
    "excerpt": "Test description",
    "author": "Steve Defendre",
    "date": "2025-12-28",
    "readTime": "1 min read",
    "tags": ["Test"],
    "content": "# Test\n\nTest content."
  }'
```

## Theme System

The app supports **light and dark modes** with automatic system preference detection.

### How It Works

1. **Initialization** (`app/layout.tsx`): An inline script runs before React hydrates to:
   - Check `localStorage` for saved preference (`smm-theme`)
   - Fall back to system preference via `prefers-color-scheme`
   - Set `data-theme` attribute on `<html>` element

2. **CSS Variables** (`app/globals.css`): All colors use CSS custom properties that change based on `html[data-theme="dark"]`

### Key CSS Variables

| Variable | Light | Dark | Usage |
|----------|-------|------|-------|
| `--bg` | `#f6f3ee` | `#0b0f14` | Page background |
| `--surface` | `rgba(255,255,255,0.82)` | `rgba(15,23,42,0.82)` | Cards, panels |
| `--text` | `#1c1b20` | `#f8fafc` | Primary text |
| `--text-muted` | `#5f5f6b` | `#a3b0c2` | Secondary text |
| `--accent` | `#0ea5a4` | `#22d3ee` | Primary accent |
| `--border` | `rgba(24,24,27,0.12)` | `rgba(148,163,184,0.2)` | Borders |

### Utility Classes

```css
/* Text colors */
.text-primary    /* var(--text) */
.text-muted      /* var(--text-muted) */
.text-accent     /* var(--accent) */

/* Backgrounds */
.bg-surface      /* var(--surface) */
.bg-elevated     /* var(--bg-elevated) */
.bg-accent-soft  /* var(--accent-soft) */

/* Borders */
.border-subtle   /* var(--border) */
.border-strong   /* var(--border-strong) */
```

### Background Effects

The app uses mesh gradient backgrounds with floating orbs:
- `.app-shell` - Main container
- `.app-backdrop` - Fixed background with gradients
- `.app-orb` - Animated floating gradient orbs

### Adding Theme Toggle (Future)

```typescript
// Toggle theme
const toggleTheme = () => {
  const current = document.documentElement.dataset.theme
  const next = current === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = next
  localStorage.setItem('smm-theme', next)
}
```

## Key Features

### Web App
- **AI Content Generation**: Gemini-powered content creation
- **Real-time Streaming**: SSE progress updates
- **Preview System**: Rendered/raw markdown views
- **One-click Publishing**: Direct publish to all platforms
- **History Management**: View and reload previous generations
- **Content Calendar**: Drag-and-drop scheduling with date management
- **Light/Dark Theme**: Automatic system preference detection with manual override
- **Settings UI**: Configure API keys in browser
- **Mobile Responsive**: Works on all devices

### CLI Tools
- **Batch Publishing**: Publish to all platforms at once
- **Scheduling Options**: Immediate or scheduled posting
- **Selective Publishing**: Skip specific platforms
- **Content Validation**: Checks for required fields
- **Error Handling**: Detailed error messages
- **Recent Content**: List recent content directories

## Troubleshooting

### Web App Issues

**"Missing Gemini API key"**
- Go to Settings → Add Gemini API key
- Or set `GEMINI_API_KEY` in `.env.local`

**"Publishing failed"**
- Check API keys in Settings
- Verify network connection
- Check browser console for errors

**"Content generation stuck"**
- Refresh the page
- Check Gemini API quota/limits

### CLI Issues

**"API key not configured"**
```bash
# Check config
python3 config.py

# Verify .env.local exists and has keys
cat .env.local
```

**"Module not found"**
```bash
# Install dependencies
pip install requests python-dotenv
```

**"File not found"**
```bash
# List recent content
python3 publish.py --list-recent

# Verify path exists
ls -la Content/2025-12/topic-slug/
```

## Best Practices

### Content Creation
1. **Research first**: Understand the topic thoroughly
2. **Write for audience**: Adapt tone for each platform
3. **SEO optimization**: Include relevant keywords naturally
4. **Visual appeal**: Use formatting, headings, bullet points
5. **Call to action**: Include clear next steps

### Publishing
1. **Review before publishing**: Check content in preview
2. **Schedule strategically**: Use optimal posting times
3. **Test with small posts**: Verify API connections work
4. **Monitor results**: Track engagement and adjust
5. **Archive content**: Keep generated content organized

### File Organization
```
Content/
├── 2025-12/
│   ├── ai-trends/
│   │   ├── blog-post.md
│   │   ├── x-post.txt
│   │   ├── linkedin-post.txt
│   │   └── image.jpg
│   └── web-security/
│       ├── blog-post.md
│       ├── x-post.txt
│       ├── linkedin-post.txt
│       └── image.jpg
└── 2025-01/
    └── ...
```

## Security Notes

- **Never commit `.env.local`** (already in .gitignore)
- **Keep API keys secure** - treat like passwords
- **Use environment variables** - don't hardcode keys
- **Rotate keys regularly** - especially if compromised
- **Limit API key permissions** - use minimum required access

## Additional Resources

- **Blog API Docs**: `docs/blog-publishing-api.md`
- **DefendreSolutions Blog**: https://defendre-solutions.vercel.app/blog
- **Typefully Docs**: https://docs.typefully.com
- **Gemini API Docs**: https://ai.google.dev/docs

---

**Last Updated**: December 29, 2025
**Maintainer**: Steve Defendre (steve.defendre12@gmail.com)
