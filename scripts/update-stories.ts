// scripts/update-stories.ts
// Run with: npx tsx scripts/update-stories.ts

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// ============================================
// STORY FILE FORMAT (place in /stories folder)
// ============================================
// Each .json file should follow this structure:
// {
//   "title": "The Bells of Kathmandu",
//   "description": "A pilgrimage through Nepal...",
//   "theme": "spirituality",
//   "tier": 1,
//   "scenes": [
//     {
//       "title": "Arrival",
//       "content": "Your scene content here...",
//       "isStart": true,
//       "order": 0,
//       "choices": [
//         { "text": "Follow the bells", "leadsTo": "Temple Steps" },
//         { "text": "Find a guesthouse", "leadsTo": "Thamel Alley" }
//       ]
//     }
//   ]
// }

interface SceneData {
  title: string
  content: string
  isStart?: boolean
  isEnding?: boolean
  isBranchPoint?: boolean
  order: number
  choices?: { text: string; leadsTo: string; archetypeTarget?: string }[]
}

interface StoryData {
  title: string
  description: string
  theme: string
  tier: number
  scenes: SceneData[]
}

// Map file names to existing story titles for matching
const STORY_MATCH_MAP: Record<string, string[]> = {
  'kathmandu': ['Kathmandu', 'Bells'],
  'corrido': ['Corrido', 'Crossing'],
  'mudwater': ['Mudwater', 'Gospel'],
  'night-market': ['Night Market', 'Market'],
  'lanterns': ['Lanterns', 'Hội An', 'Hoi An']
}

async function findExistingStory(filename: string): Promise<string | null> {
  const key = Object.keys(STORY_MATCH_MAP).find(k => 
    filename.toLowerCase().includes(k)
  )
  
  if (!key) return null
  
  const searchTerms = STORY_MATCH_MAP[key]
  
  for (const term of searchTerms) {
    const story = await prisma.story.findFirst({
      where: { title: { contains: term } }
    })
    if (story) return story.id
  }
  
  return null
}

async function createScenes(storyId: string, scenes: SceneData[]) {
  const sceneMap = new Map<string, string>()

  // First pass: create all scenes
  for (const scene of scenes) {
    const created = await prisma.scene.create({
      data: {
        storyId,
        title: scene.title,
        content: scene.content,
        isStart: scene.isStart || false,
        isEnding: scene.isEnding || false,
        isBranchPoint: scene.isBranchPoint || false,
        order: scene.order
      }
    })
    sceneMap.set(scene.title, created.id)
  }

  // Second pass: create choices
  for (const scene of scenes) {
    if (!scene.choices?.length) continue

    const fromSceneId = sceneMap.get(scene.title)
    if (!fromSceneId) continue

    for (const choice of scene.choices) {
      const toSceneId = sceneMap.get(choice.leadsTo)
      if (!toSceneId) {
        console.log(`    ⚠️  Target not found: "${choice.leadsTo}"`)
        continue
      }

      await prisma.choice.create({
        data: {
          fromSceneId,
          toSceneId,
          text: choice.text,
          archetypeTarget: choice.archetypeTarget || null
        }
      })
    }
  }
}

async function updateStoryFromFile(filepath: string) {
  const filename = path.basename(filepath)
  console.log(`\n📄 Processing: ${filename}`)

  const raw = fs.readFileSync(filepath, 'utf-8')
  const storyData: StoryData = JSON.parse(raw)

  if (!storyData.scenes?.length) {
    console.log(`  ⏭️  No scenes, skipping`)
    return
  }

  // Find existing story
  const existingId = await findExistingStory(filename)

  if (existingId) {
    console.log(`  🔍 Found existing: ${existingId}`)
    
    // Delete old scenes
    const deleted = await prisma.scene.deleteMany({
      where: { storyId: existingId }
    })
    console.log(`  🗑️  Deleted ${deleted.count} old scenes`)

    // Update metadata
    await prisma.story.update({
      where: { id: existingId },
      data: {
        title: storyData.title,
        description: storyData.description,
        theme: storyData.theme,
        tier: storyData.tier
      }
    })

    // Create new scenes
    await createScenes(existingId, storyData.scenes)
    console.log(`  ✅ Updated with ${storyData.scenes.length} scenes`)
  } else {
    console.log(`  🆕 Creating new story...`)
    
    const newStory = await prisma.story.create({
      data: {
        title: storyData.title,
        description: storyData.description,
        theme: storyData.theme,
        tier: storyData.tier,
        status: 'DRAFT'
      }
    })

    await createScenes(newStory.id, storyData.scenes)
    console.log(`  ✅ Created: ${newStory.id}`)
  }
}

async function main() {
  const storiesDir = path.join(process.cwd(), 'stories')

  if (!fs.existsSync(storiesDir)) {
    fs.mkdirSync(storiesDir)
    console.log('📁 Created /stories folder')
    console.log('   Place your story .json files there and run again.')
    return
  }

  const files = fs.readdirSync(storiesDir)
    .filter(f => f.endsWith('.json'))

  if (files.length === 0) {
    console.log('📁 No .json files found in /stories')
    return
  }

  console.log(`🔄 Found ${files.length} story files\n`)

  for (const file of files) {
    await updateStoryFromFile(path.join(storiesDir, file))
  }

  console.log('\n✨ Done!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())