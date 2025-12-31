import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Check admin secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Personalized vs standard choice pickup (with null safety)
    let pickupComparison: { type: string; count: number; percentage: number }[] = []
    try {
      const raw = await prisma.$queryRaw<{
        choice_type: string
        times_chosen: bigint
        percentage: number
      }[]>`
        SELECT
          CASE WHEN c."isGenerated" = true THEN 'Personalized' ELSE 'Standard' END as choice_type,
          COUNT(*) as times_chosen,
          ROUND(
            COUNT(*)::numeric / NULLIF(SUM(COUNT(*)) OVER (), 0) * 100, 1
          ) as percentage
        FROM "ChoiceEvent" ce
        JOIN "Choice" c ON ce."choiceId" = c.id
        GROUP BY c."isGenerated"
      `
      pickupComparison = raw.map(r => ({
        type: r.choice_type,
        count: Number(r.times_chosen),
        percentage: Number(r.percentage) || 0
      }))
    } catch {
      // Table might not exist yet or no data
      pickupComparison = []
    }

    // Archetype accuracy (with null safety)
    let archetypeAccuracy: { archetype: string; opportunities: number; pickedOwn: number; accuracy: number }[] = []
    try {
      const raw = await prisma.$queryRaw<{
        archetype: string
        opportunities: bigint
        picked_own: bigint
        accuracy: number
      }[]>`
        SELECT
          rp.archetype,
          COUNT(DISTINCT ce.id) as opportunities,
          COUNT(DISTINCT CASE WHEN c."archetypeTarget" = rp.archetype THEN ce.id END) as picked_own,
          COALESCE(
            ROUND(
              COUNT(DISTINCT CASE WHEN c."archetypeTarget" = rp.archetype THEN ce.id END)::numeric /
              NULLIF(COUNT(DISTINCT ce.id), 0) * 100, 1
            ), 0
          ) as accuracy
        FROM "ReaderProfile" rp
        JOIN "ReaderSession" rs ON rs."visitorId" = rp."visitorId"
        JOIN "ChoiceEvent" ce ON ce."sessionId" = rs.id
        JOIN "Choice" c ON ce."choiceId" = c.id
        WHERE c."archetypeTarget" IS NOT NULL
        GROUP BY rp.archetype
        ORDER BY accuracy DESC
      `
      archetypeAccuracy = raw.map(r => ({
        archetype: r.archetype,
        opportunities: Number(r.opportunities),
        pickedOwn: Number(r.picked_own),
        accuracy: Number(r.accuracy) || 0
      }))
    } catch {
      archetypeAccuracy = []
    }

    // Generation stats
    let generation = { total: 0, uniqueScenes: 0, avgPerScene: 0 }
    try {
      const genStats = await prisma.choice.aggregate({
        where: { isGenerated: true },
        _count: true
      })
      const uniqueScenes = await prisma.choice.groupBy({
        by: ['fromSceneId'],
        where: { isGenerated: true }
      })
      generation = {
        total: genStats._count || 0,
        uniqueScenes: uniqueScenes.length,
        avgPerScene: uniqueScenes.length > 0 ? Math.round((genStats._count || 0) / uniqueScenes.length * 10) / 10 : 0
      }
    } catch {
      // Fields might not exist yet
    }

    // Completion by path type (with null safety)
    let completionRate = { personalized: null as any, standard: null as any }
    try {
      const raw = await prisma.$queryRaw<{
        picked_personalized: boolean
        sessions: bigint
        completed: bigint
        rate: number
      }[]>`
        WITH session_choice_type AS (
          SELECT 
            rs.id as session_id,
            rs."completedAt" IS NOT NULL as completed,
            BOOL_OR(c."isGenerated" = true) as picked_personalized
          FROM "ReaderSession" rs
          LEFT JOIN "ChoiceEvent" ce ON ce."sessionId" = rs.id
          LEFT JOIN "Choice" c ON ce."choiceId" = c.id
          GROUP BY rs.id, rs."completedAt"
        )
        SELECT
          picked_personalized,
          COUNT(*) as sessions,
          COUNT(*) FILTER (WHERE completed) as completed,
          COALESCE(ROUND(COUNT(*) FILTER (WHERE completed)::numeric / NULLIF(COUNT(*), 0) * 100, 1), 0) as rate
        FROM session_choice_type
        GROUP BY picked_personalized
      `
      for (const r of raw) {
        const data = {
          sessions: Number(r.sessions),
          completed: Number(r.completed),
          rate: Number(r.rate) || 0
        }
        if (r.picked_personalized) {
          completionRate.personalized = data
        } else {
          completionRate.standard = data
        }
      }
    } catch {
      // Queries failed, keep nulls
    }

    // Engagement by path type (with SceneView table - optional)
    let engagement: { pathType: string; avgTimeMs: number; sessions: number }[] = []
    try {
      const raw = await prisma.$queryRaw<{
        path_type: string
        avg_time_ms: number
        sessions: bigint
      }[]>`
        WITH session_path AS (
          SELECT 
            rs.id as session_id,
            CASE 
              WHEN BOOL_OR(c."isGenerated" = true) THEN 'Personalized'
              ELSE 'Standard'
            END as path_type
          FROM "ReaderSession" rs
          LEFT JOIN "ChoiceEvent" ce ON ce."sessionId" = rs.id
          LEFT JOIN "Choice" c ON ce."choiceId" = c.id
          GROUP BY rs.id
        )
        SELECT
          sp.path_type,
          COALESCE(AVG(sv."timeSpentMs"), 0) as avg_time_ms,
          COUNT(DISTINCT sp.session_id) as sessions
        FROM session_path sp
        LEFT JOIN "SceneView" sv ON sv."sessionId" = sp.session_id
        GROUP BY sp.path_type
      `
      engagement = raw.map(r => ({
        pathType: r.path_type,
        avgTimeMs: Number(r.avg_time_ms) || 0,
        sessions: Number(r.sessions)
      }))
    } catch {
      // SceneView table might not exist
    }

    return NextResponse.json({
      pickupRate: { comparison: pickupComparison },
      completionRate,
      archetypeAccuracy,
      generation,
      engagement
    })
  } catch (error) {
    console.error('Personalization stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}