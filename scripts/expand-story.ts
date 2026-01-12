// scripts/expand-story.ts
// Run with: npx tsx scripts/expand-story.ts

import Anthropic from '@anthropic-ai/sdk'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

interface GeneratedScene {
  title: string
  content: string
  isEnding: boolean
  isBranchPoint: boolean
  choices?: { text: string; leadsToTitle: string }[]
}

interface StoryExpansion {
  branchesFrom: string
  branchChoiceText: string  // NEW: The action text for entering this branch
  scenes: GeneratedScene[]
}

async function generateExpansion(
  storyTitle: string,
  storyDescription: string,
  existingScenes: { title: string; content: string; isEnding: boolean }[],
  archetype: string
): Promise<StoryExpansion> {
  const prompt = `You are expanding an interactive fiction story for the "Echoes" platform.

STORY: "${storyTitle}"
DESCRIPTION: ${storyDescription}

EXISTING SCENES:
${existingScenes.map((s, i) => `${i + 1}. "${s.title}" ${s.isEnding ? '(ENDING)' : ''}\n${s.content.slice(0, 200)}...`).join('\n\n')}

TARGET ARCHETYPE FOR THIS BRANCH: ${archetype}
Archetype themes:
- Wanderer: exploration, curiosity, new paths, freedom
- Guardian: protection, loyalty, sacrifice, duty
- Seeker: truth, investigation, hidden knowledge, questions
- Flame: action, boldness, confrontation, passion
- Dreamer: hope, emotion, transformation, imagination
- Shadow: pragmatism, secrets, moral ambiguity, survival

TASK: Generate 4 NEW interconnected scenes that branch from the existing story and appeal to the ${archetype} archetype.

WRITING STYLE REQUIREMENTS:
- Write in a natural, literary style. Avoid these AI patterns:
  - No em dashes for emphasis
  - No "delve", "crucial", "moreover", "furthermore", "landscape", "multifaceted"
  - No "it's important to note", "in today's world", "let's explore"
  - No starting sentences with "As a..." or "When it comes to..."
  - Avoid excessive hedging ("may", "might", "could potentially")
  - Vary paragraph lengths naturally
  - Include specific sensory details, not vague descriptions
  - Show, don't tell emotions
- Content should be 150-250 words per scene, evocative and atmospheric

REQUIREMENTS:
1. Scene 1: Branches from an existing non-ending scene (specify which)
2. Scene 2-3: Continue the new branch with meaningful choices
3. Scene 4: An ending that resonates with ${archetype} themes
4. Each non-ending scene needs 2-3 choices (actions the reader can take)
5. At least one scene should be marked as isBranchPoint (for personalization)
6. Choices must be ACTIONS, not path labels. Good: "Search the abandoned tower", Bad: "[Seeker Path] The Tower"
7. Provide a "branchChoiceText" that describes the action to enter this branch (not a path label)

Respond with ONLY valid JSON in this exact format:
{
  "branchesFrom": "existing scene title to branch from",
  "branchChoiceText": "The action text for entering this branch (e.g., 'Investigate the strange sound')",
  "scenes": [
    {
      "title": "Scene Title",
      "content": "Full scene content here...",
      "isEnding": false,
      "isBranchPoint": true,
      "choices": [
        { "text": "Action the reader takes", "leadsToTitle": "Next Scene Title" },
        { "text": "Another action", "leadsToTitle": "Different Scene Title" }
      ]
    }
  ]
}

No markdown, no explanation, just the JSON.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }]
  })

  const text = response.content[0]
  if (text.type !== 'text') throw new Error('Unexpected response type')

  // Clean and parse JSON
  const jsonStr = text.text.trim().replace(/```json\n?|\n?```/g, '')
  return JSON.parse(jsonStr)
}

async function expandStory(storyId: string) {
  console.log(`\n📖 Fetching story ${storyId}...`)

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      scenes: {
        include: { choicesFrom: true },
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!story) {
    console.error('Story not found!')
    return
  }

  console.log(`📚 Found: "${story.title}" with ${story.scenes.length} scenes`)

  const archetypes = ['wanderer', 'guardian', 'seeker', 'flame', 'dreamer', 'shadow']
  let sceneOrder = story.scenes.length

  for (const archetype of archetypes) {
    console.log(`\n✨ Generating ${archetype} branch...`)

    try {
      const expansion = await generateExpansion(
        story.title,
        story.description || '',
        story.scenes.map(s => ({
          title: s.title,
          content: s.content,
          isEnding: s.isEnding
        })),
        archetype
      )

      // Find the scene to branch from
      const branchFromTitle = expansion.branchesFrom
      const branchFromScene = story.scenes.find(s => 
        s.title.toLowerCase().includes(branchFromTitle?.toLowerCase()) ||
        branchFromTitle?.toLowerCase().includes(s.title.toLowerCase())
      )

      if (!branchFromScene) {
        console.log(`⚠️ Could not find branch point "${branchFromTitle}", using first non-ending scene`)
      }

      const actualBranchFrom = branchFromScene || story.scenes.find(s => !s.isEnding && !s.isStart)

      if (!actualBranchFrom) {
        console.log(`❌ No valid branch point found for ${archetype}`)
        continue
      }

      // Create scenes and build ID map
      const sceneIdMap = new Map<string, string>()

      for (const scene of expansion.scenes) {
        sceneOrder++
        const created = await prisma.scene.create({
          data: {
            storyId: story.id,
            title: scene.title,
            content: scene.content,
            isEnding: scene.isEnding,
            isBranchPoint: scene.isBranchPoint || false,
            order: sceneOrder
          }
        })
        sceneIdMap.set(scene.title, created.id)
        console.log(`  ✅ Created scene: "${scene.title}"${scene.isEnding ? ' (ending)' : ''}${scene.isBranchPoint ? ' (branch point)' : ''}`)
      }

      // Create choices between new scenes
      for (const scene of expansion.scenes) {
        if (scene.choices && scene.choices.length > 0) {
          const fromSceneId = sceneIdMap.get(scene.title)
          if (!fromSceneId) continue

          for (let i = 0; i < scene.choices.length; i++) {
            const choice = scene.choices[i]
            const toSceneId = sceneIdMap.get(choice.leadsToTitle)

            if (toSceneId) {
              await prisma.choice.create({
                data: {
                  fromSceneId,
                  toSceneId,
                  text: choice.text,
                  order: i
                }
              })
            }
          }
        }
      }

      // Connect branch from existing scene to first new scene
      // Use the AI-generated action text, NOT a path label
      const firstNewSceneId = sceneIdMap.get(expansion.scenes[0]?.title)
      if (firstNewSceneId && actualBranchFrom) {
        // Use branchChoiceText if provided, otherwise create a generic action
        const choiceText = expansion.branchChoiceText || expansion.scenes[0]?.title || 'Continue down this path'
        
        await prisma.choice.create({
          data: {
            fromSceneId: actualBranchFrom.id,
            toSceneId: firstNewSceneId,
            text: choiceText,  // Now it's an action, not "[Archetype Path] Title"
            order: 99,
            archetypeTarget: archetype
          }
        })
        console.log(`  🔗 Connected to existing scene: "${actualBranchFrom.title}"`)
        console.log(`     Choice text: "${choiceText}"`)
      }

      // Mark the branch-from scene as a branch point
      await prisma.scene.update({
        where: { id: actualBranchFrom.id },
        data: { isBranchPoint: true }
      })

      console.log(`✅ ${archetype} branch complete!`)

      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 1000))

    } catch (error) {
      console.error(`❌ Error generating ${archetype} branch:`, error)
    }
  }

  // Final count
  const updatedStory = await prisma.story.findUnique({
    where: { id: storyId },
    include: { _count: { select: { scenes: true } } }
  })

  console.log(`\n🎉 Expansion complete!`)
  console.log(`📊 Total scenes: ${updatedStory?._count.scenes}`)
}

async function main() {
  const storyTitle = process.argv[2]

  if (!storyTitle) {
    // List available stories
    const stories = await prisma.story.findMany({
      select: { id: true, title: true, _count: { select: { scenes: true } } }
    })

    console.log('\n📚 Available stories:\n')
    stories.forEach(s => {
      console.log(`  "${s.title}"`)
      console.log(`    ID: ${s.id}`)
      console.log(`    Scenes: ${s._count.scenes}\n`)
    })

    console.log('Usage: npx tsx scripts/expand-story.ts "Story Title"')
    console.log('   or: npx tsx scripts/expand-story.ts <story-id>')
    return
  }

  // Find story by title or ID
  const story = await prisma.story.findFirst({
    where: {
      OR: [
        { title: { contains: storyTitle, mode: 'insensitive' } },
        { id: storyTitle }
      ]
    }
  })

  if (!story) {
    console.error(`Story not found: "${storyTitle}"`)
    return
  }

  await expandStory(story.id)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())