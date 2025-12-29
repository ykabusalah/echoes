import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { calculateArchetype } from '@/lib/quiz'

// GET - Check if visitor has a profile
export async function GET(request: NextRequest) {
  const visitorId = request.nextUrl.searchParams.get('visitorId')
  
  if (!visitorId) {
    return NextResponse.json({ hasProfile: false })
  }

  const profile = await prisma.readerProfile.findUnique({
    where: { visitorId }
  })

  if (profile) {
    return NextResponse.json({ 
      hasProfile: true, 
      profile: {
        archetype: profile.archetype,
        scores: profile.scores,
        createdAt: profile.createdAt
      }
    })
  }

  return NextResponse.json({ hasProfile: false })
}

// POST - Submit quiz answers and create profile
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { visitorId, answers } = body

  if (!visitorId || !answers || !Array.isArray(answers)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { archetype, scores } = calculateArchetype(answers)

  // Upsert the profile (create or update)
  const profile = await prisma.readerProfile.upsert({
    where: { visitorId },
    update: {
      archetype,
      scores,
      quizAnswers: answers,
      updatedAt: new Date()
    },
    create: {
      visitorId,
      archetype,
      scores,
      quizAnswers: answers
    }
  })

  return NextResponse.json({
    success: true,
    profile: {
      id: profile.id,
      archetype: profile.archetype,
      scores: profile.scores
    }
  })
}