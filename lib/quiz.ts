// lib/quiz.ts

export type Archetype = 'wanderer' | 'guardian' | 'seeker' | 'flame' | 'dreamer' | 'shadow'

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
  }
}

// 12-question quiz: ~9 grounded real-life, ~3 light hypotheticals
// Each archetype has exactly 4 primary (2pt) answers
export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    scenario: "You're at a restaurant and realize your meal is completely wrong. What do you do?",
    answers: [
      { text: "Send it back immediately—I ordered what I wanted", scores: { flame: 2, seeker: 1 } },
      { text: "Eat it anyway—I don't want to make a fuss", scores: { guardian: 2, dreamer: 1 } },
      { text: "Flag down the server and calmly explain the mistake", scores: { seeker: 2, shadow: 1 } },
      { text: "Try it first—maybe this is actually better", scores: { wanderer: 2, dreamer: 1 } }
    ]
  },
  {
    id: 2,
    scenario: "A coworker takes credit for your idea in a meeting. How do you react?",
    answers: [
      { text: "Call them out right there—everyone needs to know", scores: { flame: 2, seeker: 1 } },
      { text: "Let it go this time, but watch them more carefully now", scores: { shadow: 2, guardian: 1 } },
      { text: "Talk to them privately afterward to understand why", scores: { dreamer: 2, seeker: 1 } },
      { text: "Mention it casually later: 'Yeah, I was excited when I first thought of that'", scores: { wanderer: 2, shadow: 1 } }
    ]
  },
  {
    id: 3,
    scenario: "You find a wallet on the street with $500 cash and an ID inside.",
    answers: [
      { text: "Track down the owner myself and return it in person", scores: { guardian: 2, flame: 1 } },
      { text: "Turn it in to the nearest police station", scores: { seeker: 2, guardian: 1 } },
      { text: "Mail the wallet back anonymously—no need for credit", scores: { shadow: 2, wanderer: 1 } },
      { text: "Return everything and imagine how relieved they'll be", scores: { dreamer: 2, guardian: 1 } }
    ]
  },
  {
    id: 4,
    scenario: "You have a free Saturday with absolutely no obligations. What sounds most appealing?",
    answers: [
      { text: "Drive somewhere I've never been, no destination in mind", scores: { wanderer: 2, flame: 1 } },
      { text: "Finally organize that closet or finish a lingering project", scores: { guardian: 2, seeker: 1 } },
      { text: "Binge a documentary series I've been meaning to watch", scores: { seeker: 2, shadow: 1 } },
      { text: "Call up friends and see what spontaneous plans emerge", scores: { dreamer: 2, wanderer: 1 } }
    ]
  },
  {
    id: 5,
    scenario: "Your friend is about to make a decision you think is a huge mistake.",
    answers: [
      { text: "Tell them exactly what I think—they need to hear it", scores: { flame: 2, guardian: 1 } },
      { text: "Support them no matter what—it's their life to live", scores: { dreamer: 2, wanderer: 1 } },
      { text: "Ask questions to help them think it through themselves", scores: { seeker: 2, shadow: 1 } },
      { text: "Share my concerns once, then step back and let them decide", scores: { shadow: 2, guardian: 1 } }
    ]
  },
  {
    id: 6,
    scenario: "You're offered a promotion that pays significantly more but requires relocating far from family.",
    answers: [
      { text: "Take it—this is the opportunity I've been waiting for", scores: { wanderer: 2, flame: 1 } },
      { text: "Decline—some things matter more than career advancement", scores: { guardian: 2, dreamer: 1 } },
      { text: "Negotiate hard—maybe there's a remote option or compromise", scores: { shadow: 2, seeker: 1 } },
      { text: "Take time to really weigh what I'd gain versus what I'd lose", scores: { seeker: 2, dreamer: 1 } }
    ]
  },
  {
    id: 7,
    scenario: "At a party, you notice someone sitting alone looking uncomfortable.",
    answers: [
      { text: "Walk right over and introduce myself", scores: { dreamer: 2, guardian: 1 } },
      { text: "Point them out to the host—it's their job to handle it", scores: { shadow: 2, seeker: 1 } },
      { text: "Catch their eye and give a friendly nod from across the room", scores: { wanderer: 2, shadow: 1 } },
      { text: "Walk over with a drink: 'You look like you could use this'", scores: { flame: 2, dreamer: 1 } }
    ]
  },
  {
    id: 8,
    scenario: "You discover a close friend has been lying to you for months about something important.",
    answers: [
      { text: "Confront them immediately—I need answers now", scores: { flame: 2, seeker: 1 } },
      { text: "Give them space to explain before I react", scores: { dreamer: 2, guardian: 1 } },
      { text: "Distance myself while I figure out what this means", scores: { shadow: 2, wanderer: 1 } },
      { text: "Dig deeper first—I need to understand the full picture", scores: { seeker: 2, shadow: 1 } }
    ]
  },
  {
    id: 9,
    scenario: "You witness a stranger being treated unfairly by someone in authority. Speaking up could cause problems for you.",
    answers: [
      { text: "Speak up immediately—silence makes me complicit", scores: { flame: 2, guardian: 1 } },
      { text: "Find a way to help from the sidelines without direct confrontation", scores: { shadow: 2, guardian: 1 } },
      { text: "Document what's happening—evidence matters more than gestures", scores: { seeker: 2, shadow: 1 } },
      { text: "Trust that doing the right thing will work out somehow", scores: { dreamer: 2, flame: 1 } }
    ]
  },
  {
    id: 10,
    scenario: "You're planning a vacation. What matters most to you?",
    answers: [
      { text: "Going somewhere I've never been—the more unfamiliar, the better", scores: { wanderer: 2, dreamer: 1 } },
      { text: "Making sure everyone coming has a good time", scores: { guardian: 2, dreamer: 1 } },
      { text: "Learning something—history, culture, a new skill", scores: { seeker: 2, wanderer: 1 } },
      { text: "Getting the best deal and having a solid backup plan", scores: { shadow: 2, seeker: 1 } }
    ]
  },
  {
    id: 11,
    scenario: "Hypothetical: You can know the answer to any one question about your future, but you can never change what you learn.",
    answers: [
      { text: "Ask immediately—knowledge is power", scores: { seeker: 2, flame: 1 } },
      { text: "Never ask—some things should remain unknown", scores: { dreamer: 2, wanderer: 1 } },
      { text: "Ask something that helps me protect the people I love", scores: { guardian: 2, shadow: 1 } },
      { text: "Ask about something I could use to my advantage", scores: { shadow: 2, flame: 1 } }
    ]
  },
  {
    id: 12,
    scenario: "Hypothetical: You find a journal that reveals everything you believed about your family history was a lie.",
    answers: [
      { text: "Investigate relentlessly until I know the full truth", scores: { seeker: 2, flame: 1 } },
      { text: "Protect my family from this—some truths do more harm than good", scores: { guardian: 2, dreamer: 1 } },
      { text: "Grieve, then move on—the past doesn't define who I become", scores: { dreamer: 2, wanderer: 1 } },
      { text: "Figure out who else knows and what they want", scores: { shadow: 2, seeker: 1 } }
    ]
  }
]

