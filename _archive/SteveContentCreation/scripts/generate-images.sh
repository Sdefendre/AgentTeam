#!/bin/bash

# Image Generator for DefendreSolutions.com Blog Posts
# Uses Google Gemini Image Generation API

set -e

# Load environment variables if .env exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# API Configuration
# REQUIRED: Set GEMINI_API_KEY environment variable
if [ -z "$GEMINI_API_KEY" ]; then
    echo "Error: GEMINI_API_KEY environment variable is required."
    echo "Set it in your .env file or export it before running."
    exit 1
fi
MODEL="gemini-2.0-flash-exp-image-generation"
API_URL="https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent"

# Output directory
OUTPUT_DIR="${OUTPUT_DIR:-./generated-images}"
mkdir -p "$OUTPUT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to generate image using Gemini
generate_image() {
    local prompt="$1"
    local filename="$2"

    echo -e "${BLUE}Generating: ${filename}${NC}"
    echo -e "Prompt: ${prompt:0:80}..."

    # Create temporary file for the request
    local tmpfile=$(mktemp)
    cat > "$tmpfile" << 'JSONEOF'
{
  "contents": [{
    "parts": [{"text": "PROMPT_PLACEHOLDER"}]
  }],
  "generationConfig": {
    "responseModalities": ["TEXT", "IMAGE"]
  }
}
JSONEOF

    # Replace placeholder with actual prompt (escaping special chars)
    local escaped_prompt=$(echo "$prompt" | sed 's/"/\\"/g' | sed "s/'/\\'/g")
    sed -i '' "s|PROMPT_PLACEHOLDER|Generate an image: $escaped_prompt|g" "$tmpfile"

    local response=$(curl -s "${API_URL}?key=${GEMINI_API_KEY}" \
        -H "Content-Type: application/json" \
        -d @"$tmpfile")

    rm -f "$tmpfile"

    # Process response with Python
    python3 << PYEOF
import sys
import json
import base64
import os

response_text = '''$response'''
output_dir = '$OUTPUT_DIR'
filename = '$filename'

try:
    data = json.loads(response_text)

    if 'error' in data:
        print(f"\033[0;31mError: {data['error'].get('message', 'Unknown error')}\033[0m")
        sys.exit(1)

    if 'candidates' not in data or len(data['candidates']) == 0:
        print(f"\033[0;31mNo candidates in response\033[0m")
        sys.exit(1)

    # Look for image data in parts
    found_image = False
    for part in data['candidates'][0].get('content', {}).get('parts', []):
        if 'inlineData' in part:
            mime_type = part['inlineData'].get('mimeType', 'image/png')
            img_data = base64.b64decode(part['inlineData']['data'])
            ext = 'png' if 'png' in mime_type else 'jpg'
            filepath = os.path.join(output_dir, f'{filename}.{ext}')
            with open(filepath, 'wb') as f:
                f.write(img_data)
            print(f"\033[0;32mSaved: {filepath}\033[0m")
            found_image = True
            break

    if not found_image:
        print(f"\033[0;33mNo image in response. Text response:\033[0m")
        for part in data['candidates'][0].get('content', {}).get('parts', []):
            if 'text' in part:
                print(part['text'][:300])
        sys.exit(1)

except json.JSONDecodeError as e:
    print(f"\033[0;31mJSON error: {e}\033[0m")
    sys.exit(1)
except Exception as e:
    print(f"\033[0;31mError: {e}\033[0m")
    sys.exit(1)
PYEOF

    echo ""
}

# Show usage
show_usage() {
    echo -e "${YELLOW}Image Generator for DefendreSolutions.com${NC}"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  blog <post-name>     Generate images for a specific blog post"
    echo "  all                  Generate images for all recent blog posts"
    echo "  custom \"prompt\"      Generate a custom image"
    echo ""
    echo "Available blog posts:"
    echo "  last-economy, claude-code, tesla, grok-5, ai-tools"
    echo "  defense-tech, ai-ethics, after-scarcity, dreamguard, pulsepod"
    echo ""
    echo "Examples:"
    echo "  $0 blog last-economy"
    echo "  $0 all"
    echo "  $0 custom \"cybersecurity shield protecting data\""
}

