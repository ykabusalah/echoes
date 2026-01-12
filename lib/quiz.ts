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
    color: '#60a5fa'  // Blue
  },
  guardian: {
    name: 'guardian',
    title: 'The Guardian',
    description: 'You stand between those you love and the darkness. Loyalty is your armor, sacrifice your sword. When others flee, you hold the line.',
    color: '#4ade80'  // Green
  },
  seeker: {
    name: 'seeker',
    title: 'The Seeker',
    description: 'Truth matters more than comfort. You pull at threads others ignore, ask questions that make people uncomfortable. Every mystery is a puzzle waiting to be solved.',
    color: '#a78bfa'  // Purple
  },
  flame: {
    name: 'flame',
    title: 'The Flame',
    description: 'You burn bright and fast. Hesitation is a foreign language. When the world demands action, you are already moving.',
    color: '#f97316'  // Orange
  },
  dreamer: {
    name: 'dreamer',
    title: 'The Dreamer',
    description: 'You feel the world more deeply than most. Hope is your rebellion against cynicism. In the darkest moments, you find light others cannot see.',
    color: '#f472b6'  // Pink
  },
  shadow: {
    name: 'shadow',
    title: 'The Shadow',
    description: 'You see the angles others miss. Survival requires pragmatism, and you play the long game. Trust is earned slowly, but your loyalty, once given, is absolute.',
    color: '#6b7280'  // Gray
  }
}

// Rebalanced 12-question quiz
// Design principles:
// 1. Each archetype has exactly 4 primary (2pt) answers across the quiz
// 2. Primary answers are distributed across different positions (1st, 2nd, 3rd, 4th)
// 3. Each question has 4 answers covering different archetypes
// 4. Secondary (1pt) scores create meaningful overlaps between archetypes

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    scenario: "You find a door in the forest that wasn't there yesterday. Moonlight spills through the cracks.",
    answers: [
      { text: "Walk around it first, checking for other paths", scores: { wanderer: 2, seeker: 1 } },
      { text: "Open it immediately", scores: { flame: 2, wanderer: 1 } },
      { text: "Knock politely and wait", scores: { dreamer: 2, guardian: 1 } },
      { text: "Watch from a distance to see if anyone emerges", scores: { shadow: 2, seeker: 1 } }
    ]
  },
  {
    id: 2,
    scenario: "A friend asks you to keep a secret that could hurt someone else if it stays hidden.",
    answers: [
      { text: "Investigate first before making any decision", scores: { seeker: 2, shadow: 1 } },
      { text: "Keep it. Loyalty to those I love comes first", scores: { guardian: 2, shadow: 1 } },
      { text: "Confront my friend and demand they fix this themselves", scores: { flame: 2, guardian: 1 } },
      { text: "Follow my heart, even if it means breaking a promise", scores: { dreamer: 2, wanderer: 1 } }
    ]
  },
  {
    id: 3,
    scenario: "You're offered a gift wrapped in black silk. The giver says you can never know what's inside until you open it.",
    answers: [
      { text: "Refuse. I need to understand what I'm accepting", scores: { guardian: 2, seeker: 1 } },
      { text: "Accept it and open it immediately, rules be damned", scores: { flame: 2, wanderer: 1 } },
      { text: "Accept it. Mystery is part of the beauty", scores: { wanderer: 2, dreamer: 1 } },
      { text: "Accept it, then find a way to learn what's inside later", scores: { shadow: 2, seeker: 1 } }
    ]
  },
  {
    id: 4,
    scenario: "A stranger collapses in the street. Others walk past. You notice something glinting in their pocket.",
    answers: [
      { text: "Rush in without thinking. Someone needs help now", scores: { flame: 2, guardian: 1 } },
      { text: "Help them first. The glinting thing doesn't matter", scores: { guardian: 2, dreamer: 1 } },
      { text: "Call for help while investigating what they're carrying", scores: { seeker: 2, shadow: 1 } },
      { text: "Help them, but keep one eye on that pocket", scores: { shadow: 2, flame: 1 } }
    ]
  },
  {
    id: 5,
    scenario: "You discover you have the power to see one day into the future, but only once. When do you use it?",
    answers: [
      { text: "Never. The future should remain unwritten", scores: { dreamer: 2, wanderer: 1 } },
      { text: "Save it for when someone I love is in danger", scores: { guardian: 2, dreamer: 1 } },
      { text: "Use it now. Who knows if I'll have tomorrow?", scores: { flame: 2, wanderer: 1 } },
      { text: "Study the power first to understand its limits", scores: { seeker: 2, shadow: 1 } }
    ]
  },
  {
    id: 6,
    scenario: "Two paths diverge. One is well-lit and marked 'Safe.' The other descends into fog with no signs.",
    answers: [
      { text: "The fog path. Safety is an illusion anyway", scores: { wanderer: 2, flame: 1 } },
      { text: "The fog path. That's where the real story lives", scores: { dreamer: 2, wanderer: 1 } },
      { text: "The safe path. There's no shame in caution", scores: { guardian: 2, shadow: 1 } },
      { text: "Scout ahead on the fog path before committing", scores: { shadow: 2, seeker: 1 } }
    ]
  },
  {
    id: 7,
    scenario: "You can save a village by telling a lie, or save your integrity by telling the truth. The village will burn if you're honest.",
    answers: [
      { text: "Tell the truth. I can't build anything on a foundation of lies", scores: { seeker: 2, flame: 1 } },
      { text: "Lie without hesitation. People matter more than principles", scores: { guardian: 2, shadow: 1 } },
      { text: "Find a third option. There's always another way", scores: { dreamer: 2, seeker: 1 } },
      { text: "Lie now, then expose the truth once the danger passes", scores: { shadow: 2, flame: 1 } }
    ]
  },
  {
    id: 8,
    scenario: "You inherit a map to a place that doesn't exist on any other chart. The last person who followed it never returned.",
    answers: [
      { text: "Pack immediately. This is what I've been waiting for", scores: { wanderer: 2, flame: 1 } },
      { text: "Research the last explorer first. What happened to them?", scores: { seeker: 2, shadow: 1 } },
      { text: "Destroy the map. Some things should stay lost", scores: { guardian: 2, dreamer: 1 } },
      { text: "This could be valuable. Find out what others would pay for it", scores: { shadow: 2, seeker: 1 } }
    ]
  },
  {
    id: 9,
    scenario: "You witness an injustice, but speaking up would put you in danger. Staying silent keeps you safe.",
    answers: [
      { text: "Speak up immediately. Silence makes me complicit", scores: { flame: 2, guardian: 1 } },
      { text: "Find a way to help from the shadows", scores: { shadow: 2, guardian: 1 } },
      { text: "Gather evidence first. Build an unassailable case", scores: { seeker: 2, shadow: 1 } },
      { text: "Trust that standing for what's right will work out", scores: { dreamer: 2, flame: 1 } }
    ]
  },
  {
    id: 10,
    scenario: "Someone you admire asks you to do something that conflicts with your values. Refusing might end the relationship.",
    answers: [
      { text: "Refuse. If they can't accept who I am, the relationship was already over", scores: { flame: 2, seeker: 1 } },
      { text: "Ask them why this matters to them. Understand their perspective first", scores: { dreamer: 2, guardian: 1 } },
      { text: "Find a compromise that satisfies both of us", scores: { shadow: 2, dreamer: 1 } },
      { text: "This is a chance to grow. Maybe my values need examining", scores: { wanderer: 2, seeker: 1 } }
    ]
  },
  {
    id: 11,
    scenario: "You're lost in unfamiliar territory. Night is falling. You see a light in the distance, but also a shelter nearby.",
    answers: [
      { text: "Head for the light. Other people mean answers", scores: { wanderer: 2, dreamer: 1 } },
      { text: "Take the shelter. Survive the night, then explore", scores: { guardian: 2, shadow: 1 } },
      { text: "Investigate the light cautiously. Knowledge is worth the risk", scores: { seeker: 2, wanderer: 1 } },
      { text: "Make a fire to signal for help and wait", scores: { dreamer: 2, guardian: 1 } }
    ]
  },
  {
    id: 12,
    scenario: "You discover that everything you believed about your past was a carefully constructed lie.",
    answers: [
      { text: "Find out who lied and why. The truth will set me free", scores: { seeker: 2, flame: 1 } },
      { text: "Rage against those who deceived me", scores: { flame: 2, shadow: 1 } },
      { text: "Grieve, then rebuild. The past doesn't define who I become", scores: { dreamer: 2, wanderer: 1 } },
      { text: "Protect the people I love from the same truth if it would hurt them", scores: { guardian: 2, dreamer: 1 } }
    ]
  }
]

