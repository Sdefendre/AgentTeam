import { NextResponse } from 'next/server'

/**
 * GET /api/settings
 * Returns current settings from environment variables
 * This allows the frontend to pre-populate with existing keys
 */
export async function GET() {
    return NextResponse.json({
        geminiApiKey: process.env.GEMINI_API_KEY || '',
        typefullyApiKey: process.env.TYPEFULLY_API_KEY || '',
        typefullySocialSetId: process.env.TYPEFULLY_SOCIAL_SET_ID || '273516',
        blogApiKey: process.env.BLOG_API_KEY || '',
        blogApiUrl: process.env.BLOG_API_URL || 'https://defendresolutions.com/api/admin/publish-blog',
    })
}
