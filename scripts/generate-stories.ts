// scripts/generate-stories.ts
// Run with: npx tsx scripts/generate-stories.ts
// Generates stories with distinct writing styles

import Anthropic from '@anthropic-ai/sdk'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// ============================================
// STORY DEFINITIONS WITH UNIQUE STYLES
// ============================================

const NEW_STORIES = [
  {
    title: 'The Monaco Job',
    description: 'A heist goes sideways on the Riviera.',
    theme: 'heist',
    tier: 2,
    style: {
      voice: 'PULPY AND FUN',
      tone: 'Fast, playful, winking at the reader',
      pov: 'First person, unreliable narrator who talks directly to reader',
      reference: 'Elmore Leonard meets Ocean\'s Eleven',
      rules: [
        'Short punchy sentences. Lots of fragments.',
        'Witty internal monologue',
        'Characters have nicknames and quirks',
        'Tension through comedy, not melodrama',
        'Snappy dialogue, people interrupt each other'
      ]
    },
    setting: 'Monaco casino, yacht party, narrow streets',
    scenes: 8
  },
  {
    title: 'The Resignation',
    description: 'Your last two weeks at a company hiding something.',
    theme: 'corporate',
    tier: 2,
    style: {
      voice: 'DRY AND WRY',
      tone: 'Darkly comic, deadpan, observational',
      pov: 'Second person but detached, almost clinical',
      reference: 'Severance meets The Office (UK)',
      rules: [
        'Mundane details made sinister',
        'Passive-aggressive dialogue, subtext heavy',
        'Humor from corporate absurdity',
        'No exclamation points ever',
        'Characters speak in corporate jargon that means nothing'
      ]
    },
    setting: 'Generic office building, fluorescent lights, beige',
    scenes: 8
  },
  {
    title: 'Kelpie Light',
    description: 'A week alone at a lighthouse. You\'re not alone.',
    theme: 'horror',
    tier: 2,
    style: {
      voice: 'SPARSE AND ATMOSPHERIC',
      tone: 'Creepy, slow burn, sensory',
      pov: 'Second person, present tense, hyper-aware of environment',
      reference: 'The Lighthouse meets Shirley Jackson',
      rules: [
        'Short paragraphs. Lots of white space.',
        'Sound and texture over visual',
        'What you don\'t see is scarier',
        'Weather as character',
        'Protagonist barely speaks, all internal'
      ]
    },
    setting: 'Remote Scottish lighthouse, winter storms, isolation',
    scenes: 8
  },
  {
    title: 'Sublet',
    description: 'House-sitting leads to questions about the owner.',
    theme: 'mystery',
    tier: 2,
    style: {
      voice: 'DIRECT AND CONTEMPORARY',
      tone: 'Realistic, grounded, conversational',
      pov: 'First person, casual, like telling a friend',
      reference: 'Ottessa Moshfegh meets normal people',
      rules: [
        'Natural dialogue with "um" and interruptions',
        'Specific real-world details (brand names, apps)',
        'Protagonist has mundane concerns alongside mystery',
        'No purple prose, just clear observation',
        'Texts and notifications as story elements'
      ]
    },
    setting: 'Brooklyn brownstone, gentrified neighborhood',
    scenes: 8
  },
  {
    title: 'Salton Sea',
    description: 'A road trip where the destination keeps changing.',
    theme: 'surreal',
    tier: 2,
    style: {
      voice: 'DREAMY AND SURREAL',
      tone: 'Magical realism, hypnotic, liminal',
      pov: 'Second person, dreamlike, time is elastic',
      reference: 'Kelly Link meets David Lynch',
      rules: [
        'Logic that feels right but isn\'t',
        'Recurring symbols and motifs',
        'Characters accept the strange without question',
        'Desert heat as hallucinatory force',
        'Endings that loop or dissolve'
      ]
    },
    setting: 'California desert, abandoned motels, endless highway',
    scenes: 8
  },
  {
    title: 'The Horse Trader\'s Daughter',
    description: 'Your father promised you to a man you\'ve never met. The wedding is in three days.',
    theme: 'drama',
    tier: 2,
    style: {
      voice: 'FIERCE AND OBSERVANT',
      tone: 'Defiance simmering under tradition, landscape as freedom',
      pov: 'First person, young woman, sharp-eyed, calculating escape routes',
      reference: 'Kazakh cinema meets Wuthering Heights',
      rules: [
        'Horses are characters with personalities',
        'Mountains and sky as constant presence',
        'Tradition shown without judgment but protagonist pushes against it',
        'Physical competence matters: riding, weather, survival',
        'Silence between people carries meaning'
      ]
    },
    setting: 'Kyrgyzstan high pastures, yurt camps, Song-Kul lake, mountain passes in late autumn',
    scenes: 10
  },
  {
    title: 'The Crossing',
    description: 'The Darien Gap. Sixty miles of jungle. Your guide just disappeared.',
    theme: 'survival',
    tier: 2,
    style: {
      voice: 'VISCERAL AND IMMEDIATE',
      tone: 'Survival without romanticism, body under stress, decisions that cost',
      pov: 'Second person present tense, reduced to senses and next step',
      reference: 'Cormac McCarthy meets survival documentary',
      rules: [
        'Jungle is indifferent, not malevolent',
        'Other migrants are allies and competitors',
        'Spanish dialogue left in Spanish when meaning is clear',
        'Hunger, thirst, insects, mud are constant',
        'No heroics. Just forward.'
      ]
    },
    setting: 'Darien Gap between Colombia and Panama, river crossings, cartel territory, migrant camps',
    scenes: 10
  },
  {
    title: 'The Boatbuilder',
    description: 'Your grandfather\'s last fishing boat. A Japanese collector wants to buy it.',
    theme: 'family legacy',
    tier: 1,
    style: {
      voice: 'SALT AND SAWDUST',
      tone: 'Generational tension, craft as identity, change coming whether you want it',
      pov: 'First person, middle-aged, caught between father and children',
      reference: 'Hemingway\'s Old Man meets Korean family drama',
      rules: [
        'Boat construction details are plot',
        'Three generations, three views of same history',
        'Sea is livelihood not metaphor',
        'Money problems are real and specific',
        'Village is changing. Some welcome it. Some don\'t.'
      ]
    },
    setting: 'Bocas del Toro, Panama. Fishing village, boatyard, mangrove channels, the old dock',
    scenes: 8
  },
  {
    title: 'The Translator',
    description: 'A war crimes tribunal. The witness speaks a dialect you barely know.',
    theme: 'moral drama',
    tier: 3,
    style: {
      voice: 'PRECISE UNDER PRESSURE',
      tone: 'Weight of accuracy, what gets lost between languages',
      pov: 'First person, translator as invisible witness, professional mask cracking',
      reference: 'Hannah Arendt meets courtroom drama',
      rules: [
        'Legal procedure as rhythm',
        'What witness says vs what you translate vs what court hears',
        'Your own history with this conflict, kept hidden',
        'Other translators, other loyalties',
        'One word choice could change everything'
      ]
    },
    setting: 'The Hague tribunal, Sarajevo flashbacks, translator booths, hotel rooms with CNN on mute',
    scenes: 12
  },
  {
    title: 'Sulfur and Honey',
    description: 'The volcano has been rumbling for weeks. Your bees won\'t leave.',
    theme: 'magical realism',
    tier: 2,
    style: {
      voice: 'EARTHY AND STRANGE',
      tone: 'Folk knowledge meets impending disaster, practical magic',
      pov: 'First person, beekeeper, listens to things others dismiss',
      reference: 'Gabriel Garcia Marquez meets nature documentary',
      rules: [
        'Bees communicate. You understand them. Nobody believes you.',
        'Volcano is fact not symbol',
        'Village evacuation politics: who stays, who goes, why',
        'Catholic saints and older beliefs coexist',
        'The honey tastes different now. Metallic.'
      ]
    },
    setting: 'Small village on Volcan de Fuego slopes, Guatemala. Bee yards, church, evacuation route',
    scenes: 10
  },
  {
    title: 'The Night Fishermen',
    description: 'Lake Inle. Floating gardens. A body tangled in the nets.',
    theme: 'mystery',
    tier: 2,
    style: {
      voice: 'STILL WATER',
      tone: 'Quiet menace, community secrets, everything reflected and doubled',
      pov: 'First person, returned to village after years away, outsider insider',
      reference: 'Vietnamese noir meets rural mystery',
      rules: [
        'Water everywhere: transport, livelihood, burial',
        'Leg-rowing fishermen, floating markets, stilt houses',
        'Political situation (Myanmar) present but background',
        'Who you ask determines what truth you get',
        'Night fishing scenes as set pieces'
      ]
    },
    setting: 'Inle Lake, Myanmar. Intha villages, floating tomato gardens, monastery on the water',
    scenes: 10
  },
  {
    title: 'The Ice Road',
    description: 'Sixty tons of cargo. Frozen river. The thaw is coming early.',
    theme: 'thriller',
    tier: 2,
    style: {
      voice: 'ENGINE AND ICE',
      tone: 'Machine and cold as adversaries, deadline pressure',
      pov: 'First person, trucker, practical problem-solver, running out of options',
      reference: 'Wages of Fear on ice',
      rules: [
        'Truck mechanics matter: gear ratios, tire pressure, weight distribution',
        'Ice thickness readings as tension',
        'CB radio voices, other drivers, dispatcher pressure',
        'Cold described through effects on body and machine',
        'No room for mistakes. You make mistakes.'
      ]
    },
    setting: 'Yakutia, Siberia. Ice road over frozen Lena River, truck stops, minus 50 nights',
    scenes: 10
  },
  {
    title: 'The Pepper Trader',
    description: 'Your grandmother\'s spice stall. A stranger asking too many questions.',
    theme: 'cozy thriller',
    tier: 1,
    style: {
      voice: 'MARKET NOISE',
      tone: 'Commerce as community, danger in familiar places',
      pov: 'First person, young woman, knows every vendor, reads people fast',
      reference: 'Marketplace thriller meets coming of age',
      rules: [
        'Spices as sensory anchors: smell, color, texture',
        'Market politics: who has which stall, old feuds, new money',
        'Grandmother taught you more than cooking',
        'Stranger\'s questions reveal what he\'s really looking for',
        'You\'ve been underestimated your whole life'
      ]
    },
    setting: 'Zanzibar Stone Town. Darajani Market, narrow alleys, spice warehouses, rooftop at dusk',
    scenes: 8
  },
  {
    title: 'Salt Flats',
    description: 'A photo expedition. A couple falling apart. The landscape doesn\'t care.',
    theme: 'relationship drama',
    tier: 2,
    style: {
      voice: 'EXPOSURE AND SILENCE',
      tone: 'Relationship in crisis, nowhere to hide, altitude and emptiness',
      pov: 'Alternating first person, both partners, unreliable about each other',
      reference: 'Marriage Story meets Into the Wild',
      rules: [
        'Photography as avoidance and communication',
        'Altitude sickness as metaphor and real problem',
        'Guide sees everything, says nothing',
        'What they came here to escape followed them',
        'The landscape is stunning. They barely notice.'
      ]
    },
    setting: 'Salar de Uyuni, Bolivia. Salt hotel, cactus island, jeep breakdowns, train cemetery',
    scenes: 10
  },
  {
    title: 'The Ger',
    description: 'Winter on the steppe. A stranger\'s horse collapsed outside your door.',
    theme: 'survival drama',
    tier: 2,
    style: {
      voice: 'WOOL AND WIND',
      tone: 'Hospitality as survival, obligation and suspicion',
      pov: 'First person, herder, practical, reads weather and animals better than people',
      reference: 'Mongolian cinema meets survival thriller',
      rules: [
        'The dzud (harsh winter) is coming. Everyone knows.',
        'Stranger brings danger or luck. Which takes time to know.',
        'Animals must be saved. Decisions about which ones.',
        'Ger life described precisely: stove, felt, placement',
        'Hospitality is law. But this man is hiding something.'
      ]
    },
    setting: 'Mongolian steppe, winter. Ger camp, frozen river, nearest town three days ride',
    scenes: 10
  },
  {
    title: 'The Ferry',
    description: 'Overnight crossing. A passenger who shouldn\'t be on the manifest.',
    theme: 'thriller',
    tier: 2,
    style: {
      voice: 'DIESEL AND SALT',
      tone: 'Confined space, limited time, everyone has reasons to disappear',
      pov: 'First person, ship worker, invisible to passengers, sees everything',
      reference: 'And Then There Were None on a ferry',
      rules: [
        'Ship geography matters: decks, cabins, engine room, hiding spots',
        'Twelve-hour crossing as countdown',
        'Passengers have class divisions, workers have their own',
        'Someone on board is not who they say',
        'You recognize them. They don\'t know you do.'
      ]
    },
    setting: 'Overnight ferry from Brindisi to Patras. Deck class, truck drivers, migrants, tourists',
    scenes: 10
  },
  {
    title: 'The Blind Pig',
    description: 'Prohibition. A speakeasy in the swamp. The law is coming.',
    theme: 'historical thriller',
    tier: 2,
    style: {
      voice: 'MOLASSES AND GUNPOWDER',
      tone: 'Period but not precious, survival economy, loyalty tests',
      pov: 'First person, Black woman running the books, smarter than everyone knows',
      reference: 'Boardwalk Empire meets Mudbound',
      rules: [
        'Swamp as character: gators, boats, hiding places',
        '1920s Louisiana: segregation is law but crime is integrated',
        'Numbers running, moonshine, who gets paid first',
        'Dialect authentic but readable',
        'Violence has consequences that ripple'
      ]
    },
    setting: 'Louisiana bayou, 1927. Stilt house speakeasy, fishing boats, the road to New Orleans',
    scenes: 10
  },
  {
    title: 'Graveyard Shift',
    description: 'Night security at a museum. Something in the Egyptian wing keeps moving.',
    theme: 'horror comedy',
    tier: 1,
    style: {
      voice: 'DEADPAN SCARED',
      tone: 'Comedy through underreaction, mundane meets supernatural',
      pov: 'First person, minimum wage energy, too tired for this',
      reference: 'What We Do in the Shadows meets Night at the Museum but actually scary',
      rules: [
        'Protagonist treats supernatural as annoying workplace problem',
        'Coworkers are weirder than the ghosts',
        'HR complaints about non-living entities',
        'Real fear underneath the jokes',
        'Museum facts played straight'
      ]
    },
    setting: 'Natural history museum after hours, Egyptian wing, basement archives, break room',
    scenes: 8
  },
  {
    title: 'Wake',
    description: 'The Irish funeral goes off the rails. Your grandmother would have loved it.',
    theme: 'dark comedy',
    tier: 1,
    style: {
      voice: 'CHAOTIC FAMILY ENERGY',
      tone: 'Grief and laughter tangled, family dysfunction as love language',
      pov: 'First person, exhausted adult grandchild, managing chaos',
      reference: 'The Banshees of Inisherin meets Fleabag',
      rules: [
        'Everyone talks at once',
        'Old grudges surface at worst moments',
        'Drinking is constant and commented on',
        'Grandmother\'s voice in flashbacks, sharp and funny',
        'Death is sad and absurd simultaneously'
      ]
    },
    setting: 'Small Irish village, family home, pub, church, graveyard in the rain',
    scenes: 8
  },
  {
    title: 'The Rememberer',
    description: 'In a world where memories can be sold, you deal in stolen ones.',
    theme: 'neo-noir sci-fi',
    tier: 3,
    style: {
      voice: 'HARDBOILED MELANCHOLY',
      tone: 'Classic noir updated, identity as commodity',
      pov: 'First person, world-weary, has seen too many lives from the inside',
      reference: 'Blade Runner meets Eternal Sunshine meets Raymond Chandler',
      rules: [
        'Memory technology explained through use, not exposition',
        'Whose memories are these? Question throughout',
        'Rain and neon, but make it feel new',
        'Clients are desperate, seller is tired',
        'What you remember vs what happened'
      ]
    },
    setting: 'Near-future LA, memory clinics, black market labs, diners at 4am',
    scenes: 12
  }
]

