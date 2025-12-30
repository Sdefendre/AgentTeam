# Social Media Manager Agent

A modern web app that generates social media content from any topic using AI. Built with Next.js 16 and powered by Claude Opus 4.5.

**Input:** A topic
**Output:** Blog post + X post + LinkedIn post + AI-generated hero image

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Setup

1. Go to **Settings** in the app
2. Add your **Anthropic API Key** (required for Claude)
3. Add your **Google API Key** (required for image generation)
4. Add your **Brave Search API Key** (required for research)
5. Optionally add Typefully API key for X/LinkedIn publishing
6. Optionally add Blog API key for blog publishing

### Getting API Keys

| Service | Purpose | Get It |
|---------|---------|--------|
| Anthropic (Claude) | AI content generation | [Anthropic Console](https://console.anthropic.com/settings/keys) |
| Google (Imagen) | AI image generation | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| Brave Search | Web research for accuracy | [Brave Search API](https://brave.com/search/api/) |
| Typefully | X & LinkedIn publishing | [Typefully Settings](https://typefully.com/settings) |
| Blog API | Blog publishing | Your blog's admin panel |

## Features

### Content Generation
- **AI-Powered Content**: Uses Claude Opus 4.5 to create optimized blog posts, X posts, and LinkedIn posts
- **AI Image Generation**: Google Imagen (Nano Banana Pro) creates professional, contextual hero images for every post
- **Web Research**: Brave Search API integration ensures content accuracy with real-time research before writing
- **Topic Suggestions**: Claude recommends relevant, cutting-edge topics based on DefendreSolutions.com's focus areas and latest AI trends
- **Real-time Progress**: Live SSE streaming shows generation progress for each content type

### Content Preview
- **Tabbed Interface**: Switch between Blog, X, LinkedIn, and Image previews
- **Rendered/Raw Toggle**: View content as formatted markdown or raw source
- **Copy as Markdown**: One-click copy of blog content in markdown format
- **Styled Markdown Rendering**: Custom typography for headings, lists, code blocks, blockquotes, and links
- **Blog Frontmatter Parsing**: Automatic extraction and display of title, description, and tags

### Publishing
- **X (Twitter)**: Publish directly via Typefully API (includes DefendreSolutions.com CTA)
- **LinkedIn**: Publish directly via Typefully API (includes DefendreSolutions.com CTA)
- **Blog**: Publish to your custom blog endpoint
- **Safety Confirmation**: Red confirmation modal prevents accidental publishing

### History & Persistence
- **Post History**: View and reload up to 50 previous generations
- **Browser Storage**: API keys and history saved in localStorage
- **Session Persistence**: Resume previous work across browser sessions

### Content Calendar
- **Drag-and-Drop Scheduling**: Drag content from history onto calendar dates
- **Visual Status Indicators**: Draft, scheduled, and published states
- **Month Navigation**: Browse through months with today quick-jump
- **Responsive Grid**: Adapts to viewport size

### User Experience
- **Light/Dark Theme**: Automatic system preference detection with localStorage persistence
- **Mobile Responsive**: Optimized layouts for all device sizes
- **Real-time Validation**: API key warnings and error handling
- **Modern Glass UI**: Glassmorphism design with mesh gradient backgrounds
- **Animated Backgrounds**: Floating gradient orbs and subtle grid overlays
- **Gradient Buttons**: Beautiful platform-specific gradient buttons with hover effects
- **Changelog Page**: Track all updates and improvements at `/changelog`

## Project Structure

```
├── app/
│   ├── page.tsx              # Main page with view routing
│   ├── layout.tsx            # Root layout + theme initialization
│   ├── globals.css           # Theme system + CSS variables
│   ├── changelog/
│   │   └── page.tsx          # Changelog page
│   └── api/
│       ├── generate-content/ # AI content generation with research (SSE)
│       ├── suggest-topics/   # AI-powered topic suggestions
│       ├── publish/          # X & LinkedIn publishing
│       ├── publish-blog/     # Blog publishing
│       └── settings/         # Environment variable fallbacks
├── components/
│   ├── CreateView.tsx        # Topic input, platform selection, topic suggestions
│   ├── ProgressView.tsx      # Real-time generation progress
│   ├── PreviewView.tsx       # Tabbed content preview & publishing
│   ├── HistoryView.tsx       # Post history management
│   ├── CalendarView.tsx      # Drag-and-drop content calendar
│   ├── SettingsView.tsx      # API key configuration
│   └── PlatformPreviews/
│       ├── XPreviewCard.tsx       # Pixel-perfect X/Twitter preview
│       └── LinkedInPreviewCard.tsx # Pixel-perfect LinkedIn preview
├── store/
│   └── useStore.ts           # Zustand global state
├── lib/
│   └── utils.ts              # Utility functions
└── public/                   # Static assets
```

## Theme System

The app supports **light and dark modes** with automatic system preference detection.

- **Auto-detection**: Uses `prefers-color-scheme` media query on first load
- **Persistence**: Theme choice saved to `localStorage` as `smm-theme`
- **No flash**: Theme applied via inline script before React hydrates
- **CSS Variables**: All colors defined as custom properties in `globals.css`

Theme is controlled via `data-theme` attribute on `<html>`:
```html
<html data-theme="light">  <!-- or "dark" -->
```

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | React framework with App Router |
| React | 19.2.3 | UI library |
| Tailwind CSS | 4.x | Utility-first styling |
| Zustand | 5.0.9 | Lightweight state management |
| @dnd-kit | 6.x | Drag-and-drop for calendar |
| date-fns | 4.x | Date manipulation |
| react-markdown | 10.1.0 | Markdown rendering |
| Claude Opus 4.5 | Latest | AI content generation |
| Google Imagen | Latest | AI image generation (Nano Banana Pro) |
| Brave Search API | - | Web research for accuracy |
| Typefully API | - | Social media publishing |

## Environment Variables

Create a `.env.local` file for server-side API keys (optional, can use Settings UI instead):

```env
# Required for content generation
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_API_KEY=your_google_api_key
BRAVE_SEARCH_API_KEY=your_brave_search_api_key

# Optional for publishing
TYPEFULLY_API_KEY=your_typefully_api_key
TYPEFULLY_SOCIAL_SET_ID=your_social_set_id
BLOG_API_KEY=your_blog_api_key
BLOG_API_URL=https://your-blog.com/api
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## License

MIT
