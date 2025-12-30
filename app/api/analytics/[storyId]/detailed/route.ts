import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params

  try {
    // 1. Time spent per scene
    const timePerScene = await prisma.$queryRaw<{
      scene_id: string
      scene_title: string
      scene_order: number
      avg_time_ms: number
      median_time_ms: number
      total_views: bigint
      is_ending: boolean
    }[]>`
      SELECT 
        s.id as scene_id,
        s.title as scene_title,
        s."order" as scene_order,
        COALESCE(AVG(sv."timeSpentMs"), 0)::int as avg_time_ms,
        COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY sv."timeSpentMs"), 0)::int as median_time_ms,
        COUNT(sv.id) as total_views,
        s."isEnding" as is_ending
      FROM "Scene" s
      LEFT JOIN "SceneView" sv ON s.id = sv."sceneId"
      WHERE s."storyId" = ${storyId}
      GROUP BY s.id, s.title, s."order", s."isEnding"
      ORDER BY s."order"
    `

    // 2. Engagement heatmap
    const engagementHeatmap = await prisma.$queryRaw<{
      scene_id: string
      scene_title: string
      hover_count: bigint
      reread_count: bigint
      hesitation_count: bigint
      engagement_score: number
    }[]>`
      SELECT 
        s.id as scene_id,
        s.title as scene_title,
        COUNT(CASE WHEN ie."eventType" = 'hover_choice' THEN 1 END) as hover_count,
        COUNT(CASE WHEN ie."eventType" = 'reread' THEN 1 END) as reread_count,
        COUNT(CASE WHEN ie."eventType" = 'hesitation' THEN 1 END) as hesitation_count,
        COALESCE(
          (
            COUNT(CASE WHEN ie."eventType" = 'hover_choice' THEN 1 END) * 1.0 +
            COUNT(CASE WHEN ie."eventType" = 'reread' THEN 1 END) * 2.0 +
            COUNT(CASE WHEN ie."eventType" = 'hesitation' THEN 1 END) * 1.5
          ) / NULLIF(COUNT(DISTINCT sv."sessionId"), 0), 0
        ) as engagement_score
      FROM "Scene" s
      LEFT JOIN "SceneView" sv ON s.id = sv."sceneId"
      LEFT JOIN "InteractionEvent" ie ON s.id = ie."sceneId"
      WHERE s."storyId" = ${storyId}
      GROUP BY s.id, s.title
      ORDER BY engagement_score DESC
    `

    // 3. Choice hesitation analysis
    const choiceHesitation = await prisma.$queryRaw<{
      choice_id: string
      choice_text: string
      from_scene: string
      avg_decision_time_ms: number
      times_chosen: bigint
    }[]>`
      WITH choice_timing AS (
        SELECT 
          ce."choiceId",
          sv."timeSpentMs" as decision_time
        FROM "ChoiceEvent" ce
        JOIN "Choice" c ON ce."choiceId" = c.id
        JOIN "SceneView" sv ON ce."sessionId" = sv."sessionId" 
          AND c."fromSceneId" = sv."sceneId"
        JOIN "Scene" s ON c."fromSceneId" = s.id
        WHERE s."storyId" = ${storyId}
      )
      SELECT 
        c.id as choice_id,
        c.text as choice_text,
        s.title as from_scene,
        COALESCE(AVG(ct.decision_time), 0)::int as avg_decision_time_ms,
        COUNT(ce.id) as times_chosen
      FROM "Choice" c
      JOIN "Scene" s ON c."fromSceneId" = s.id
      LEFT JOIN "ChoiceEvent" ce ON c.id = ce."choiceId"
      LEFT JOIN choice_timing ct ON c.id = ct."choiceId"
      WHERE s."storyId" = ${storyId}
      GROUP BY c.id, c.text, s.title
      ORDER BY avg_decision_time_ms DESC
    `

    // 4. Path flow heatmap
    const pathHeatmap = await prisma.$queryRaw<{
      from_scene_id: string
      from_scene_title: string
      to_scene_id: string
      to_scene_title: string
      transition_count: bigint
      percentage: number
    }[]>`
      SELECT 
        s1.id as from_scene_id,
        s1.title as from_scene_title,
        s2.id as to_scene_id,
        s2.title as to_scene_title,
        COUNT(ce.id) as transition_count,
        ROUND(
          COUNT(ce.id)::numeric / NULLIF(SUM(COUNT(ce.id)) OVER (PARTITION BY s1.id), 0) * 100, 1
        ) as percentage
      FROM "ChoiceEvent" ce
      JOIN "Choice" c ON ce."choiceId" = c.id
      JOIN "Scene" s1 ON c."fromSceneId" = s1.id
      JOIN "Scene" s2 ON c."toSceneId" = s2.id
      WHERE s1."storyId" = ${storyId}
      GROUP BY s1.id, s1.title, s2.id, s2.title
      ORDER BY transition_count DESC
    `

    // 5. Reading time patterns
    const readingPatterns = await prisma.$queryRaw<{
      hour_of_day: number
      day_of_week: number
      session_count: bigint
    }[]>`
      SELECT 
        EXTRACT(HOUR FROM rs."startedAt")::int as hour_of_day,
        EXTRACT(DOW FROM rs."startedAt")::int as day_of_week,
        COUNT(*) as session_count
      FROM "ReaderSession" rs
      WHERE rs."storyId" = ${storyId}
      GROUP BY hour_of_day, day_of_week
      ORDER BY day_of_week, hour_of_day
    `

    // Convert BigInt to Number for JSON
    const serialize = (data: any[]) => data.map(row => {
      const obj: any = {}
      for (const [key, val] of Object.entries(row)) {
        obj[key] = typeof val === 'bigint' ? Number(val) : val
      }
      return obj
    })

    return NextResponse.json({
      timePerScene: serialize(timePerScene),
      engagementHeatmap: serialize(engagementHeatmap),
      choiceHesitation: serialize(choiceHesitation),
      pathHeatmap: serialize(pathHeatmap),
      readingPatterns: serialize(readingPatterns)
    })
  } catch (error) {
    console.error('Detailed analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}