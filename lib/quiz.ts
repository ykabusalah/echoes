export type Archetype = 'wanderer' | 'guardian' | 'seeker' | 'flame' | 'dreamer' | 'shadow' | 'jackal'

export type ArchetypeScores = Record<Archetype, number>

export interface QuizAnswer {
  text: string
  scores: Partial<ArchetypeScores>
}

export interface QuizQuestion {
  id: number
  scenario: string
  answers: QuizAnswer[]
}

export const archetypeInfo: Record<Archetype, { name: string; title: string; description: string; color: string }> = {
  wanderer: {
    name: 'wanderer',
    title: 'The Wanderer',
    description: 'You follow the wind wherever it blows. Curiosity is your compass, and every door is an invitation. You find beauty in the unknown and trust that the path will reveal itself.',
    color: '#60a5fa'
  },
  guardian: {
    name: 'guardian',
    title: 'The Guardian',
    description: 'You stand between those you love and the darkness. Loyalty is your armor, sacrifice your sword. When others flee, you hold the line.',
    color: '#4ade80'
  },
  seeker: {
    name: 'seeker',
    title: 'The Seeker',
    description: 'Truth matters more than comfort. You pull at threads others ignore, ask questions that make people uncomfortable. Every mystery is a puzzle waiting to be solved.',
    color: '#a78bfa'
  },
  flame: {
    name: 'flame',
    title: 'The Flame',
    description: 'You burn bright and fast. Hesitation is a foreign language. When the world demands action, you are already moving.',
    color: '#f97316'
  },
  dreamer: {
    name: 'dreamer',
    title: 'The Dreamer',
    description: 'You feel the world more deeply than most. Hope is your rebellion against cynicism. In the darkest moments, you find light others cannot see.',
    color: '#f472b6'
  },
  shadow: {
    name: 'shadow',
    title: 'The Shadow',
    description: 'You see the angles others miss. Survival requires pragmatism, and you play the long game. Trust is earned slowly, but your loyalty, once given, is absolute.',
    color: '#6b7280'
  },
  jackal: {
    name: 'jackal',
    title: 'The Jackal',
    description: 'You see opportunities where others see obligations. Self-interest isn\'t selfishness to you. It\'s honesty. Everyone else is playing the same game. You just admit it.',
    color: '#b45309'
  }
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    scenario: "Your meal arrives completely wrong. You're starving.",
    answers: [
      { text: "Send it back. I ordered what I wanted.", scores: { flame: 2, seeker: 1 } },
      { text: "Eat it anyway. Not worth the hassle.", scores: { guardian: 2, shadow: 1 } },
      { text: "Try it. Might actually be better than what I ordered.", scores: { wanderer: 2, dreamer: 1 } },
      { text: "Send it back and ask for a discount. This is on them.", scores: { seeker: 2, jackal: 1 } }
    ]
  },
  {
    id: 2,
    scenario: "A coworker takes credit for your idea in a meeting. Your boss seems impressed.",
    answers: [
      { text: "Call it out right there. Everyone needs to know.", scores: { flame: 2, seeker: 1 } },
      { text: "Let it slide, but remember it. Information is leverage.", scores: { shadow: 2, jackal: 1 } },
      { text: "Talk to them afterward. Maybe there's an explanation.", scores: { dreamer: 2, guardian: 1 } },
      { text: "Mention it casually later: 'Yeah, I was excited when I first thought of that.'", scores: { jackal: 2, shadow: 1 } }
    ]
  },
  {
    id: 3,
    scenario: "You find a wallet on the sidewalk. Inside: $500 cash and a driver's license. The address is a few blocks away.",
    answers: [
      { text: "Walk it over myself. I'd want someone to do that for me.", scores: { guardian: 2, dreamer: 1 } },
      { text: "Drop it at the nearest police station. Safest option.", scores: { seeker: 2, shadow: 1 } },
      { text: "Take the cash, mail the wallet. They get their cards back.", scores: { shadow: 2, jackal: 1 } },
      { text: "Keep it. Shouldn't have lost it.", scores: { jackal: 2, flame: 1 } }
    ]
  },
  {
    id: 4,
    scenario: "Free Saturday. No plans, no obligations. What sounds best?",
    answers: [
      { text: "Drive somewhere I've never been. No destination.", scores: { wanderer: 2, flame: 1 } },
      { text: "Finally tackle that project I've been putting off.", scores: { guardian: 2, seeker: 1 } },
      { text: "Deep dive into something I've been curious about.", scores: { seeker: 2, shadow: 1 } },
      { text: "Call people, see what happens. Best days are unplanned.", scores: { dreamer: 2, wanderer: 1 } }
    ]
  },
  {
    id: 5,
    scenario: "Your friend is about to make a decision you think is a huge mistake.",
    answers: [
      { text: "Tell them straight. They need to hear it, even if it hurts.", scores: { flame: 2, guardian: 1 } },
      { text: "Support them anyway. It's their life, their choice.", scores: { dreamer: 2, wanderer: 1 } },
      { text: "Ask questions. Help them think it through without pushing.", scores: { seeker: 2, shadow: 1 } },
      { text: "Say my piece once, then let it go. Not my problem after that.", scores: { jackal: 2, shadow: 1 } }
    ]
  },
  {
    id: 6,
    scenario: "Big promotion offer. Great money. But you'd have to relocate far from everyone you know.",
    answers: [
      { text: "Take it. This is the opportunity I've been waiting for.", scores: { wanderer: 2, jackal: 1 } },
      { text: "Turn it down. Some things matter more than money.", scores: { guardian: 2, dreamer: 1 } },
      { text: "Negotiate hard. Remote work, delayed start, something.", scores: { shadow: 2, seeker: 1 } },
      { text: "Take time to really weigh it. No rushing this.", scores: { seeker: 2, dreamer: 1 } }
    ]
  },
  {
    id: 7,
    scenario: "You're at a party. Someone's sitting alone, clearly uncomfortable.",
    answers: [
      { text: "Walk over, introduce myself. Everyone deserves to feel included.", scores: { dreamer: 2, guardian: 1 } },
      { text: "Catch their eye, give a nod. Let them decide if they want company.", scores: { wanderer: 2, shadow: 1 } },
      { text: "Bring them a drink. 'You look like you need this.'", scores: { flame: 2, dreamer: 1 } },
      { text: "Not my problem. I'm here to have fun.", scores: { jackal: 2, flame: 1 } }
    ]
  },
  {
    id: 8,
    scenario: "You find out a close friend has been lying to you for months about something important.",
    answers: [
      { text: "Confront them immediately. I need answers.", scores: { flame: 2, seeker: 1 } },
      { text: "Give them a chance to explain before I react.", scores: { dreamer: 2, guardian: 1 } },
      { text: "Pull back. Need space to figure out what this changes.", scores: { shadow: 2, wanderer: 1 } },
      { text: "Cut them off. I don't keep liars around.", scores: { jackal: 2, flame: 1 } }
    ]
  },
  {
    id: 9,
    scenario: "A stranger is being treated unfairly by someone in authority. Speaking up could make things worse for you.",
    answers: [
      { text: "Speak up anyway. Can't just stand there.", scores: { flame: 2, guardian: 1 } },
      { text: "Help quietly from the sidelines. Avoid direct confrontation.", scores: { guardian: 2, shadow: 1 } },
      { text: "Record it. Evidence matters more than gestures.", scores: { seeker: 2, jackal: 1 } },
      { text: "Stay out of it. Not my fight, not my problem.", scores: { jackal: 2, shadow: 1 } }
    ]
  },
  {
    id: 10,
    scenario: "You're planning a trip. What matters most?",
    answers: [
      { text: "Somewhere I've never been. The more unfamiliar, the better.", scores: { wanderer: 2, dreamer: 1 } },
      { text: "Making sure everyone coming has a good time.", scores: { guardian: 2, dreamer: 1 } },
      { text: "Learning something. History, culture, a new skill.", scores: { seeker: 2, wanderer: 1 } },
      { text: "What I want to do. Everyone else can figure out their own plans.", scores: { flame: 2, jackal: 1 } }
    ]
  },
  {
    id: 11,
    scenario: "You can know the answer to one question about your future. But you can never change what you learn.",
    answers: [
      { text: "Ask immediately. Knowledge is power.", scores: { seeker: 2, flame: 1 } },
      { text: "Never ask. Some things should stay unknown.", scores: { dreamer: 2, wanderer: 1 } },
      { text: "Ask something that helps me protect the people I love.", scores: { guardian: 2, shadow: 1 } },
      { text: "Ask something I can use to my advantage.", scores: { jackal: 2, flame: 1 } }
    ]
  },
  {
    id: 12,
    scenario: "You find a journal that proves everything you believed about your family history was a lie.",
    answers: [
      { text: "Investigate until I know the full truth. All of it.", scores: { seeker: 2, flame: 1 } },
      { text: "Protect my family from this. Some truths do more harm than good.", scores: { guardian: 2, dreamer: 1 } },
      { text: "Grieve, then move on. The past doesn't define who I become.", scores: { dreamer: 2, wanderer: 1 } },
      { text: "Figure out who else knows. And what they might want.", scores: { shadow: 2, jackal: 1 } }
    ]
  }
]

