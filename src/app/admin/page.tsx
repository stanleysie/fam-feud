'use client'

import { AnimateIn } from '@/components/animate-in'
import { AppBackground } from '@/components/app-background'
import { FeudTitle } from '@/components/feud-title'
import { QuestionBuilder } from '@/components/question-builder'
import { DownloadExcelTemplateButton } from '@/components/export-questions-button'
import { QuestionsModal } from '@/components/questions-modal'
import { StorageRecoveryNotice } from '@/components/storage-recovery-notice'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { SAMPLE_IMPORT_DATA, validateImportData } from '@/lib/import-validation'
import {
  isExcelFile,
  isJsonFile,
  parseExcelBuffer,
} from '@/lib/excel-questions'
import { playCorrectSound, playWrongSound } from '@/lib/sounds'
import { useGameStateSync } from '@/hooks/use-game-state-sync'
import { createInitialState, GameState, ImportData, Round } from '@/types/game'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ListIcon,
  MonitorIcon,
  RotateCcwIcon,
  SkipForwardIcon,
  UploadCloudIcon,
  Volume2Icon,
  XIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

export default function AdminPage() {
  const router = useRouter()
  const { gameState, setGameState: setGameStateLocal, isReady } =
    useGameStateSync()
  const [jsonInput, setJsonInput] = useState('')
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [questionsOpen, setQuestionsOpen] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [importHover, setImportHover] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateState = useCallback(
    (newState: GameState) => {
      setGameStateLocal(newState)
    },
    [setGameStateLocal],
  )

  useEffect(() => {
    if (!isReady || !gameState || gameState.gameStarted) return
    router.replace('/questions')
  }, [isReady, gameState, router])

  const validateAndImport = (data: ImportData) => {
    const validationError = validateImportData(data)
    if (validationError) {
      setError(validationError)
      return false
    }
    setError('')
    return true
  }

  const completeImport = useCallback(
    (rounds: Round[]) => {
      updateState(createInitialState(rounds))
      setJsonInput('')
      router.push('/questions')
    },
    [router, updateState],
  )

  const handleImport = useCallback(() => {
    try {
      const data: ImportData = JSON.parse(jsonInput)
      if (validateAndImport(data)) {
        completeImport(data.rounds)
      }
    } catch {
      setError('Invalid JSON. Please check the format.')
    }
  }, [completeImport, jsonInput])

  const handleFileImport = (file: File) => {
    if (isExcelFile(file)) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const buffer = e.target?.result
        if (!(buffer instanceof ArrayBuffer)) {
          setError('Could not read the Excel file.')
          return
        }

        const result = parseExcelBuffer(buffer)
        if ('error' in result) {
          setError(result.error)
          return
        }

        setError('')
        completeImport(result.rounds)
      }
      reader.readAsArrayBuffer(file)
      return
    }

    if (!isJsonFile(file)) {
      setError('Please upload an Excel (.xlsx) or JSON (.json) file.')
      return
    }

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
    if (!file) return

    if (isExcelFile(file) || isJsonFile(file)) {
      handleFileImport(file)
      return
    }

    setError('Please drop an Excel (.xlsx) or JSON (.json) file.')
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

  useEffect(() => {
    if (gameState) return
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleImport()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [gameState, handleImport])

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
    setGameStateLocal(null)
    setJsonInput('')
    setResetConfirmOpen(false)
  }

  if (!isReady) {
    return (
      <AppBackground className='min-h-screen'>
        <div className='flex-1' />
      </AppBackground>
    )
  }

  if (!gameState) {
    return (
      <AppBackground className='flex flex-col text-slate-800'>
        <div className='flex-1 p-4 pb-44 md:p-6 md:pb-40'>
          <div className='mx-auto w-5/6 lg:w-2/3 space-y-4'>
            <StorageRecoveryNotice />
            <AnimateIn className='w-full'>
              <Card className='border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-amber-200/60 hover:shadow-md'>
                <CardContent className='flex flex-wrap items-center justify-between gap-3 p-4'>
                  <div className='flex min-w-0 items-center gap-3'>
                    <FeudTitle />
                    <div className='hidden h-6 w-px bg-slate-200 sm:block' />
                    <span className='hidden text-sm leading-none text-slate-500 sm:inline'>
                      Admin panel
                    </span>
                  </div>
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
                    className='border-slate-200 transition-all duration-200 hover:scale-105 hover:border-amber-300 hover:shadow-sm active:scale-100'
                  >
                    <MonitorIcon />
                    Game View
                  </Button>
                </CardContent>
              </Card>
            </AnimateIn>

            <AnimateIn delay={80}>
              <Card className='overflow-hidden border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-amber-200/60 hover:shadow-md'>
                <CardHeader className='border-b border-slate-100 bg-slate-50/50'>
                  <CardTitle className='text-slate-800'>
                    Import questions
                  </CardTitle>
                  <p className='text-sm font-normal text-slate-500'>
                    Start with the Excel template, or import JSON if you prefer.
                  </p>
                </CardHeader>
                <CardContent className='space-y-4 p-4 md:p-6'>
                  <div className='flex flex-col gap-3 rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                      <p className='text-sm font-medium text-slate-800'>
                        Use Excel or Google Sheets
                      </p>
                      <p className='text-sm text-slate-600'>
                        Download the template, add your questions and answers,
                        then upload the file below.
                      </p>
                    </div>
                    <DownloadExcelTemplateButton className='shrink-0 border-amber-300 bg-white hover:bg-amber-50' />
                  </div>

                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
                      dragActive
                        ? 'scale-[1.02] border-amber-400 bg-amber-50 shadow-lg shadow-amber-500/10'
                        : 'border-slate-200 bg-slate-50/50 hover:scale-[1.01] hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'
                    }`}
                  >
                    <UploadCloudIcon
                      className={`mx-auto mb-3 size-12 transition-transform duration-300 ${
                        dragActive
                          ? 'scale-110 text-amber-500'
                          : 'text-slate-400 hover:scale-105'
                      }`}
                    />
                    <p className='text-sm font-medium text-slate-700'>
                      Drop an Excel or JSON file here, or{' '}
                      <button
                        type='button'
                        onClick={() => fileInputRef.current?.click()}
                        className='font-semibold text-amber-600 hover:text-amber-700 underline-offset-2 hover:underline'
                      >
                        browse
                      </button>
                    </p>
                    <p className='mt-1 text-xs text-slate-400'>
                      Supports .xlsx and .json files
                    </p>
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='.xlsx,.xls,.json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/json'
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
                      <span className='bg-white px-3 text-slate-400 uppercase tracking-wider'>
                        or paste JSON (advanced)
                      </span>
                    </div>
                  </div>

                  <Textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder={`{\n  "rounds": [\n    {\n      "question": "Your question here",\n      "answers": [\n        { "text": "Answer 1", "points": 30 },\n        { "text": "Answer 2", "points": 20 }\n      ]\n    }\n  ]\n}`}
                    className='min-h-[220px] font-mono text-sm bg-slate-50 border-slate-200 transition-all duration-200 focus-visible:border-amber-400 focus-visible:ring-amber-400/20 focus-visible:shadow-md'
                  />
                  {error && (
                    <p className='animate-card-enter rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600'>
                      {error}
                    </p>
                  )}

                  <div className='relative'>
                    <div className='absolute inset-0 flex items-center'>
                      <div className='w-full border-t border-slate-200' />
                    </div>
                    <div className='relative flex justify-center text-xs'>
                      <span className='bg-white px-3 text-slate-400 uppercase tracking-wider'>
                        or build your own
                      </span>
                    </div>
                  </div>

                  <QuestionBuilder
                    onSubmit={(rounds) => {
                      setError('')
                      completeImport(rounds)
                    }}
                  />
                </CardContent>
              </Card>
            </AnimateIn>
          </div>
        </div>

        <div className='fixed bottom-0 left-0 right-0 z-10 border-t border-slate-200/80 bg-white/95 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] backdrop-blur-sm'>
          <div className='mx-auto w-5/6 lg:w-2/3 space-y-2'>
            <div className='flex flex-col gap-2 sm:flex-row'>
              <button
                type='button'
                onClick={handleImport}
                onMouseEnter={() => setImportHover(true)}
                onMouseLeave={() => setImportHover(false)}
                className='group relative h-11 flex-1 overflow-hidden rounded-lg bg-slate-800 text-base font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:bg-slate-900 hover:shadow-lg hover:shadow-amber-500/20 active:scale-100'
              >
                <span
                  className={`absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/25 to-amber-500/0 transition-transform duration-500 ${
                    importHover ? 'translate-x-full' : '-translate-x-full'
                  }`}
                />
                <span className='relative'>Import &amp; review</span>
              </button>
              <Button
                onClick={handleLoadSample}
                variant='outline'
                className='h-11 border-slate-200 transition-all duration-200 hover:scale-[1.02] hover:border-amber-300 active:scale-100 sm:min-w-[9rem]'
              >
                Load sample
              </Button>
            </div>
            <p className='text-center text-xs text-slate-400'>
              Press{' '}
              <kbd className='rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-slate-600 shadow-sm'>
                Ctrl
              </kbd>
              {' + '}
              <kbd className='rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-slate-600 shadow-sm'>
                Enter
              </kbd>{' '}
              to import
            </p>
          </div>
        </div>
      </AppBackground>
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
    <AppBackground className='text-slate-800 p-4 md:p-6'>
      <div className='mx-auto w-5/6 lg:w-2/3 min-w-0 space-y-4 pb-4'>
        <AnimateIn className='w-full'>
          <Card className='w-full border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-amber-200/60 hover:shadow-md'>
            <CardContent className='flex flex-wrap items-center justify-between gap-3 p-4'>
              <div className='flex min-w-0 items-center gap-3'>
                <FeudTitle />
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
                  className='border-slate-200 transition-all duration-200 hover:scale-105 hover:border-amber-300 hover:shadow-sm active:scale-100'
                >
                  <MonitorIcon />
                  Game View
                </Button>
                <Button
                  onClick={() => setQuestionsOpen(true)}
                  variant='outline'
                  className='border-slate-200 transition-all duration-200 hover:scale-105 hover:border-amber-300 active:scale-100'
                >
                  <ListIcon />
                  Questions
                </Button>
                <Button
                  onClick={() => setResetConfirmOpen(true)}
                  variant='outline'
                  className='border-red-200 text-red-600 transition-all duration-200 hover:scale-105 hover:bg-red-50 active:scale-100'
                >
                  <RotateCcwIcon />
                  Reset game
                </Button>
              </div>
            </CardContent>
          </Card>
        </AnimateIn>

        <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
          <DialogContent showCloseButton={false} className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Reset game?</DialogTitle>
              <DialogDescription>
                This clears all scores, progress, and saved game state. You will
                need to import questions again to start a new game.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setResetConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleClear}
                className='bg-red-500 hover:bg-red-600 text-white'
              >
                Reset game
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <QuestionsModal
          rounds={gameState.rounds}
          currentRoundIndex={gameState.currentRoundIndex}
          open={questionsOpen}
          onOpenChange={setQuestionsOpen}
        />

        {/* Team Scores - 2 columns */}
        <AnimateIn delay={60} className='w-full'>
        <div className='grid grid-cols-2 gap-3'>
          <button
            onClick={handleSwitchTeam}
            disabled={!live || gameState.roundStatus === 'ended'}
            className={`rounded-xl border-2 p-4 text-center transition-all duration-300 ${
              displayActiveTeam === 1
                ? 'scale-[1.02] border-blue-600 bg-blue-500 text-white shadow-md shadow-blue-200/50'
                : 'border-slate-200/80 bg-white/90 backdrop-blur-sm hover:scale-[1.02] hover:border-slate-300 hover:shadow-md'
            } ${!live || gameState.roundStatus === 'ended' ? 'cursor-default opacity-80' : 'active:scale-[0.98]'}`}
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
            className={`rounded-xl border-2 p-4 text-center transition-all duration-300 ${
              displayActiveTeam === 2
                ? 'scale-[1.02] border-blue-600 bg-blue-500 text-white shadow-md shadow-blue-200/50'
                : 'border-slate-200/80 bg-white/90 backdrop-blur-sm hover:scale-[1.02] hover:border-slate-300 hover:shadow-md'
            } ${!live || gameState.roundStatus === 'ended' ? 'cursor-default opacity-80' : 'active:scale-[0.98]'}`}
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
        </AnimateIn>

        {review && (
          <AnimateIn delay={90} className='w-full'>
          <Card className='border-slate-300/80 bg-slate-100/90 backdrop-blur-sm'>
            <CardContent className='p-3 text-center text-sm text-slate-600'>
              Reviewing question {gameState.viewRoundIndex + 1} — final state
              (read-only)
            </CardContent>
          </Card>
          </AnimateIn>
        )}

        {/* Round Info */}
        {!round && (
          <AnimateIn className='w-full'>
          <Card className='border-red-200/80 bg-red-50/90 backdrop-blur-sm'>
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
          </AnimateIn>
        )}

        <AnimateIn delay={100} className='w-full'>
        <Card className='w-full border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md'>
          <CardContent className='p-4 md:p-5'>
            <div className='w-full space-y-3'>
              <div className='flex w-full min-w-0 items-start gap-3'>
                <Badge
                  variant='outline'
                  className='shrink-0 bg-slate-100 px-2.5 py-1 text-sm font-semibold'
                >
                  Q{viewState.currentRoundIndex + 1}/{gameState.rounds.length}
                </Badge>
                <p className='min-w-0 flex-1 text-base font-bold leading-snug break-words text-slate-800 md:text-lg'>
                  {round?.question}
                </p>
              </div>
              <div className='flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-sm'>
                <div className='text-slate-500'>
                  Points:{' '}
                  <span className='text-base font-bold text-amber-500'>
                    {viewState.roundPoints}
                  </span>
                </div>
                <Separator orientation='vertical' className='hidden h-5 sm:block' />
                <div className='text-slate-500'>
                  Strikes:{' '}
                  <span className='text-base font-bold tracking-wide text-red-500'>
                    {Array.from({ length: 3 }, (_, i) =>
                      i < viewState.strikes ? '✗ ' : '○ ',
                    )}
                  </span>
                </div>
                <Separator orientation='vertical' className='hidden h-5 sm:block' />
                <div className='shrink-0'>
                  {viewState.isStealPhase ? (
                    <Badge className='bg-orange-500 px-2.5 py-1 text-sm font-semibold'>
                      STEAL - Team {viewState.activeTeam}
                    </Badge>
                  ) : viewState.roundStatus === 'ended' ? (
                    <Badge className='bg-green-500 px-2.5 py-1 text-sm font-semibold'>
                      ENDED
                    </Badge>
                  ) : review ? (
                    <Badge
                      variant='outline'
                      className='px-2.5 py-1 text-sm font-semibold'
                    >
                      REVIEW
                    </Badge>
                  ) : (
                    <Badge className='bg-blue-500 px-2.5 py-1 text-sm font-semibold'>
                      ACTIVE
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </AnimateIn>

        {/* Round End Summary */}
        {live && gameState.roundStatus === 'ended' && (
          <AnimateIn delay={120} className='w-full'>
          <Card className='border-amber-200/80 bg-amber-50/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md'>
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
          </AnimateIn>
        )}

        {/* Answers */}
        {showAnswers && (
          <AnimateIn delay={140} className='w-full'>
          <Card className='border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md'>
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
                      className={`flex items-center gap-3 rounded-lg border p-3 transition-all duration-200 ${
                        isRevealed
                          ? 'border-green-200 bg-green-50'
                          : 'border-slate-200 bg-white hover:translate-x-1 hover:border-amber-200 hover:bg-slate-50 hover:shadow-sm'
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
                            className='h-8 bg-green-500 text-xs text-white transition-all duration-200 hover:scale-105 hover:bg-green-600 active:scale-100'
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
          </AnimateIn>
        )}

        {/* Controls */}
        <AnimateIn delay={160} className='w-full'>
        <Card className='border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md'>
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
        </AnimateIn>
      </div>
    </AppBackground>
  )
}
