'use client'

import { QuestionsModal } from '@/components/questions-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  canGoNextView,
  canGoPrevView,
  getActiveRound,
  getEffectiveState,
  goToLastRound,
  hasNextRound,
  isLiveView,
  isReviewMode,
  markWrong,
  nextRound,
  nextRoundView,
  prevRoundView,
  revealAnswer,
  revealRemainingAnswer,
  switchActiveTeam,
  undoAction,
} from '@/lib/game-engine'
import {
  SAMPLE_IMPORT_DATA,
  validateImportData,
} from '@/lib/import-validation'
import { playCorrectSound, playWrongSound } from '@/lib/sounds'
import {
  clearGameState,
  getGameState,
  onUpdate,
  setGameState,
} from '@/lib/storage'
import { createInitialState, GameState, ImportData, Round } from '@/types/game'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ListIcon,
  MonitorIcon,
  RotateCcwIcon,
  SkipForwardIcon,
  Volume2Icon,
  XIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

export default function AdminPage() {
  const router = useRouter()
  const [gameState, setGameStateLocal] = useState<GameState | null>(null)
  const [jsonInput, setJsonInput] = useState('')
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [questionsOpen, setQuestionsOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const existing = getGameState()
    if (existing) setGameStateLocal(existing)

    return onUpdate(() => {
      const updated = getGameState()
      if (updated) setGameStateLocal(updated)
    })
  }, [])

  const updateState = useCallback((newState: GameState) => {
    setGameStateLocal(newState)
    setGameState(newState)
  }, [])

  const validateAndImport = (data: ImportData) => {
    const validationError = validateImportData(data)
    if (validationError) {
      setError(validationError)
      return false
    }
    setError('')
    return true
  }

  const completeImport = (rounds: Round[]) => {
    updateState(createInitialState(rounds))
    setJsonInput('')
    router.push('/questions')
  }

  const handleImport = () => {
    try {
      const data: ImportData = JSON.parse(jsonInput)
      if (validateAndImport(data)) {
        completeImport(data.rounds)
      }
    } catch {
      setError('Invalid JSON. Please check the format.')
    }
  }

  const handleFileImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setJsonInput(content)
      try {
        const data: ImportData = JSON.parse(content)
        if (validateAndImport(data)) {
          completeImport(data.rounds)
        }
      } catch {
        setError('Invalid JSON file. Please check the format.')
      }
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/json') {
      handleFileImport(file)
    } else {
      setError('Please drop a .json file')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleLoadSample = () => {
    setJsonInput(JSON.stringify(SAMPLE_IMPORT_DATA, null, 2))
  }

  const handleReveal = (answerIndex: number) => {
    if (!gameState || !isLiveView(gameState)) return
    const isCosmeticReveal = gameState.roundStatus === 'ended'
    const newState = isCosmeticReveal
      ? revealRemainingAnswer(gameState, answerIndex)
      : revealAnswer(gameState, answerIndex)
    if (!isCosmeticReveal) {
      playCorrectSound()
    }
    updateState(newState)
  }

  const handleWrong = () => {
    if (!gameState) return
    const wasStealPhase = gameState.isStealPhase
    const newState = markWrong(gameState)
    if (!wasStealPhase) {
      playWrongSound()
    }
    updateState(newState)
  }

  const handleUndo = () => {
    if (!gameState) return
    updateState(undoAction(gameState))
  }

  const handleNextQuestion = () => {
    if (!gameState) return
    updateState(nextRound(gameState))
  }

  const handlePrev = () => {
    if (!gameState) return
    updateState(prevRoundView(gameState))
  }

  const handleNextView = () => {
    if (!gameState) return
    updateState(nextRoundView(gameState))
  }

  const handleGoToLastRound = () => {
    if (!gameState) return
    updateState(goToLastRound(gameState))
  }

  const handleSwitchTeam = () => {
    if (!gameState) return
    updateState(switchActiveTeam(gameState))
  }

  const handleClear = () => {
    clearGameState()
    setGameStateLocal(null)
    setJsonInput('')
  }

  if (!gameState) {
    return (
      <div className='min-h-screen bg-slate-50 text-slate-800 flex flex-col'>
        <div className='flex-1 p-8 pb-32'>
          <div className='max-w-2xl mx-auto'>
            <h1 className='text-3xl font-bold mb-8 text-slate-800'>
              Family Feud - Admin
            </h1>

            <Card className='bg-white border-slate-200 shadow-sm'>
              <CardHeader>
                <CardTitle className='text-slate-800'>
                  Import Questions
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* File Drop Zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className='text-slate-400 mb-4'>
                    <svg
                      className='w-12 h-12 mx-auto mb-3'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={1.5}
                        d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                      />
                    </svg>
                    <p className='text-sm font-medium text-slate-600'>
                      Drop a JSON file here, or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className='text-blue-500 hover:text-blue-600 underline'
                      >
                        browse
                      </button>
                    </p>
                    <p className='text-xs text-slate-400 mt-1'>
                      Supports .json files only
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='.json,application/json'
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileImport(file)
                    }}
                    className='hidden'
                  />
                </div>

                <div className='relative'>
                  <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t border-slate-200' />
                  </div>
                  <div className='relative flex justify-center text-xs'>
                    <span className='bg-white px-2 text-slate-400'>
                      or paste JSON
                    </span>
                  </div>
                </div>

                <Textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={`{\n  "rounds": [\n    {\n      "question": "Your question here",\n      "answers": [\n        { "text": "Answer 1", "points": 30 },\n        { "text": "Answer 2", "points": 20 }\n      ]\n    }\n  ]\n}`}
                  className='min-h-[200px] font-mono text-sm bg-slate-50 border-slate-200'
                />
                {error && <p className='text-red-500 text-sm'>{error}</p>}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sticky Import Button */}
        <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-10'>
          <div className='max-w-2xl mx-auto flex gap-2'>
            <Button
              onClick={handleImport}
              className='flex-1 bg-slate-800 hover:bg-slate-700 h-12 text-base'
            >
              Import
            </Button>
            <Button
              onClick={handleLoadSample}
              variant='outline'
              className='h-12'
            >
              Load Sample
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const round = getActiveRound(getEffectiveState(gameState))
  const viewState = getEffectiveState(gameState)
  const live = isLiveView(gameState)
  const review = isReviewMode(gameState)
  const canGoNext = hasNextRound(gameState)
  const hasUnrevealedAnswers =
    live &&
    round &&
    !round.answers.every((_, index) =>
      gameState.revealedAnswers.includes(index),
    )
  const showAnswers =
    round &&
    (review ||
      gameState.roundStatus === 'active' ||
      (live && gameState.roundStatus === 'ended'))
  const canUndo =
    live &&
    gameState.roundStatus === 'active' &&
    gameState.actionHistory.length > 0
  const displayActiveTeam = live ? gameState.activeTeam : viewState.activeTeam

  return (
    <div className='min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6'>
      <div className='max-w-5xl mx-auto space-y-4 pb-4'>
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardContent className='flex flex-wrap items-center justify-between gap-3 p-4'>
            <div className='flex items-center gap-3 min-w-0'>
              <h1 className='text-xl font-bold leading-none tracking-tight text-slate-800 sm:text-2xl'>
                FAMILY <span className='text-amber-500'>FEUD</span>
              </h1>
              <div className='hidden h-6 w-px bg-slate-200 sm:block' />
              <span className='hidden text-sm leading-none text-slate-500 sm:inline'>
                Admin panel
              </span>
              {review && <Badge className='bg-slate-500'>Reviewing</Badge>}
            </div>

            <div className='flex flex-wrap items-center gap-2'>
              <Button
                nativeButton={false}
                render={
                  <Link
                    href='/game-view'
                    target='_blank'
                    rel='noopener noreferrer'
                  />
                }
                variant='outline'
                className='border-slate-200'
              >
                <MonitorIcon />
                Game View
              </Button>
              <Button
                onClick={() => setQuestionsOpen(true)}
                variant='outline'
                className='border-slate-200'
              >
                <ListIcon />
                Questions
              </Button>
              <Button
                onClick={handleClear}
                variant='outline'
                className='border-red-200 text-red-600 hover:bg-red-50'
              >
                <RotateCcwIcon />
                Reset game
              </Button>
            </div>
          </CardContent>
        </Card>

        <QuestionsModal
          rounds={gameState.rounds}
          currentRoundIndex={gameState.currentRoundIndex}
          open={questionsOpen}
          onOpenChange={setQuestionsOpen}
        />

        {/* Team Scores - 2 columns */}
        <div className='grid grid-cols-2 gap-3'>
          <button
            onClick={handleSwitchTeam}
            disabled={!live || gameState.roundStatus === 'ended'}
            className={`p-4 rounded-xl border-2 transition-all text-center ${
              displayActiveTeam === 1
                ? 'bg-blue-500 border-blue-600 text-white shadow-md'
                : 'bg-white border-slate-200 hover:border-slate-300'
            } ${!live || gameState.roundStatus === 'ended' ? 'opacity-80 cursor-default' : ''}`}
          >
            <div
              className={`text-xs font-semibold tracking-wider mb-1 ${displayActiveTeam === 1 ? 'text-blue-100' : 'text-slate-400'}`}
            >
              TEAM 1
            </div>
            <div
              className={`text-3xl font-bold ${displayActiveTeam === 1 ? 'text-white' : 'text-slate-800'}`}
            >
              {viewState.team1Score}
            </div>
          </button>

          <button
            onClick={handleSwitchTeam}
            disabled={!live || gameState.roundStatus === 'ended'}
            className={`p-4 rounded-xl border-2 transition-all text-center ${
              displayActiveTeam === 2
                ? 'bg-blue-500 border-blue-600 text-white shadow-md'
                : 'bg-white border-slate-200 hover:border-slate-300'
            } ${!live || gameState.roundStatus === 'ended' ? 'opacity-80 cursor-default' : ''}`}
          >
            <div
              className={`text-xs font-semibold tracking-wider mb-1 ${displayActiveTeam === 2 ? 'text-blue-100' : 'text-slate-400'}`}
            >
              TEAM 2
            </div>
            <div
              className={`text-3xl font-bold ${displayActiveTeam === 2 ? 'text-white' : 'text-slate-800'}`}
            >
              {viewState.team2Score}
            </div>
          </button>
        </div>

        {review && (
          <Card className='bg-slate-100 border-slate-300'>
            <CardContent className='p-3 text-center text-sm text-slate-600'>
              Reviewing question {gameState.viewRoundIndex + 1} — final state
              (read-only)
            </CardContent>
          </Card>
        )}

        {/* Round Info */}
        {!round && (
          <Card className='bg-red-50 border-red-200'>
            <CardContent className='p-4 text-center space-y-3'>
              <div className='text-red-800 font-medium'>
                Past the last question (Q{gameState.currentRoundIndex + 1}/
                {gameState.rounds.length})
              </div>
              <Button onClick={handleGoToLastRound} variant='outline'>
                Go to last question
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardContent className='p-3'>
            <div className='flex flex-wrap items-center gap-3 text-sm'>
              <Badge variant='outline' className='bg-slate-100'>
                Q{viewState.currentRoundIndex + 1}/{gameState.rounds.length}
              </Badge>
              <div className='font-medium text-slate-600 truncate flex-1'>
                {round?.question}
              </div>
              <Separator orientation='vertical' className='h-4' />
              <div className='text-slate-500'>
                Points:{' '}
                <span className='font-bold text-amber-500'>
                  {viewState.roundPoints}
                </span>
              </div>
              <Separator orientation='vertical' className='h-4' />
              <div className='text-slate-500'>
                Strikes:{' '}
                <span className='font-bold text-red-500'>
                  {Array.from({ length: 3 }, (_, i) =>
                    i < viewState.strikes ? '✗ ' : '○ ',
                  )}
                </span>
              </div>
              <Separator orientation='vertical' className='h-4' />
              <div>
                {viewState.isStealPhase ? (
                  <Badge className='bg-orange-500'>
                    STEAL - Team {viewState.activeTeam}
                  </Badge>
                ) : viewState.roundStatus === 'ended' ? (
                  <Badge className='bg-green-500'>ENDED</Badge>
                ) : review ? (
                  <Badge variant='outline'>REVIEW</Badge>
                ) : (
                  <Badge className='bg-blue-500'>ACTIVE</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Round End Summary */}
        {live && gameState.roundStatus === 'ended' && (
          <Card className='bg-amber-50 border-amber-200'>
            <CardContent className='p-4 text-center'>
              <div className='text-lg font-bold mb-2 text-slate-800'>
                {gameState.roundWinner
                  ? `Team ${gameState.roundWinner} wins ${gameState.roundPoints} points!`
                  : 'No points awarded'}
              </div>
              {hasUnrevealedAnswers && (
                <p className='text-sm text-slate-600 mb-3'>
                  Reveal remaining answers below before moving on (no extra
                  points).
                </p>
              )}
              {canGoNext ? (
                <Button
                  onClick={handleNextQuestion}
                  className='bg-slate-800 hover:bg-slate-700'
                >
                  Next Question
                </Button>
              ) : (
                <div className='text-slate-600 font-medium'>
                  Game complete — Team 1: {gameState.team1Score} · Team 2:{' '}
                  {gameState.team2Score}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Answers */}
        {showAnswers && (
          <Card className='bg-white border-slate-200 shadow-sm'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg text-slate-800'>
                Answers{review ? ' (read-only)' : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {round.answers.map((answer, index) => {
                  const isRevealed = viewState.revealedAnswers.includes(index)
                  const canReveal =
                    live &&
                    !review &&
                    !isRevealed &&
                    (gameState.roundStatus === 'active' ||
                      gameState.roundStatus === 'ended')

                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        isRevealed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className='w-7 text-center font-bold text-slate-400 text-sm'>
                        {index + 1}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='font-medium text-slate-800 truncate'>
                          {answer.text}
                        </div>
                        <div className='text-sm text-slate-500'>
                          {answer.points} pts
                        </div>
                      </div>
                      <div className='flex items-center gap-2 shrink-0'>
                        {isRevealed ? (
                          <Badge className='bg-green-500'>Revealed</Badge>
                        ) : review ? (
                          <Badge variant='outline'>Hidden</Badge>
                        ) : canReveal ? (
                          <Button
                            size='sm'
                            onClick={() => handleReveal(index)}
                            className='bg-green-500 hover:bg-green-600 text-white text-xs h-8'
                          >
                            Reveal
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardContent className='p-4 space-y-4'>
            {/* Review past questions */}
            <div className='space-y-2'>
              <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
                Review questions
              </p>
              <div className='flex flex-wrap gap-2'>
                <Button
                  onClick={handlePrev}
                  variant='outline'
                  disabled={!canGoPrevView(gameState)}
                  className='min-w-[8.5rem] border-slate-200'
                >
                  <ChevronLeftIcon />
                  Previous
                </Button>
                <Button
                  onClick={handleNextView}
                  variant='outline'
                  disabled={!canGoNextView(gameState)}
                  className='min-w-[8.5rem] border-slate-200'
                >
                  Next
                  <ChevronRightIcon />
                </Button>
              </div>
              <p className='text-xs text-slate-500'>
                Browse completed questions on Game View (read-only).
              </p>
            </div>

            {live && gameState.roundStatus === 'active' && (
              <>
                <div className='border-t border-slate-100' />

                {/* Live round actions */}
                <div className='space-y-2'>
                  <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
                    Round actions
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    <Button
                      onClick={handleUndo}
                      variant='outline'
                      disabled={!canUndo}
                      className='border-slate-200'
                    >
                      <RotateCcwIcon />
                      Undo
                    </Button>
                    <Button
                      onClick={handleWrong}
                      disabled={
                        !gameState.isStealPhase && gameState.strikes >= 3
                      }
                      className='bg-red-500 hover:bg-red-600 text-white min-w-[9rem]'
                    >
                      <XIcon />
                      {gameState.isStealPhase ? 'Steal wrong' : 'No answer'}
                    </Button>
                    <Button
                      onClick={handleNextQuestion}
                      variant='outline'
                      disabled={!canGoNext}
                      className='border-amber-300 text-amber-700 hover:bg-amber-50 min-w-[9rem]'
                    >
                      <SkipForwardIcon />
                      Skip question
                    </Button>
                  </div>
                  <p className='text-xs text-slate-500'>
                    {gameState.isStealPhase
                      ? 'Reveal an answer if the steal is correct, or mark wrong if not.'
                      : 'Undo only reverses the last reveal or wrong answer.'}
                  </p>
                </div>
              </>
            )}

            <div className='border-t border-slate-100' />

            {/* Sound test */}
            <div className='space-y-2'>
              <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
                Sound check
              </p>
              <div className='flex flex-wrap gap-2'>
                <Button
                  onClick={playCorrectSound}
                  variant='outline'
                  size='sm'
                  className='border-green-200 text-green-700 hover:bg-green-50'
                >
                  <Volume2Icon />
                  Correct
                </Button>
                <Button
                  onClick={playWrongSound}
                  variant='outline'
                  size='sm'
                  className='border-red-200 text-red-700 hover:bg-red-50'
                >
                  <Volume2Icon />
                  Wrong
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
