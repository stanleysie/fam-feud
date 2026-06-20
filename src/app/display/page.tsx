'use client'

import { getActiveRound, getVisibleAnswers } from '@/lib/game-engine'
import { getGameState, onUpdate } from '@/lib/storage'
import { GameState } from '@/types/game'
import { useEffect, useRef, useState } from 'react'

export default function DisplayPage() {
  const [gameState, setGameStateLocal] = useState<GameState | null>(null)
  const [flashAnswer, setFlashAnswer] = useState<number | null>(null)
  const [wrongOverlay, setWrongOverlay] = useState<boolean>(false)
  const prevStrikes = useRef<number>(0)
  const hasShownFirstStrikeOverlay = useRef<boolean>(false)

  useEffect(() => {
    const existing = getGameState()
    if (existing) {
      setGameStateLocal(existing)
      prevStrikes.current = existing.strikes
      hasShownFirstStrikeOverlay.current = existing.strikes > 0
    }

    return onUpdate(() => {
      const updated = getGameState()
      if (updated) {
        setGameStateLocal(updated)
      }
    })
  }, [])

  // Flash effect for newly revealed answers
  useEffect(() => {
    if (!gameState) return
    const lastRevealed =
      gameState.revealedAnswers[gameState.revealedAnswers.length - 1]
    if (lastRevealed !== undefined) {
      setFlashAnswer(lastRevealed)
      const timer = setTimeout(() => setFlashAnswer(null), 800)
      return () => clearTimeout(timer)
    }
  }, [gameState?.revealedAnswers.length])

  // X overlay - only on the very first strike
  useEffect(() => {
    if (!gameState) return
    if (gameState.strikes > prevStrikes.current) {
      if (!hasShownFirstStrikeOverlay.current) {
        setWrongOverlay(true)
        hasShownFirstStrikeOverlay.current = true
        const timer = setTimeout(() => setWrongOverlay(false), 1500)
        prevStrikes.current = gameState.strikes
        return () => clearTimeout(timer)
      }
    }
    prevStrikes.current = gameState.strikes
  }, [gameState?.strikes])

  if (!gameState) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
        <div className='text-slate-400 text-2xl font-medium'>
          Waiting for admin to start the game...
        </div>
      </div>
    )
  }

  const round = getActiveRound(gameState)
  const visibleAnswers = getVisibleAnswers(gameState)

  if (!round) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
        <div className='text-slate-400 text-2xl font-medium'>
          No more questions!
        </div>
      </div>
    )
  }

  // Split answers into columns: left column top-to-bottom, then right column
  const mid = Math.ceil(visibleAnswers.length / 2)
  const leftAnswers = visibleAnswers.slice(0, mid)
  const rightAnswers = visibleAnswers.slice(mid)

  return (
    <div className='min-h-screen bg-slate-50 flex flex-col overflow-hidden'>
      {/* Wrong Answer Overlay */}
      {wrongOverlay && (
        <div className='fixed inset-0 z-50 flex items-center justify-center pointer-events-none'>
          <div className='absolute inset-0 bg-red-500/10' />
          <div className='relative animate-x-overlay'>
            <svg
              viewBox='0 0 200 200'
              className='w-48 h-48 md:w-72 md:h-72 drop-shadow-2xl'
            >
              <line
                x1='30'
                y1='30'
                x2='170'
                y2='170'
                stroke='#DC2626'
                strokeWidth='24'
                strokeLinecap='round'
              />
              <line
                x1='170'
                y1='30'
                x2='30'
                y2='170'
                stroke='#DC2626'
                strokeWidth='24'
                strokeLinecap='round'
              />
            </svg>
          </div>
        </div>
      )}

      {/* Top Bar - Strikes + Steal Indicator */}
      <div className='bg-white border-b border-slate-200 px-8 py-4'>
        <div className='max-w-6xl mx-auto flex items-center justify-between'>
          {/* Strike Indicators */}
          <div className='flex items-center gap-6'>
            {[0, 1, 2].map((i) => (
              <div key={i} className='flex flex-col items-center gap-1'>
                <span className='text-xs font-semibold text-slate-400 tracking-wider'>
                  STRIKE {i + 1}
                </span>
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    i < gameState.strikes
                      ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-200'
                      : 'bg-slate-100 text-slate-300'
                  }`}
                >
                  <svg
                    viewBox='0 0 24 24'
                    className='w-5 h-5 md:w-6 md:h-6'
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
          {gameState.isStealPhase && (
            <div className='flex items-center gap-2 bg-orange-100 border border-orange-300 rounded-lg px-4 py-2'>
              <div className='w-2.5 h-2.5 rounded-full bg-orange-500' />
              <span className='text-orange-700 font-bold text-sm tracking-wider'>
                STEAL - TEAM {gameState.activeTeam}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Question */}
      <div className='px-8 pt-6 pb-4'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-2xl md:text-4xl font-bold text-slate-800 text-center leading-tight'>
            {round.question}
          </h1>
        </div>
      </div>

      {/* Answer Board */}
      <div className='flex-1 flex items-start justify-center px-8 pb-4'>
        <div className='max-w-5xl w-full'>
          <div className='grid grid-cols-2 gap-3 md:gap-4'>
            {/* Left Column */}
            <div className='space-y-3 md:space-y-4'>
              {leftAnswers.map((answerIndex, position) => (
                <AnswerBlock
                  key={answerIndex}
                  answerIndex={answerIndex}
                  position={position}
                  answer={round.answers[answerIndex]}
                  isRevealed={gameState.revealedAnswers.includes(answerIndex)}
                  isFlashing={flashAnswer === answerIndex}
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
                  isRevealed={gameState.revealedAnswers.includes(answerIndex)}
                  isFlashing={flashAnswer === answerIndex}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Accumulated Points */}
      <div className='bg-white border-t border-slate-200 px-8 py-4'>
        <div className='max-w-6xl mx-auto flex items-center justify-center gap-8'>
          <div className='text-center'>
            <div className='text-xs font-semibold text-slate-400 tracking-wider mb-1'>
              ACCUMULATED POINTS
            </div>
            <div className='text-4xl md:text-5xl font-bold text-amber-500'>
              {gameState.roundPoints}
            </div>
          </div>
        </div>
      </div>

      {/* Round End Summary */}
      {gameState.roundStatus === 'ended' && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm'>
          <div className='bg-white rounded-3xl p-10 md:p-14 text-center max-w-md mx-4 shadow-2xl'>
            <div className='text-sm font-semibold text-slate-400 tracking-wider mb-3'>
              ROUND OVER
            </div>
            {gameState.roundWinner ? (
              <>
                <div className='text-slate-800 text-3xl md:text-4xl font-bold mb-3'>
                  Team {gameState.roundWinner} wins!
                </div>
                <div className='text-amber-500 text-5xl md:text-6xl font-black'>
                  +{gameState.roundPoints}
                </div>
                <div className='text-slate-400 text-sm mt-2'>points</div>
              </>
            ) : (
              <div className='text-slate-800 text-2xl md:text-3xl font-bold'>
                No points awarded
              </div>
            )}
          </div>
        </div>
      )}

      {/* Team Scores - Bottom */}
      <div className='bg-slate-800 px-8 py-3'>
        <div className='max-w-6xl mx-auto flex justify-between items-center'>
          <div className='flex items-center gap-3'>
            <div
              className={`w-3 h-3 rounded-full ${gameState.activeTeam === 1 ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`}
            />
            <div>
              <div className='text-slate-400 text-xs font-medium'>TEAM 1</div>
              <div className='text-white text-xl font-bold'>
                {gameState.team1Score}
              </div>
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <div className='text-right'>
              <div className='text-slate-400 text-xs font-medium'>TEAM 2</div>
              <div className='text-white text-xl font-bold'>
                {gameState.team2Score}
              </div>
            </div>
            <div
              className={`w-3 h-3 rounded-full ${gameState.activeTeam === 2 ? 'bg-red-400 animate-pulse' : 'bg-slate-600'}`}
            />
          </div>
        </div>
      </div>
    </div>
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
      className={`relative rounded-xl overflow-hidden transition-all duration-500 ${
        isFlashing ? 'scale-[1.02]' : ''
      }`}
    >
      {isRevealed ? (
        <div className='bg-green-50 border-2 border-green-200 rounded-xl px-5 py-4 md:px-6 md:py-5 flex items-center justify-between shadow-md animate-reveal-block'>
          <span className='text-slate-800 text-lg md:text-2xl font-bold'>
            {answer.text}
          </span>
          <span className='text-amber-500 text-lg md:text-2xl font-black ml-4'>
            {answer.points}
          </span>
        </div>
      ) : (
        <div className='bg-white border-2 border-slate-200 rounded-xl px-5 py-4 md:px-6 md:py-5 flex items-center justify-between shadow-sm'>
          <span className='text-slate-400 text-lg md:text-2xl font-bold'>
            {position + 1}
          </span>
          <div className='w-6 h-6 md:w-8 md:h-8 rounded bg-slate-100' />
        </div>
      )}
    </div>
  )
}
