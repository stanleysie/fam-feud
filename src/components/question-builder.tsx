'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { validateImportData } from '@/lib/import-validation'
import { Round } from '@/types/game'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'

type DraftAnswer = {
  text: string
  points: string
}

type DraftRound = {
  question: string
  answers: DraftAnswer[]
}

function createEmptyRound(): DraftRound {
  return {
    question: '',
    answers: [
      { text: '', points: '30' },
      { text: '', points: '20' },
    ],
  }
}

type QuestionBuilderProps = {
  onSubmit: (rounds: Round[]) => void
}

export function QuestionBuilder({ onSubmit }: QuestionBuilderProps) {
  const [rounds, setRounds] = useState<DraftRound[]>([createEmptyRound()])
  const [error, setError] = useState('')

  const updateRound = (roundIndex: number, patch: Partial<DraftRound>) => {
    setRounds((prev) =>
      prev.map((round, index) =>
        index === roundIndex ? { ...round, ...patch } : round,
      ),
    )
  }

  const updateAnswer = (
    roundIndex: number,
    answerIndex: number,
    patch: Partial<DraftAnswer>,
  ) => {
    setRounds((prev) =>
      prev.map((round, index) => {
        if (index !== roundIndex) return round
        return {
          ...round,
          answers: round.answers.map((answer, i) =>
            i === answerIndex ? { ...answer, ...patch } : answer,
          ),
        }
      }),
    )
  }

  const addAnswer = (roundIndex: number) => {
    setRounds((prev) =>
      prev.map((round, index) =>
        index === roundIndex
          ? {
              ...round,
              answers: [...round.answers, { text: '', points: '10' }],
            }
          : round,
      ),
    )
  }

  const removeAnswer = (roundIndex: number, answerIndex: number) => {
    setRounds((prev) =>
      prev.map((round, index) => {
        if (index !== roundIndex || round.answers.length <= 1) return round
        return {
          ...round,
          answers: round.answers.filter((_, i) => i !== answerIndex),
        }
      }),
    )
  }

  const addRound = () => {
    setRounds((prev) => [...prev, createEmptyRound()])
  }

  const removeRound = (roundIndex: number) => {
    setRounds((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, index) => index !== roundIndex),
    )
  }

  const handleSubmit = () => {
    const parsed: Round[] = rounds.map((round) => ({
      question: round.question.trim(),
      answers: round.answers.map((answer) => ({
        text: answer.text.trim(),
        points: Number(answer.points),
      })),
    }))

    const validationError = validateImportData({ rounds: parsed })
    if (validationError) {
      setError(validationError)
      return
    }

    for (const round of parsed) {
      if (round.answers.some((answer) => Number.isNaN(answer.points))) {
        setError('Each answer needs a valid point value.')
        return
      }
    }

    setError('')
    onSubmit(parsed)
  }

  return (
    <div className='space-y-4'>
      {rounds.map((round, roundIndex) => (
        <div
          key={roundIndex}
          className='space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4'
        >
          <div className='flex items-start justify-between gap-3'>
            <div className='min-w-0 flex-1 space-y-2'>
              <label className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
                Question {roundIndex + 1}
              </label>
              <Textarea
                value={round.question}
                onChange={(e) =>
                  updateRound(roundIndex, { question: e.target.value })
                }
                placeholder='e.g. Name something you bring to the beach'
                className='min-h-[72px] border-slate-200 bg-white focus-visible:border-amber-400 focus-visible:ring-amber-400/20'
              />
            </div>
            {rounds.length > 1 && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => removeRound(roundIndex)}
                className='shrink-0 border-red-200 text-red-600 hover:bg-red-50'
              >
                <Trash2Icon />
                Remove
              </Button>
            )}
          </div>

          <div className='space-y-2'>
            <label className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
              Answers
            </label>
            {round.answers.map((answer, answerIndex) => (
              <div key={answerIndex} className='flex gap-2'>
                <span className='flex h-8 w-7 shrink-0 items-center justify-center text-xs font-bold text-slate-400'>
                  {answerIndex + 1}
                </span>
                <Input
                  value={answer.text}
                  onChange={(e) =>
                    updateAnswer(roundIndex, answerIndex, {
                      text: e.target.value,
                    })
                  }
                  placeholder='Answer text'
                  className='h-9 flex-1 border-slate-200 bg-white'
                />
                <Input
                  type='number'
                  min={1}
                  value={answer.points}
                  onChange={(e) =>
                    updateAnswer(roundIndex, answerIndex, {
                      points: e.target.value,
                    })
                  }
                  placeholder='Pts'
                  className='h-9 w-20 border-slate-200 bg-white'
                />
                <Button
                  type='button'
                  variant='outline'
                  size='icon-sm'
                  onClick={() => removeAnswer(roundIndex, answerIndex)}
                  disabled={round.answers.length <= 1}
                  className='shrink-0 border-slate-200 text-slate-500'
                  aria-label='Remove answer'
                >
                  <Trash2Icon className='size-4' />
                </Button>
              </div>
            ))}
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => addAnswer(roundIndex)}
              className='border-slate-200'
            >
              <PlusIcon />
              Add answer
            </Button>
          </div>
        </div>
      ))}

      <div className='flex flex-wrap gap-2'>
        <Button
          type='button'
          variant='outline'
          onClick={addRound}
          className='border-slate-200'
        >
          <PlusIcon />
          Add question
        </Button>
        <Button
          type='button'
          onClick={handleSubmit}
          className='bg-slate-800 hover:bg-slate-700'
        >
          Create &amp; review
        </Button>
      </div>

      {error && (
        <p className='rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600'>
          {error}
        </p>
      )}
    </div>
  )
}
