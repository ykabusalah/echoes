'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { quizQuestions, archetypeInfo, type Archetype } from '@/lib/quiz'

function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  let id = document.cookie.split('; ').find(row => row.startsWith('visitorId='))?.split('=')[1]
  if (!id) {
    id = crypto.randomUUID()
    document.cookie = `visitorId=${id}; max-age=31536000; path=/`
  }
  return id
}

function FloatingOrb({ className, style }: { className: string; style: React.CSSProperties }) {
  return <div className={`orb ${className}`} style={style} />
}

type QuizState = 'intro' | 'questions' | 'calculating' | 'result'

export default function QuizPage() {
  const router = useRouter()
  const [visitorId, setVisitorId] = useState('')
  const [state, setState] = useState<QuizState>('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<{ archetype: Archetype; scores: Record<string, number> } | null>(null)
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    setVisitorId(getVisitorId())
  }, [])

  // Check if user already has a profile
  useEffect(() => {
    async function checkProfile() {
      if (!visitorId) return
      const res = await fetch(`/api/quiz?visitorId=${visitorId}`)
      const data = await res.json()
      if (data.hasProfile) {
        setResult({ archetype: data.profile.archetype, scores: data.profile.scores })
        setState('result')
      }
    }
    checkProfile()
  }, [visitorId])

  async function handleAnswer(answerIndex: number) {
    setTransitioning(true)
    const newAnswers = [...answers, answerIndex]
    setAnswers(newAnswers)

    await new Promise(r => setTimeout(r, 400))

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setTransitioning(false)
    } else {
      setState('calculating')
      // Submit to API
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, answers: newAnswers })
      })
      const data = await res.json()
      
      await new Promise(r => setTimeout(r, 2000)) // Dramatic pause
      
      setResult({ archetype: data.profile.archetype, scores: data.profile.scores })
      setState('result')
    }
  }

  function handleRetakeQuiz() {
    setAnswers([])
    setCurrentQuestion(0)
    setResult(null)
    setState('intro')
  }

  // Intro Screen
  if (state === 'intro') {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-4 py-12">
        <FloatingOrb className="orb-purple animate-float-slow" style={{ width: '350px', height: '350px', top: '10%', left: '10%', opacity: 0.3 }} />
        <FloatingOrb className="orb-gold animate-float" style={{ width: '250px', height: '250px', bottom: '20%', right: '10%', opacity: 0.25, animationDelay: '2s' }} />

        <div className="relative max-w-2xl mx-auto text-center">
          <div>
            <span className="inline-block px-4 py-2 rounded-full text-sm tracking-[0.2em] uppercase mb-6
              bg-gradient-to-r from-[--purple-dark]/80 to-[--purple-mid]/80 
              border border-[--purple-light]/50 text-[--purple-glow]">
              ✦ Before We Begin ✦
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl mb-6 text-gradient" 
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Who Are You?
          </h1>

          <p className="text-xl text-[--text-secondary] mb-8 leading-relaxed"
             style={{ fontFamily: "'Spectral', serif", fontStyle: 'italic' }}>
            Every reader carries a story within them. Answer seven questions, 
            and we'll reveal the archetype that shapes your journey.
          </p>

          <p className="text-[--text-muted] mb-12"
             style={{ fontFamily: "'Spectral', serif" }}>
            Your choices will be compared to others who share your path.
          </p>

          <button 
            onClick={() => setState('questions')}
            className="btn btn-primary text-lg px-10 py-4"
            style={{ opacity: 1, color: '#12081f' }}
          >
            Begin the Journey
          </button>

          <div className="mt-8">
            <Link href="/" className="text-[--text-muted] hover:text-[--gold-mid] transition-colors text-sm"
                  style={{ fontFamily: "'Spectral', serif" }}>
              ← Return to stories
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Questions Screen
  if (state === 'questions') {
    const question = quizQuestions[currentQuestion]
    const progress = ((currentQuestion) / quizQuestions.length) * 100

    return (
      <div className="min-h-screen relative flex items-center justify-center px-4 py-12">
        <FloatingOrb className="orb-purple animate-float-slow" style={{ width: '300px', height: '300px', top: '15%', left: '5%', opacity: 0.25 }} />
        <FloatingOrb className="orb-gold animate-float" style={{ width: '200px', height: '200px', bottom: '15%', right: '5%', opacity: 0.2, animationDelay: '1s' }} />

        <div className="relative max-w-2xl mx-auto w-full">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-[--text-muted] mb-2">
              <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Question Card */}
          <div className={`card p-8 md:p-10 transition-all duration-500 ${transitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <p className="text-xl md:text-2xl text-[--text-primary] mb-10 leading-relaxed"
               style={{ fontFamily: "'Spectral', serif" }}>
              {question.scenario}
            </p>

            <div className="space-y-4">
              {question.answers.map((answer, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={transitioning}
                  className="choice-btn"
                  style={{ opacity: 1 }}
                >
                  {answer.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Calculating Screen
  if (state === 'calculating') {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-4">
        <FloatingOrb className="orb-purple animate-float-slow" style={{ width: '400px', height: '400px', top: '20%', left: '20%', opacity: 0.4 }} />
        <FloatingOrb className="orb-gold animate-float" style={{ width: '300px', height: '300px', bottom: '20%', right: '20%', opacity: 0.3 }} />

        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-[--purple-mid] border-t-[--gold-mid] rounded-full animate-spin" />
            <div className="absolute inset-2 border-4 border-transparent border-b-[--purple-bright] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            <div className="absolute inset-4 border-4 border-[--purple-dark] border-t-[--gold-light] rounded-full animate-spin" style={{ animationDuration: '2s' }} />
          </div>
          
          <p className="text-2xl text-[--gold-mid] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Reading the stars...
          </p>
          <p className="text-[--text-muted]" style={{ fontFamily: "'Spectral', serif", fontStyle: 'italic' }}>
            Your archetype is being revealed
          </p>
        </div>
      </div>
    )
  }

  // Result Screen
  if (state === 'result' && result) {
    const info = archetypeInfo[result.archetype]

    return (
      <div className="min-h-screen relative flex items-center justify-center px-4 py-12">
        <FloatingOrb className="orb-purple animate-float-slow" style={{ width: '350px', height: '350px', top: '10%', left: '10%', opacity: 0.3 }} />
        <FloatingOrb className="orb-gold animate-float" style={{ width: '250px', height: '250px', bottom: '15%', right: '10%', opacity: 0.25, animationDelay: '2s' }} />

        <div className="relative max-w-2xl mx-auto text-center">
          <div>
            <span className="inline-block px-4 py-2 rounded-full text-sm tracking-[0.2em] uppercase mb-6
              bg-gradient-to-r from-[--purple-dark]/80 to-[--purple-mid]/80 
              border border-[--purple-light]/50 text-[--purple-glow]">
              ✦ Your Archetype ✦
            </span>
          </div>

          {/* Archetype Icon */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center animate-pulse-glow"
                 style={{ background: `linear-gradient(135deg, ${info.color}40, var(--purple-dark))`, border: `2px solid ${info.color}` }}>
              <span className="text-5xl">
                {result.archetype === 'wanderer' && '🧭'}
                {result.archetype === 'guardian' && '🛡️'}
                {result.archetype === 'seeker' && '🔍'}
                {result.archetype === 'flame' && '🔥'}
                {result.archetype === 'dreamer' && '✨'}
                {result.archetype === 'shadow' && '🌑'}
              </span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl mb-6" 
              style={{ fontFamily: "'Cormorant Garamond', serif", color: info.color }}>
            {info.title}
          </h1>

          <p className="text-xl text-[--text-secondary] mb-10 leading-relaxed max-w-lg mx-auto"
             style={{ fontFamily: "'Spectral', serif", fontStyle: 'italic' }}>
            {info.description}
          </p>

          {/* Score breakdown */}
          <div className="card p-6 mb-10">
            <p className="text-[--text-muted] text-sm mb-4 uppercase tracking-wide">Your Affinities</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(result.scores)
                .sort(([,a], [,b]) => b - a)
                .map(([arch, score]) => (
                  <div key={arch} className="text-center">
                    <p className="text-2xl font-semibold" style={{ color: archetypeInfo[arch as Archetype].color, fontFamily: "'Cormorant Garamond', serif" }}>
                      {score}
                    </p>
                    <p className="text-xs text-[--text-muted] capitalize">{arch}</p>
                  </div>
                ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="btn btn-primary" style={{ opacity: 1, color: '#12081f' }}>
              Discover Stories
            </Link>
            <button onClick={handleRetakeQuiz} className="btn btn-secondary" style={{ opacity: 1 }}>
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}