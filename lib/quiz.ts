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
    description: 'You burn bright and fast. Hesitation is a foreign language. When the world demands action, you are already moving—consequences be damned.',
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

// Rebalanced: Each archetype now has 2-3 primary (2pt) answers across the quiz
export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    scenario: "You find a door in the forest that wasn't there yesterday. Moonlight spills through the cracks.",
    answers: [
      { text: "Open it immediately—adventure awaits", scores: { flame: 2, wanderer: 1 } },
      { text: "Walk around it first, checking for other paths", scores: { wanderer: 2, seeker: 1 } },
      { text: "Wait and watch from a distance", scores: { shadow: 2, guardian: 1 } },
      { text: "Knock politely—whoever made this deserves respect", scores: { dreamer: 2, guardian: 1 } }
    ]
  },
  {
    id: 2,
    scenario: "A friend asks you to keep a secret that could hurt someone else if it stays hidden.",
    answers: [
      { text: "Keep it—loyalty to those I love comes first", scores: { guardian: 2, shadow: 1 } },
      { text: "Tell them I need to think about it, then follow my heart", scores: { dreamer: 2, wanderer: 1 } },
      { text: "Investigate first—I need all the facts before deciding", scores: { seeker: 2, shadow: 1 } },
      { text: "Confront my friend directly and demand they fix this", scores: { flame: 2, guardian: 1 } }
    ]
  },
  {
    id: 3,
    scenario: "You're offered a gift wrapped in black silk, but told you can never know what's inside until you open it.",
    answers: [
      { text: "Accept it—mystery is part of the beauty", scores: { wanderer: 2, dreamer: 1 } },
      { text: "Refuse—I need to understand what I'm accepting", scores: { guardian: 2, seeker: 1 } },
      { text: "Accept it, then find a way to learn what's inside later", scores: { shadow: 2, seeker: 1 } },
      { text: "Accept it and open it immediately, rules be damned", scores: { flame: 2, wanderer: 1 } }
    ]
  },
  {
    id: 4,
    scenario: "A stranger collapses in the street. Others walk past. You notice something glinting in their pocket.",
    answers: [
      { text: "Help them first—the glinting thing doesn't matter", scores: { guardian: 2, dreamer: 1 } },
      { text: "Help them, but keep one eye on that pocket", scores: { shadow: 2, flame: 1 } },
      { text: "Call for help while investigating what they're carrying", scores: { seeker: 2, shadow: 1 } },
      { text: "Rush in without thinking—someone needs help now", scores: { flame: 2, guardian: 1 } }
    ]
  },
  {
    id: 5,
    scenario: "You discover you have the power to see one day into the future, but only once. When do you use it?",
    answers: [
      { text: "Save it for when someone I love is in danger", scores: { guardian: 2, dreamer: 1 } },
      { text: "Use it now—who knows if I'll have tomorrow?", scores: { flame: 2, wanderer: 1 } },
      { text: "Study the power first to understand its limits", scores: { seeker: 2, shadow: 1 } },
      { text: "Never use it—the future should remain unwritten", scores: { dreamer: 2, wanderer: 1 } }
    ]
  },
  {
    id: 6,
    scenario: "Two paths diverge. One is well-lit and marked 'Safe.' The other descends into fog with no signs.",
    answers: [
      { text: "The fog path—safety is an illusion anyway", scores: { wanderer: 2, flame: 1 } },
      { text: "The safe path—there's no shame in caution", scores: { guardian: 2, shadow: 1 } },
      { text: "Scout ahead on the fog path before committing", scores: { shadow: 2, seeker: 1 } },
      { text: "The fog path—that's where the real story lives", scores: { dreamer: 2, wanderer: 1 } }
    ]
  },
  {
    id: 7,
    scenario: "You can save a village by telling a lie, or save your integrity by telling the truth. The village will burn if you're honest.",
    answers: [
      { text: "Lie without hesitation—people matter more than principles", scores: { guardian: 2, shadow: 1 } },
      { text: "Tell the truth—I can't build anything on a foundation of lies", scores: { seeker: 2, flame: 1 } },
      { text: "Find a third option—there's always another way", scores: { dreamer: 2, seeker: 1 } },
      { text: "Lie now, then expose the truth once the danger passes", scores: { shadow: 2, flame: 1 } }
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

  const archetype = Object.entries(scores).reduce((a, b) => 
    b[1] > a[1] ? b : a
  )[0] as Archetype

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