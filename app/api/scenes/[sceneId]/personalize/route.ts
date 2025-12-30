import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { generatePersonalizedChoice } from '@/lib/generateChoice'
import { Archetype } from '@/lib/quiz'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sceneId: string }> }
) {
  const { sceneId } = await params
  const { visitorId } = await request.json()

  if (!visitorId) {
    return NextResponse.json({ error: 'visitorId required' }, { status: 400 })
  }

  try {
    // Get reader's profile
    const profile = await prisma.readerProfile.findUnique({
      where: { visitorId }
    })

    if (!profile) {
      return NextResponse.json({ error: 'No profile found' }, { status: 404 })
    }

    const archetype = profile.archetype as Archetype

    // Get the scene with story info
    const scene = await prisma.scene.findUnique({
      where: { id: sceneId },
      include: {
        story: true,
        choicesFrom: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!scene) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 })
    }

    // Check if this scene is a branch point
    if (!scene.isBranchPoint) {
      return NextResponse.json({ error: 'Not a branch point' }, { status: 400 })
    }

    // Check if we already have a generated choice for this archetype + scene
    const existingGenerated = await prisma.choice.findFirst({
      where: {
        fromSceneId: sceneId,
        archetypeTarget: archetype,
        isGenerated: true
      }
    })

    if (existingGenerated) {
      return NextResponse.json({ choice: existingGenerated })
    }

    // Get existing (non-personalized) choices
    const standardChoices = scene.choicesFrom.filter(c => !c.archetypeTarget)

    if (standardChoices.length === 0) {
      return NextResponse.json({ error: 'No base choices to build from' }, { status: 400 })
    }

    // Pick a random existing choice to branch from (the personalized choice leads to same destination)
    const branchFrom = standardChoices[Math.floor(Math.random() * standardChoices.length)]

    // Generate personalized choice text
    const choiceText = await generatePersonalizedChoice({
      sceneContent: scene.content,
      sceneTitle: scene.title,
      storyTitle: scene.story.title,
      existingChoices: standardChoices.map(c => c.text),
      archetype
    })

    // Save the generated choice
    const newChoice = await prisma.choice.create({
      data: {
        text: choiceText,
        fromSceneId: sceneId,
        toSceneId: branchFrom.toSceneId, // Same destination as base choice
        order: standardChoices.length, // Add at end
        archetypeTarget: archetype,
        isGenerated: true,
        generatedFor: visitorId,
        generatedAt: new Date()
      }
    })

    return NextResponse.json({ choice: newChoice })
  } catch (error) {
    console.error('Personalization error:', error)
    return NextResponse.json({ error: 'Failed to generate personalized choice' }, { status: 500 })
  }
}