export function calculateArchetype(answers: number[]): { archetype: Archetype; scores: ArchetypeScores } {
  const scores: ArchetypeScores = {
    wanderer: 0,
    guardian: 0,
    seeker: 0,
    flame: 0,
    dreamer: 0,
    shadow: 0,
    jackal: 0
  }

  answers.forEach((answerIndex, questionIndex) => {
    const question = quizQuestions[questionIndex]
    if (question && question.answers[answerIndex]) {
      const answerScores = question.answers[answerIndex].scores
      Object.entries(answerScores).forEach(([archetype, points]) => {
        scores[archetype as Archetype] += points
      })
    }
  })

  const sortedArchetypes = Object.entries(scores)
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1]
      return a[0].localeCompare(b[0])
    })
  
  const archetype = sortedArchetypes[0][0] as Archetype

  return { archetype, scores }
}

export function getArchetypeThemes(archetype: Archetype): string[] {
  const themes: Record<Archetype, string[]> = {
    wanderer: ['adventure', 'exploration', 'mystery', 'journey'],
    guardian: ['sacrifice', 'protection', 'loyalty', 'family'],
    seeker: ['truth', 'puzzle', 'investigation', 'knowledge'],
    flame: ['action', 'conflict', 'passion', 'rebellion'],
    dreamer: ['hope', 'emotion', 'fantasy', 'redemption'],
    shadow: ['survival', 'strategy', 'moral_gray', 'secrets'],
    jackal: ['opportunity', 'self_interest', 'cunning', 'pragmatism']
  }
  return themes[archetype]
}

export function verifyQuizBalance(): { 
  primaryCounts: Record<Archetype, number>
  positionDistribution: Record<Archetype, number[]>
} {
  const primaryCounts: Record<Archetype, number> = {
    wanderer: 0, guardian: 0, seeker: 0, flame: 0, dreamer: 0, shadow: 0, jackal: 0
  }
  const positionDistribution: Record<Archetype, number[]> = {
    wanderer: [], guardian: [], seeker: [], flame: [], dreamer: [], shadow: [], jackal: []
  }

  quizQuestions.forEach((q, qIndex) => {
    q.answers.forEach((a, aIndex) => {
      const primaryArchetype = Object.entries(a.scores).find(([_, pts]) => pts === 2)?.[0] as Archetype | undefined
      if (primaryArchetype) {
        primaryCounts[primaryArchetype]++
        positionDistribution[primaryArchetype].push(aIndex + 1)
      }
    })
  })

  return { primaryCounts, positionDistribution }
}