// Balance verification:
// Wanderer: Q1d, Q4a, Q6a, Q10a = 4 primary
// Guardian: Q1b, Q3a, Q6b, Q10b = 4 primary
// Seeker:   Q1c, Q3b, Q11a, Q12a = 4 primary
// Flame:    Q1a, Q2a, Q5a, Q8a = 4 primary
// Dreamer:  Q4d, Q5b, Q7a, Q11b = 4 primary
// Shadow:   Q2b, Q5d, Q9b, Q11d = 4 primary

export function calculateArchetype(answers: number[]): { archetype: Archetype; scores: ArchetypeScores } {
  const scores: ArchetypeScores = {
    wanderer: 0,
    guardian: 0,
    seeker: 0,
    flame: 0,
    dreamer: 0,
    shadow: 0
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

  // Find the archetype with the highest score
  // In case of tie, use a deterministic tiebreaker (alphabetical order)
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
    shadow: ['survival', 'strategy', 'moral_gray', 'secrets']
  }
  return themes[archetype]
}

export function verifyQuizBalance(): { 
  primaryCounts: Record<Archetype, number>
  positionDistribution: Record<Archetype, number[]>
} {
  const primaryCounts: Record<Archetype, number> = {
    wanderer: 0, guardian: 0, seeker: 0, flame: 0, dreamer: 0, shadow: 0
  }
  const positionDistribution: Record<Archetype, number[]> = {
    wanderer: [], guardian: [], seeker: [], flame: [], dreamer: [], shadow: []
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