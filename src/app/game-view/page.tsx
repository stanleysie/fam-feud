'use client'

import {
  getActiveRound,
  getEffectiveState,
  getVisibleAnswers,
  isGameComplete,
  isLiveView,
  isReviewMode,
  revealFinalScores,
} from '@/lib/game-engine'
import { getGameState, onUpdate, setGameState } from '@/lib/storage'
import { GameState } from '@/types/game'
import { useEffect, useState } from 'react'

export default function GameViewPage() {
  const [gameState, setGameStateLocal] = useState<GameState | null>(null)
  const [flashAnswer, setFlashAnswer] = useState<number | null>(null)

  useEffect(() => {
    const existing = getGameState()
    if (existing) {
      setGameStateLocal(existing)
    }

    return onUpdate(() => {
      const updated = getGameState()
      if (updated) {
        setGameStateLocal(updated)
      }
    })
  }, [])

  // Flash effect for newly revealed answers during live active play only
  useEffect(() => {
    if (!gameState || !isLiveView(gameState)) return
    if (gameState.roundStatus === 'ended') return
    const viewState = getEffectiveState(gameState)
    const lastRevealed =
      viewState.revealedAnswers[viewState.revealedAnswers.length - 1]
    if (lastRevealed !== undefined) {
      setFlashAnswer(lastRevealed)
      const timer = setTimeout(() => setFlashAnswer(null), 800)
      return () => clearTimeout(timer)
    }
  }, [gameState?.revealedAnswers.length, gameState?.viewRoundIndex, gameState?.roundStatus])

  if (!gameState) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
        <div className='text-slate-400 text-2xl font-medium'>
          Waiting for admin to start the game...
        </div>
      </div>
    )
  }

  const viewState = getEffectiveState(gameState)
  const round = getActiveRound(viewState)
  const visibleAnswers = getVisibleAnswers(viewState)
  const gameComplete = isGameComplete(gameState)
  const review = isReviewMode(gameState)
  const finalScoresRevealed = gameState.finalScoresRevealed ?? false

  const handleRevealFinalScores = () => {
    const newState = revealFinalScores(gameState)
    setGameStateLocal(newState)
    setGameState(newState)
  }

  if (!round) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
        <div className='text-slate-400 text-2xl font-medium'>
          No more questions!
        </div>
      </div>
    )
  }

  const showRoundEndBanner =
    viewState.roundStatus === 'ended' &&
    !gameComplete &&
    viewState.roundWinner
  const showNoPointsBanner =
    viewState.roundStatus === 'ended' &&
    !gameComplete &&
    !viewState.roundWinner

  // Split answers into columns: left column top-to-bottom, then right column
  const mid = Math.ceil(visibleAnswers.length / 2)
  const leftAnswers = visibleAnswers.slice(0, mid)
  const rightAnswers = visibleAnswers.slice(mid)

  return (
    <div className='min-h-screen bg-slate-50 flex flex-col overflow-hidden'>
      {/* Top Bar - Strikes + Steal Indicator */}
      <div className='bg-white border-b border-slate-200 px-8 py-4'>
        <div className='max-w-6xl mx-auto relative flex items-center justify-center min-h-[4.5rem]'>
          {/* Strike Indicators */}
          <div className='flex items-center justify-center gap-6'>
            {[0, 1, 2].map((i) => (
              <div key={i} className='flex flex-col items-center gap-1'>
                <span className='text-xs font-semibold text-slate-400 tracking-wider'>
                  STRIKE {i + 1}
                </span>
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    i < viewState.strikes
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
          {viewState.isStealPhase && (
            <div className='absolute right-0 flex items-center gap-2 bg-orange-100 border border-orange-300 rounded-lg px-4 py-2'>
              <div className='w-2.5 h-2.5 rounded-full bg-orange-500' />
              <span className='text-orange-700 font-bold text-sm tracking-wider'>
                STEAL - TEAM {viewState.activeTeam}
              </span>
            </div>
          )}
          {review && (
            <div className='absolute right-0 flex items-center gap-2 bg-slate-100 border border-slate-300 rounded-lg px-4 py-2'>
              <span className='text-slate-600 font-bold text-sm tracking-wider'>
                REVIEW - Q{viewState.currentRoundIndex + 1}
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
                  isRevealed={viewState.revealedAnswers.includes(answerIndex)}
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
                  isRevealed={viewState.revealedAnswers.includes(answerIndex)}
                  isFlashing={!review && flashAnswer === answerIndex}
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
              {viewState.roundPoints}
            </div>
          </div>
        </div>
      </div>

      {/* Round End Banner */}
      {showRoundEndBanner && (
        <div className='bg-amber-500 text-white px-8 py-4 shadow-lg'>
          <div className='max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center'>
            <div className='text-sm font-semibold tracking-wider uppercase opacity-90'>
              Round over
            </div>
            <div className='text-xl md:text-2xl font-bold'>
              Team {viewState.roundWinner} wins{' '}
              <span className='text-amber-100'>{viewState.roundPoints} points</span>
            </div>
          </div>
        </div>
      )}

      {showNoPointsBanner && (
        <div className='bg-slate-500 text-white px-8 py-4 shadow-lg'>
          <div className='max-w-6xl mx-auto text-center text-xl md:text-2xl font-bold'>
            No points awarded
          </div>
        </div>
      )}

      {/* Game Complete Summary */}
      {gameComplete && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm'>
          <div className='bg-white rounded-3xl p-10 md:p-14 text-center max-w-2xl mx-4 shadow-2xl'>
            {finalScoresRevealed ? (
              <>
                <div className='text-sm font-semibold text-slate-400 tracking-wider mb-6'>
                  FINAL SCORES
                </div>
                <div className='grid grid-cols-2 gap-4 md:gap-6 mb-8'>
                  <div
                    className={`rounded-2xl border-2 p-6 md:p-8 ${
                      viewState.team1Score >= viewState.team2Score
                        ? 'border-blue-400 bg-blue-50 shadow-lg shadow-blue-100'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className='text-xs font-semibold text-slate-400 tracking-wider mb-2'>
                      TEAM 1
                    </div>
                    <div className='text-blue-600 text-5xl md:text-6xl font-black'>
                      {viewState.team1Score}
                    </div>
                  </div>
                  <div
                    className={`rounded-2xl border-2 p-6 md:p-8 ${
                      viewState.team2Score >= viewState.team1Score
                        ? 'border-red-400 bg-red-50 shadow-lg shadow-red-100'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className='text-xs font-semibold text-slate-400 tracking-wider mb-2'>
                      TEAM 2
                    </div>
                    <div className='text-red-600 text-5xl md:text-6xl font-black'>
                      {viewState.team2Score}
                    </div>
                  </div>
                </div>
                <div className='text-slate-800 text-2xl md:text-3xl font-bold'>
                  {viewState.team1Score === viewState.team2Score
                    ? "It's a tie!"
                    : viewState.team1Score > viewState.team2Score
                      ? 'Team 1 wins the game!'
                      : 'Team 2 wins the game!'}
                </div>
              </>
            ) : (
              <>
                <div className='text-sm font-semibold text-slate-400 tracking-wider mb-3'>
                  GAME COMPLETE
                </div>
                <div className='text-slate-800 text-3xl md:text-4xl font-bold mb-8'>
                  Ready to reveal final scores?
                </div>
                <button
                  onClick={handleRevealFinalScores}
                  className='bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition-colors'
                >
                  Reveal Final Scores
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Team Scores - Bottom */}
      <div className='bg-slate-800 px-8 py-3'>
        <div className='max-w-6xl mx-auto flex justify-between items-center'>
          <div className='flex items-center gap-3'>
            <div
              className={`w-3 h-3 rounded-full ${viewState.activeTeam === 1 && !review ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`}
            />
            <div>
              <div className='text-slate-400 text-xs font-medium'>TEAM 1</div>
              <div className='text-white text-xl font-bold'>
                {viewState.team1Score}
              </div>
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <div className='text-right'>
              <div className='text-slate-400 text-xs font-medium'>TEAM 2</div>
              <div className='text-white text-xl font-bold'>
                {viewState.team2Score}
              </div>
            </div>
            <div
              className={`w-3 h-3 rounded-full ${viewState.activeTeam === 2 && !review ? 'bg-red-400 animate-pulse' : 'bg-slate-600'}`}
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
