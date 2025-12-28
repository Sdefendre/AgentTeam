# Agent Team

A simple web app that generates social media content from a topic.

**Input:** A topic  
**Output:** Blog post + X post + LinkedIn post + Stock image

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Setup

1. Go to **Settings** in the app
2. Add your **Gemini API Key** (required for content generation)
3. Optionally add Typefully API key for social publishing
4. Optionally add Blog API key for blog publishing

### Getting API Keys

| Service | Purpose | Get It |
|---------|---------|--------|
| Gemini | Content generation | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| Typefully | X & LinkedIn publishing | [Typefully Settings](https://typefully.com/settings) |
| Blog API | Blog publishing | Your blog's admin panel |

## Features

- **Content Generation**: Uses Gemini AI to create blog posts, X posts, and LinkedIn posts
- **Stock Images**: Automatically fetches relevant images from Unsplash
- **Publishing**: Publish directly to X, LinkedIn, and your blog
- **Settings**: Save API keys in your browser (localStorage)

## Project Structure

```
├── app/
│   ├── page.tsx              # Main page
│   └── api/
│       ├── generate-content/ # AI content generation
│       ├── publish/          # X & LinkedIn publishing
│       └── publish-blog/     # Blog publishing
├── components/
│   ├── CreateView.tsx        # Topic input form
│   ├── ProgressView.tsx      # Generation progress
│   ├── PreviewView.tsx       # Content preview & publish
│   └── SettingsView.tsx      # API key management
├── store/
│   └── useStore.ts           # App state (Zustand)
└── lib/
    └── utils.ts              # Helper functions
```

## API Endpoints

### POST /api/generate-content

Generate content for a topic.

**Request:**
```json
{
  "topic": "AI automation for small businesses",
  "platforms": ["x", "linkedin"],
  "geminiApiKey": "your-key"
}
```

**Response:**
```json
{
  "success": true,
  "contentId": "content_123",
  "results": {
    "blog": "---\ntitle: ...\n---\n...",
    "x": "AI is changing how...",
    "linkedin": "🚀 AI is transforming...",
    "image": "https://source.unsplash.com/..."
  }
}
```

### POST /api/publish

Publish to X and/or LinkedIn via Typefully.

**Request:**
```json
{
  "xContent": "Your X post",
  "linkedinContent": "Your LinkedIn post",
  "imageUrl": "https://...",
  "typefullyApiKey": "your-key",
  "typefullySocialSetId": "273516"
}
```

### POST /api/publish-blog

Publish a blog post.

**Request:**
```json
{
  "blogContent": "---\ntitle: ...\n---\n...",
  "blogApiKey": "your-key",
  "blogApiUrl": "https://yoursite.com/api/publish"
}
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React + Tailwind CSS
- **State**: Zustand
- **AI**: Google Gemini
- **Publishing**: Typefully API

## Notes

- API keys are stored in your browser's localStorage
- Keys are sent to your own Next.js API routes only
- No data is stored on any server
