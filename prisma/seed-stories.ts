// prisma/seed-stories.ts
// Run with: npx ts-node prisma/seed-stories.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const stories = [
  {
    title: 'The Bells of Kathmandu',
    description: 'A mysterious map leads you through the ancient temples of Nepal, where every choice echoes through centuries of hidden history.',
    theme: 'seeker',
    location: 'Nepal',
    scenes: [
      {
        title: 'The Map Seller',
        content: 'The old woman\'s stall sits wedged between a tea shop and a fabric merchant in the labyrinthine streets of Thamel. She doesn\'t look up as you approach, but her weathered hands push a yellowed paper toward you.\n\n"You\'ve been looking for this," she says. "The map to Nāga Pokhari. The serpent pool that grants answers."\n\nThe map shows a route through temples you\'ve never heard of, ending at a location marked only with a coiled snake.',
        isStart: true,
        choices: [
          { text: 'Ask her how she knew you were searching', leadsTo: 'The Woman\'s Secret' },
          { text: 'Pay for the map without questions', leadsTo: 'The First Temple' },
          { text: 'Refuse—this feels like a trap', leadsTo: 'Walking Away' }
        ]
      },
      {
        title: 'The Woman\'s Secret',
        content: 'She finally meets your eyes. They\'re clouded with cataracts, yet somehow piercing.\n\n"Your mother came to me thirty years ago with the same question in her heart. She never found the pool." The woman pauses. "But she found something else. Something that led to you standing here today."\n\nShe places a small brass bell beside the map. "Take both. Ring the bell only when you\'re truly lost."',
        choices: [
          { text: 'Ask about your mother', leadsTo: 'Mother\'s Path' },
          { text: 'Take the items and begin your journey', leadsTo: 'The First Temple' }
        ]
      },
      {
        title: 'The First Temple',
        content: 'Swayambhunath rises before you, the eyes of Buddha painted on its white dome seeming to track your movement. Prayer flags snap in the wind, carrying wishes to the sky.\n\nThe map indicates a passage behind the main stupa, but monks patrol the area. A young novice notices you studying the walls and approaches.',
        choices: [
          { text: 'Show him the map and ask for help', leadsTo: 'The Novice\'s Choice' },
          { text: 'Wait until nightfall to explore alone', leadsTo: 'Night at the Temple' }
        ]
      },
      {
        title: 'Walking Away',
        content: 'You turn from the stall, but her voice follows you: "The questions don\'t stop just because you stop asking them."\n\nThat night, you dream of water—dark, still, ancient. Something waits beneath the surface. When you wake, the map is on your bedside table. You never took it. You\'re certain you never took it.',
        isEnding: true
      },
      {
        title: 'Mother\'s Path',
        content: 'The woman\'s story unfolds: your mother sought the pool to ask about her future child—you. She never reached it, but along the way she met your father at a monastery in the mountains.\n\n"She chose love over answers," the woman says. "Now you must choose what you seek."\n\nThe map feels heavier somehow. The journey ahead will change you either way.',
        isEnding: true
      },
      {
        title: 'The Novice\'s Choice',
        content: 'The young monk studies the map with widening eyes. "This path... my teacher spoke of it once. He said some doors should remain closed."\n\nHe looks around nervously, then whispers: "But he also said that those who are meant to find the pool cannot be stopped. I will show you the passage—but I cannot go with you beyond the first gate."',
        isEnding: true
      },
      {
        title: 'Night at the Temple',
        content: 'The temple transforms under moonlight. The painted eyes seem to glow, and you hear the distant sound of bells though nothing moves.\n\nBehind the stupa, you find the passage—a narrow gap that shouldn\'t exist in solid stone. As you squeeze through, you realize you\'re not alone. Someone else has been following the map tonight.',
        isEnding: true
      }
    ]
  },
  {
    title: 'Corrido of the Crossing',
    description: 'In a small town on the Mexico-US border, a grandmother\'s final wish sends you into a web of family secrets, old debts, and impossible choices.',
    theme: 'guardian',
    location: 'Mexico',
    scenes: [
      {
        title: 'Abuela\'s Letter',
        content: 'The letter arrives three days after her funeral. Your grandmother\'s handwriting, shaky but determined:\n\n"Mi corazón, I have kept something from you. Your grandfather did not die in 1987. He crossed to the other side—the border, not heaven—and he never came back. But he is still alive. I need you to find him and give him what I could not: forgiveness."\n\nA faded photograph falls from the envelope. A young man stands before a church in a town you don\'t recognize.',
        isStart: true,
        choices: [
          { text: 'Travel to the town in the photograph', leadsTo: 'San Miguel de la Frontera' },
          { text: 'Call your mother first—she deserves to know', leadsTo: 'Mother\'s Reaction' },
          { text: 'Burn the letter. Some secrets should stay buried.', leadsTo: 'Ashes and Regret' }
        ]
      },
      {
        title: 'San Miguel de la Frontera',
        content: 'The town bakes under an unforgiving sun. The church from the photograph still stands, though its white paint has faded to gray.\n\nInside, an elderly priest arranges flowers at the altar. When you show him the photograph, his hands still.\n\n"Rodrigo Vega," he whispers. "I wondered when someone would come looking. He\'s not here anymore—but I know where he went. The question is whether you\'re prepared for what you\'ll find."',
        choices: [
          { text: '"Tell me everything."', leadsTo: 'The Priest\'s Story' },
          { text: '"Just tell me where he is."', leadsTo: 'The Address' }
        ]
      },
      {
        title: 'Mother\'s Reaction',
        content: 'The phone is silent for a long moment after you read the letter aloud.\n\n"I knew," your mother finally says. "Not everything—but I knew he didn\'t die. Mamá told me when I was sixteen. She made me promise never to look for him." Her voice hardens. "He left us. He chose to leave. Whatever forgiveness she wanted to give him, that was hers. You don\'t owe him anything."',
        choices: [
          { text: '"I need to do this, Mom. For Abuela."', leadsTo: 'San Miguel de la Frontera' },
          { text: '"You\'re right. I\'ll let this go."', leadsTo: 'Letting Go' }
        ]
      },
      {
        title: 'Ashes and Regret',
        content: 'The letter catches quickly, the old paper eager for flame. You watch your grandmother\'s last wish curl into smoke.\n\nBut that night, and every night after, you dream of a man walking north through desert scrub, looking back over his shoulder with your eyes—eyes you inherited from someone you\'ll never meet.',
        isEnding: true
      },
      {
        title: 'The Priest\'s Story',
        content: '"Rodrigo came to me forty years ago, desperate. He owed money to dangerous men—he thought leaving would protect his family. I helped him cross, God forgive me."\n\nThe priest sits heavily in a pew. "He built a new life in Mississippi, working the fishing boats. Changed his name. But he never stopped sending money back—anonymously. Your grandmother\'s house, your mother\'s education... he paid for all of it from the shadows."',
        isEnding: true
      },
      {
        title: 'The Address',
        content: 'The priest writes an address on a prayer card: Biloxi, Mississippi. A phone number below it.\n\n"He\'s old now. Sick. He calls me sometimes." The priest presses the card into your hands. "He\'s been waiting for this. Waiting for someone to come. I think he\'s been waiting to be found so he can finally stop hiding."',
        isEnding: true
      },
      {
        title: 'Letting Go',
        content: 'You honor your mother\'s wish, as your grandmother honored hers for decades. The letter goes into a box with other family documents, its secret preserved but unacted upon.\n\nYears later, at your mother\'s funeral, a stranger appears at the back of the church. An old man with your eyes. He leaves before you can reach him, but he leaves flowers—the same kind your grandmother always grew in her garden.',
        isEnding: true
      }
    ]
  },
  {
    title: 'The Lanterns of Hội An',
    description: 'A chance encounter during the Full Moon Festival pulls you into a story of war, memory, and the ghosts we carry across generations.',
    theme: 'dreamer',
    location: 'Vietnam',
    scenes: [
      {
        title: 'The Festival',
        content: 'Hội An transforms on the full moon. Electric lights dim, and thousands of silk lanterns paint the ancient town in watercolor hues. You\'ve come as a tourist, but the old woman who approaches you by the Thu Bồn River sees something else.\n\n"You have her face," she says in accented English. "The American nurse. 1969. She saved my brother\'s life." She presses a paper lantern into your hands. "Will you light this with me? For the dead and the living?"',
        isStart: true,
        choices: [
          { text: 'Light the lantern and ask about the nurse', leadsTo: 'The Story Unfolds' },
          { text: 'Politely decline—you\'re not who she thinks', leadsTo: 'Mistaken Identity' },
          { text: 'Light the lantern in silence, sharing the moment', leadsTo: 'Shared Silence' }
        ]
      },
      {
        title: 'The Story Unfolds',
        content: 'Her name is Linh, and she was seven when the American nurse saved her brother from a shrapnel wound. "She stayed when others ran. Treated Vietnamese and American soldiers the same. My mother said she was proof that war cannot kill kindness."\n\nLihn shows you a photograph: a young woman in army fatigues, exhausted but smiling. The resemblance is undeniable—she could be your grandmother.\n\n"She wrote to us for years. Then the letters stopped. We never knew what happened to her."',
        choices: [
          { text: '"That might actually be my grandmother..."', leadsTo: 'The Connection' },
          { text: '"I\'ll help you find out what happened to her"', leadsTo: 'The Search' }
        ]
      },
      {
        title: 'Mistaken Identity',
        content: '"Forgive me," she says, but her eyes linger on your face. "The spirits play tricks during festival. They show us what we long to see."\n\nShe lights her lantern alone and sets it on the river. You watch it drift among hundreds of others, each one carrying a wish, a memory, a name. You\'ll never know whose name hers carries.',
        isEnding: true
      },
      {
        title: 'Shared Silence',
        content: 'Words aren\'t necessary. You light the lantern together, her weathered hands steadying your unfamiliar ones. The flame catches, warm through the silk.\n\nAs you release it onto the river, she whispers a name—or maybe a prayer. The lantern joins the others, indistinguishable now, part of something larger.\n\n"Thank you," she says. "Whoever you are. Thank you for being here tonight."',
        isEnding: true
      },
      {
        title: 'The Connection',
        content: 'You call your father that night, waking him at 3 AM in Ohio. The questions spill out: Grandma\'s service record, her time in Vietnam, why she never talked about the war.\n\nThe silence on the line tells you everything. "She made me promise," he finally says. "She had a whole other life there. People she loved. When she came home, she tried to keep writing, but... it was too hard. It broke her every time."\n\nLinh is still waiting by the river when you return with the truth.',
        isEnding: true
      },
      {
        title: 'The Search',
        content: 'Over the following days, Linh introduces you to her network: veterans, historians, families who\'ve spent decades searching for closure. You photograph documents, record testimonies, promise to search American archives.\n\nOn your last night, Linh gives you her brother\'s dog tags—the ones the nurse returned to him after surgery. "Find her," she says. "Or find her family. Tell them she is not forgotten. Tell them she still has family here."',
        isEnding: true
      }
    ]
  },
  {
    title: 'Mudwater Gospel',
    description: 'A hurricane bears down on the Mississippi Delta, and you must choose what—and who—to save before the waters rise.',
    theme: 'flame',
    location: 'United States - Mississippi',
    scenes: [
      {
        title: 'The Warning',
        content: 'The radio crackles with emergency broadcasts: Category 4, direct hit, mandatory evacuation. But you\'re standing in your grandmother\'s church—the one she built with her own hands after the last flood—and sixty-three years of gospel music and Sunday dinners are staring back at you from the walls.\n\nYour phone buzzes. Your brother: "Roads closing in 2 hours. You coming or not?"\n\nThrough the window, you see Old Mae on her porch across the street. She\'s ninety-one and hasn\'t evacuated for a storm since 1965.',
        isStart: true,
        choices: [
          { text: 'Go to Mae first—she needs help', leadsTo: 'Old Mae\'s Choice' },
          { text: 'Load what you can from the church and go', leadsTo: 'Saving What Matters' },
          { text: 'You\'re staying. This church survived before.', leadsTo: 'Riding It Out' }
        ]
      },
      {
        title: 'Old Mae\'s Choice',
        content: '"I ain\'t leaving, sugar." Mae rocks steadily on her porch, watching the sky turn green-gray. "Buried three husbands from this porch. Raised seven children. If the Lord wants me, He knows where to find me."\n\nShe pats the chair beside her. "But I wouldn\'t mind company. Got a generator, got canned peaches, got stories you never heard. Your grandmother and I had some adventures, you know. Before she got respectable."',
        choices: [
          { text: 'Stay with Mae through the storm', leadsTo: 'The Long Night' },
          { text: 'Convince her to come with you', leadsTo: 'Reluctant Departure' }
        ]
      },
      {
        title: 'Saving What Matters',
        content: 'You work fast, making impossible choices. The photo of the original congregation in 1961. Your grandmother\'s handwritten hymnbook. The stained glass window is too heavy, too fragile—you take a picture instead and pray.\n\nAs you load the car, Deacon Williams pulls up. "Thought you might need help. What else can we carry?"',
        choices: [
          { text: 'Take the pews—they\'re handmade, irreplaceable', leadsTo: 'The Pews' },
          { text: 'Get the baptismal font—it survived the 1927 flood', leadsTo: 'Living History' }
        ]
      },
      {
        title: 'Riding It Out',
        content: 'The church groans like a living thing. Water seeps under the door, then rises to your ankles, your knees. You climb to the choir loft, then the rafters, clutching your grandmother\'s Bible.\n\nIn the howling dark, you start to sing. The old songs, the ones she taught you. And somehow, impossibly, you hear voices joining in. Mae from across the street. The Williams family. Others you can\'t see.\n\nThe community is here. The church is wherever you sing together.',
        isEnding: true
      },
      {
        title: 'The Long Night',
        content: 'The storm screams for eight hours. Mae\'s house shudders but holds. She tells you stories between wind gusts: your grandmother sneaking out to blues clubs in the 1950s, the secret romance with a traveling preacher before she met your grandfather.\n\nWhen dawn comes, the street is a river. But Mae\'s porch sits just above the waterline, and across the way, the church steeple still points at the sky.',
        isEnding: true
      },
      {
        title: 'Reluctant Departure',
        content: '"Fine," Mae sighs, letting you help her to your car. "But I\'m bringing my records. And if Mahalia Jackson gets water damaged, I\'m blaming you personally."\n\nYou make it to the highway with twenty minutes to spare. In the rearview mirror, the Delta disappears behind sheets of rain. Mae pats your hand.\n\n"Buildings can be rebuilt, baby. It\'s the people that matter. Your grandmother knew that. That\'s why she built a church instead of a monument."',
        isEnding: true
      },
      {
        title: 'The Pews',
        content: 'It takes four of you and every rope in the deacon\'s truck. The pews are heavier than sin itself, your grandmother used to say. But you get them loaded as the first bands of rain arrive.\n\nSix months later, those pews sit in a community center three towns over. They\'re still holding Sunday services, still holding the weight of prayers. The building was always just wood and stone. This is the church.',
        isEnding: true
      },
      {
        title: 'Living History',
        content: 'The baptismal font has names carved inside it—every soul baptized since 1927. Your grandmother\'s name. Your mother\'s. Yours. Deacon Williams helps you lift it into the truck bed.\n\n"This thing\'s seen more floods than any of us," he says. "Guess it\'ll see a few more."\n\nThe church can be rebuilt. But this—this is memory made solid. This is why you came back.',
        isEnding: true
      }
    ]
  },
  {
    title: 'The Night Market',
    description: 'In the neon-lit streets of Taipei, a stranger offers you a deal that could change everything—but nothing in the night market is what it seems.',
    theme: 'shadow',
    location: 'Taiwan',
    scenes: [
      {
        title: 'The Offer',
        content: 'Shilin Night Market swallows you in steam and noise and light. You\'re lost—happily, deliberately lost—when the woman in the red dress appears at your elbow.\n\n"You\'re looking for something," she says. Not a question. "Everyone who wanders here alone is looking for something. I can help you find it—but you\'ll have to tell me what it is first."\n\nHer smile doesn\'t reach her eyes. Behind her, a stall sells wooden masks that seem to watch you.',
        isStart: true,
        choices: [
          { text: '"I\'m just a tourist."', leadsTo: 'Just a Tourist' },
          { text: '"I\'m looking for someone who disappeared here."', leadsTo: 'The Disappeared' },
          { text: '"What would it cost me?"', leadsTo: 'The Price' }
        ]
      },
      {
        title: 'Just a Tourist',
        content: '"No one is just anything." She produces a business card from nowhere—blank except for an address. "When you\'re ready to admit what you\'re really looking for, come find me. The market remembers everyone who walks through it. And everyone leaves something behind."\n\nShe vanishes into the crowd. The card feels warm in your pocket. You tell yourself you\'ll throw it away.\n\nYou don\'t throw it away.',
        isEnding: true
      },
      {
        title: 'The Disappeared',
        content: 'Her expression shifts—something like recognition. "The American who came six months ago. Asked too many questions about the old temple district. Yes, I know where he went."\n\nShe leads you through the market\'s hidden layers: past the tourist stalls, past the locals-only food vendors, into a maze of alleys where the neon doesn\'t reach. "Your friend found something he shouldn\'t have. But he\'s alive. The question is whether finding him will make things better or worse."',
        choices: [
          { text: 'Keep following her', leadsTo: 'The Hidden Temple' },
          { text: 'This is too dangerous—leave now', leadsTo: 'Retreat' }
        ]
      },
      {
        title: 'The Price',
        content: '"Smart," she says. "Most people don\'t ask until after. The price is a secret. One you\'ve never told anyone. The more valuable the secret, the more I can help you find."\n\nShe leans closer. "But be careful what you offer. Secrets have weight. Once you give one away, you can never take it back. And some secrets, once spoken, change the speaker forever."',
        choices: [
          { text: 'Tell her your deepest secret', leadsTo: 'The Exchange' },
          { text: 'Walk away—some prices are too high', leadsTo: 'Walking Away Price' }
        ]
      },
      {
        title: 'The Hidden Temple',
        content: 'The temple shouldn\'t exist—not here, not surrounded by modern buildings. But there it stands, ancient and patient, its incense smoke curling into shapes that almost form words.\n\nYour friend sits in the courtyard, thin but alive, surrounded by journals filled with frantic writing. "I found it," he whispers. "The answer to everything. But the answer has a question, and the question has a cost, and I\'ve been trying to figure out if it\'s worth paying."\n\nHe looks at you with eyes that have seen too much. "Now you have to decide too."',
        isEnding: true
      },
      {
        title: 'Retreat',
        content: 'You pull away from the woman, backing toward the lights and noise of the main market. "A wise choice," she calls after you, not following. "Or a cowardly one. Time will tell."\n\nYou fly home the next day. You never find your friend. But sometimes, in the liminal space between sleep and waking, you see those alleys stretching out before you, and you wonder what waited at the end.',
        isEnding: true
      },
      {
        title: 'The Exchange',
        content: 'The secret leaves you like a physical thing—a weight lifted, or perhaps removed. The woman closes her eyes as she receives it, and when she opens them, they\'re different. Older.\n\n"Follow the masks," she says. "They\'ll show you what you need. But remember: you came to the night market looking for something. The market also looks back. And now it knows you."',
        isEnding: true
      },
      {
        title: 'Walking Away Price',
        content: 'You shake your head and back away. She lets you go, but her voice follows: "Everyone pays eventually. The only choice is whether you pay in secrets or in regrets."\n\nThe night market closes around you again, bright and normal and loud. But for the rest of your trip, you catch glimpses of her red dress in crowds, always at the edge of vision, always watching. Some offers, once made, are never fully refused.',
        isEnding: true
      }
    ]
  }
]

async function main() {
  console.log('Seeding stories...')

  for (const story of stories) {
    console.log(`Creating: ${story.title}`)

    // Create story
    const created = await prisma.story.create({
      data: {
        title: story.title,
        description: story.description,
        theme: story.theme,
        status: 'ARCHIVED',
        published: true
      }
    })

    // Create scenes
    const sceneMap = new Map<string, string>()
    
    for (let i = 0; i < story.scenes.length; i++) {
      const scene = story.scenes[i]
      const createdScene = await prisma.scene.create({
        data: {
          storyId: created.id,
          title: scene.title,
          content: scene.content,
          isStart: scene.isStart || false,
          isEnding: scene.isEnding || false,
          order: i
        }
      })
      sceneMap.set(scene.title, createdScene.id)
    }

    // Create choices
    for (const scene of story.scenes) {
      if (scene.choices) {
        const fromSceneId = sceneMap.get(scene.title)!
        for (let i = 0; i < scene.choices.length; i++) {
          const choice = scene.choices[i]
          const toSceneId = sceneMap.get(choice.leadsTo)
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
  }

  console.log('Done seeding stories!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())