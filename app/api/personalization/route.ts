import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Check admin secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Personalized vs standard choice pickup
    const pickupComparison = await prisma.$queryRaw<{
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

    // Completion rate by choice type
    const completionByType = await prisma.$queryRaw<{
      picked_personalized: boolean
      sessions: bigint
      completed: bigint
      completion_rate: number
    }[]>`
      WITH session_choice_type AS (
        SELECT 
          rs.id as session_id,
          rs."completedAt",
          BOOL_OR(c."isGenerated") as picked_personalized
        FROM "ReaderSession" rs
        LEFT JOIN "ChoiceEvent" ce ON rs.id = ce."sessionId"
        LEFT JOIN "Choice" c ON ce."choiceId" = c.id
        GROUP BY rs.id, rs."completedAt"
      )
      SELECT
        picked_personalized,
        COUNT(*) as sessions,
        COUNT(CASE WHEN "completedAt" IS NOT NULL THEN 1 END) as completed,
        ROUND(
          COUNT(CASE WHEN "completedAt" IS NOT NULL THEN 1 END)::numeric /
          NULLIF(COUNT(*), 0) * 100, 1
        ) as completion_rate
      FROM session_choice_type
      GROUP BY picked_personalized
    `

    // Archetype accuracy (do readers pick their archetype's choices?)
    const archetypeAccuracy = await prisma.$queryRaw<{
      archetype: string
      total_opportunities: bigint
      picked_own: bigint
      accuracy: number
    }[]>`
      SELECT
        rp.archetype,
        COUNT(*) as total_opportunities,
        COUNT(CASE WHEN c."archetypeTarget" = rp.archetype THEN 1 END) as picked_own,
        ROUND(
          COUNT(CASE WHEN c."archetypeTarget" = rp.archetype THEN 1 END)::numeric /
          NULLIF(COUNT(*), 0) * 100, 1
        ) as accuracy
      FROM "ChoiceEvent" ce
      JOIN "Choice" c ON ce."choiceId" = c.id
      JOIN "ReaderSession" rs ON ce."sessionId" = rs.id
      JOIN "ReaderProfile" rp ON rs."profileId" = rp.id
      WHERE c."archetypeTarget" IS NOT NULL
      GROUP BY rp.archetype
      ORDER BY accuracy DESC
    `

    // Generation stats
    const generationStats = await prisma.$queryRaw<{
      total_generated: bigint
      unique_scenes: bigint
      avg_per_scene: number
    }[]>`
      SELECT
        COUNT(*) as total_generated,
        COUNT(DISTINCT "fromSceneId") as unique_scenes,
        ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT "fromSceneId"), 0), 1) as avg_per_scene
      FROM "Choice"
      WHERE "isGenerated" = true
    `

    // Time spent comparison (personalized path vs standard)
    const timeComparison = await prisma.$queryRaw<{
      path_type: string
      avg_time_ms: number
      sessions: bigint
    }[]>`
      WITH session_paths AS (
        SELECT 
          rs.id,
          BOOL_OR(c."isGenerated") as used_personalized,
          SUM(sv."timeSpentMs") as total_time
        FROM "ReaderSession" rs
        JOIN "SceneView" sv ON rs.id = sv."sessionId"
        LEFT JOIN "ChoiceEvent" ce ON rs.id = ce."sessionId"
        LEFT JOIN "Choice" c ON ce."choiceId" = c.id
        WHERE sv."timeSpentMs" IS NOT NULL
        GROUP BY rs.id
      )
      SELECT
        CASE WHEN used_personalized THEN 'Personalized' ELSE 'Standard' END as path_type,
        ROUND(AVG(total_time))::int as avg_time_ms,
        COUNT(*) as sessions
      FROM session_paths
      WHERE total_time > 0
      GROUP BY used_personalized
    `

    return NextResponse.json({
      pickupRate: {
        comparison: pickupComparison.map(p => ({
          type: p.choice_type,
          count: Number(p.times_chosen),
          percentage: Number(p.percentage)
        }))
      },
      completionRate: {
        personalized: completionByType.find(c => c.picked_personalized)
          ? {
              sessions: Number(completionByType.find(c => c.picked_personalized)?.sessions || 0),
              completed: Number(completionByType.find(c => c.picked_personalized)?.completed || 0),
              rate: Number(completionByType.find(c => c.picked_personalized)?.completion_rate || 0)
            }
          : null,
        standard: completionByType.find(c => !c.picked_personalized)
          ? {
              sessions: Number(completionByType.find(c => !c.picked_personalized)?.sessions || 0),
              completed: Number(completionByType.find(c => !c.picked_personalized)?.completed || 0),
              rate: Number(completionByType.find(c => !c.picked_personalized)?.completion_rate || 0)
            }
          : null
      },
      archetypeAccuracy: archetypeAccuracy.map(a => ({
        archetype: a.archetype,
        opportunities: Number(a.total_opportunities),
        pickedOwn: Number(a.picked_own),
        accuracy: Number(a.accuracy)
      })),
      generation: {
        total: Number(generationStats[0]?.total_generated || 0),
        uniqueScenes: Number(generationStats[0]?.unique_scenes || 0),
        avgPerScene: Number(generationStats[0]?.avg_per_scene || 0)
      },
      engagement: timeComparison.map(t => ({
        pathType: t.path_type,
        avgTimeMs: Number(t.avg_time_ms),
        sessions: Number(t.sessions)
      }))
    })
  } catch (error) {
    console.error('Personalization stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}