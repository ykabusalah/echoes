import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const storyCount = await prisma.story.count()
  return NextResponse.json({ connected: true, stories: storyCount })
}