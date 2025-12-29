import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  // Get featured story
  const featured = await prisma.story.findFirst({
    where: { 
      published: true,
      status: 'FEATURED'
    },
    include: {
      _count: {
        select: {
          scenes: true,
          characters: true,
          readerSessions: true
        }
      }
    }
  })

  // Get archived stories
  const archived = await prisma.story.findMany({
    where: { 
      published: true,
      status: { not: 'FEATURED' }
    },
    include: {
      _count: {
        select: {
          scenes: true,
          characters: true,
          readerSessions: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({ featured, archived })
}