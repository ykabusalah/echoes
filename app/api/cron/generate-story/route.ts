import { NextRequest, NextResponse } from 'next/server'
import { generateStory, rotateFeatureStory } from '@/lib/story-generator'

// This endpoint is called by Vercel Cron
// Vercel automatically adds CRON_SECRET to authorized cron requests

export async function GET(request: NextRequest) {
  // Verify this is a legitimate cron request
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // In production, verify the cron secret
  // In development, allow requests without auth for testing
  if (process.env.NODE_ENV === 'production' && cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    console.log('Cron job: Starting weekly story generation...')
    
    const result = await generateStory()

    if (result.success && result.storyId) {
      // Rotate featured stories
      await rotateFeatureStory(result.storyId)

      console.log(`Cron job: Successfully generated and featured story ${result.storyId}`)
      
      return NextResponse.json({
        success: true,
        message: 'Weekly story generated and featured',
        storyId: result.storyId
      })
    } else {
      console.error('Cron job: Generation failed:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}