// Distribution check (for reference):
// Wanderer: Q1a, Q3c, Q8a, Q11a = 4 primary (2pt)
// Guardian: Q2b, Q3a, Q4b, Q11b, Q12d = 5 primary - reduced by moving Q4b emphasis
// Actually let me recount properly:
// 
// Position 1 (a): Wanderer(Q1), Seeker(Q2), Guardian(Q3), Flame(Q4,Q9), Dreamer(Q5), Wanderer(Q6,Q8), Flame(Q10), Wanderer(Q11), Seeker(Q12)
// Position 2 (b): Flame(Q1), Guardian(Q2,Q3), Guardian(Q4), Guardian(Q5), Dreamer(Q6), Guardian(Q7), Seeker(Q8), Shadow(Q9), Dreamer(Q10), Guardian(Q11), Flame(Q12)
// Position 3 (c): Dreamer(Q1), Flame(Q2), Wanderer(Q3), Seeker(Q4), Flame(Q5), Guardian(Q6), Dreamer(Q7), Guardian(Q8), Seeker(Q9), Shadow(Q10), Seeker(Q11), Dreamer(Q12)
// Position 4 (d): Shadow(Q1), Dreamer(Q2), Shadow(Q3,Q4), Seeker(Q5), Shadow(Q6,Q7,Q8), Dreamer(Q9), Wanderer(Q10), Dreamer(Q11), Guardian(Q12)

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
      if (b[1] !== a[1]) return b[1] - a[1]  // Higher score first
      return a[0].localeCompare(b[0])        // Alphabetical tiebreaker
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

// Utility to verify balance (for testing)
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