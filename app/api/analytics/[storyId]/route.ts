import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params

  // Total sessions and completion rate
  const sessionStats = await prisma.$queryRaw<[{
    total_sessions: bigint
    completed_sessions: bigint
    completion_rate: number
  }]>`
    SELECT 
      COUNT(*) as total_sessions,
      COUNT(CASE WHEN "completedAt" IS NOT NULL THEN 1 END) as completed_sessions,
      ROUND(
        COUNT(CASE WHEN "completedAt" IS NOT NULL THEN 1 END)::numeric / 
        NULLIF(COUNT(*), 0) * 100, 1
      ) as completion_rate
    FROM "ReaderSession"
    WHERE "storyId" = ${storyId}
  `

  // Choice popularity - which choices do readers pick most?
  const choicePopularity = await prisma.$queryRaw<{
    choice_id: string
    choice_text: string
    from_scene: string
    times_chosen: bigint
    percentage: number
  }[]>`
    SELECT 
      c.id as choice_id,
      c.text as choice_text,
      s.title as from_scene,
      COUNT(ce.id) as times_chosen,
      ROUND(
        COUNT(ce.id)::numeric / NULLIF(SUM(COUNT(ce.id)) OVER (PARTITION BY c."fromSceneId"), 0) * 100, 1
      ) as percentage
    FROM "Choice" c
    JOIN "Scene" s ON c."fromSceneId" = s.id
    LEFT JOIN "ChoiceEvent" ce ON c.id = ce."choiceId"
    WHERE s."storyId" = ${storyId}
    GROUP BY c.id, c.text, s.title, c."fromSceneId"
    ORDER BY s.title, times_chosen DESC
  `

  // Drop-off points - where do readers abandon?
  const dropOffPoints = await prisma.$queryRaw<{
    scene_id: string
    scene_title: string
    sessions_reached: bigint
    sessions_left: bigint
    drop_off_rate: number
  }[]>`
    WITH scene_visits AS (
      SELECT 
        s.id as scene_id,
        s.title as scene_title,
        s."isEnding",
        COUNT(DISTINCT rs.id) as sessions_reached
      FROM "Scene" s
      LEFT JOIN "ReaderSession" rs ON rs."currentSceneId" = s.id OR EXISTS (
        SELECT 1 FROM "ChoiceEvent" ce
        JOIN "Choice" c ON ce."choiceId" = c.id
        WHERE ce."sessionId" = rs.id AND (c."fromSceneId" = s.id OR c."toSceneId" = s.id)
      )
      WHERE s."storyId" = ${storyId}
      GROUP BY s.id, s.title, s."isEnding"
    )
    SELECT 
      scene_id,
      scene_title,
      sessions_reached,
      CASE WHEN "isEnding" = false THEN
        sessions_reached - COALESCE((
          SELECT COUNT(DISTINCT ce."sessionId")
          FROM "ChoiceEvent" ce
          JOIN "Choice" c ON ce."choiceId" = c.id
          WHERE c."fromSceneId" = scene_id
        ), 0)
      ELSE 0 END as sessions_left,
      CASE WHEN "isEnding" = false AND sessions_reached > 0 THEN
        ROUND((sessions_reached - COALESCE((
          SELECT COUNT(DISTINCT ce."sessionId")
          FROM "ChoiceEvent" ce
          JOIN "Choice" c ON ce."choiceId" = c.id
          WHERE c."fromSceneId" = scene_id
        ), 0))::numeric / sessions_reached * 100, 1)
      ELSE 0 END as drop_off_rate
    FROM scene_visits
    ORDER BY drop_off_rate DESC
  `

  // Endings reached - which endings are most common?
  const endingsReached = await prisma.$queryRaw<{
    scene_id: string
    scene_title: string
    times_reached: bigint
    percentage: number
  }[]>`
    SELECT 
      s.id as scene_id,
      s.title as scene_title,
      COUNT(rs.id) as times_reached,
      ROUND(
        COUNT(rs.id)::numeric / NULLIF((
          SELECT COUNT(*) FROM "ReaderSession" 
          WHERE "storyId" = ${storyId} AND "completedAt" IS NOT NULL
        ), 0) * 100, 1
      ) as percentage
    FROM "Scene" s
    LEFT JOIN "ReaderSession" rs ON rs."currentSceneId" = s.id AND rs."completedAt" IS NOT NULL
    WHERE s."storyId" = ${storyId} AND s."isEnding" = true
    GROUP BY s.id, s.title
    ORDER BY times_reached DESC
  `

  // Convert BigInt to Number for JSON serialization
  const serialize = (obj: unknown) => JSON.parse(
    JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? Number(v) : v)
  )

  return NextResponse.json({
    sessionStats: serialize(sessionStats[0]),
    choicePopularity: serialize(choicePopularity),
    dropOffPoints: serialize(dropOffPoints),
    endingsReached: serialize(endingsReached)
  })
}