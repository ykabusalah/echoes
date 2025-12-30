import Anthropic from '@anthropic-ai/sdk'
import { Archetype, archetypeInfo, getArchetypeThemes } from './quiz'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

interface GenerateChoiceParams {
  sceneContent: string
  sceneTitle: string
  storyTitle: string
  existingChoices: string[]
  archetype: Archetype
}

export async function generatePersonalizedChoice({
  sceneContent,
  sceneTitle,
  storyTitle,
  existingChoices,
  archetype
}: GenerateChoiceParams): Promise<string> {
  const info = archetypeInfo[archetype]
  const themes = getArchetypeThemes(archetype)

  const prompt = `You are a writer for an interactive fiction game called "Echoes."

STORY: "${storyTitle}"
CURRENT SCENE: "${sceneTitle}"
SCENE CONTENT:
${sceneContent}

EXISTING CHOICES (that all readers see):
${existingChoices.map((c, i) => `${i + 1}. ${c}`).join('\n')}

THE READER'S ARCHETYPE: ${info.title}
ARCHETYPE DESCRIPTION: ${info.description}
ARCHETYPE THEMES: ${themes.join(', ')}

TASK: Generate ONE additional choice that would specifically appeal to a ${info.title} reader. This choice should:
- Align with their personality (${themes.slice(0, 2).join(', ')})
- Feel natural in the scene context
- Be distinct from existing choices
- Be roughly the same length as existing choices (1 short sentence)
- NOT be obviously "better" or "worse" than other choices

Respond with ONLY the choice text, nothing else. No quotes, no explanation, no numbering.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 100,
    messages: [{ role: 'user', content: prompt }]
  })

  const text = response.content[0]
  if (text.type === 'text') {
    return text.text.trim()
  }
  
  throw new Error('Failed to generate choice')
}