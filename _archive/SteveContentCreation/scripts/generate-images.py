#!/usr/bin/env python3
"""
Image Generator for DefendreSolutions.com Blog Posts
Uses Google Gemini Image Generation API
"""

import os
import sys
import json
import base64
import requests
from pathlib import Path

# Configuration
# REQUIRED: Set GEMINI_API_KEY environment variable
API_KEY = os.environ.get('GEMINI_API_KEY')
if not API_KEY:
    raise ValueError(
        "GEMINI_API_KEY environment variable is required. "
        "Set it in your .env file or export it before running."
    )
MODEL = "nano-banana-pro-preview"  # High quality image generation model
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
OUTPUT_DIR = Path(os.environ.get('OUTPUT_DIR', './generated-images'))

# Create output directory
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Colors
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    BLUE = '\033[0;34m'
    YELLOW = '\033[1;33m'
    NC = '\033[0m'

def generate_image(prompt: str, filename: str) -> bool:
    """Generate an image using Gemini API"""
    print(f"{Colors.BLUE}Generating: {filename}{Colors.NC}")
    print(f"Prompt: {prompt[:80]}...")

    payload = {
        "contents": [{
            "parts": [{"text": f"Generate an image: {prompt}"}]
        }],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"]
        }
    }

    try:
        response = requests.post(
            f"{API_URL}?key={API_KEY}",
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=120
        )
        data = response.json()

        if 'error' in data:
            print(f"{Colors.RED}Error: {data['error'].get('message', 'Unknown error')}{Colors.NC}")
            return False

        if 'candidates' not in data or len(data['candidates']) == 0:
            print(f"{Colors.RED}No candidates in response{Colors.NC}")
            return False

        # Look for image data
        for part in data['candidates'][0].get('content', {}).get('parts', []):
            if 'inlineData' in part:
                mime_type = part['inlineData'].get('mimeType', 'image/png')
                img_data = base64.b64decode(part['inlineData']['data'])
                ext = 'png' if 'png' in mime_type else 'jpg'
                filepath = OUTPUT_DIR / f"{filename}.{ext}"

                with open(filepath, 'wb') as f:
                    f.write(img_data)

                print(f"{Colors.GREEN}Saved: {filepath}{Colors.NC}\n")
                return True

        # No image found
        print(f"{Colors.YELLOW}No image in response. Text response:{Colors.NC}")
        for part in data['candidates'][0].get('content', {}).get('parts', []):
            if 'text' in part:
                print(part['text'][:300])
        return False

    except requests.exceptions.RequestException as e:
        print(f"{Colors.RED}Request error: {e}{Colors.NC}")
        return False
    except Exception as e:
        print(f"{Colors.RED}Error: {e}{Colors.NC}")
        return False

# Blog post prompts
BLOG_POSTS = {
    'last-economy': {
        'title': 'The Last Economy',
        'images': [
            ('last-economy-hero', 'Futuristic digital landscape showing transition from traditional human economy to AI powered abundance, split composition with classic city on left transforming into luminous AI integrated utopia on right, flowing data streams connecting both sides, warm golden hour lighting meeting cool blue digital glow, cinematic wide shot, professional business technology aesthetic, photorealistic'),
            ('last-economy-social', 'Abstract visualization of Intelligence Inversion concept, human silhouette surrounded by expanding rings of AI neural networks, balance between human warmth with orange and gold tones and AI precision with blue and silver colors, minimalist professional style, centered composition'),
        ]
    },
    'claude-code': {
        'title': 'Claude Code Blog',
        'images': [
            ('claude-code-hero', 'Professional software developer veteran working with glowing holographic AI coding assistant, modern tech office environment, warm lighting showing collaboration between human expertise and AI tools, cinematic composition, photorealistic'),
            ('claude-code-social', 'Abstract art of code transformation, flowing lines of beautiful code in patriotic colors navy blue silver and subtle red accents, modern minimalist tech aesthetic, professional style'),
        ]
    },
    'tesla': {
        'title': 'Tesla Master Plan',
        'images': [
            ('tesla-master-plan-hero', 'Futuristic Tesla ecosystem visualization with interconnected autonomous electric vehicles, humanoid robots, and massive solar panel and battery storage infrastructure, flowing energy lines connecting all elements, sleek white silver and electric blue color palette, cinematic sci-fi realism, photorealistic'),
            ('tesla-master-plan-social', 'Elegant humanoid robot hand gently holding a glowing planet Earth, clean renewable energy symbols orbiting around, minimalist white background, professional corporate futurism aesthetic'),
        ]
    },
    'grok-5': {
        'title': 'Grok 5 / xAI',
        'images': [
            ('grok-5-hero', 'Software developer standing at edge of digital horizon where programming code transforms into conscious thought patterns and neural networks, dark dramatic background with bright glowing AI visualizations, cinematic lighting, contemplative futuristic mood, photorealistic'),
            ('grok-5-social', 'Abstract visualization of artificial general intelligence emergence, human brain seamlessly merging with advanced AI neural network architecture, deep space black background with electric blue and bright white accents, professional tech editorial style'),
        ]
    },
    'ai-tools': {
        'title': 'AI Development Tools',
        'images': [
            ('ai-tools-hero', 'Professional developer workspace surrounded by floating holographic AI tool interfaces, streams of code flowing between glowing screens, modern minimalist office with plants, warm productive atmosphere with cool blue technology accents, photorealistic'),
            ('ai-tools-social', 'Abstract digital toolbox opening to reveal glowing AI symbols and beautiful code snippets, gradient background from deep purple to bright blue, clean modern tech illustration style'),
        ]
    },
    'defense-tech': {
        'title': 'Defense Technology',
        'images': [
            ('defense-tech-hero', 'Futuristic military command center with large holographic displays showing AI powered threat analysis maps, cyber defense network visualizations, professional serious atmosphere, blue and green accent lighting, cinematic, photorealistic'),
            ('defense-tech-social', 'Protective digital shield composed of circuit board patterns and binary code, representing cyber defense, dark navy blue background with glowing cyan accents, professional military technology aesthetic'),
        ]
    },
    'ai-ethics': {
        'title': 'AI Ethics',
        'images': [
            ('ai-ethics-hero', 'Balanced golden scales held jointly by elegant robotic hand and human hand, one side holding glowing AI microchip, other side holding heart symbol representing ethics and humanity, soft neutral background, warm hopeful lighting, photorealistic'),
            ('ai-ethics-social', 'AI neural network pattern forming shape of classic compass, suggesting ethical direction and moral guidance, clean minimalist design, professional blue and gold color scheme'),
        ]
    },
    'after-scarcity': {
        'title': 'After Scarcity',
        'images': [
            ('after-scarcity-hero', 'Beautiful utopian futuristic city where abundance is visible everywhere, vertical urban farms on skyscrapers, clean renewable energy infrastructure, automated robotic production, diverse citizens walking in green spaces, warm hopeful golden hour lighting, photorealistic'),
        ]
    },
    'dreamguard': {
        'title': 'DreamGuard Sleep Tech',
        'images': [
            ('dreamguard-hero', 'Serene modern bedroom with subtle holographic sleep monitoring visualization floating above peacefully sleeping person, soft purple and blue ambient lighting, advanced but calming health technology integration, dreamy soft focus atmosphere, photorealistic'),
        ]
    },
    'pulsepod': {
        'title': 'PulsePod Health Scanner',
        'images': [
            ('pulsepod-hero', 'Sleek futuristic handheld medical scanning device being used on person, holographic health data visualization floating around them showing vitals and diagnostic information, clean white medical environment with soft blue accents, professional product photography style, photorealistic'),
        ]
    },
}

