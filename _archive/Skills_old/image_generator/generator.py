#!/usr/bin/env python3
"""
Image Generator Skill for DefendreSolutions.com
Uses Nano Banana Pro API for high-quality AI image generation
"""

import os
import sys
import json
import base64
import re
import requests
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, List, Any

# Configuration
# REQUIRED: Set NANO_BANANA_API_KEY or GEMINI_API_KEY environment variable
API_KEY = os.environ.get('NANO_BANANA_API_KEY') or os.environ.get('GEMINI_API_KEY')
if not API_KEY:
    raise ValueError(
        "NANO_BANANA_API_KEY or GEMINI_API_KEY environment variable is required. "
        "Set it in your .env file or export it before running."
    )
MODEL = "nano-banana-pro-preview"
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

# Default output directory
DEFAULT_OUTPUT_DIR = Path("/Users/stevedefendre/Desktop/Agent Team /Content /SteveContentCreation/generated-images")


class Colors:
    """Terminal colors for output"""
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    BLUE = '\033[0;34m'
    YELLOW = '\033[1;33m'
    NC = '\033[0m'


# Topic keywords for auto-matching content to images
TOPIC_KEYWORDS = {
    'claude-code-social.jpg': ['claude', 'claude code', 'ai coding', 'coding assistant', 'code generation'],
    'ai-tools-social.jpg': ['ai tools', 'developer tools', 'copilot', 'cursor', 'dev tools', 'ide'],
    'last-economy-social.jpg': ['economy', 'future of work', 'automation jobs', 'ai economy', 'labor'],
    'grok-5-social.jpg': ['grok', 'xai', 'agi', 'artificial general intelligence', 'elon'],
    'tesla-master-plan-social.jpg': ['tesla', 'optimus', 'robotaxi', 'sustainable', 'electric vehicle'],
    'defense-tech-social.jpg': ['defense', 'military', 'veteran tech', 'cybersecurity', 'national security'],
    'ai-ethics-social.jpg': ['ethics', 'responsible ai', 'ai safety', 'bias', 'fairness'],
}

# Blog post configurations with prompts
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
    # Social media specific templates
    'ai-automation': {
        'title': 'AI Automation',
        'images': [
            ('ai-automation-social', 'Modern business office with glowing automated workflows flowing between computers and robots, efficiency and productivity visualization, clean professional aesthetic, blue and white color scheme, photorealistic'),
        ]
    },
    'small-business': {
        'title': 'Small Business Tech',
        'images': [
            ('small-business-social', 'Confident small business owner at laptop with holographic growth charts and AI tools floating around, warm inviting atmosphere, success and empowerment theme, photorealistic'),
        ]
    },
    'veteran-tech': {
        'title': 'Veteran in Tech',
        'images': [
            ('veteran-tech-social', 'Military veteran transitioning to tech, standing between military past and tech future, discipline meets innovation, patriotic undertones with modern tech aesthetic, inspiring composition, photorealistic'),
        ]
    },
}


