#!/bin/bash

# Marketing Content Generator for defendresolutions.com
# Uses Google Gemini API to generate X and LinkedIn posts

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
API_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to call Gemini API
call_gemini() {
    local prompt="$1"

    local response=$(curl -s "${API_URL}?key=${GEMINI_API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"contents\": [{
                \"parts\": [{
                    \"text\": \"$prompt\"
                }]
            }],
            \"generationConfig\": {
                \"temperature\": 0.9,
                \"maxOutputTokens\": 2048
            }
        }")

    # Extract the text from the response
    echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'candidates' in data and len(data['candidates']) > 0:
        text = data['candidates'][0]['content']['parts'][0]['text']
        print(text)
    elif 'error' in data:
        print(f\"API Error: {data['error']['message']}\", file=sys.stderr)
        sys.exit(1)
    else:
        print('Unexpected response format', file=sys.stderr)
        sys.exit(1)
except Exception as e:
    print(f'Error parsing response: {e}', file=sys.stderr)
    sys.exit(1)
"
}

# Generate X/Twitter content
generate_x_content() {
    local topic="$1"
    local prompt="Create 3 engaging X/Twitter posts for defendresolutions.com about ${topic}.

Requirements:
- Each post must be under 280 characters
- Include 2-3 relevant hashtags
- Focus on cybersecurity and IT solutions
- Include a call-to-action where appropriate
- Make them attention-grabbing and shareable
- Vary the tone: one informative, one engaging question, one promotional

Brand: defendresolutions.com - Professional cybersecurity and IT solutions provider

Format each post clearly numbered 1, 2, 3."

    echo -e "${BLUE}=== X/Twitter Posts ===${NC}\n"
    call_gemini "$prompt"
}

# Generate LinkedIn content
generate_linkedin_content() {
    local topic="$1"
    local prompt="Create a compelling LinkedIn post for defendresolutions.com about ${topic}.

Requirements:
- 150-300 words
- Start with an attention-grabbing hook (first line should stop the scroll)
- Provide valuable insights or tips
- Professional but personable tone
- End with a call-to-action or engaging question
- Include 3-5 relevant hashtags at the end
- Focus on cybersecurity, IT solutions, and digital defense

Brand: defendresolutions.com - Professional cybersecurity and IT solutions provider"

    echo -e "${GREEN}=== LinkedIn Post ===${NC}\n"
    call_gemini "$prompt"
}

# Show usage
show_usage() {
    echo -e "${YELLOW}Marketing Content Generator for defendresolutions.com${NC}"
    echo ""
    echo "Usage: $0 <platform> <topic>"
    echo ""
    echo "Platforms:"
    echo "  x, twitter    - Generate X/Twitter posts"
    echo "  linkedin, li  - Generate LinkedIn post"
    echo "  both, all     - Generate both X and LinkedIn content"
    echo ""
    echo "Examples:"
    echo "  $0 x \"cybersecurity tips for small businesses\""
    echo "  $0 linkedin \"new managed security service launch\""
    echo "  $0 both \"holiday security awareness\""
    echo ""
}

# Main
main() {
    local platform="${1:-both}"
    local topic="${2:-cybersecurity best practices}"

    if [ "$platform" == "-h" ] || [ "$platform" == "--help" ]; then
        show_usage
        exit 0
    fi

    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}  defendresolutions.com Content Generator${NC}"
    echo -e "${YELLOW}========================================${NC}"
    echo ""
    echo -e "Topic: ${GREEN}${topic}${NC}"
    echo -e "Platform: ${BLUE}${platform}${NC}"
    echo ""

    case "$platform" in
        x|twitter|X|Twitter)
            generate_x_content "$topic"
            ;;
        linkedin|li|LinkedIn|LI)
            generate_linkedin_content "$topic"
            ;;
        both|all|Both|All)
            generate_x_content "$topic"
            echo ""
            echo -e "${YELLOW}----------------------------------------${NC}"
            echo ""
            generate_linkedin_content "$topic"
            ;;
        *)
            echo -e "${RED}Unknown platform: $platform${NC}"
            show_usage
            exit 1
            ;;
    esac

    echo ""
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${GREEN}Content generated successfully!${NC}"
    echo ""
    echo -e "${BLUE}Posting Tips:${NC}"
    echo "- Best times for X: 8-10 AM, 12 PM, 5-6 PM"
    echo "- Best times for LinkedIn: Tuesday-Thursday, 8-10 AM"
    echo "- Engage with comments in the first hour for better reach"
}

main "$@"
