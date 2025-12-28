// prisma/seed.ts
// Echoes - Sample story seed data

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.choiceEvent.deleteMany()
  await prisma.readerSession.deleteMany()
  await prisma.choice.deleteMany()
  await prisma.scene.deleteMany()
  await prisma.character.deleteMany()
  await prisma.story.deleteMany()

  // Create a sample story
  const story = await prisma.story.create({
    data: {
      title: 'The Crossing',
      description: 'A short interactive story about a refugee\'s journey to safety.',
      published: true,
    },
  })

  // Create characters
  const protagonist = await prisma.character.create({
    data: {
      storyId: story.id,
      name: 'Amira',
      description: 'A young woman fleeing conflict, carrying her family\'s hopes.',
    },
  })

  const guide = await prisma.character.create({
    data: {
      storyId: story.id,
      name: 'Hassan',
      description: 'A weathered smuggler with a complicated conscience.',
    },
  })

  // Create scenes
  const scene1 = await prisma.scene.create({
    data: {
      storyId: story.id,
      title: 'The Shore',
      content: 'The boat rocks beneath your feet. Thirty people crowd a vessel meant for ten. Across the dark water, you can barely see the lights of the distant shore. Hassan looks at you. "We leave in five minutes. Last chance to turn back."',
      isStart: true,
      characterId: protagonist.id,
      order: 1,
    },
  })

  const scene2a = await prisma.scene.create({
    data: {
      storyId: story.id,
      title: 'Courage',
      content: 'You grip the side of the boat and nod. "I didn\'t come this far to stop now." Hassan almost smiles. The engine sputters to life, and the shore begins to shrink behind you. A child nearby starts to cry, and her mother hums a lullaby you recognize from your own childhood.',
      characterId: protagonist.id,
      order: 2,
    },
  })

  const scene2b = await prisma.scene.create({
    data: {
      storyId: story.id,
      title: 'Hesitation',
      content: 'Your feet won\'t move. The faces of everyone you\'re leaving behind flash through your mind. Hassan sighs. "I\'ve seen that look before. Fear is wisdom sometimes." He presses something into your hand—a phone number. "Call this when you\'re ready. If you\'re ever ready."',
      characterId: guide.id,
      order: 2,
    },
  })

  const scene3a = await prisma.scene.create({
    data: {
      storyId: story.id,
      title: 'The Lights',
      content: 'Hours pass. Dawn breaks pink and gold over the water. And then—land. Real, solid land. People around you are weeping, praying, laughing. You don\'t know what comes next, but you\'re alive. You made it. The crossing is complete.',
      isEnding: true,
      characterId: protagonist.id,
      order: 3,
    },
  })

  const scene3b = await prisma.scene.create({
    data: {
      storyId: story.id,
      title: 'The Return',
      content: 'You walk back through the dark streets to the room you\'ve been renting. The phone number burns in your pocket. Tomorrow, you tell yourself. Or the next day. The journey isn\'t over—it just hasn\'t begun yet.',
      isEnding: true,
      characterId: protagonist.id,
      order: 3,
    },
  })

  // Create choices connecting scenes
  await prisma.choice.createMany({
    data: [
      {
        fromSceneId: scene1.id,
        toSceneId: scene2a.id,
        text: 'Step onto the boat',
        order: 1,
      },
      {
        fromSceneId: scene1.id,
        toSceneId: scene2b.id,
        text: 'Step back from the water',
        order: 2,
      },
      {
        fromSceneId: scene2a.id,
        toSceneId: scene3a.id,
        text: 'Hold on through the night',
        order: 1,
      },
      {
        fromSceneId: scene2b.id,
        toSceneId: scene3b.id,
        text: 'Walk away',
        order: 1,
      },
    ],
  })

  console.log('✓ Echoes database seeded with sample story: "The Crossing"')
  console.log(`  - Story ID: ${story.id}`)
  console.log(`  - 2 characters, 5 scenes, 4 choices`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })