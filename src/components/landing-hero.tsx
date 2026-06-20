'use client'

import { AppBackground } from '@/components/app-background'
import { FeudTitle } from '@/components/feud-title'
import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function LandingHero() {
  const router = useRouter()
  const [buttonHover, setButtonHover] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') router.push('/admin')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [router])

  return (
    <AppBackground className='min-h-screen'>
      <div className='flex flex-1 flex-col items-center justify-center p-6'>
        <div className='relative space-y-10 text-center animate-landing-fade-up'>
          <div className='space-y-3'>
            <p className='text-sm font-semibold uppercase tracking-[0.3em] text-slate-400 animate-landing-fade-up'>
              Survey says…
            </p>
            <FeudTitle
              size='hero'
              className='animate-landing-fade-up [animation-delay:100ms]'
            />
            <p className='mx-auto max-w-md text-lg text-slate-500 animate-landing-fade-up [animation-delay:200ms] md:text-xl'>
              Host your own game. Import questions, control the board, and play
              on the big screen.
            </p>
          </div>

          <div className='animate-landing-fade-up [animation-delay:300ms]'>
            <Link
              href='/admin'
              onMouseEnter={() => setButtonHover(true)}
              onMouseLeave={() => setButtonHover(false)}
              className='group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-slate-800 px-10 py-5 text-xl font-bold text-white shadow-xl transition-all duration-300 hover:bg-slate-900 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20 active:scale-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/40'
            >
              <span
                className={`absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/20 to-amber-500/0 transition-transform duration-500 ${
                  buttonHover ? 'translate-x-full' : '-translate-x-full'
                }`}
              />
              <span className='relative'>Start Game</span>
              <ArrowRightIcon
                className={`relative size-6 transition-transform duration-300 ${
                  buttonHover ? 'translate-x-1' : ''
                }`}
              />
            </Link>
            <p className='mt-4 text-sm text-slate-400'>
              Press{' '}
              <kbd className='rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-xs text-slate-600 shadow-sm'>
                Enter
              </kbd>{' '}
              to begin
            </p>
          </div>
        </div>
      </div>
    </AppBackground>
  )
}