def generate_blog_images(post_name: str) -> int:
    """Generate images for a specific blog post"""
    if post_name not in BLOG_POSTS:
        print(f"{Colors.RED}Unknown blog post: {post_name}{Colors.NC}")
        print(f"Available: {', '.join(BLOG_POSTS.keys())}")
        return 1

    post = BLOG_POSTS[post_name]
    print(f"{Colors.YELLOW}=== {post['title']} ==={Colors.NC}\n")

    success_count = 0
    for filename, prompt in post['images']:
        if generate_image(prompt, filename):
            success_count += 1

    return 0 if success_count > 0 else 1

def generate_all() -> int:
    """Generate images for all blog posts"""
    print(f"{Colors.YELLOW}{'='*40}{Colors.NC}")
    print(f"{Colors.YELLOW}  Generating All Blog Post Images{Colors.NC}")
    print(f"{Colors.YELLOW}{'='*40}{Colors.NC}\n")

    total_success = 0
    for post_name in BLOG_POSTS:
        if generate_blog_images(post_name) == 0:
            total_success += 1
        print(f"{Colors.YELLOW}{'-'*40}{Colors.NC}\n")

    print(f"\n{Colors.GREEN}Generation complete!{Colors.NC}")
    print(f"Output directory: {Colors.BLUE}{OUTPUT_DIR}{Colors.NC}")

    # List generated files
    files = list(OUTPUT_DIR.glob('*.png')) + list(OUTPUT_DIR.glob('*.jpg'))
    if files:
        print(f"\nGenerated {len(files)} images:")
        for f in sorted(files):
            print(f"  - {f.name}")

    return 0

def generate_custom(prompt: str) -> int:
    """Generate a custom image"""
    from datetime import datetime
    filename = f"custom-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    return 0 if generate_image(prompt, filename) else 1

def show_usage():
    """Show usage information"""
    print(f"{Colors.YELLOW}Image Generator for DefendreSolutions.com{Colors.NC}")
    print()
    print("Usage: python generate-images.py <command> [options]")
    print()
    print("Commands:")
    print("  blog <post-name>     Generate images for a specific blog post")
    print("  all                  Generate images for all recent blog posts")
    print('  custom "prompt"      Generate a custom image')
    print()
    print("Available blog posts:")
    print(f"  {', '.join(BLOG_POSTS.keys())}")
    print()
    print("Examples:")
    print("  python generate-images.py blog last-economy")
    print("  python generate-images.py all")
    print('  python generate-images.py custom "cybersecurity shield"')

def main():
    if len(sys.argv) < 2:
        show_usage()
        return 0

    command = sys.argv[1]

    if command in ['-h', '--help', 'help']:
        show_usage()
        return 0
    elif command == 'blog':
        if len(sys.argv) < 3:
            print(f"{Colors.RED}Error: Missing blog post name{Colors.NC}")
            return 1
        return generate_blog_images(sys.argv[2])
    elif command == 'all':
        return generate_all()
    elif command == 'custom':
        if len(sys.argv) < 3:
            print(f"{Colors.RED}Error: Missing prompt{Colors.NC}")
            return 1
        return generate_custom(sys.argv[2])
    else:
        print(f"{Colors.RED}Unknown command: {command}{Colors.NC}")
        show_usage()
        return 1

if __name__ == '__main__':
    sys.exit(main())
