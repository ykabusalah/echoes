import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Check admin secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Total sessions
    const totalSessions = await prisma.readerSession.count()

    // Completion rate
    const completionStats = await prisma.$queryRaw<{
      total: bigint
      completed: bigint
      rate: number
    }[]>`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN "completedAt" IS NOT NULL THEN 1 END) as completed,
        ROUND(
          COUNT(CASE WHEN "completedAt" IS NOT NULL THEN 1 END)::numeric /
          NULLIF(COUNT(*), 0) * 100, 1
        ) as rate
      FROM "ReaderSession"
    `

    // Personalization pickup rate
    const personalizationStats = await prisma.$queryRaw<{
      total_choices: bigint
      personalized_picks: bigint
      pickup_rate: number
    }[]>`
      SELECT
        COUNT(*) as total_choices,
        COUNT(CASE WHEN c."isGenerated" = true THEN 1 END) as personalized_picks,
        ROUND(
          COUNT(CASE WHEN c."isGenerated" = true THEN 1 END)::numeric /
          NULLIF(COUNT(*), 0) * 100, 1
        ) as pickup_rate
      FROM "ChoiceEvent" ce
      JOIN "Choice" c ON ce."choiceId" = c.id
    `

    // Stories with session counts
    const stories = await prisma.story.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        _count: {
          select: {
            scenes: true,
            readerSessions: true
          }
        }
      },
      orderBy: { featuredAt: 'desc' }
    })

    // Total readers
    const totalReaders = await prisma.readerProfile.count()

    // Total generated choices
    const generatedChoices = await prisma.choice.count({
      where: { isGenerated: true }
    })

    return NextResponse.json({
      overview: {
        totalSessions: Number(totalSessions),
        totalReaders,
        completionRate: Number(completionStats[0]?.rate || 0),
        personalizationPickupRate: Number(personalizationStats[0]?.pickup_rate || 0),
        generatedChoices
      },
      stories: stories.map(s => ({
        id: s.id,
        title: s.title,
        status: s.status,
        scenes: s._count.scenes,
        sessions: s._count.readerSessions
      }))
    })
  } catch (error) {
    console.error('Overview stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}