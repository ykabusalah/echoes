import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, sceneId, action, viewId } = await request.json()

    if (!sessionId || !sceneId) {
      return NextResponse.json({ error: 'Missing sessionId or sceneId' }, { status: 400 })
    }

    if (action === 'enter') {
      const view = await prisma.sceneView.create({
        data: { sessionId, sceneId }
      })
      return NextResponse.json({ viewId: view.id })
    }

    if (action === 'exit' && viewId) {
      const view = await prisma.sceneView.findUnique({
        where: { id: viewId }
      })

      if (view) {
        const exitedAt = new Date()
        const timeSpentMs = exitedAt.getTime() - view.enteredAt.getTime()

        await prisma.sceneView.update({
          where: { id: viewId },
          data: { exitedAt, timeSpentMs }
        })
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Scene tracking error:', error)
    return NextResponse.json({ error: 'Failed to track scene' }, { status: 500 })
  }
}