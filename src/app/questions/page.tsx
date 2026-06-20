'use client'

import { QuestionsAccordion } from '@/components/questions-accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getGameState, onUpdate } from '@/lib/storage'
import { GameState } from '@/types/game'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function QuestionsPage() {
  const [gameState, setGameStateLocal] = useState<GameState | null>(null)

  useEffect(() => {
    const existing = getGameState()
    if (existing) setGameStateLocal(existing)

    return onUpdate(() => {
      const updated = getGameState()
      if (updated) setGameStateLocal(updated)
    })
  }, [])

  if (!gameState) {
    return (
      <div className='min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6'>
        <Card className='max-w-md w-full bg-white border-slate-200 shadow-sm'>
          <CardHeader>
            <CardTitle className='text-slate-800'>No questions loaded</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-slate-600 text-sm'>
              Import a question set from the admin panel first.
            </p>
            <Button
              nativeButton={false}
              render={<Link href='/admin' />}
              className='w-full bg-slate-800 hover:bg-slate-700'
            >
              Go to Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8'>
      <div className='max-w-3xl mx-auto space-y-6'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h1 className='text-2xl md:text-3xl font-bold text-slate-800'>
              Questions &amp; Answers
            </h1>
            <p className='text-slate-500 text-sm mt-1'>
              {gameState.rounds.length} question
              {gameState.rounds.length === 1 ? '' : 's'} imported
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button nativeButton={false} render={<Link href='/admin' />} variant='outline'>
              Admin Panel
            </Button>
            <Button
              nativeButton={false}
              render={<Link href='/game-view' />}
              className='bg-amber-500 hover:bg-amber-600 text-white'
            >
              Game View
            </Button>
          </div>
        </div>

        <QuestionsAccordion
          rounds={gameState.rounds}
          currentRoundIndex={gameState.currentRoundIndex}
        />
      </div>
    </div>
  )
}