# Generate images for specific blog posts
generate_blog_images() {
    local post="$1"

    case "$post" in
        last-economy|the-last-economy)
            echo -e "${YELLOW}=== The Last Economy ===${NC}\n"
            generate_image "Futuristic digital landscape showing transition from traditional human economy to AI powered abundance, split composition with classic city on left transforming into luminous AI integrated utopia on right, flowing data streams connecting both sides, warm golden hour lighting meeting cool blue digital glow, cinematic wide shot, professional business technology aesthetic, photorealistic" \
                "last-economy-hero"
            generate_image "Abstract visualization of Intelligence Inversion concept, human silhouette surrounded by expanding rings of AI neural networks, balance between human warmth with orange and gold tones and AI precision with blue and silver colors, minimalist professional style, centered composition" \
                "last-economy-social"
            ;;

        claude-code)
            echo -e "${YELLOW}=== Claude Code Blog ===${NC}\n"
            generate_image "Professional software developer veteran working with glowing holographic AI coding assistant, modern tech office environment, warm lighting showing collaboration between human expertise and AI tools, cinematic composition, photorealistic" \
                "claude-code-hero"
            generate_image "Abstract art of code transformation, military challenge coin morphing into beautiful flowing lines of code, patriotic colors navy blue silver and subtle red accents, modern minimalist tech aesthetic, professional style" \
                "claude-code-social"
            ;;

        tesla|tesla-master-plan)
            echo -e "${YELLOW}=== Tesla Master Plan ===${NC}\n"
            generate_image "Futuristic Tesla ecosystem visualization with interconnected autonomous electric vehicles, humanoid robots, and massive solar panel and battery storage infrastructure, flowing energy lines connecting all elements, sleek white silver and electric blue color palette, cinematic sci-fi realism, photorealistic" \
                "tesla-master-plan-hero"
            generate_image "Elegant humanoid robot hand gently holding a glowing planet Earth, clean renewable energy symbols orbiting around, minimalist white background, professional corporate futurism aesthetic" \
                "tesla-master-plan-social"
            ;;

        grok|grok-5|xai)
            echo -e "${YELLOW}=== Grok 5 / xAI ===${NC}\n"
            generate_image "Software developer standing at edge of digital horizon where programming code transforms into conscious thought patterns and neural networks, dark dramatic background with bright glowing AI visualizations, cinematic lighting, contemplative futuristic mood, photorealistic" \
                "grok-5-hero"
            generate_image "Abstract visualization of artificial general intelligence emergence, human brain seamlessly merging with advanced AI neural network architecture, deep space black background with electric blue and bright white accents, professional tech editorial style" \
                "grok-5-social"
            ;;

        ai-tools|beyond-claude)
            echo -e "${YELLOW}=== AI Development Tools ===${NC}\n"
            generate_image "Professional developer workspace surrounded by floating holographic AI tool interfaces, streams of code flowing between glowing screens, modern minimalist office with plants, warm productive atmosphere with cool blue technology accents, photorealistic" \
                "ai-tools-hero"
            generate_image "Abstract digital toolbox opening to reveal glowing AI symbols and beautiful code snippets, gradient background from deep purple to bright blue, clean modern tech illustration style" \
                "ai-tools-social"
            ;;

        defense-tech|future-defense)
            echo -e "${YELLOW}=== Defense Technology ===${NC}\n"
            generate_image "Futuristic military command center with large holographic displays showing AI powered threat analysis maps, cyber defense network visualizations, professional serious atmosphere, blue and green accent lighting, cinematic, photorealistic" \
                "defense-tech-hero"
            generate_image "Protective digital shield composed of circuit board patterns and binary code, representing cyber defense, dark navy blue background with glowing cyan accents, professional military technology aesthetic" \
                "defense-tech-social"
            ;;

        ai-ethics|responsible-ai)
            echo -e "${YELLOW}=== AI Ethics ===${NC}\n"
            generate_image "Balanced golden scales held jointly by elegant robotic hand and human hand, one side holding glowing AI microchip, other side holding heart symbol representing ethics and humanity, soft neutral background, warm hopeful lighting, photorealistic" \
                "ai-ethics-hero"
            generate_image "AI neural network pattern forming shape of classic compass, suggesting ethical direction and moral guidance, clean minimalist design, professional blue and gold color scheme" \
                "ai-ethics-social"
            ;;

        after-scarcity)
            echo -e "${YELLOW}=== After Scarcity ===${NC}\n"
            generate_image "Beautiful utopian futuristic city where abundance is visible everywhere, vertical urban farms on skyscrapers, clean renewable energy infrastructure, automated robotic production, happy diverse citizens walking in green spaces, warm hopeful golden hour lighting, photorealistic" \
                "after-scarcity-hero"
            ;;

        dreamguard|sleep)
            echo -e "${YELLOW}=== DreamGuard Sleep Tech ===${NC}\n"
            generate_image "Serene modern bedroom with subtle holographic sleep monitoring visualization floating above peacefully sleeping person, soft purple and blue ambient lighting, advanced but calming health technology integration, dreamy soft focus atmosphere, photorealistic" \
                "dreamguard-hero"
            ;;

        pulsepod|health-scanner)
            echo -e "${YELLOW}=== PulsePod Health Scanner ===${NC}\n"
            generate_image "Sleek futuristic handheld medical scanning device being used on person, holographic health data visualization floating around them showing vitals and diagnostic information, clean white medical environment with soft blue accents, professional product photography style, photorealistic" \
                "pulsepod-hero"
            ;;

        *)
            echo -e "${RED}Unknown blog post: $post${NC}"
            echo "Available: last-economy, claude-code, tesla, grok-5, ai-tools, defense-tech, ai-ethics, after-scarcity, dreamguard, pulsepod"
            return 1
            ;;
    esac
}

# Generate all blog images
generate_all() {
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}  Generating All Blog Post Images${NC}"
    echo -e "${YELLOW}========================================${NC}\n"

    local posts=("last-economy" "claude-code" "tesla" "grok-5" "ai-tools" "defense-tech" "ai-ethics" "after-scarcity" "dreamguard" "pulsepod")

    for post in "${posts[@]}"; do
        generate_blog_images "$post"
        echo -e "${YELLOW}----------------------------------------${NC}\n"
        sleep 2
    done

    echo -e "\n${GREEN}All images generated!${NC}"
    echo -e "Output directory: ${BLUE}$OUTPUT_DIR${NC}"
    ls -la "$OUTPUT_DIR"
}

# Main
main() {
    local command="${1:-}"

    case "$command" in
        blog)
            shift
            generate_blog_images "$1"
            ;;
        all)
            generate_all
            ;;
        custom)
            shift
            local prompt="$1"
            local filename="custom-$(date +%Y%m%d-%H%M%S)"
            generate_image "$prompt" "$filename"
            ;;
        -h|--help|help|"")
            show_usage
            ;;
        *)
            echo -e "${RED}Unknown command: $command${NC}"
            show_usage
            exit 1
            ;;
    esac
}

main "$@"
