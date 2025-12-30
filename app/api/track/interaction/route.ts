import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, sceneId, eventType, metadata } = await request.json()

    if (!sessionId || !sceneId || !eventType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const validEvents = ['scroll', 'hover_choice', 'reread', 'idle_return', 'hesitation']
    if (!validEvents.includes(eventType)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 })
    }

    const event = await prisma.interactionEvent.create({
      data: {
        sessionId,
        sceneId,
        eventType,
        metadata: metadata || {}
      }
    })

    return NextResponse.json({ eventId: event.id })
  } catch (error) {
    console.error('Interaction tracking error:', error)
    return NextResponse.json({ error: 'Failed to track interaction' }, { status: 500 })
  }
}