class ImageGenerator:
    """Main image generator class for integration with other skills"""

    def __init__(self, output_dir: Optional[Path] = None, api_key: Optional[str] = None):
        self.output_dir = Path(output_dir) if output_dir else DEFAULT_OUTPUT_DIR
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.api_key = api_key or API_KEY

    def generate(self, prompt: str, filename: str, max_retries: int = 3) -> Dict[str, Any]:
        """
        Generate an image from a prompt.

        Args:
            prompt: Text description of the image to generate
            filename: Output filename (without extension)
            max_retries: Number of retry attempts on failure

        Returns:
            {"success": True, "path": "/path/to/image.jpg"} or
            {"success": False, "error": "error message"}
        """
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

        for attempt in range(max_retries):
            try:
                response = requests.post(
                    f"{API_URL}?key={self.api_key}",
                    headers={"Content-Type": "application/json"},
                    json=payload,
                    timeout=120
                )
                data = response.json()

                if 'error' in data:
                    error_msg = data['error'].get('message', 'Unknown error')
                    if attempt < max_retries - 1:
                        print(f"{Colors.YELLOW}Retry {attempt + 1}/{max_retries}: {error_msg}{Colors.NC}")
                        continue
                    return {"success": False, "error": error_msg}

                if 'candidates' not in data or len(data['candidates']) == 0:
                    if attempt < max_retries - 1:
                        continue
                    return {"success": False, "error": "No candidates in response"}

                # Look for image data
                for part in data['candidates'][0].get('content', {}).get('parts', []):
                    if 'inlineData' in part:
                        mime_type = part['inlineData'].get('mimeType', 'image/png')
                        img_data = base64.b64decode(part['inlineData']['data'])
                        ext = 'png' if 'png' in mime_type else 'jpg'
                        filepath = self.output_dir / f"{filename}.{ext}"

                        with open(filepath, 'wb') as f:
                            f.write(img_data)

                        print(f"{Colors.GREEN}Saved: {filepath}{Colors.NC}\n")
                        return {"success": True, "path": str(filepath)}

                # No image found in response
                if attempt < max_retries - 1:
                    continue
                return {"success": False, "error": "No image in API response"}

            except requests.exceptions.RequestException as e:
                if attempt < max_retries - 1:
                    print(f"{Colors.YELLOW}Retry {attempt + 1}/{max_retries}: {e}{Colors.NC}")
                    continue
                return {"success": False, "error": f"Request error: {e}"}
            except Exception as e:
                return {"success": False, "error": str(e)}

        return {"success": False, "error": "Max retries exceeded"}

    def generate_blog_images(self, post_name: str) -> Dict[str, Any]:
        """
        Generate all images for a blog post.

        Args:
            post_name: Name of the blog post (e.g., 'claude-code', 'ai-tools')

        Returns:
            {"success": True, "images": ["image1.jpg", "image2.jpg"]} or
            {"success": False, "error": "message"}
        """
        if post_name not in BLOG_POSTS:
            return {
                "success": False,
                "error": f"Unknown blog post: {post_name}",
                "available": list(BLOG_POSTS.keys())
            }

        post = BLOG_POSTS[post_name]
        print(f"{Colors.YELLOW}=== {post['title']} ==={Colors.NC}\n")

        generated_images = []
        for filename, prompt in post['images']:
            result = self.generate(prompt, filename)
            if result['success']:
                generated_images.append(Path(result['path']).name)

        if generated_images:
            return {"success": True, "images": generated_images}
        return {"success": False, "error": "Failed to generate any images"}

    def find_existing_image(self, topic: str) -> Optional[str]:
        """
        Find an existing image that matches the topic.

        Args:
            topic: Topic or keywords to match

        Returns:
            Path to matching image or None
        """
        topic_lower = topic.lower()

        # Check each image's keywords
        for image_name, keywords in TOPIC_KEYWORDS.items():
            for keyword in keywords:
                if keyword in topic_lower or topic_lower in keyword:
                    image_path = self.output_dir / image_name
                    if image_path.exists():
                        return str(image_path)

        # Try direct filename match
        for pattern in ['*social*.jpg', '*social*.png']:
            for file in self.output_dir.glob(pattern):
                # Extract topic from filename
                file_topic = file.stem.replace('-social', '').replace('-', ' ')
                if file_topic in topic_lower or topic_lower in file_topic:
                    return str(file)

        return None

    def generate_for_post(self, post_content: str, force_generate: bool = False) -> Dict[str, Any]:
        """
        Generate or find an appropriate image for social post content.

        Args:
            post_content: The text content of the social media post
            force_generate: If True, always generate new image even if match exists

        Returns:
            {"success": True, "path": "/path/to/image.jpg", "generated": True/False} or
            {"success": False, "error": "message"}
        """
        # Extract key topics from content
        content_lower = post_content.lower()

        # Try to find existing image first (unless force_generate)
        if not force_generate:
            existing = self.find_existing_image(content_lower)
            if existing:
                print(f"{Colors.GREEN}Found existing image: {existing}{Colors.NC}")
                return {"success": True, "path": existing, "generated": False}

        # Determine best topic based on content
        best_topic = self._detect_topic(content_lower)

        # Check if we have a blog post template for this topic
        if best_topic and best_topic in BLOG_POSTS:
            # Generate the social image for this topic
            post_config = BLOG_POSTS[best_topic]
            for filename, prompt in post_config['images']:
                if 'social' in filename:
                    result = self.generate(prompt, filename)
                    if result['success']:
                        result['generated'] = True
                        return result

        # Generate a custom image based on content
        prompt = self._create_prompt_from_content(post_content)
        filename = f"post-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        result = self.generate(prompt, filename)
        if result['success']:
            result['generated'] = True
        return result

    def _detect_topic(self, content: str) -> Optional[str]:
        """Detect the main topic from content"""
        topic_scores = {}

        for image_name, keywords in TOPIC_KEYWORDS.items():
            score = 0
            for keyword in keywords:
                if keyword in content:
                    score += len(keyword)  # Longer matches score higher
            if score > 0:
                # Map image name to blog post name
                post_name = image_name.replace('-social.jpg', '')
                topic_scores[post_name] = score

        # Also check blog post titles
        for post_name, config in BLOG_POSTS.items():
            title_lower = config['title'].lower()
            if title_lower in content or post_name.replace('-', ' ') in content:
                topic_scores[post_name] = topic_scores.get(post_name, 0) + 10

        if topic_scores:
            return max(topic_scores, key=topic_scores.get)
        return None

    def _create_prompt_from_content(self, content: str) -> str:
        """Create an image generation prompt from post content"""
        # Extract key themes
        themes = []

        if any(word in content.lower() for word in ['ai', 'artificial intelligence', 'automation']):
            themes.append('AI technology')
        if any(word in content.lower() for word in ['business', 'company', 'startup']):
            themes.append('business')
        if any(word in content.lower() for word in ['veteran', 'military', 'service']):
            themes.append('veteran')
        if any(word in content.lower() for word in ['code', 'developer', 'software']):
            themes.append('software development')

        theme_str = ' and '.join(themes) if themes else 'technology and business'

        return f"Professional social media image representing {theme_str}, modern minimalist style, clean composition, blue and white color scheme with subtle accents, optimized for social media sharing, photorealistic"

    def list_images(self) -> Dict[str, List[str]]:
        """List all available images organized by type"""
        images = {"hero": [], "social": [], "other": []}

        for file in sorted(self.output_dir.glob('*.jpg')) + sorted(self.output_dir.glob('*.png')):
            if '-hero' in file.stem:
                images["hero"].append(file.name)
            elif '-social' in file.stem:
                images["social"].append(file.name)
            else:
                images["other"].append(file.name)

        return images


