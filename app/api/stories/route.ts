import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

// Get the current week number of the year
function getWeekNumber(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  const oneWeek = 604800000 // milliseconds in a week
  return Math.floor(diff / oneWeek)
}

export async function GET() {
  // Get all published stories ordered by featuredAt (or createdAt as fallback)
  const allStories = await prisma.story.findMany({
    where: { published: true },
    include: {
      _count: {
        select: {
          scenes: true,
          characters: true,
          readerSessions: true
        }
      }
    },
    orderBy: { featuredAt: 'asc' }
  })

  if (allStories.length === 0) {
    return NextResponse.json({ featured: null, archived: [] })
  }

  // Rotate featured story based on current week
  const weekNumber = getWeekNumber()
  const featuredIndex = weekNumber % allStories.length
  
  const featured = allStories[featuredIndex]
  const archived = allStories.filter((_, index) => index !== featuredIndex)

  return NextResponse.json({ featured, archived })
}