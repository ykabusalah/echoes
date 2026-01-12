// scripts/inspect-choices.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get all choices that have an archetypeTarget (personalized choices)
  const personalizedChoices = await prisma.choice.findMany({
    where: {
      archetypeTarget: { not: null }
    },
    include: {
      fromScene: {
        include: { story: true }
      }
    },
    take: 20
  })

  console.log(`\nFound ${personalizedChoices.length} personalized choices:\n`)
  
  for (const choice of personalizedChoices) {
    console.log(`Story: ${choice.fromScene?.story?.title}`)
    console.log(`  Archetype: ${choice.archetypeTarget}`)
    console.log(`  Text: "${choice.text}"`)
    console.log()
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())