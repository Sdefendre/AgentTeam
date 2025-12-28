#!/usr/bin/env python3
"""
Typefully API Integration for X Post Creator Skill
Posts to X and LinkedIn with image support for @sdefendre
"""

import os
import requests
import json
import sys
import time
from pathlib import Path

# REQUIRED: Set TYPEFULLY_API_KEY environment variable
API_KEY = os.environ.get('TYPEFULLY_API_KEY')
if not API_KEY:
    raise ValueError(
        "TYPEFULLY_API_KEY environment variable is required. "
        "Set it in your .env file or export it before running."
    )
BASE_URL = "https://api.typefully.com"
SOCIAL_SET_ID = "273516"  # @Sdefendre

# Image paths
IMAGES_DIR = Path("/Users/stevedefendre/Desktop/Agent Team /Content /SteveContentCreation/generated-images")

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}


def get_social_sets():
    """Get all connected social accounts"""
    response = requests.get(f"{BASE_URL}/v2/social-sets", headers=HEADERS)
    response.raise_for_status()
    return response.json()


def upload_image(image_path: str) -> str:
    """
    Upload an image to Typefully and return the media_id

    Args:
        image_path: Path to the image file

    Returns:
        media_id string for attaching to posts
    """
    image_path = Path(image_path)

    if not image_path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    # Step 1: Request upload URL
    payload = {"file_name": image_path.name}
    response = requests.post(
        f"{BASE_URL}/v2/social-sets/{SOCIAL_SET_ID}/media/upload",
        headers=HEADERS,
        json=payload
    )
    response.raise_for_status()
    upload_data = response.json()

    media_id = upload_data["media_id"]
    upload_url = upload_data["upload_url"]

    # Step 2: Upload file to S3 (presigned URL - no extra headers needed)
    with open(image_path, "rb") as f:
        file_data = f.read()

    upload_response = requests.put(upload_url, data=file_data)
    upload_response.raise_for_status()

    # Step 3: Wait for processing
    for _ in range(30):  # Max 30 seconds
        status_response = requests.get(
            f"{BASE_URL}/v2/social-sets/{SOCIAL_SET_ID}/media/{media_id}",
            headers=HEADERS
        )
        status_response.raise_for_status()
        status = status_response.json()

        if status.get("status") == "ready":
            return media_id
        elif status.get("status") == "failed":
            raise Exception(f"Image processing failed: {status}")

        time.sleep(1)

    raise Exception("Image processing timed out")


def create_draft(content: str, schedule: str = None, image_path: str = None,
                 platforms: dict = None):
    """
    Create a draft on Typefully

    Args:
        content: The post content (use \\n\\n\\n\\n for thread breaks)
        schedule: 'now', 'next-free-slot', ISO datetime, or None for draft
        image_path: Optional path to image file
        platforms: Dict specifying which platforms to post to
                  Default: {"x": True, "linkedin": False}

    Returns:
        API response with draft details
    """
    if platforms is None:
        platforms = {"x": True, "linkedin": False}

    # Upload image if provided
    media_ids = []
    if image_path:
        print(f"Uploading image: {image_path}")
        media_id = upload_image(image_path)
        media_ids.append(media_id)
        print(f"Image uploaded: {media_id}")

    # Split content into thread posts if there are thread separators
    posts = []
    if "\n\n\n\n" in content:
        thread_parts = content.split("\n\n\n\n")
        for i, part in enumerate(thread_parts):
            if part.strip():
                post = {"text": part.strip()}
                # Attach image to first post only
                if i == 0 and media_ids:
                    post["media_ids"] = media_ids
                posts.append(post)
    else:
        post = {"text": content.strip()}
        if media_ids:
            post["media_ids"] = media_ids
        posts = [post]

    # Build platform config
    platform_config = {}

    if platforms.get("x"):
        platform_config["x"] = {
            "enabled": True,
            "posts": posts,
            "settings": {}
        }

    if platforms.get("linkedin"):
        platform_config["linkedin"] = {
            "enabled": True,
            "posts": posts,
            "settings": {}
        }

    payload = {"platforms": platform_config}

    if schedule:
        payload["publish_at"] = schedule

    response = requests.post(
        f"{BASE_URL}/v2/social-sets/{SOCIAL_SET_ID}/drafts",
        headers=HEADERS,
        json=payload
    )
    response.raise_for_status()
    return response.json()


def list_drafts(limit: int = 10):
    """List existing drafts"""
    response = requests.get(
        f"{BASE_URL}/v2/social-sets/{SOCIAL_SET_ID}/drafts",
        headers=HEADERS,
        params={"limit": limit}
    )
    response.raise_for_status()
    return response.json()


def post_to_typefully(content: str, schedule: str = None, image_path: str = None,
                      platforms: dict = None):
    """
    Main function to post content to Typefully

    Args:
        content: Tweet or thread content
        schedule: 'now', 'next-free-slot', ISO datetime, or None for draft
        image_path: Optional path to image file
        platforms: Dict of platforms {"x": True, "linkedin": True}

    Returns:
        Result message with draft URL
    """
    result = create_draft(content, schedule, image_path, platforms)

    draft_id = result.get("id", "unknown")
    status = "scheduled" if schedule else "saved as draft"

    platform_list = []
    if platforms:
        if platforms.get("x"):
            platform_list.append("X")
        if platforms.get("linkedin"):
            platform_list.append("LinkedIn")
    else:
        platform_list.append("X")

    platforms_str = " + ".join(platform_list)

    return f"Success! Post {status} on Typefully for {platforms_str}.\nDraft ID: {draft_id}\nView at: https://typefully.com/drafts"


def find_social_image(topic: str) -> str:
    """
    Find a social image matching the topic

    Args:
        topic: Topic keyword to match (e.g., 'claude-code', 'ai-tools')

    Returns:
        Path to matching social image or None
    """
    # Try to find a matching social image
    for pattern in [f"{topic}-social.jpg", f"{topic}-social.png"]:
        path = IMAGES_DIR / pattern
        if path.exists():
            return str(path)

    # Try partial match
    for file in IMAGES_DIR.glob("*-social.*"):
        if topic.lower() in file.stem.lower():
            return str(file)

    return None


def list_available_images():
    """List all available images"""
    if not IMAGES_DIR.exists():
        return []

    images = {
        "hero": [],
        "social": []
    }

    for file in sorted(IMAGES_DIR.glob("*.jpg")) + sorted(IMAGES_DIR.glob("*.png")):
        if "-hero" in file.stem:
            images["hero"].append(file.name)
        elif "-social" in file.stem:
            images["social"].append(file.name)

    return images


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Post to Typefully")
    parser.add_argument("content", nargs="?", help="Post content")
    parser.add_argument("--schedule", "-s", help="Schedule: 'now', 'next-free-slot', or ISO datetime")
    parser.add_argument("--image", "-i", help="Path to image file")
    parser.add_argument("--linkedin", "-l", action="store_true", help="Also post to LinkedIn")
    parser.add_argument("--list-images", action="store_true", help="List available images")

    args = parser.parse_args()

    if args.list_images:
        images = list_available_images()
        print("Available Images:")
        print("\nHero images (for blog):")
        for img in images["hero"]:
            print(f"  - {img}")
        print("\nSocial images (for X/LinkedIn):")
        for img in images["social"]:
            print(f"  - {img}")
        sys.exit(0)

    if not args.content:
        print("Usage: python typefully.py <content> [--schedule SCHEDULE] [--image PATH] [--linkedin]")
        print("       python typefully.py --list-images")
        sys.exit(1)

    platforms = {"x": True, "linkedin": args.linkedin}

    try:
        result = post_to_typefully(
            args.content,
            args.schedule,
            args.image,
            platforms
        )
        print(result)
    except requests.exceptions.HTTPError as e:
        print(f"API Error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        print(f"Error: {str(e)}")