// ============================================
// ANTI-AI WRITING GUIDELINES
// ============================================

const STYLE_ENFORCEMENT = `
CRITICAL WRITING RULES - VIOLATIONS WILL BE REJECTED:

1. ABSOLUTELY NO EM-DASH ABUSE
   WRONG: "She walked forward—uncertain—toward the door—her heart racing—"
   WRONG: "The sky—dark now—seemed to press down—heavy and cold—"
   RIGHT: "She walked forward. Uncertain. Her heart raced as she reached the door."
   RIGHT: "The sky had gone dark. It seemed to press down on them."
   LIMIT: ZERO em-dashes in the entire story. Use periods instead. Use short sentences.

2. NO PROFOUND REVELATIONS
   WRONG: "You realize this was never about the heist. It was about finding yourself."
   WRONG: "In that moment, everything changed."
   WRONG: "Perhaps the real treasure was the friends we made along the way."
   RIGHT: Just tell the story. Trust the reader.

3. SHOW DON'T TELL EMOTIONS
   WRONG: "A wave of guilt washed over you."
   WRONG: "Fear gripped her heart."
   WRONG: "He felt a surge of anger."
   RIGHT: "Your hands wouldn't stop shaking. You shoved them in your pockets."
   RIGHT: "She couldn't look at him."
   RIGHT: "He kicked the chair over."

4. VARY SENTENCE RHYTHM
   Mix long and short. Not everything needs three beats.
   Not every paragraph needs a punchy one-liner ending.
   Avoid the pattern: "Statement. Statement. Short punch."

5. REAL DIALOGUE
   WRONG: "I understand now," she said, her voice heavy with meaning.
   WRONG: "We need to talk about what happened," he said quietly.
   RIGHT: "Wait, what?" She laughed. "That's insane."
   RIGHT: "So." He wouldn't look at her. "You heard."

6. BANNED AI PHRASES - DO NOT USE THESE:
   - "A mix of [emotion] and [emotion]"
   - "couldn't help but"
   - "found yourself"
   - "something shifted"
   - "the weight of"
   - "in that moment"
   - "little did they know"
   - "a sense of"
   - "washed over"
   - "settled over"
   - "hung in the air"
   - "felt a pang"
   - "let out a breath"
   - "cutting through"
   - "pierced the silence"

7. SPECIFIC DETAILS OVER VAGUE
   WRONG: "an old car" / RIGHT: "a rust-orange Datsun 280Z"
   WRONG: "a song played" / RIGHT: "Fleetwood Mac leaked from a cracked window"
   WRONG: "local food" / RIGHT: "lamb pilaf with yellow carrots and cumin"

8. NO METAPHOR STACKING
   WRONG: "The silence was a living thing, coiling around them like smoke, heavy as stone."
   RIGHT: "Nobody spoke."

9. TRUST THE READER
   Don't explain feelings. Don't explain themes. Don't summarize what just happened.
   If a moment is sad, the reader will feel it. You don't need to say "it was sad."
`

