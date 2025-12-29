// lib/story-generator.ts

import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

// Story themes that map to archetypes
const THEMES = [
  { theme: 'adventure', description: 'exploration, discovery, journeys into the unknown' },
  { theme: 'mystery', description: 'secrets, investigations, hidden truths' },
  { theme: 'sacrifice', description: 'protecting others, difficult choices, loyalty tested' },
  { theme: 'rebellion', description: 'fighting against injustice, challenging authority' },
  { theme: 'redemption', description: 'second chances, making amends, finding hope' },
  { theme: 'survival', description: 'moral gray areas, difficult decisions, pragmatism' },
  { theme: 'wonder', description: 'magic, fantasy, the extraordinary in ordinary life' },
  { theme: 'connection', description: 'relationships, trust, finding belonging' }
]

const SETTINGS = [
  'a rain-soaked city where neon signs flicker and secrets hide in every shadow',
  'a small coastal village where the sea whispers ancient stories',
  'a sprawling library that exists between worlds, its shelves holding books not yet written',
  'a train journey through a country on the brink of change',
  'a mountain monastery where monks guard a dangerous truth',
  'a space station at the edge of known territory, running low on hope',
  'a carnival that appears only once every decade, granting one wish per visitor',
  'a forest where the trees remember everything and share their memories at dusk'
]

interface GeneratedScene {
  id: string
  title: string
  content: string
  characterName: string | null
  isStart: boolean
  isEnding: boolean
  choices: {
    text: string
    leadsToId: string
  }[]
}

interface GeneratedStory {
  title: string
  description: string
  theme: string
  characters: { name: string; description: string }[]
  scenes: GeneratedScene[]
}

export async function generateStory(): Promise<{ success: boolean; storyId?: string; error?: string }> {
  const startTime = Date.now()
  
  // Randomly select theme and setting
  const theme = THEMES[Math.floor(Math.random() * THEMES.length)]
  const setting = SETTINGS[Math.floor(Math.random() * SETTINGS.length)]
  const sceneCount = Math.floor(Math.random() * 8) + 7 // 7-14 scenes
  const endingCount = Math.floor(Math.random() * 3) + 2 // 2-4 endings

  const prompt = `You are a master storyteller creating an interactive branching narrative. Generate a complete story with the following requirements:

THEME: ${theme.theme} (${theme.description})
SETTING: ${setting}
STRUCTURE: ${sceneCount} total scenes with ${endingCount} different endings

REQUIREMENTS:
1. Create 2-4 memorable characters with distinct voices
2. Each non-ending scene must have 2-3 choices
3. Choices should feel meaningful and reflect different approaches (cautious vs bold, emotional vs logical, etc.)
4. Multiple paths should be possible - not all scenes need to be visited in one playthrough
5. Endings should feel earned and different from each other (not just "good" vs "bad")
6. Scene content should be 50-80 words, evocative and atmospheric
7. The story should be completable in 4-7 scenes depending on path taken

IMPORTANT: Return ONLY valid JSON matching this exact structure, no other text:

{
  "title": "Story Title",
  "description": "A one-sentence hook that intrigues readers",
  "theme": "${theme.theme}",
  "characters": [
    { "name": "Character Name", "description": "Brief description" }
  ],
  "scenes": [
    {
      "id": "scene_1",
      "title": "Scene Title",
      "content": "The narrative content of this scene...",
      "characterName": "Name of speaking/focal character or null",
      "isStart": true,
      "isEnding": false,
      "choices": [
        { "text": "Choice text the reader sees", "leadsToId": "scene_2" },
        { "text": "Another choice", "leadsToId": "scene_3" }
      ]
    }
  ]
}

Ensure all scene IDs referenced in choices exist in the scenes array. Ending scenes should have an empty choices array.`

  let generationLog
  
  try {
    // Log the generation attempt
    generationLog = await prisma.storyGeneration.create({
      data: {
        prompt: prompt.substring(0, 5000), // Truncate for storage
        model: "claude-sonnet-4-20250514",
        success: false
      }
    })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [
        { role: 'user', content: prompt }
      ]
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // Parse the JSON response
    // Parse the JSON response (strip markdown code fences if present)
    let jsonText = content.text.trim()
    if (jsonText.startsWith('```json')) {
  jsonText = jsonText.slice(7) // Remove ```json
}
if (jsonText.startsWith('```')) {
  jsonText = jsonText.slice(3) // Remove ```
}
if (jsonText.endsWith('```')) {
  jsonText = jsonText.slice(0, -3) // Remove trailing ```
}
const storyData: GeneratedStory = JSON.parse(jsonText.trim())

    // Validate structure
    if (!storyData.title || !storyData.scenes || storyData.scenes.length === 0) {
      throw new Error('Invalid story structure')
    }

    // Create the story in database
    const story = await prisma.story.create({
      data: {
        title: storyData.title,
        description: storyData.description,
        theme: storyData.theme,
        published: true,
        status: 'FEATURED',
        generatedBy: 'ai',
        aiPrompt: prompt.substring(0, 2000),
        featuredAt: new Date()
      }
    })

    // Create characters
    const characterMap = new Map<string, string>()
    for (const char of storyData.characters) {
      const created = await prisma.character.create({
        data: {
          storyId: story.id,
          name: char.name,
          description: char.description
        }
      })
      characterMap.set(char.name, created.id)
    }

    // Create scenes (first pass - without choice connections)
    const sceneMap = new Map<string, string>()
    for (const scene of storyData.scenes) {
      const characterId = scene.characterName ? characterMap.get(scene.characterName) : null
      
      const created = await prisma.scene.create({
        data: {
          storyId: story.id,
          title: scene.title,
          content: scene.content,
          isStart: scene.isStart,
          isEnding: scene.isEnding,
          characterId: characterId || null,
          order: storyData.scenes.indexOf(scene)
        }
      })
      sceneMap.set(scene.id, created.id)
    }

    // Create choices (second pass - now we have all scene IDs)
    for (const scene of storyData.scenes) {
      const fromSceneId = sceneMap.get(scene.id)!
      
      for (let i = 0; i < scene.choices.length; i++) {
        const choice = scene.choices[i]
        const toSceneId = sceneMap.get(choice.leadsToId)
        
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

    const duration = Date.now() - startTime

    // Update generation log with success
    await prisma.storyGeneration.update({
      where: { id: generationLog.id },
      data: {
        success: true,
        storyId: story.id,
        durationMs: duration,
        tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens
      }
    })

    return { success: true, storyId: story.id }

  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Update generation log with failure
    if (generationLog) {
      await prisma.storyGeneration.update({
        where: { id: generationLog.id },
        data: {
          success: false,
          error: errorMessage,
          durationMs: duration
        }
      })
    }

    console.error('Story generation failed:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Archive old featured stories and feature a new one
export async function rotateFeatureStory(newStoryId: string) {
  // Archive current featured stories
  await prisma.story.updateMany({
    where: { status: 'FEATURED' },
    data: { 
      status: 'ARCHIVED',
      archivedAt: new Date()
    }
  })

  // Feature the new story
  await prisma.story.update({
    where: { id: newStoryId },
    data: {
      status: 'FEATURED',
      featuredAt: new Date()
    }
  })
}