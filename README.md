# Agent Team

Social media content pipeline for **DefendreSolutions.com** and **@sdefendre**.

One topic → Blog post + X post + LinkedIn post + AI image → Published to all platforms.

## Quick Start

```
User: "Write about [topic]"
```

The social-media-manager agent will:
1. Research the topic
2. Write a blog post (800-1500 words)
3. Generate an AI image
4. Adapt content for X (Twitter)
5. Adapt content for LinkedIn
6. Publish to all platforms

## File Structure

```
Agent Team/
├── config.py              # API keys and settings
├── publish.py             # Publishing script
├── SKILL.md               # Master reference document
├── .claude/agents/
│   └── social-media-manager.md

└── Content/
    └── YYYY-MM/
        └── topic-slug/
            ├── blog-post.md
            ├── x-post.txt
            ├── linkedin-post.txt
            └── image.jpg
```

## Key Paths

| Purpose | Path |
|---------|------|
| Content Archive | `Content/YYYY-MM/topic-slug/` |
| Blog Production | `/Users/stevedefendre/Desktop/Code/Active Projects/code/DefendreSolutions/blog_posts/` |

Blog posts are saved to BOTH locations.

## Manual Publishing

```bash
# Publish content from a topic folder
python3 publish.py Content/2024-12/topic-slug/ -s next-free-slot

# Publish immediately
python3 publish.py Content/2024-12/topic-slug/ -s now

# Publish to X only
python3 publish.py Content/2024-12/topic-slug/ -p x

# List recent content
python3 publish.py --list-recent
```

## Content Formats

### X (Twitter)
- Hook first line
- Short, punchy sentences
- Line breaks for readability
- Thread format: separate with `\n\n\n\n`
- CTA at end
- No hashtags (or 1-2 max)

### LinkedIn
- First line hooks before "see more"
- Professional storytelling
- 1000-1500 characters
- End with engaging question
- 3-5 hashtags at bottom

### Blog
- 800-1500 words
- SEO title with keyword
- H2/H3 structure
- Meta description
- CTA in conclusion

## APIs

- **Nano Banana Pro**: AI image generation
- **Typefully**: Publishing to X and LinkedIn

## Configuration

**IMPORTANT**: API keys are now required via environment variables for security. No hardcoded keys are allowed.

### Setup Environment Variables

Create a `.env` file in the project root (it's gitignored):

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your actual API keys
```

Or export them in your shell:

```bash
export NANO_BANANA_API_KEY="your-key"
export TYPEFULLY_API_KEY="your-key"
# OR use GEMINI_API_KEY instead of NANO_BANANA_API_KEY
export GEMINI_API_KEY="your-key"
```

**Required Environment Variables:**
- `NANO_BANANA_API_KEY` or `GEMINI_API_KEY` - For AI image generation
- `TYPEFULLY_API_KEY` - For social media publishing

The application will fail with a clear error message if these are not set.

## Documentation

See `SKILL.md` for complete reference including:
- Content format specifications
- API documentation
- Troubleshooting guide
