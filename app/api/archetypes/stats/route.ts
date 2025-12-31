import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get total count
    const total = await prisma.readerProfile.count()

    if (total === 0) {
      return NextResponse.json({
        total: 0,
        distribution: [
          { archetype: 'seeker', count: 0, percentage: 0 },
          { archetype: 'guardian', count: 0, percentage: 0 },
          { archetype: 'wanderer', count: 0, percentage: 0 },
          { archetype: 'flame', count: 0, percentage: 0 },
          { archetype: 'dreamer', count: 0, percentage: 0 },
          { archetype: 'shadow', count: 0, percentage: 0 },
        ]
      })
    }

    // Get distribution grouped by archetype
    const distribution = await prisma.readerProfile.groupBy({
      by: ['archetype'],
      _count: {
        archetype: true
      },
      orderBy: {
        _count: {
          archetype: 'desc'
        }
      }
    })

    // All archetypes for complete list
    const allArchetypes = ['seeker', 'guardian', 'wanderer', 'flame', 'dreamer', 'shadow']

    // Build complete distribution with percentages
    const fullDistribution = allArchetypes.map(archetype => {
      const found = distribution.find(d => d.archetype.toLowerCase() === archetype)
      const count = found?._count.archetype || 0
      // Use Math.max to ensure at least 1% if there's any count
      const percentage = count > 0 
        ? Math.max(1, Math.round((count / total) * 100))
        : 0
      
      return {
        archetype,
        count,
        percentage
      }
    })

    // Sort by count descending
    fullDistribution.sort((a, b) => b.count - a.count)

    return NextResponse.json({
      total,
      distribution: fullDistribution
    })
  } catch (error) {
    console.error('Archetype stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}