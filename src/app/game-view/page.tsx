'use client'

import { AnimateIn } from '@/components/animate-in'
import { AppBackground } from '@/components/app-background'
import { useGameStateSync } from '@/hooks/use-game-state-sync'
import {
  getActiveRound,
  getEffectiveState,
  getVisibleAnswers,
  isGameComplete,
  isLiveView,
  isReviewMode,
  revealFinalScores,
} from '@/lib/game-engine'
import { getTeamName } from '@/lib/team-names'
import { useEffect, useRef, useState } from 'react'

export default function GameViewPage() {
  const { gameState, setGameState: setGameStateLocal, isReady } =
    useGameStateSync()
  const [flashAnswer, setFlashAnswer] = useState<number | null>(null)
  const [pointsPop, setPointsPop] = useState(false)
  const prevPoints = useRef<number | null>(null)

  // Flash effect for newly revealed answers during live active play only
  useEffect(() => {
    if (
      !gameState ||
      !isLiveView(gameState) ||
      gameState.roundStatus === 'ended'
    ) {
      return
    }
    const viewState = getEffectiveState(gameState)
    const lastRevealed =
      viewState.revealedAnswers[viewState.revealedAnswers.length - 1]
    if (lastRevealed === undefined) return

    const flashTimer = window.setTimeout(() => setFlashAnswer(lastRevealed), 0)
    const clearTimer = window.setTimeout(() => setFlashAnswer(null), 800)
    return () => {
      window.clearTimeout(flashTimer)
      window.clearTimeout(clearTimer)
    }
  }, [gameState])

  const viewState = gameState ? getEffectiveState(gameState) : null
  const roundPoints = viewState?.roundPoints ?? 0

  useEffect(() => {
    if (prevPoints.current === null) {
      prevPoints.current = roundPoints
      return
    }
    if (roundPoints === prevPoints.current) return

    prevPoints.current = roundPoints
    const popTimer = window.setTimeout(() => setPointsPop(true), 0)
    const clearTimer = window.setTimeout(() => setPointsPop(false), 450)
    return () => {
      window.clearTimeout(popTimer)
      window.clearTimeout(clearTimer)
    }
  }, [roundPoints])

  if (!isReady) {
    return (
      <AppBackground variant='subtle' className='min-h-screen'>
        <div className='flex-1' />
      </AppBackground>
    )
  }

  if (!gameState || !gameState.gameStarted) {
    return (
      <AppBackground variant='subtle' className='min-h-screen'>
        <div className='flex flex-1 flex-col items-center justify-center p-6'>
          <AnimateIn className='space-y-4 text-center'>
            <div className='inline-flex items-center gap-3 text-slate-500'>
              <span className='relative flex h-3 w-3'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75' />
                <span className='relative inline-flex h-3 w-3 rounded-full bg-amber-500' />
              </span>
              <span className='text-xl font-medium md:text-2xl'>
                Waiting for admin to start the game…
              </span>
            </div>
          </AnimateIn>
        </div>
      </AppBackground>
    )
  }

  const round = getActiveRound(viewState!)
  const visibleAnswers = getVisibleAnswers(viewState!)
  const gameComplete = isGameComplete(gameState)
  const review = isReviewMode(gameState)
  const finalScoresRevealed = gameState.finalScoresRevealed ?? false

  const handleRevealFinalScores = () => {
    setGameStateLocal(revealFinalScores(gameState))
  }

  if (!round) {
    return (
      <AppBackground variant='subtle' className='min-h-screen'>
        <div className='flex flex-1 flex-col items-center justify-center p-6'>
          <AnimateIn>
            <div className='text-center text-2xl font-medium text-slate-500'>
              No more questions!
            </div>
          </AnimateIn>
        </div>
      </AppBackground>
    )
  }

  const showRoundEndBanner =
    viewState!.roundStatus === 'ended' &&
    !gameComplete &&
    viewState!.roundWinner
  const showNoPointsBanner =
    viewState!.roundStatus === 'ended' &&
    !gameComplete &&
    !viewState!.roundWinner

  // Split answers into columns: left column top-to-bottom, then right column
  const mid = Math.ceil(visibleAnswers.length / 2)
  const leftAnswers = visibleAnswers.slice(0, mid)
  const rightAnswers = visibleAnswers.slice(mid)

  return (
    <AppBackground variant='subtle' className='min-h-screen'>
      {/* Main content — grows to fill viewport */}
      <div className='flex min-h-0 flex-1 flex-col'>
        {/* Top Bar - Strikes + Steal Indicator */}
        <div className='shrink-0 border-b border-slate-200/80 bg-white/90 px-8 py-4 backdrop-blur-sm'>
          <div className='relative mx-auto flex min-h-[4.5rem] max-w-6xl items-center justify-center'>
            {/* Strike Indicators */}
            <div className='flex items-center justify-center gap-6'>
              {[0, 1, 2].map((i) => (
                <div key={i} className='flex flex-col items-center gap-1'>
                  <span className='text-xs font-semibold tracking-wider text-slate-400'>
                    STRIKE {i + 1}
                  </span>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 md:h-12 md:w-12 ${
                      i < viewState!.strikes
                        ? 'scale-110 bg-red-500 text-white shadow-lg shadow-red-200 animate-strike-pop'
                        : 'bg-slate-100 text-slate-300'
                    }`}
                  >
                    <svg
                      viewBox='0 0 24 24'
                      className='h-5 w-5 md:h-6 md:w-6'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='3'
                      strokeLinecap='round'
                    >
                      <line x1='6' y1='6' x2='18' y2='18' />
                      <line x1='18' y1='6' x2='6' y2='18' />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* Steal Mode Indicator */}
            {viewState!.isStealPhase && (
              <div className='absolute right-0 flex animate-card-enter items-center gap-2 rounded-lg border border-orange-300 bg-orange-100 px-4 py-2 shadow-sm'>
                <div className='h-2.5 w-2.5 animate-pulse rounded-full bg-orange-500' />
                <span className='text-sm font-bold tracking-wider text-orange-700'>
                  STEAL - {getTeamName(gameState, viewState!.activeTeam).toUpperCase()}
                </span>
              </div>
            )}
            {review && (
              <div className='absolute right-0 flex animate-card-enter items-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-4 py-2'>
                <span className='text-sm font-bold tracking-wider text-slate-600'>
                  REVIEW - Q{viewState!.currentRoundIndex + 1}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Question */}
        <div className='shrink-0 px-8 pb-4 pt-6'>
          <div className='mx-auto max-w-4xl'>
            <h1
              key={round.question}
              className='animate-landing-fade-up text-center text-2xl font-bold leading-tight text-slate-800 md:text-4xl'
            >
              {round.question}
            </h1>
          </div>
        </div>

        {/* Answer Board */}
        <div className='flex min-h-0 flex-1 items-start justify-center px-8 pb-4'>
          <div className='w-full max-w-5xl'>
            <div className='grid grid-cols-2 gap-3 md:gap-4'>
              {/* Left Column */}
              <div className='space-y-3 md:space-y-4'>
                {leftAnswers.map((answerIndex, position) => (
                  <AnswerBlock
                    key={answerIndex}
                    answerIndex={answerIndex}
                    position={position}
                    answer={round.answers[answerIndex]}
                    isRevealed={viewState!.revealedAnswers.includes(
                      answerIndex,
                    )}
                    isFlashing={!review && flashAnswer === answerIndex}
                  />
                ))}
              </div>
              {/* Right Column */}
              <div className='space-y-3 md:space-y-4'>
                {rightAnswers.map((answerIndex, position) => (
                  <AnswerBlock
                    key={answerIndex}
                    answerIndex={answerIndex}
                    position={position + leftAnswers.length}
                    answer={round.answers[answerIndex]}
                    isRevealed={viewState!.revealedAnswers.includes(
                      answerIndex,
                    )}
                    isFlashing={!review && flashAnswer === answerIndex}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom dock — pinned to viewport bottom */}
      <div className='mt-auto shrink-0'>
        {/* Accumulated Points */}
        <div className='border-t border-slate-200/80 bg-white/90 px-8 py-4 backdrop-blur-sm'>
          <div className='mx-auto flex max-w-6xl items-center justify-center gap-8'>
            <div className='text-center'>
              <div className='mb-1 text-xs font-semibold tracking-wider text-slate-400'>
                ACCUMULATED POINTS
              </div>
              <div
                className={`text-4xl font-bold text-amber-500 md:text-5xl ${
                  pointsPop ? 'animate-points-pop' : ''
                }`}
              >
                {viewState!.roundPoints}
              </div>
            </div>
          </div>
        </div>

        {/* Round End Banner */}
        {showRoundEndBanner && (
          <div className='animate-banner-slide-up bg-amber-500 px-8 py-4 text-white shadow-lg'>
            <div className='mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center'>
              <div className='text-sm font-semibold uppercase tracking-wider opacity-90'>
                Round over
              </div>
              <div className='text-xl font-bold md:text-2xl'>
                {getTeamName(gameState, viewState!.roundWinner!)} wins{' '}
                <span className='text-amber-100'>
                  {viewState!.roundPoints} points
                </span>
              </div>
            </div>
          </div>
        )}

        {showNoPointsBanner && (
          <div className='animate-banner-slide-up bg-slate-500 px-8 py-4 text-white shadow-lg'>
            <div className='mx-auto max-w-6xl text-center text-xl font-bold md:text-2xl'>
              No points awarded
            </div>
          </div>
        )}

        {/* Game Complete Summary */}
        {gameComplete && (
          <div className='fixed inset-0 z-50 flex animate-landing-fade-up items-center justify-center bg-slate-900/60 backdrop-blur-sm'>
            <div className='mx-4 max-w-2xl rounded-3xl bg-white p-10 text-center shadow-2xl transition-transform duration-300 hover:scale-[1.01] md:p-14'>
              {finalScoresRevealed ? (
                <>
                  <div className='mb-6 text-sm font-semibold tracking-wider text-slate-400'>
                    FINAL SCORES
                  </div>
                  <div className='mb-8 grid grid-cols-2 gap-4 md:gap-6'>
                    <div
                      className={`rounded-2xl border-2 p-6 transition-all duration-300 md:p-8 ${
                        viewState!.team1Score >= viewState!.team2Score
                          ? 'scale-[1.02] border-blue-400 bg-blue-50 shadow-lg shadow-blue-100'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className='mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase'>
                        {getTeamName(gameState, 1)}
                      </div>
                      <div className='text-5xl font-black text-blue-600 md:text-6xl'>
                        {viewState!.team1Score}
                      </div>
                    </div>
                    <div
                      className={`rounded-2xl border-2 p-6 transition-all duration-300 md:p-8 ${
                        viewState!.team2Score >= viewState!.team1Score
                          ? 'scale-[1.02] border-red-400 bg-red-50 shadow-lg shadow-red-100'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className='mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase'>
                        {getTeamName(gameState, 2)}
                      </div>
                      <div className='text-5xl font-black text-red-600 md:text-6xl'>
                        {viewState!.team2Score}
                      </div>
                    </div>
                  </div>
                  <div className='text-2xl font-bold text-slate-800 md:text-3xl'>
                    {viewState!.team1Score === viewState!.team2Score
                      ? "It's a tie!"
                      : viewState!.team1Score > viewState!.team2Score
                        ? `${getTeamName(gameState, 1)} wins the game!`
                        : `${getTeamName(gameState, 2)} wins the game!`}
                  </div>
                </>
              ) : (
                <>
                  <div className='mb-3 text-sm font-semibold tracking-wider text-slate-400'>
                    GAME COMPLETE
                  </div>
                  <div className='mb-8 text-3xl font-bold text-slate-800 md:text-4xl'>
                    Ready to reveal final scores?
                  </div>
                  <button
                    onClick={handleRevealFinalScores}
                    className='rounded-xl bg-amber-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-amber-600 hover:shadow-amber-500/30 active:scale-100'
                  >
                    Reveal Final Scores
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Team Scores - Bottom */}
        <div className='bg-slate-800/95 px-8 py-3 backdrop-blur-sm'>
          <div className='mx-auto flex max-w-6xl items-center justify-between'>
            <div className='flex items-center gap-3 transition-transform duration-300 hover:scale-105'>
              <div
                className={`h-3 w-3 rounded-full ${
                  viewState!.activeTeam === 1 && !review
                    ? 'animate-pulse bg-blue-400 shadow-lg shadow-blue-400/50'
                    : 'bg-slate-600'
                }`}
              />
              <div>
                <div className='text-xs font-medium uppercase text-slate-400'>
                  {getTeamName(gameState, 1)}
                </div>
                <div className='text-xl font-bold text-white'>
                  {viewState!.team1Score}
                </div>
              </div>
            </div>
            <div className='flex items-center gap-3 transition-transform duration-300 hover:scale-105'>
              <div className='text-right'>
                <div className='text-xs font-medium uppercase text-slate-400'>
                  {getTeamName(gameState, 2)}
                </div>
                <div className='text-xl font-bold text-white'>
                  {viewState!.team2Score}
                </div>
              </div>
              <div
                className={`h-3 w-3 rounded-full ${
                  viewState!.activeTeam === 2 && !review
                    ? 'animate-pulse bg-blue-400 shadow-lg shadow-blue-400/50'
                    : 'bg-slate-600'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </AppBackground>
  )
}

function AnswerBlock({
  position,
  answer,
  isRevealed,
  isFlashing,
}: {
  answerIndex: number
  position: number
  answer: { text: string; points: number }
  isRevealed: boolean
  isFlashing: boolean
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl transition-all duration-500 ${
        isFlashing ? 'scale-[1.03] shadow-lg shadow-amber-500/20' : ''
      }`}
    >
      {isRevealed ? (
        <div className='flex animate-reveal-block items-center justify-between rounded-xl border-2 border-green-200 bg-green-50 px-5 py-4 shadow-md md:px-6 md:py-5'>
          <span className='text-lg font-bold text-slate-800 md:text-2xl'>
            {answer.text}
          </span>
          <span className='ml-4 text-lg font-black text-amber-500 md:text-2xl'>
            {answer.points}
          </span>
        </div>
      ) : (
        <div className='flex items-center justify-between rounded-xl border-2 border-slate-200/80 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm transition-all duration-300 md:px-6 md:py-5'>
          <span className='text-lg font-bold text-slate-400 md:text-2xl'>
            {position + 1}
          </span>
          <div className='h-6 w-6 rounded bg-slate-100 md:h-8 md:w-8' />
        </div>
      )}
    </div>
  )
}
