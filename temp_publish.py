#!/usr/bin/env python3
"""
Temporary script to publish Claude Cowork blog post to X and LinkedIn with images
"""

import requests
import json
import base64
import time
import os

# API Keys from .env.local
GEMINI_API_KEY = "AIzaSyBqXqXo0yCyEmftBH2REAAc80EVqh8CXzU"
TYPEFULLY_API_KEY = "VxYijn54dDnw5QulI5CAuLeUk29OflHZ"
TYPEFULLY_SOCIAL_SET_ID = "273516"

# Content
X_POST = """Anthropic just democratized AI agents.

Claude Cowork runs in your Desktop app—give it a folder, describe what you need, and it handles the rest.

50% velocity boost for dev teams. Same potential for everyone else.

→ DefendreSolutions.com/blog/claude-cowork-ai-assistant-everyone"""

LINKEDIN_POST = """The barrier to AI agents just disappeared.

Anthropic launched Claude Cowork yesterday—an autonomous AI assistant built into Claude Desktop for macOS that can read, create, edit, and organize files in designated folders without step-by-step instructions.

What makes this remarkable:
• Built entirely with Claude Code in ~1.5 weeks
• Runs in a sandboxed Linux environment via Apple's Virtualization Framework
• No coding required—just natural language

At Defendre Solutions, we've seen Claude Code deliver 50% velocity increases for development teams. Cowork extends that multiplier to knowledge workers: expense reports from receipt photos, intelligent file organization, scattered notes synthesized into drafts.

The security considerations are real (prompt injection, accidental file operations), but the democratization potential is undeniable. Veterans transitioning to civilian roles. Non-technical professionals. Anyone who works with files.

Read the full analysis: DefendreSolutions.com/blog/claude-cowork-ai-assistant-everyone

What task would you automate first with an AI agent?

#AI #ArtificialIntelligence #ProductivityTools #TechInnovation #FutureOfWork"""


def generate_image(prompt: str, aspect_ratio: str = "16:9") -> bytes:
    """Generate an image using Nano Banana Pro (Gemini 3 Pro Image)"""

    # Use Nano Banana Pro (Gemini 3 Pro Image Preview)
    print("  Using Nano Banana Pro (gemini-3-pro-image-preview)...")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent"

    headers = {
        "x-goog-api-key": GEMINI_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "contents": [{
            "parts": [{"text": f"Generate an image: {prompt}"}]
        }],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
            "imageConfig": {
                "aspectRatio": aspect_ratio,
                "imageSize": "2K"
            }
        }
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.ok:
        data = response.json()
        # Extract image from response
        for candidate in data.get("candidates", []):
            for part in candidate.get("content", {}).get("parts", []):
                if "inlineData" in part:
                    return base64.b64decode(part["inlineData"]["data"])

    # Fallback to Gemini 2.5 Flash Image if Nano Banana Pro fails
    print(f"  Nano Banana Pro failed ({response.status_code}), trying Gemini 2.5 Flash Image...")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key={GEMINI_API_KEY}"

    payload = {
        "contents": [{
            "parts": [{"text": f"Generate an image: {prompt}"}]
        }],
        "generationConfig": {
            "responseModalities": ["image", "text"]
        }
    }

    response = requests.post(url, json=payload)

    if response.ok:
        data = response.json()
        for candidate in data.get("candidates", []):
            for part in candidate.get("content", {}).get("parts", []):
                if "inlineData" in part:
                    return base64.b64decode(part["inlineData"]["data"])

    print(f"  All image models failed. Last error: {response.status_code} - {response.text[:200]}")
    raise Exception("All image generation models failed")


def upload_image_to_typefully(image_bytes: bytes, filename: str = "image.png") -> str:
    """Upload an image to Typefully and return the media_id"""
    import subprocess
    import tempfile

    base_url = "https://api.typefully.com"
    headers = {
        "Authorization": f"Bearer {TYPEFULLY_API_KEY}",
        "Content-Type": "application/json"
    }

    # Step 1: Request upload URL
    upload_response = requests.post(
        f"{base_url}/v2/social-sets/{TYPEFULLY_SOCIAL_SET_ID}/media/upload",
        headers=headers,
        json={"file_name": filename}
    )

    if not upload_response.ok:
        raise Exception(f"Failed to get upload URL: {upload_response.text}")

    upload_data = upload_response.json()
    media_id = upload_data["media_id"]
    upload_url = upload_data["upload_url"]

    print(f"  Got upload URL, media_id: {media_id}")

    # Step 2: Upload to S3 using curl with verbose output to debug
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
        f.write(image_bytes)
        temp_path = f.name

    try:
        # Upload with no extra headers - Typefully's pre-signed URL doesn't expect Content-Type
        curl_cmd = [
            'curl', '-s', '-w', '%{http_code}', '-o', '/tmp/s3_response.txt',
            '-X', 'PUT',
            '-T', temp_path,
            upload_url
        ]
        result = subprocess.run(curl_cmd, capture_output=True, text=True)
        status_code = result.stdout.strip()

        if status_code != '200':
            with open('/tmp/s3_response.txt', 'r') as f:
                error_body = f.read()
            raise Exception(f"S3 upload failed (HTTP {status_code}): {error_body[:300]}")
    finally:
        os.unlink(temp_path)
        if os.path.exists('/tmp/s3_response.txt'):
            os.unlink('/tmp/s3_response.txt')

    print(f"  Uploaded to S3")

    # Step 3: Wait for processing
    for i in range(30):
        time.sleep(1)
        status_response = requests.get(
            f"{base_url}/v2/social-sets/{TYPEFULLY_SOCIAL_SET_ID}/media/{media_id}",
            headers=headers
        )
        status = status_response.json()
        if status.get("status") == "ready":
            print(f"  Image ready!")
            return media_id
        if status.get("status") == "failed":
            raise Exception("Image processing failed")
        print(f"  Waiting for processing... ({i+1}/30)")

    raise Exception("Image processing timed out")


