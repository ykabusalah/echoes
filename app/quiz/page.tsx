'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '../components/ThemeToggle'
import { quizQuestions } from '@/lib/quiz'

function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  let id = document.cookie.split('; ').find(row => row.startsWith('visitorId='))?.split('=')[1]
  if (!id) {
    id = crypto.randomUUID()
    document.cookie = `visitorId=${id}; max-age=31536000; path=/`
  }
  return id
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L13.09 8.26L22 9.27L14 14.14L15.18 21.02L12 17.77L8.82 21.02L10 14.14L2 9.27L10.91 8.26L12 2Z" />
    </svg>
  )
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  )
}

type QuizState = 'intro' | 'questions' | 'calculating'

export default function QuizPage() {
  const router = useRouter()
  const [visitorId, setVisitorId] = useState('')
  const [state, setState] = useState<QuizState>('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    setVisitorId(getVisitorId())
  }, [])

  useEffect(() => {
    async function checkProfile() {
      if (!visitorId) return
      const res = await fetch(`/api/quiz?visitorId=${visitorId}`)
      const data = await res.json()
      if (data.hasProfile) {
        // Redirect to results page if already has profile
        router.push(`/quiz/results?archetype=${data.profile.archetype}`)
      }
    }
    checkProfile()
  }, [visitorId, router])

  async function handleAnswer(answerIndex: number) {
    setTransitioning(true)
    const newAnswers = [...answers, answerIndex]
    setAnswers(newAnswers)

    await new Promise(r => setTimeout(r, 300))

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setTransitioning(false)
    } else {
      setState('calculating')
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, answers: newAnswers })
      })
      const data = await res.json()
      
      await new Promise(r => setTimeout(r, 1500))
      
      // Redirect to results page with archetype
      router.push(`/quiz/results?archetype=${data.profile.archetype}`)
    }
  }

  // Intro Screen
  if (state === 'intro') {
    return (
      <div className="min-h-screen flex flex-col">
        <nav className="border-b border-[hsl(var(--border))]">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-sm text-[hsl(var(--secondary-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </Link>
            <span className="font-medium">Archetype Quiz</span>
            <ThemeToggle />
          </div>
        </nav>

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-lg w-full text-center">
            <div className="mb-6">
              <span className="badge badge-brand">
                <SparkleIcon className="w-3 h-3" />
                Before We Begin
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold mb-4">
              Who Are You?
            </h1>

            <p className="text-[hsl(var(--secondary-foreground))] mb-6 leading-relaxed">
              Every reader carries a story within them. Answer seven questions, 
              and we'll reveal the archetype that shapes your journey.
            </p>

            <p className="text-sm text-[hsl(var(--secondary-foreground))] mb-6">
              Your choices will be compared to others who share your path.
            </p>

            <div className="card p-4 mb-8 border-[hsl(var(--warning)/0.5)] bg-[hsl(var(--warning)/0.1)]">
              <p className="text-sm text-[hsl(var(--foreground))]">
                <span className="font-medium">⚠️ Before you begin:</span> Once you start, you cannot go back. 
                Each choice is final. You must complete all 7 questions before you can retake the quiz.
              </p>
            </div>

            <button 
              onClick={() => setState('questions')}
              className="btn btn-brand"
            >
              Begin the Journey
            </button>
          </div>
        </main>
      </div>
    )
  }

  // Questions Screen
  if (state === 'questions') {
    const question = quizQuestions[currentQuestion]
    const progress = ((currentQuestion) / quizQuestions.length) * 100

    return (
      <div className="min-h-screen flex flex-col">
        <nav className="border-b border-[hsl(var(--border))]">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-sm text-[hsl(var(--secondary-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
              <ArrowLeftIcon className="w-4 h-4" />
              Leave
            </Link>
            <span className="font-medium">Question {currentQuestion + 1} of {quizQuestions.length}</span>
            <ThemeToggle />
          </div>
        </nav>

        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-2xl w-full">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-xs text-[hsl(var(--secondary-foreground))] mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Question Card */}
            <div className={`card p-6 md:p-8 transition-all duration-300 ${transitioning ? 'opacity-0 scale-98' : 'opacity-100 scale-100'}`}>
              <p className="text-lg mb-8 leading-relaxed">
                {question.scenario}
              </p>

              <div className="space-y-3">
                {question.answers.map((answer, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={transitioning}
                    className="choice-btn"
                  >
                    {answer.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Calculating Screen
  if (state === 'calculating') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="spinner" />
        <p className="text-sm text-[hsl(var(--secondary-foreground))]">
          Analyzing your choices...
        </p>
      </div>
    )
  }

  return null
}