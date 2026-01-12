// scripts/fix-choice-labels.ts
// Fixes existing choices that have [Archetype Path] prefixes baked in
// Run with: npx tsx scripts/fix-choice-labels.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Pattern to match [Archetype Path] or [Archetype path] prefixes
const PATH_LABEL_PATTERN = /^\[(?:wanderer|guardian|seeker|flame|dreamer|shadow)\s*path\]\s*/i

async function fixChoiceLabels(dryRun = true) {
  console.log(`\n🔧 ${dryRun ? '[DRY RUN] ' : ''}Fixing choice labels...\n`)

  // Find all choices with path labels
  const choices = await prisma.choice.findMany({
    where: {
      text: {
        contains: 'Path]'
      }
    },
    include: {
      fromScene: {
        include: { story: true }
      }
    }
  })

  console.log(`Found ${choices.length} choices with potential path labels\n`)

  let fixedCount = 0
  const updates: { id: string; oldText: string; newText: string; story: string }[] = []

  for (const choice of choices) {
    if (PATH_LABEL_PATTERN.test(choice.text)) {
      const newText = choice.text.replace(PATH_LABEL_PATTERN, '').trim()
      
      updates.push({
        id: choice.id,
        oldText: choice.text,
        newText: newText,
        story: choice.fromScene?.story?.title || 'Unknown'
      })
      fixedCount++
    }
  }

  // Display what will be changed
  if (updates.length === 0) {
    console.log('✅ No choices need fixing!')
    return
  }

  console.log('Changes to apply:\n')
  console.log('-'.repeat(80))
  
  for (const update of updates) {
    console.log(`Story: ${update.story}`)
    console.log(`  Before: "${update.oldText}"`)
    console.log(`  After:  "${update.newText}"`)
    console.log()
  }
  
  console.log('-'.repeat(80))
  console.log(`\nTotal: ${fixedCount} choices to fix`)

  if (dryRun) {
    console.log('\n⚠️  This was a dry run. To apply changes, run:')
    console.log('   npx tsx scripts/fix-choice-labels.ts --apply\n')
  } else {
    console.log('\nApplying changes...')
    
    for (const update of updates) {
      await prisma.choice.update({
        where: { id: update.id },
        data: { text: update.newText }
      })
    }
    
    console.log(`\n✅ Fixed ${fixedCount} choices!`)
  }
}

async function main() {
  const dryRun = !process.argv.includes('--apply')
  await fixChoiceLabels(dryRun)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())