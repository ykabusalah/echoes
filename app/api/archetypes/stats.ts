import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get archetype distribution using raw SQL
    const stats = await prisma.$queryRaw<{
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

    // Get total profiles
    const total = await prisma.readerProfile.count()

    // Convert BigInt to Number
    const serialized = stats.map(s => ({
      archetype: s.archetype,
      count: Number(s.count),
      percentage: Number(s.percentage)
    }))

    return NextResponse.json({
      total,
      distribution: serialized
    })
  } catch (error) {
    console.error('Archetype stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}