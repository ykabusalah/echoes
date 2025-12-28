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

  console.log('✓ Seeded: "The Crossing"')
  console.log(`  - Story ID: ${story.id}`)

  // ============== SECOND STORY: The Interview ==============

  const story2 = await prisma.story.create({
    data: {
      title: 'The Interview',
      description: 'A tech PM interview where every answer shapes your fate.',
      published: true,
    },
  })

  const candidate = await prisma.character.create({
    data: {
      storyId: story2.id,
      name: 'You',
      description: 'A product manager candidate with something to prove.',
    },
  })

  const interviewer = await prisma.character.create({
    data: {
      storyId: story2.id,
      name: 'Sarah',
      description: 'VP of Product. Sharp eyes, neutral expression.',
    },
  })

  const s2scene1 = await prisma.scene.create({
    data: {
      storyId: story2.id,
      title: 'The Lobby',
      content: 'The elevator doors open to a sleek office. A recruiter leads you past rows of engineers to a glass-walled conference room. Sarah, VP of Product, looks up from her laptop. "Thanks for coming in. Let\'s skip the small talk—tell me about a product you think is poorly designed."',
      isStart: true,
      characterId: interviewer.id,
      order: 1,
    },
  })

  const s2scene2a = await prisma.scene.create({
    data: {
      storyId: story2.id,
      title: 'The Safe Answer',
      content: 'You mention a banking app with confusing navigation. Sarah nods slowly. "That\'s a common answer. What would you do differently?" Her tone is polite but you sense she\'s heard this before.',
      characterId: interviewer.id,
      order: 2,
    },
  })

  const s2scene2b = await prisma.scene.create({
    data: {
      storyId: story2.id,
      title: 'The Bold Answer',
      content: 'You take a breath. "Honestly? Your onboarding flow. I signed up last week and almost gave up twice." Sarah\'s eyebrows rise. A long pause. Then she leans forward. "Go on."',
      characterId: interviewer.id,
      order: 2,
    },
  })

  const s2scene3a = await prisma.scene.create({
    data: {
      storyId: story2.id,
      title: 'Playing It Safe',
      content: 'You walk through standard UX improvements. Sarah thanks you for your time. A week later, you get a polite rejection email. "We\'ve decided to move forward with other candidates." You wonder what would have happened if you\'d taken a risk.',
      isEnding: true,
      characterId: candidate.id,
      order: 3,
    },
  })

  const s2scene3b = await prisma.scene.create({
    data: {
      storyId: story2.id,
      title: 'The Deep Dive',
      content: 'You pull out your phone and walk through exactly where you got stuck, what you expected, and how you\'d fix it. Sarah is scribbling notes. "This is the most useful feedback we\'ve gotten in months." She closes her laptop. "Let me introduce you to the team."',
      isEnding: true,
      characterId: interviewer.id,
      order: 3,
    },
  })

  await prisma.choice.createMany({
    data: [
      {
        fromSceneId: s2scene1.id,
        toSceneId: s2scene2a.id,
        text: 'Mention a safe, well-known example',
        order: 1,
      },
      {
        fromSceneId: s2scene1.id,
        toSceneId: s2scene2b.id,
        text: 'Critique their own product',
        order: 2,
      },
      {
        fromSceneId: s2scene2a.id,
        toSceneId: s2scene3a.id,
        text: 'Stick with conventional suggestions',
        order: 1,
      },
      {
        fromSceneId: s2scene2b.id,
        toSceneId: s2scene3b.id,
        text: 'Show your detailed analysis',
        order: 1,
      },
    ],
  })

  console.log('✓ Seeded: "The Interview"')
  console.log(`  - Story ID: ${story2.id}`)

  // ============== THIRD STORY: The Awakening ==============

  const story3 = await prisma.story.create({
    data: {
      title: 'The Awakening',
      description: 'You wake up to discover Pokémon have appeared in the real world. The line between wonder and chaos is thinner than you think.',
      published: true,
    },
  })

  const player = await prisma.character.create({
    data: {
      storyId: story3.id,
      name: 'You',
      description: 'An ordinary person in an extraordinary new world.',
    },
  })

  const roommate = await prisma.character.create({
    data: {
      storyId: story3.id,
      name: 'Dev',
      description: 'Your roommate. Pragmatic, skeptical, currently freaking out.',
    },
  })

  const ranger = await prisma.character.create({
    data: {
      storyId: story3.id,
      name: 'Officer Reyes',
      description: 'A park ranger trying to maintain order in an orderless world.',
    },
  })

  const researcher = await prisma.character.create({
    data: {
      storyId: story3.id,
      name: 'Dr. Yuki Tanaka',
      description: 'A biologist who saw this coming. Nobody believed her.',
    },
  })

  // Scene 1: The Wake Up
  const s3scene1 = await prisma.scene.create({
    data: {
      storyId: story3.id,
      title: 'Something Wrong',
      content: 'You wake to the sound of screaming. Not the frightened kind—the delighted kind. Children, somewhere outside, shrieking with joy.\n\nThen you hear the other sound. A chittering, clicking noise from your bedroom window. You lie still, heart pounding. The morning light catches something yellow moving on the fire escape.\n\nYour phone buzzes. Then buzzes again. Then doesn\'t stop buzzing.\n\nDev bursts through your door, face pale, phone clutched in both hands. "You need to see the news. You need to see it right now."',
      isStart: true,
      characterId: player.id,
      order: 1,
    },
  })

  // Scene 2a: Check the window
  const s3scene2a = await prisma.scene.create({
    data: {
      storyId: story3.id,
      title: 'The Fire Escape',
      content: 'You pull back the curtain. A Pikachu—an actual, living Pikachu—sits on your fire escape, nibbling what looks like the rubber coating from an old cable. It looks up at you. Cheeks spark.\n\nYou don\'t move. It doesn\'t move.\n\nBelow, the street is chaos. A Growlithe chases a taxi. A flock of Pidgey wheels overhead. Someone runs past screaming about their car being "absorbed by a pink blob."\n\nThe Pikachu tilts its head. It almost looks... expectant.',
      characterId: player.id,
      order: 2,
    },
  })

  // Scene 2b: Check the news
  const s3scene2b = await prisma.scene.create({
    data: {
      storyId: story3.id,
      title: 'Every Channel',
      content: 'Dev shoves his phone in your face. CNN, BBC, NHK—every channel shows the same impossible footage. A Gyarados surfacing in Tokyo Bay. Machamp lifting a collapsed overpass in São Paulo while rescue workers stare in disbelief. A Jigglypuff putting an entire airport terminal to sleep.\n\n"It started six hours ago," Dev says, voice shaking. "Everywhere. All at once. They just... appeared."\n\nThe President is speaking now, urging calm. Behind her, through the White House windows, you can see a Butterfree drift past.\n\nYour phone finally stops buzzing. Then a new notification: EMERGENCY ALERT. REMAIN INDOORS. UNKNOWN BIOLOGICAL ENTITIES.',
      characterId: roommate.id,
      order: 2,
    },
  })

  // Scene 3a: Open the window
  const s3scene3a = await prisma.scene.create({
    data: {
      storyId: story3.id,
      title: 'First Contact',
      content: 'Your hands tremble as you unlock the window. The Pikachu watches, ears twitching.\n\n"Hey," you whisper. "Hey, little guy."\n\nIt sniffs your hand. Its fur is coarser than you expected—more like a wild animal than a cartoon. But those eyes. There\'s something behind them. Recognition, maybe. Intelligence.\n\nIt makes a small sound—"Pika"—and nudges your palm with its head.\n\nDev appears behind you. "What are you DOING? That thing could—"\n\nThe Pikachu\'s cheeks spark. Dev freezes. But it doesn\'t attack. It just looks at him, then back at you, then hops down from the window into your room like it owns the place.\n\nSomewhere outside, you hear a distant roar. Something much bigger than a Pikachu.',
      characterId: player.id,
      order: 3,
    },
  })

  // Scene 3b: Stay away from window
  const s3scene3b = await prisma.scene.create({
    data: {
      storyId: story3.id,
      title: 'Behind Closed Curtains',
      content: '"Don\'t," Dev says. "Don\'t go near it."\n\nYou let the curtain fall. The clicking continues outside, then fades. When you check again an hour later, the fire escape is empty except for a scorch mark where the Pikachu sat.\n\nThe news gets worse. The National Guard has been mobilized. A Charizard destroyed a news helicopter over Chicago. Three people are dead in Seoul after an encounter with a territorial Nidoking.\n\nBut there are other stories too. A lost child found safe, led home by a Growlithe. A Blissey appearing in a hospital, healing patients that doctors had given up on. An Alakazam that walked into a university physics lab and began writing equations on the board.\n\nBy noon, the internet has split into two camps: those who want to capture them, and those who want to understand them.\n\nYour phone rings. Unknown number. You answer.\n\n"You saw one, didn\'t you?" The voice is calm, professional. "My name is Dr. Tanaka. I need your help."',
      characterId: roommate.id,
      order: 3,
    },
  })

  // Scene 4a: Go outside with Pikachu
  const s3scene4a = await prisma.scene.create({
    data: {
      storyId: story3.id,
      title: 'Into the New World',
      content: 'The Pikachu follows you down the stairs like it\'s been doing this its whole life. Dev refuses to come.\n\nOutside, the city has transformed. People cluster on sidewalks, some filming, some fleeing, some just standing in shock. A man walks past with a Bulbasaur cradled in his arms like a baby. Two cops stand helplessly as a Snorlax blocks an intersection, fast asleep.\n\nThe Pikachu stays close to your ankles. When a panicked driver nearly hits you, it sparks a warning. The driver swerves.\n\nA woman in a park ranger uniform approaches, hand raised. "Stay calm. I\'m Officer Reyes. We\'re trying to establish safe zones. Is that creature... with you?"\n\nThe Pikachu chirps.\n\n"It seems to think so," you say.\n\nReyes studies you both. "There\'s a shelter at the community center. We could use people they trust. They don\'t trust many of us yet."',
      characterId: ranger.id,
      order: 4,
    },
  })

  // Scene 4b: Help Dr. Tanaka
  const s3scene4b = await prisma.scene.create({
    data: {
      storyId: story3.id,
      title: 'The Scientist',
      content: 'Dr. Tanaka meets you at a coffee shop that somehow remains open. She\'s younger than her voice suggested, with tired eyes and a tablet full of graphs.\n\n"I\'ve been studying dimensional theory for fifteen years," she says. "Parallel worlds. Points of intersection. Everyone thought I was chasing fairy tales." She laughs bitterly. "Now there\'s a Dragonite nesting on the Eiffel Tower."\n\nShe slides the tablet toward you. "They\'re not just appearing randomly. There\'s a pattern. The first sightings clustered around children—hospitals, schools, playgrounds. Then the pattern shifted to areas of conflict. War zones. Protests. As if..."\n\n"As if they were drawn to something," you finish.\n\n"Emotion," she says. "I think they can sense it. Strong emotion pulls them through. Which means we have a choice. We can react with fear, with violence—"\n\n"Or we can react differently."\n\nShe nods. "I need people to help me prove it. Before the military decides to shoot first."',
      characterId: researcher.id,
      order: 4,
    },
  })

  // Scene 5a: Go to shelter (from 4a)
  const s3scene5a = await prisma.scene.create({
    data: {
      storyId: story3.id,
      title: 'The Shelter',
      content: 'The community center is controlled chaos. Families huddle on cots. A Chansey—an actual Chansey—moves between them, offering eggs that glow faintly. People who eat them look healthier within minutes.\n\nIn the corner, a child sits alone with a Cubone. Both look like they\'ve been crying.\n\nYour Pikachu—you\'re already thinking of it as yours—approaches them slowly. The Cubone tenses, but Pikachu sits down and waits. After a long moment, the Cubone relaxes.\n\nOfficer Reyes appears beside you. "They respond to patience. Kindness. The ones that attacked... we think they were scared. Or protecting something." She pauses. "We need more people who understand that. The government wants to categorize them as invasive species. But they\'re not animals. You can see it."\n\n"What can I do?"\n\n"Stay. Help. Be the bridge."',
      characterId: ranger.id,
      order: 5,
    },
  })

  // Scene 5b: Stay and fight alongside Pikachu
  const s3scene5b = await prisma.scene.create({
    data: {
      storyId: story3.id,
      title: 'The First Battle',
      content: 'The roar comes again—closer now. People scatter as something massive rounds the corner. A Tyranitar, seven feet of armor and rage, smashing parked cars like toys. Behind it, a pack of Houndoom spreads out, cutting off escape routes.\n\nYour Pikachu steps forward. Cheeks crackling.\n\n"No," you say. "You\'re too small—"\n\nBut it looks back at you, and there\'s no fear in those eyes. Only determination. It chirps once—almost reassuring—and then moves.\n\nWhat happens next is like nothing you\'ve seen outside a screen. Your Pikachu is fast, impossibly fast, darting between attacks, launching bolts of lightning. A Houndoom goes down. Then another. The Tyranitar swings, misses, roars in frustration.\n\nOther Pokémon emerge from hiding—a Machop, a Shinx, a Riolu—joining the fight. They\'re protecting the people who showed them kindness.\n\nWhen it\'s over, the Tyranitar retreats, wounded. Your Pikachu returns to you, exhausted but unbroken.\n\nA little girl tugs your sleeve. "Is that your Pokémon?"\n\nYou look down at the yellow creature, at the trust in its eyes.\n\n"Yeah," you say. "I think it is."',
      characterId: player.id,
      order: 5,
    },
  })

  // Scene 5c: Join Tanaka's research
  const s3scene5c = await prisma.scene.create({
    data: {
      storyId: story3.id,
      title: 'The Pattern',
      content: 'You spend three days with Dr. Tanaka, mapping sightings, interviewing witnesses, analyzing patterns. The data is undeniable. Pokémon appear in clusters around strong emotional events—a wedding, a funeral, a protest, a reunion.\n\n"They\'re not invaders," Tanaka says, staring at the map. "They\'re responding to a call. Our call. Centuries of stories, games, dreams—billions of people imagining them, wanting them, believing in them. We pulled them here."\n\n"So what happens now?"\n\nShe pulls up a news feed. Governments arguing over containment versus coexistence. Corporations already filing patents. Religious leaders calling it a sign. And everywhere, ordinary people making choices—some reaching out in kindness, others in fear.\n\n"Now we decide what kind of world we want this to be," she says. "One where we fight them? Cage them? Study them like specimens?" She shakes her head. "Or one where we finally learn what we\'ve been trying to teach ourselves through every story we ever told. That different isn\'t dangerous. That power isn\'t the point. That maybe—maybe—we can be better."\n\nYour phone buzzes. It\'s Dev. He\'s found a Pokémon too. An Abra, sitting in the kitchen, refusing to leave.\n\n"What do I do?" he asks.\n\nYou smile. "Make it some coffee. I\'ll be right there."',
      characterId: researcher.id,
      order: 5,
    },
  })

  // Scene 5d: Refuse to get involved
  const s3scene5d = await prisma.scene.create({
    data: {
      storyId: story3.id,
      title: 'Watching from Windows',
      content: 'You tell Dr. Tanaka you\'re not interested. You tell Officer Reyes you just want to stay home. You keep the curtains closed and the TV on, watching the world change through a screen.\n\nWeeks pass. The chaos settles into a new normal. Some Pokémon are captured, contained. Others integrate quietly—a Growlithe adopted by a fire station, a Blissey working in a children\'s hospital. The debates continue, but life goes on.\n\nDev moves out. "I can\'t just sit here," he says. "There\'s a whole new world out there. Aren\'t you curious?"\n\nYou are. You\'ve always been. But curiosity means risk, and risk means loss, and you\'ve had enough loss.\n\nOne night, you hear the clicking again. You pull back the curtain.\n\nA Pikachu sits on your fire escape. Different from before, or maybe the same—you can\'t tell. It looks at you with those dark, knowing eyes.\n\nYou don\'t open the window. But you don\'t close the curtain either.\n\nYou just watch, and wonder what might have been.',
      isEnding: true,
      characterId: player.id,
      order: 5,
    },
  })

  // Scene 6a: Ending - The Bridge
  const s3scene6a = await prisma.scene.create({
    data: {
      storyId: story3.id,
      title: 'The Bridge',
      content: 'Six months later, you stand at the opening ceremony of the first Human-Pokémon Cooperation Center. Officer Reyes gives a speech about coexistence. The Chansey from the shelter is there, now officially employed by the city health department.\n\nYour Pikachu sits on your shoulder—its favorite spot. You\'ve been through a lot together. The early riots. The fear. The slow, painful process of building trust.\n\nA reporter approaches. "You were one of the first. What was it like?"\n\nYou think about that morning. The screaming. The clicking at the window. The choice you made.\n\n"Terrifying," you say. "And wonderful. Mostly both at the same time."\n\nYour Pikachu chirps in agreement.\n\nThe reporter smiles. "Any advice for people still afraid?"\n\nYou look out at the crowd—humans and Pokémon, uncertain, hopeful, trying. "Open the window," you say. "See what happens."',
      isEnding: true,
      characterId: player.id,
      order: 6,
    },
  })

  // Scene 6b: Ending - The Trainer
  const s3scene6b = await prisma.scene.create({
    data: {
      storyId: story3.id,
      title: 'The Trainer',
      content: 'They call you a Trainer now. The word feels strange—borrowed from a game that turned out to be a prophecy.\n\nYour team has grown. Pikachu, the first. Riolu, who evolved into Lucario during the Saffron Street incident. Eevee, rescued from traffickers and now fiercely loyal. They\'re not pets. They\'re not weapons. They\'re partners.\n\nThe world is different now. Pokémon battles are legal in some countries, banned in others. The ethical debates rage on. But you\'ve made your choice: you fight only to protect. Your team understands this. They chose it too.\n\nTonight, you\'re tracking reports of a Mewtwo sighting upstate. Nobody knows where it came from, but the psychic signatures are off the charts.\n\nDev—now your field partner—pulls up beside you in the jeep. "You sure about this?"\n\nYou look at Pikachu. It looks back, cheeks sparking with anticipation.\n\n"No," you say. "But that\'s never stopped us before."\n\nYou drive toward the unknown, together.',
      isEnding: true,
      characterId: player.id,
      order: 6,
    },
  })

  // Scene 6c: Ending - The Researcher
  const s3scene6c = await prisma.scene.create({
    data: {
      storyId: story3.id,
      title: 'The Researcher',
      content: 'Dr. Tanaka wins the Nobel Prize. You\'re in the audience when she accepts it.\n\n"This isn\'t my achievement," she says. "It belongs to everyone who chose curiosity over fear. Who reached out when they could have run away. Who understood that the arrival of Pokémon wasn\'t a crisis to be solved—it was an invitation to evolve."\n\nYou think about the Abra in Dev\'s kitchen, now a Kadabra, helping him with his architecture thesis. You think about the Ditto in the genetics lab that has rewritten everything we know about DNA. You think about the Celebi that appeared briefly in a dying forest and left it blooming.\n\n"We called them here," Tanaka continues. "With our stories. Our dreams. Our desperate, beautiful hope that we weren\'t alone in the universe." She pauses. "We weren\'t. We never were."\n\nAfter the ceremony, she finds you. "I\'m starting a new project. The dimensional barriers are weakening. More crossings are coming. I need someone who understands both worlds."\n\n"Both worlds?"\n\nShe smiles. "The one we lived in. And the one we wished for."\n\nYou accept.',
      isEnding: true,
      characterId: researcher.id,
      order: 6,
    },
  })

  // Create all choices for story 3
  await prisma.choice.createMany({
    data: [
      // From Scene 1
      { fromSceneId: s3scene1.id, toSceneId: s3scene2a.id, text: 'Check the window', order: 1 },
      { fromSceneId: s3scene1.id, toSceneId: s3scene2b.id, text: 'Look at the news first', order: 2 },
      // From Scene 2a
      { fromSceneId: s3scene2a.id, toSceneId: s3scene3a.id, text: 'Open the window', order: 1 },
      { fromSceneId: s3scene2a.id, toSceneId: s3scene3b.id, text: 'Back away slowly', order: 2 },
      // From Scene 2b
      { fromSceneId: s3scene2b.id, toSceneId: s3scene2a.id, text: 'Now check your window', order: 1 },
      { fromSceneId: s3scene2b.id, toSceneId: s3scene3b.id, text: 'Stay inside and keep watching', order: 2 },
      // From Scene 3a
      { fromSceneId: s3scene3a.id, toSceneId: s3scene4a.id, text: 'Go outside with the Pikachu', order: 1 },
      { fromSceneId: s3scene3a.id, toSceneId: s3scene5b.id, text: 'Wait—what\'s that roar?', order: 2 },
      // From Scene 3b
      { fromSceneId: s3scene3b.id, toSceneId: s3scene4b.id, text: 'Answer Dr. Tanaka\'s call', order: 1 },
      { fromSceneId: s3scene3b.id, toSceneId: s3scene5d.id, text: 'Ignore the call, stay safe', order: 2 },
      // From Scene 4a
      { fromSceneId: s3scene4a.id, toSceneId: s3scene5a.id, text: 'Go to the shelter', order: 1 },
      { fromSceneId: s3scene4a.id, toSceneId: s3scene5b.id, text: 'Stay on the streets, help where you can', order: 2 },
      // From Scene 4b
      { fromSceneId: s3scene4b.id, toSceneId: s3scene5c.id, text: 'Join her research team', order: 1 },
      { fromSceneId: s3scene4b.id, toSceneId: s3scene5d.id, text: 'This is too much—go home', order: 2 },
      // From Scene 5a
      { fromSceneId: s3scene5a.id, toSceneId: s3scene6a.id, text: 'Stay and become a bridge', order: 1 },
      // From Scene 5b
      { fromSceneId: s3scene5b.id, toSceneId: s3scene6b.id, text: 'Embrace your role as a Trainer', order: 1 },
      // From Scene 5c
      { fromSceneId: s3scene5c.id, toSceneId: s3scene6c.id, text: 'Dedicate yourself to understanding', order: 1 },
    ],
  })

  console.log('✓ Seeded: "The Awakening"')
  console.log(`  - Story ID: ${story3.id}`)
  console.log('✓ Echoes database seeded with 3 stories')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })