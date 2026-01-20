# Echoes

An interactive fiction platform where stories adapt to who you are. Readers take a personality quiz to discover their archetype, then experience branching narratives with AI-generated choices tailored to their personality type.

## How It Works

1. Take a 12-question personality quiz
2. Get assigned one of 7 reader archetypes (Wanderer, Guardian, Seeker, Flame, Dreamer, Shadow, Jackal)
3. Play interactive branching stories
4. At key moments, receive a personalized choice generated specifically for your archetype
5. See how your decisions compare to other readers

## Features

- Branching narrative engine with 12-30 scenes per story
- Real-time choice statistics showing what percentage of readers made each decision
- AI-powered personalization using Claude to generate archetype-specific choices
- Dynamic theming that changes site colors based on your archetype
- Admin dashboard with analytics for reader engagement and personalization effectiveness
- Dark and light mode support

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (Neon)
- **AI:** Anthropic Claude API
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon account)
- Anthropic API key

### Installation

```bash
git clone https://github.com/ykabusalah/echoes.git
cd echoes
npm install
```

### Environment Variables

Create a `.env` file:

```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
ANTHROPIC_API_KEY=sk-ant-api03-...
ADMIN_SECRET=your-admin-password
```

### Database Setup

```bash
npx prisma generate
npx prisma db push
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
echoes/
├── app/
│   ├── components/       # Shared UI components
│   ├── quiz/             # Personality quiz pages
│   ├── play/[storyId]/   # Story reader
│   ├── dashboard/        # Admin analytics
│   └── api/              # API routes
├── lib/
│   ├── db.ts             # Prisma client
│   ├── quiz.ts           # Quiz logic and archetype definitions
│   └── generateChoice.ts # Claude API integration
├── prisma/
│   └── schema.prisma     # Database schema
└── public/
```

## The Archetypes

| Archetype | Traits |
|-----------|--------|
| Wanderer | Curiosity, exploration, embracing the unknown |
| Guardian | Loyalty, protection, sacrifice |
| Seeker | Truth-seeking, investigation, knowledge |
| Flame | Action, passion, impulsive bravery |
| Dreamer | Hope, emotion, idealism |
| Shadow | Pragmatism, strategy, calculated survival |
| Jackal | Opportunity, self-interest, cunning |

## License

MIT

## Author

Yousef Abu-Salah