# CLI Interface
def show_usage():
    """Show usage information"""
    print(f"{Colors.YELLOW}Image Generator for DefendreSolutions.com{Colors.NC}")
    print()
    print("Usage: python generator.py <command> [options]")
    print()
    print("Commands:")
    print("  blog <post-name>     Generate images for a specific blog post")
    print("  all                  Generate images for all blog posts")
    print('  custom "prompt"      Generate a custom image')
    print('  post "content"       Generate image for social post content')
    print('  find "topic"         Find existing image for topic')
    print("  list                 List all available images")
    print()
    print("Available blog posts:")
    print(f"  {', '.join(BLOG_POSTS.keys())}")
    print()
    print("Examples:")
    print("  python generator.py blog claude-code")
    print("  python generator.py all")
    print('  python generator.py custom "cybersecurity shield"')
    print('  python generator.py post "AI is transforming small business..."')
    print('  python generator.py find "ai coding"')


def main():
    gen = ImageGenerator()

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
            print(f"Available: {', '.join(BLOG_POSTS.keys())}")
            return 1
        result = gen.generate_blog_images(sys.argv[2])
        return 0 if result['success'] else 1

    elif command == 'all':
        print(f"{Colors.YELLOW}{'='*40}{Colors.NC}")
        print(f"{Colors.YELLOW}  Generating All Blog Post Images{Colors.NC}")
        print(f"{Colors.YELLOW}{'='*40}{Colors.NC}\n")

        for post_name in BLOG_POSTS:
            gen.generate_blog_images(post_name)
            print(f"{Colors.YELLOW}{'-'*40}{Colors.NC}\n")

        print(f"\n{Colors.GREEN}Generation complete!{Colors.NC}")
        return 0

    elif command == 'custom':
        if len(sys.argv) < 3:
            print(f"{Colors.RED}Error: Missing prompt{Colors.NC}")
            return 1
        filename = f"custom-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        result = gen.generate(sys.argv[2], filename)
        return 0 if result['success'] else 1

    elif command == 'post':
        if len(sys.argv) < 3:
            print(f"{Colors.RED}Error: Missing post content{Colors.NC}")
            return 1
        result = gen.generate_for_post(sys.argv[2])
        if result['success']:
            print(f"Image: {result['path']}")
            print(f"Generated: {result.get('generated', False)}")
        return 0 if result['success'] else 1

    elif command == 'find':
        if len(sys.argv) < 3:
            print(f"{Colors.RED}Error: Missing topic{Colors.NC}")
            return 1
        image = gen.find_existing_image(sys.argv[2])
        if image:
            print(f"{Colors.GREEN}Found: {image}{Colors.NC}")
            return 0
        else:
            print(f"{Colors.YELLOW}No matching image found{Colors.NC}")
            return 1

    elif command == 'list':
        images = gen.list_images()
        print(f"{Colors.YELLOW}Available Images:{Colors.NC}")
        print(f"\n{Colors.BLUE}Hero images (for blog):{Colors.NC}")
        for img in images['hero']:
            print(f"  - {img}")
        print(f"\n{Colors.BLUE}Social images (for X/LinkedIn):{Colors.NC}")
        for img in images['social']:
            print(f"  - {img}")
        if images['other']:
            print(f"\n{Colors.BLUE}Other images:{Colors.NC}")
            for img in images['other']:
                print(f"  - {img}")
        return 0

    else:
        print(f"{Colors.RED}Unknown command: {command}{Colors.NC}")
        show_usage()
        return 1


if __name__ == '__main__':
    sys.exit(main())
