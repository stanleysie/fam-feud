'use client'

import { AppBackground } from '@/components/app-background'
import { FeudTitle } from '@/components/feud-title'
import { GITHUB_PROFILE_URL, GITHUB_REPO_URL, GITHUB_USERNAME } from '@/lib/site-meta'
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
      <div className='flex min-h-screen flex-1 flex-col p-6'>
        <div className='flex flex-1 flex-col items-center justify-center'>
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
              <span className='relative'>Get Started</span>
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
              to get started
            </p>
          </div>
          </div>
        </div>

        <footer className='shrink-0 pb-2 text-center text-sm text-slate-400'>
          <div className='flex items-center justify-center'>
            <a
              href={GITHUB_PROFILE_URL}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1.5 text-slate-500 transition-colors hover:text-amber-600 hover:underline'
            >
              <svg
                viewBox='0 0 24 24'
                aria-hidden='true'
                className='size-4 shrink-0 fill-current'
              >
                <path d='M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z' />
              </svg>
              {GITHUB_USERNAME}
            </a>
            <span className='mx-2 text-slate-300'>·</span>
            <a
              href={GITHUB_REPO_URL}
              target='_blank'
              rel='noopener noreferrer'
              className='text-slate-500 transition-colors hover:text-amber-600 hover:underline'
            >
              View source on GitHub
            </a>
          </div>
        </footer>
      </div>
    </AppBackground>
  )
}
