import { NextRequest, NextResponse } from 'next/server'
import { generateStory } from '@/lib/story-generator'

// Simple admin protection - check for secret key
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'echoes-admin-2024'

export async function POST(request: NextRequest) {
  // Check authorization
  const authHeader = request.headers.get('authorization')
  const providedSecret = authHeader?.replace('Bearer ', '')

  if (providedSecret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('Starting story generation...')
    const result = await generateStory()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Story generated successfully',
        storyId: result.storyId
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Generation endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check generation status/history
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const providedSecret = authHeader?.replace('Bearer ', '')

  if (providedSecret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { prisma } = await import('@/lib/db')

  const recentGenerations = await prisma.storyGeneration.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      model: true,
      success: true,
      error: true,
      storyId: true,
      durationMs: true,
      tokensUsed: true,
      createdAt: true
    }
  })

  return NextResponse.json({ generations: recentGenerations })
}