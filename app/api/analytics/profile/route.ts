import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const visitorId = request.nextUrl.searchParams.get('visitorId')

  if (!visitorId) {
    return NextResponse.json({ error: 'visitorId required' }, { status: 400 })
  }

  try {
    // Get user's profile
    const profile = await prisma.readerProfile.findUnique({
      where: { visitorId }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get user's session stats
    const sessions = await prisma.readerSession.findMany({
      where: { visitorId },
      include: {
        story: { select: { id: true, title: true } },
        choiceEvents: true
      }
    })

    const storiesPlayed = new Set(sessions.map(s => s.storyId)).size
    const storiesCompleted = sessions.filter(s => s.completedAt).length
    const totalChoices = sessions.reduce((sum, s) => sum + s.choiceEvents.length, 0)

    // Get endings discovered
    const endingsDiscovered = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT s.id) as count
      FROM "ReaderSession" rs
      JOIN "Scene" s ON rs."currentSceneId" = s.id
      WHERE rs."visitorId" = ${visitorId}
      AND s."isEnding" = true
      AND rs."completedAt" IS NOT NULL
    `

    // Get total possible endings
    const totalEndings = await prisma.scene.count({
      where: { isEnding: true }
    })

    // Community stats
    const archetypeDistribution = await prisma.$queryRaw<{
      archetype: string
      count: bigint
      percentage: number
    }[]>`
      SELECT 
        archetype,
        COUNT(*) as count,
        ROUND(COUNT(*)::numeric / NULLIF(SUM(COUNT(*)) OVER (), 0) * 100, 1) as percentage
      FROM "ReaderProfile"
      GROUP BY archetype
      ORDER BY count DESC
    `

    const totalReaders = await prisma.readerProfile.count()

    // Most completed story
    const mostCompleted = await prisma.$queryRaw<{
      story_id: string
      title: string
      completion_rate: number
    }[]>`
      SELECT 
        s.id as story_id,
        s.title,
        ROUND(
          COUNT(CASE WHEN rs."completedAt" IS NOT NULL THEN 1 END)::numeric /
          NULLIF(COUNT(*), 0) * 100, 1
        ) as completion_rate
      FROM "Story" s
      JOIN "ReaderSession" rs ON s.id = rs."storyId"
      GROUP BY s.id, s.title
      ORDER BY completion_rate DESC
      LIMIT 1
    `

    // User's archetype percentage
    const userArchetypeStats = archetypeDistribution.find(
      a => a.archetype === profile.archetype
    )

    return NextResponse.json({
      profile: {
        archetype: profile.archetype,
        archetypePercentage: userArchetypeStats?.percentage || 0,
        createdAt: profile.createdAt
      },
      stats: {
        storiesPlayed,
        storiesCompleted,
        totalChoices,
        endingsDiscovered: Number(endingsDiscovered[0]?.count || 0),
        totalEndings
      },
      community: {
        totalReaders,
        archetypeDistribution: archetypeDistribution.map(a => ({
          archetype: a.archetype,
          count: Number(a.count),
          percentage: Number(a.percentage)
        })),
        mostCompletedStory: mostCompleted[0] ? {
          title: mostCompleted[0].title,
          completionRate: Number(mostCompleted[0].completion_rate)
        } : null,
        mostPopularArchetype: archetypeDistribution[0]?.archetype || null,
        rarestArchetype: archetypeDistribution[archetypeDistribution.length - 1]?.archetype || null
      }
    })
  } catch (error) {
    console.error('Profile stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}