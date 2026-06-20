'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  endRound,
  getActiveRound,
  markWrong,
  nextRound,
  prevRound,
  resolveSteal,
  revealAnswer,
  switchActiveTeam,
  undoAction,
} from '@/lib/game-engine'
import { playCorrectSound, playWrongSound } from '@/lib/sounds'
import {
  clearGameState,
  getGameState,
  onUpdate,
  setGameState,
} from '@/lib/storage'
import { createInitialState, GameState, ImportData } from '@/types/game'
import { useCallback, useEffect, useRef, useState } from 'react'

const SAMPLE_DATA: ImportData = {
  rounds: [
    {
      question: 'Name something you bring to the beach',
      answers: [
        { text: 'Sunscreen', points: 35 },
        { text: 'Towel', points: 28 },
        { text: 'Umbrella', points: 20 },
        { text: 'Cooler', points: 12 },
        { text: 'Chair', points: 5 },
      ],
    },
    {
      question: 'Name a popular pizza topping',
      answers: [
        { text: 'Pepperoni', points: 40 },
        { text: 'Mushrooms', points: 22 },
        { text: 'Sausage', points: 18 },
        { text: 'Onions', points: 12 },
        { text: 'Bell Peppers', points: 8 },
      ],
    },
    {
      question: 'Name something you find in a toolbox',
      answers: [
        { text: 'Hammer', points: 30 },
        { text: 'Screwdriver', points: 25 },
        { text: 'Wrench', points: 20 },
        { text: 'Pliers', points: 15 },
        { text: 'Tape Measure', points: 10 },
      ],
    },
  ],
}