def publish_to_x(content: str, media_ids: list = None, schedule: str = "next-free-slot") -> dict:
    """Publish to X via Typefully"""
    base_url = "https://api.typefully.com"
    headers = {
        "Authorization": f"Bearer {TYPEFULLY_API_KEY}",
        "Content-Type": "application/json"
    }

    posts = [{"text": content.strip()}]
    if media_ids:
        posts[0]["media_ids"] = media_ids

    payload = {
        "platforms": {
            "x": {
                "enabled": True,
                "posts": posts,
                "settings": {}
            }
        },
        "publish_at": schedule
    }

    response = requests.post(
        f"{base_url}/v2/social-sets/{TYPEFULLY_SOCIAL_SET_ID}/drafts",
        headers=headers,
        json=payload
    )

    if not response.ok:
        raise Exception(f"X publishing failed: {response.text}")

    return response.json()


def publish_to_linkedin(content: str, media_ids: list = None, schedule: str = "next-free-slot") -> dict:
    """Publish to LinkedIn via Typefully"""
    base_url = "https://api.typefully.com"
    headers = {
        "Authorization": f"Bearer {TYPEFULLY_API_KEY}",
        "Content-Type": "application/json"
    }

    posts = [{"text": content.strip()}]
    if media_ids:
        posts[0]["media_ids"] = media_ids

    payload = {
        "platforms": {
            "linkedin": {
                "enabled": True,
                "posts": posts,
                "settings": {}
            }
        },
        "publish_at": schedule
    }

    response = requests.post(
        f"{base_url}/v2/social-sets/{TYPEFULLY_SOCIAL_SET_ID}/drafts",
        headers=headers,
        json=payload
    )

    if not response.ok:
        raise Exception(f"LinkedIn publishing failed: {response.text}")

    return response.json()


def test_image_upload():
    """Test image generation and upload to Typefully"""
    print("=" * 60)
    print("Testing Image Upload to Typefully")
    print("=" * 60)

    # Generate a simple test image
    print("\n[1/2] Generating test image...")
    test_prompt = "Abstract digital art with flowing blue and purple waves, modern tech aesthetic, no text"

    try:
        image_bytes = generate_image(test_prompt, "16:9")
        print(f"  ✓ Image generated: {len(image_bytes)} bytes")
    except Exception as e:
        print(f"  ✗ Failed: {e}")
        return

    # Upload to Typefully
    print("\n[2/2] Uploading to Typefully...")
    try:
        media_id = upload_image_to_typefully(image_bytes, "test-image.png")
        print(f"  ✓ Upload successful! Media ID: {media_id}")
    except Exception as e:
        print(f"  ✗ Failed: {e}")
        return

    print("\n" + "=" * 60)
    print("✓ Image upload test passed!")
    print("=" * 60)


def main():
    """Full publishing workflow with image generation"""
    print("=" * 60)
    print("Publishing to X and LinkedIn with Image")
    print("=" * 60)

    # Generate image
    print("\n[1/4] Generating image...")
    image_prompt = """Create a professional hero image for a blog post about "Claude Cowork: AI Agents for Everyone".
    Style: Modern, clean, minimalist tech aesthetic.
    Show a visual metaphor of AI assistance - perhaps abstract digital waves or network connections.
    Colors: Deep blue and cyan accents on dark background.
    No text overlays. Professional and futuristic feel."""

    try:
        image_bytes = generate_image(image_prompt, "16:9")
        print(f"  ✓ Image generated ({len(image_bytes)} bytes)")
    except Exception as e:
        print(f"  ✗ Image generation failed: {e}")
        print("  Continuing without image...")
        image_bytes = None

    # Upload image if generated
    media_id = None
    if image_bytes:
        print("\n[2/4] Uploading image to Typefully...")
        try:
            media_id = upload_image_to_typefully(image_bytes, "post-image.png")
            print(f"  ✓ Media ID: {media_id}")
        except Exception as e:
            print(f"  ✗ Upload failed: {e}")
            print("  Continuing without image...")

    # Publish to X (immediate to avoid scheduling limits)
    print("\n[3/4] Publishing to X...")
    try:
        media_ids = [media_id] if media_id else None
        x_result = publish_to_x(X_POST, media_ids, schedule="now")
        print(f"  ✓ Published to X!")
        print(f"    Draft ID: {x_result.get('id', 'N/A')}")
    except Exception as e:
        print(f"  ✗ Failed: {e}")
        return

    # Publish to LinkedIn
    print("\n[4/4] Publishing to LinkedIn...")
    try:
        media_ids = [media_id] if media_id else None
        linkedin_result = publish_to_linkedin(LINKEDIN_POST, media_ids, schedule="now")
        print(f"  ✓ Published to LinkedIn!")
        print(f"    Draft ID: {linkedin_result.get('id', 'N/A')}")
    except Exception as e:
        print(f"  ✗ Failed: {e}")
        return

    print("\n" + "=" * 60)
    print("✓ Successfully published to both platforms!")
    print("  Check Typefully for posts")
    print("=" * 60)


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "test-image":
        test_image_upload()
    else:
        main()