async function generateStory(storyDef: typeof NEW_STORIES[0]) {
  console.log(`\n🎲 Generating: ${storyDef.title}`)
  console.log(`   Style: ${storyDef.style.voice}`)

  const prompt = `You are writing an interactive fiction story for the "Echoes" platform.

STORY: "${storyDef.title}"
LOGLINE: ${storyDef.description}
SETTING: ${storyDef.setting}
THEME: ${storyDef.theme}

=======================================
VOICE & STYLE REQUIREMENTS
=======================================
VOICE: ${storyDef.style.voice}
TONE: ${storyDef.style.tone}
POV: ${storyDef.style.pov}
REFERENCE AUTHORS/WORKS: ${storyDef.style.reference}

SPECIFIC STYLE RULES FOR THIS STORY:
${storyDef.style.rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

${STYLE_ENFORCEMENT}

=======================================
STRUCTURE REQUIREMENTS
=======================================
Generate exactly ${storyDef.scenes} interconnected scenes.

SCENE REQUIREMENTS:
- Scene 1 must have isStart: true
- At least 2 scenes must have isEnding: true (different endings)
- At least 1 scene must have isBranchPoint: true (for AI personalization)
- Each non-ending scene needs 2-3 choices
- Content: 150-300 words per scene
- Choices must be meaningfully different, not just phrasing variations

BRANCHING: Create a tree, not a railroad. Choices should lead to genuinely different paths.

=======================================
OUTPUT FORMAT
=======================================
Respond with ONLY valid JSON. No markdown. No explanation.

{
  "title": "${storyDef.title}",
  "description": "${storyDef.description}",
  "theme": "${storyDef.theme}",
  "tier": ${storyDef.tier},
  "scenes": [
    {
      "title": "Scene Title Here",
      "content": "Full scene content...",
      "isStart": true,
      "isEnding": false,
      "isBranchPoint": false,
      "order": 0,
      "choices": [
        { "text": "Choice text", "leadsTo": "Next Scene Title" }
      ]
    }
  ]
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }]
  })

  const text = response.content[0]
  if (text.type !== 'text') throw new Error('Unexpected response type')

  // Clean JSON
  let jsonStr = text.text.trim()
  jsonStr = jsonStr.replace(/```json\n?|\n?```/g, '')
  
  return JSON.parse(jsonStr)
}

async function saveStory(storyData: any) {
  const storiesDir = path.join(process.cwd(), 'stories', 'generated')
  if (!fs.existsSync(storiesDir)) {
    fs.mkdirSync(storiesDir, { recursive: true })
  }

  const filename = storyData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  const filepath = path.join(storiesDir, `${filename}.json`)
  fs.writeFileSync(filepath, JSON.stringify(storyData, null, 2))
  
  console.log(`   💾 Saved: stories/generated/${filename}.json`)
  return filepath
}

async function main() {
  console.log('🎭 Echoes Story Generator')
  console.log('='.repeat(40))
  console.log(`Generating ${NEW_STORIES.length} stories with distinct voices...\n`)

  const generated: string[] = []

  for (const storyDef of NEW_STORIES) {
    try {
      const storyData = await generateStory(storyDef)
      const filepath = await saveStory(storyData)
      generated.push(filepath)
      
      // Rate limiting
      await new Promise(r => setTimeout(r, 2000))
    } catch (err) {
      console.error(`   ❌ Failed: ${err}`)
    }
  }

  console.log('\n' + '='.repeat(40))
  console.log('✨ Generation complete!')
  console.log(`   ${generated.length}/${NEW_STORIES.length} stories generated`)
  console.log('\nNext steps:')
  console.log('1. Review stories in /stories/generated/')
  console.log('2. Edit as needed')
  console.log('3. Move to /stories/ folder')
  console.log('4. Run: npx tsx scripts/update-stories.ts')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())