export default function AdminPage() {
  const [gameState, setGameStateLocal] = useState<GameState | null>(null)
  const [jsonInput, setJsonInput] = useState('')
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
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
    setError('')
    if (
      !data.rounds ||
      !Array.isArray(data.rounds) ||
      data.rounds.length === 0
    ) {
      setError(
        'Invalid format: must have a "rounds" array with at least one round.',
      )
      return false
    }
    for (const round of data.rounds) {
      if (
        !round.question ||
        !Array.isArray(round.answers) ||
        round.answers.length === 0
      ) {
        setError('Each round must have a "question" and at least one "answer".')
        return false
      }
      for (const answer of round.answers) {
        if (!answer.text || typeof answer.points !== 'number') {
          setError(
            'Each answer must have "text" (string) and "points" (number).',
          )
          return false
        }
      }
    }
    return true
  }

  const handleImport = () => {
    try {
      const data: ImportData = JSON.parse(jsonInput)
      if (validateAndImport(data)) {
        updateState(createInitialState(data.rounds))
        setJsonInput('')
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
          updateState(createInitialState(data.rounds))
          setJsonInput('')
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
    setJsonInput(JSON.stringify(SAMPLE_DATA, null, 2))
  }

  const handleReveal = (answerIndex: number) => {
    if (!gameState) return
    const newState = revealAnswer(gameState, answerIndex)
    playCorrectSound()
    updateState(newState)
  }

  const handleWrong = () => {
    if (!gameState) return
    const newState = markWrong(gameState)
    playWrongSound()
    updateState(newState)
  }

  const handleStealSuccess = () => {
    if (!gameState) return
    updateState(resolveSteal(gameState, true))
  }

  const handleStealFail = () => {
    if (!gameState) return
    updateState(resolveSteal(gameState, false))
  }

  const handleUndo = () => {
    if (!gameState) return
    updateState(undoAction(gameState))
  }

  const handleEndRound = () => {
    if (!gameState) return
    updateState(endRound(gameState))
  }

  const handleNext = () => {
    if (!gameState) return
    updateState(nextRound(gameState))
  }

  const handlePrev = () => {
    if (!gameState) return
    updateState(prevRound(gameState))
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

  const round = getActiveRound(gameState)

  return (
    <div className='min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6'>
      <div className='max-w-5xl mx-auto space-y-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-slate-800'>
            Family Feud - Admin
          </h1>
          <Button onClick={handleClear} variant='destructive' size='sm'>
            Reset Game
          </Button>
        </div>

        {/* Team Scores - 2 columns */}
        <div className='grid grid-cols-2 gap-3'>
          <button
            onClick={handleSwitchTeam}
            className={`p-4 rounded-xl border-2 transition-all text-center ${
              gameState.activeTeam === 1
                ? 'bg-blue-500 border-blue-600 text-white shadow-md'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div
              className={`text-xs font-semibold tracking-wider mb-1 ${gameState.activeTeam === 1 ? 'text-blue-100' : 'text-slate-400'}`}
            >
              TEAM 1
            </div>
            <div
              className={`text-3xl font-bold ${gameState.activeTeam === 1 ? 'text-white' : 'text-slate-800'}`}
            >
              {gameState.team1Score}
            </div>
          </button>

          <button
            onClick={handleSwitchTeam}
            className={`p-4 rounded-xl border-2 transition-all text-center ${
              gameState.activeTeam === 2
                ? 'bg-red-500 border-red-600 text-white shadow-md'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div
              className={`text-xs font-semibold tracking-wider mb-1 ${gameState.activeTeam === 2 ? 'text-red-100' : 'text-slate-400'}`}
            >
              TEAM 2
            </div>
            <div
              className={`text-3xl font-bold ${gameState.activeTeam === 2 ? 'text-white' : 'text-slate-800'}`}
            >
              {gameState.team2Score}
            </div>
          </button>
        </div>

        {/* Round Info */}
        <Card className='bg-white border-slate-200 shadow-sm'>
          <CardContent className='p-3'>
            <div className='flex flex-wrap items-center gap-3 text-sm'>
              <Badge variant='outline' className='bg-slate-100'>
                Q{gameState.currentRoundIndex + 1}/{gameState.rounds.length}
              </Badge>
              <div className='font-medium text-slate-600 truncate flex-1'>
                {round?.question}
              </div>
              <Separator orientation='vertical' className='h-4' />
              <div className='text-slate-500'>
                Points:{' '}
                <span className='font-bold text-amber-500'>
                  {gameState.roundPoints}
                </span>
              </div>
              <Separator orientation='vertical' className='h-4' />
              <div className='text-slate-500'>
                Strikes:{' '}
                <span className='font-bold text-red-500'>
                  {Array.from({ length: 3 }, (_, i) =>
                    i < gameState.strikes ? '✗ ' : '○ ',
                  )}
                </span>
              </div>
              <Separator orientation='vertical' className='h-4' />
              <div>
                {gameState.isStealPhase ? (
                  <Badge className='bg-orange-500'>
                    STEAL - Team {gameState.activeTeam}
                  </Badge>
                ) : gameState.roundStatus === 'ended' ? (
                  <Badge className='bg-green-500'>ENDED</Badge>
                ) : (
                  <Badge className='bg-blue-500'>ACTIVE</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Round End Summary */}
        {gameState.roundStatus === 'ended' && (
          <Card className='bg-amber-50 border-amber-200'>
            <CardContent className='p-4 text-center'>
              <div className='text-lg font-bold mb-2 text-slate-800'>
                {gameState.roundWinner
                  ? `Team ${gameState.roundWinner} wins ${gameState.roundPoints} points!`
                  : 'No points awarded'}
              </div>
              <Button
                onClick={handleNext}
                className='bg-slate-800 hover:bg-slate-700'
              >
                Next Question
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Answers */}
        {round && gameState.roundStatus === 'active' && (
          <Card className='bg-white border-slate-200 shadow-sm'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg text-slate-800'>Answers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {round.answers.map((answer, index) => {
                  const isRevealed = gameState.revealedAnswers.includes(index)

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
                        ) : (
                          <Button
                            size='sm'
                            onClick={() => handleReveal(index)}
                            className='bg-green-500 hover:bg-green-600 text-white text-xs h-8'
                          >
                            Reveal
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        {gameState.roundStatus === 'active' && !gameState.isStealPhase && (
          <div className='flex flex-wrap gap-2 justify-center'>
            <Button
              onClick={handlePrev}
              variant='outline'
              disabled={gameState.currentRoundIndex === 0}
            >
              Prev
            </Button>
            <Button
              onClick={handleUndo}
              variant='outline'
              disabled={gameState.actionHistory.length === 0}
            >
              Undo
            </Button>
            <Button
              onClick={handleWrong}
              variant='destructive'
              disabled={gameState.strikes >= 3}
            >
              No Answer
            </Button>
            <Button
              onClick={handleEndRound}
              variant='outline'
              className='border-amber-300 text-amber-600 hover:bg-amber-50'
            >
              End Round
            </Button>
            <Button onClick={handleNext} variant='destructive'>
              Skip (Forfeit)
            </Button>
          </div>
        )}

        {/* Steal Controls */}
        {gameState.isStealPhase && (
          <Card className='bg-orange-50 border-orange-200'>
            <CardContent className='p-4 text-center space-y-3'>
              <div className='text-lg font-bold text-orange-800'>
                Team {gameState.activeTeam} is stealing!
              </div>
              <div className='flex gap-2 justify-center'>
                <Button
                  onClick={handleStealSuccess}
                  className='bg-green-500 hover:bg-green-600 text-white'
                >
                  Steal Correct
                </Button>
                <Button onClick={handleStealFail} variant='destructive'>
                  Steal Wrong
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sound Test */}
        <div className='flex gap-2 justify-center pb-4'>
          <Button
            onClick={playCorrectSound}
            variant='outline'
            size='sm'
            className='border-green-200 text-green-600 hover:bg-green-50'
          >
            Correct Sound
          </Button>
          <Button
            onClick={playWrongSound}
            variant='outline'
            size='sm'
            className='border-red-200 text-red-600 hover:bg-red-50'
          >
            Wrong Sound
          </Button>
        </div>
      </div>
    </div>
  )
}
