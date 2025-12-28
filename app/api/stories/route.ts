import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const stories = await prisma.story.findMany({
    where: { published: true },
    include: {
      _count: {
        select: {
          scenes: true,
          characters: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(stories)
}