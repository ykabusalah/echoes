type IconProps = {
  className?: string
}

export function WandererIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="32" cy="20" r="8" />
      <path d="M20 58 L32 35 L44 58" strokeLinejoin="round" />
      <path d="M32 35 L32 20" />
      <path d="M16 28 C20 32, 26 30, 32 28 C38 26, 44 28, 48 32" strokeLinecap="round" />
      <path d="M8 45 L18 40 M56 45 L46 40" strokeLinecap="round" />
      <circle cx="32" cy="8" r="2" fill="currentColor" />
    </svg>
  )
}

export function GuardianIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M32 8 L52 18 L52 34 C52 46 42 54 32 58 C22 54 12 46 12 34 L12 18 Z" strokeLinejoin="round" />
      <path d="M32 20 L32 42" strokeLinecap="round" />
      <path d="M24 30 L40 30" strokeLinecap="round" />
      <circle cx="32" cy="30" r="8" strokeWidth="1.5" />
    </svg>
  )
}

export function SeekerIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="28" cy="28" r="16" />
      <path d="M40 40 L54 54" strokeLinecap="round" strokeWidth="3" />
      <circle cx="28" cy="28" r="6" />
      <path d="M28 18 L28 22 M28 34 L28 38 M18 28 L22 28 M34 28 L38 28" strokeLinecap="round" />
      <circle cx="28" cy="28" r="2" fill="currentColor" />
    </svg>
  )
}

export function FlameIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M32 6 C32 6 42 18 42 30 C42 38 40 44 36 48 C40 44 42 38 38 30 C38 30 36 36 32 40 C28 36 26 30 26 30 C22 38 24 44 28 48 C24 44 22 38 22 30 C22 18 32 6 32 6 Z" strokeLinejoin="round" />
      <path d="M26 52 C26 56 28 58 32 58 C36 58 38 56 38 52" strokeLinecap="round" />
      <ellipse cx="32" cy="36" rx="4" ry="6" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export function DreamerIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="32" cy="36" r="16" />
      <path d="M32 20 L32 12" strokeLinecap="round" />
      <path d="M44 24 L50 18" strokeLinecap="round" />
      <path d="M20 24 L14 18" strokeLinecap="round" />
      <circle cx="32" cy="8" r="3" fill="currentColor" />
      <circle cx="52" cy="16" r="2" fill="currentColor" />
      <circle cx="12" cy="16" r="2" fill="currentColor" />
      <path d="M26 34 C26 34 28 38 32 38 C36 38 38 34 38 34" strokeLinecap="round" />
      <circle cx="26" cy="32" r="2" fill="currentColor" />
      <circle cx="38" cy="32" r="2" fill="currentColor" />
    </svg>
  )
}

export function ShadowIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M32 8 L38 24 L56 26 L42 38 L46 56 L32 46 L18 56 L22 38 L8 26 L26 24 Z" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="8" fill="currentColor" opacity="0.2" />
      <path d="M28 30 L30 34 L36 30" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export const archetypeIcons: Record<string, React.FC<IconProps>> = {
  wanderer: WandererIcon,
  guardian: GuardianIcon,
  seeker: SeekerIcon,
  flame: FlameIcon,
  dreamer: DreamerIcon,
  shadow: ShadowIcon
}

export const archetypeColors: Record<string, string> = {
  wanderer: 'hsl(200, 70%, 50%)',   // Blue - exploration
  guardian: 'hsl(45, 80%, 50%)',    // Gold - protection
  seeker: 'hsl(270, 60%, 55%)',     // Purple - mystery
  flame: 'hsl(15, 85%, 55%)',       // Orange-red - passion
  dreamer: 'hsl(300, 50%, 60%)',    // Pink-purple - imagination
  shadow: 'hsl(240, 20%, 40%)'      // Dark blue-gray - depth
}

export const archetypeDescriptions: Record<string, { title: string; tagline: string; description: string }> = {
  wanderer: {
    title: 'The Wanderer',
    tagline: 'Paths untaken call to you',
    description: 'You are drawn to the unknown, finding comfort in uncertainty. Where others see danger, you see possibility. Your curiosity is your compass, leading you to discoveries others miss.'
  },
  guardian: {
    title: 'The Guardian',
    tagline: 'Your strength shields those you love',
    description: 'You stand between chaos and those who cannot protect themselves. Loyalty is not just a word to you—it is the foundation of who you are. You find purpose in protection.'
  },
  seeker: {
    title: 'The Seeker',
    tagline: 'Truth hides, but not from you',
    description: 'Questions drive you forward. You see patterns where others see noise, connections where others see coincidence. The mystery is not something to fear—it is something to solve.'
  },
  flame: {
    title: 'The Flame',
    tagline: 'Hesitation is not in your nature',
    description: 'You burn bright and act decisively. While others deliberate, you move. Your passion can scorch, but it also illuminates the path forward when all seems dark.'
  },
  dreamer: {
    title: 'The Dreamer',
    tagline: 'You see worlds others cannot',
    description: 'Reality is just one possibility to you. Your imagination opens doors that logic keeps locked. You believe in transformation—that what is does not have to be what will be.'
  },
  shadow: {
    title: 'The Shadow',
    tagline: 'Darkness holds no fear for you',
    description: 'You understand that light cannot exist without shadow. You embrace complexity, reject easy answers, and find beauty in the spaces between. Redemption interests you more than purity.'
  }
}

export function ArchetypeIcon({ archetype, className }: { archetype: string; className?: string }) {
  const Icon = archetypeIcons[archetype.toLowerCase()]
  if (!Icon) return null
  return <Icon className={className} />
}