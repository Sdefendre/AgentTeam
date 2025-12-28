#!/usr/bin/env python3
"""
Generate image and publish content to X and LinkedIn
"""

import base64
import json
import time
import requests
from pathlib import Path

# API Configuration
GEMINI_API_KEY = "AIzaSyCxWBum8Rdx4oeOBl0KGUvNuJXHg04RXcI"
TYPEFULLY_API_KEY = "VxYijn54dDnw5QulI5CAuLeUk29OflHZ"
TYPEFULLY_SOCIAL_SET_ID = "273516"

TYPEFULLY_BASE_URL = "https://api.typefully.com"
# Nano Banana Pro (Gemini 3 Pro Image) - correct endpoint
IMAGE_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent"

HEADERS = {
    "Authorization": f"Bearer {TYPEFULLY_API_KEY}",
    "Content-Type": "application/json"
}

CONTENT_DIR = Path(__file__).parent


def generate_image(prompt: str, output_path: Path) -> bool:
    """Generate an image using Gemini API"""
    full_prompt = f"Generate an image: {prompt}. Style: professional, modern, tech-focused, clean composition, suitable for social media. 1200x630 landscape orientation."
    print(f"Generating image...")

    payload = {
        "contents": [{
            "parts": [{"text": full_prompt}]
        }],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"]
        }
    }

    try:
        response = requests.post(
            f"{IMAGE_API_URL}?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=120
        )
        data = response.json()

        if 'error' in data:
            print(f"Error: {data['error'].get('message', 'Unknown error')}")
            return False

        if 'candidates' not in data or len(data['candidates']) == 0:
            print("Error: No image generated")
            return False

        for part in data['candidates'][0].get('content', {}).get('parts', []):
            if 'inlineData' in part:
                img_data = base64.b64decode(part['inlineData']['data'])
                output_path.parent.mkdir(parents=True, exist_ok=True)
                with open(output_path, 'wb') as f:
                    f.write(img_data)
                print(f"Image saved: {output_path}")
                return True

        print("Error: No image in response")
        return False

    except Exception as e:
        print(f"Error generating image: {e}")
        return False


def upload_image(image_path: Path) -> str:
    """Upload image to Typefully and return media_id"""
    if not image_path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    print(f"Uploading image: {image_path.name}")

    # Step 1: Request upload URL
    response = requests.post(
        f"{TYPEFULLY_BASE_URL}/v2/social-sets/{TYPEFULLY_SOCIAL_SET_ID}/media/upload",
        headers=HEADERS,
        json={"file_name": image_path.name}
    )
    response.raise_for_status()
    upload_data = response.json()

    media_id = upload_data["media_id"]
    upload_url = upload_data["upload_url"]

    # Step 2: Upload file to S3
    with open(image_path, "rb") as f:
        file_data = f.read()

    upload_response = requests.put(upload_url, data=file_data)
    upload_response.raise_for_status()

    # Step 3: Wait for processing
    for _ in range(30):
        status_response = requests.get(
            f"{TYPEFULLY_BASE_URL}/v2/social-sets/{TYPEFULLY_SOCIAL_SET_ID}/media/{media_id}",
            headers=HEADERS
        )
        status_response.raise_for_status()
        status = status_response.json()

        if status.get("status") == "ready":
            print(f"Image uploaded: {media_id}")
            return media_id
        elif status.get("status") == "failed":
            raise Exception(f"Image processing failed: {status}")

        time.sleep(1)

    raise Exception("Image processing timed out")


def publish_to_platform(content: str, platform: str, media_ids: list = None, schedule: str = "now") -> dict:
    """Publish content to a platform"""
    posts = [{"text": content.strip()}]
    if media_ids:
        posts[0]["media_ids"] = media_ids

    payload = {
        "platforms": {
            platform: {
                "enabled": True,
                "posts": posts,
                "settings": {}
            }
        },
        "publish_at": schedule
    }

    response = requests.post(
        f"{TYPEFULLY_BASE_URL}/v2/social-sets/{TYPEFULLY_SOCIAL_SET_ID}/drafts",
        headers=HEADERS,
        json=payload
    )
    response.raise_for_status()
    result = response.json()

    print(f"Published to {platform.upper()}: ID {result.get('id', 'unknown')}")
    return result


def main():
    # Generate image
    image_path = CONTENT_DIR / "image.jpg"
    image_prompt = "Top 5 AI models of 2025, featuring logos or representations of Claude, GPT, Gemini, Grok, and LLaMA arranged in a modern tech visualization with neural network patterns and futuristic design elements"

    image_generated = generate_image(image_prompt, image_path)

    media_ids = []
    if image_generated:
        try:
            media_id = upload_image(image_path)
            media_ids.append(media_id)
        except Exception as e:
            print(f"Warning: Image upload failed: {e}")

    # Read content
    x_content = (CONTENT_DIR / "x-post.txt").read_text().strip()
    linkedin_content = (CONTENT_DIR / "linkedin-post.txt").read_text().strip()

    print(f"\nPublishing to X and LinkedIn immediately...")

    # Publish to X
    try:
        publish_to_platform(x_content, "x", media_ids, "now")
    except Exception as e:
        print(f"Error publishing to X: {e}")

    # Publish to LinkedIn
    try:
        publish_to_platform(linkedin_content, "linkedin", media_ids, "now")
    except Exception as e:
        print(f"Error publishing to LinkedIn: {e}")

    print("\nDone! Check https://typefully.com/drafts")


if __name__ == "__main__":
    main()
