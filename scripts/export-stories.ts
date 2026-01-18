import { prisma } from '../lib/db'

async function main() {
  const stories = await prisma.story.findMany({
    include: { scenes: { include: { choicesFrom: true } } }
  })
  console.log(JSON.stringify(stories, null, 2))
}

main()