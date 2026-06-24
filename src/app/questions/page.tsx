'use client'

import { AppBackground } from '@/components/app-background'
import { QuestionsAccordion } from '@/components/questions-accordion'
import { ExportQuestionsButtons } from '@/components/export-questions-button'
import { StorageRecoveryNotice } from '@/components/storage-recovery-notice'
import { TeamNamesEditor } from '@/components/team-names-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGameStateSync } from '@/hooks/use-game-state-sync'
import { startGame } from '@/lib/game-engine'
import { updateTeamNames } from '@/lib/team-names'
import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function QuestionsPage() {
  const router = useRouter()
  const { gameState, setGameState, isReady } = useGameStateSync()

  const handleStartGame = () => {
    if (!gameState) return
    setGameState(startGame(gameState))
    router.push('/admin')
  }

  if (!isReady) {
    return (
      <AppBackground variant='subtle'>
        <div className='flex-1' />
      </AppBackground>
    )
  }

  if (!gameState) {
    return (
      <AppBackground variant='subtle' className='text-slate-800'>
        <div className='flex flex-1 items-center justify-center p-6'>
          <div className='w-full max-w-md space-y-4'>
            <StorageRecoveryNotice />
            <Card className='w-full bg-white border-slate-200 shadow-sm'>
              <CardHeader>
                <CardTitle className='text-slate-800'>
                  No questions loaded
                </CardTitle>
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
        </div>
      </AppBackground>
    )
  }

  return (
    <AppBackground variant='subtle' className='text-slate-800'>
      <div className='p-4 md:p-8'>
        <div className='mx-auto w-5/6 lg:w-2/3 space-y-6'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold text-slate-800'>
                Questions &amp; Answers
              </h1>
              <p className='text-slate-500 text-sm mt-1'>
                {gameState.rounds.length} question
                {gameState.rounds.length === 1 ? '' : 's'} imported — review
                below, then start when you are ready.
              </p>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <ExportQuestionsButtons
                rounds={gameState.rounds}
                className='[&_button]:border-slate-200 [&_button]:bg-white/80'
              />
              <Button
                nativeButton={false}
                render={
                  <Link href='/game-view' target='_blank' rel='noopener noreferrer' />
                }
                variant='outline'
                className='border-slate-200 bg-white/80'
              >
                Open Game View
              </Button>
            </div>
          </div>

          <QuestionsAccordion
            rounds={gameState.rounds}
            currentRoundIndex={gameState.currentRoundIndex}
          />

          <Card className='border-slate-200 bg-white shadow-sm'>
            <CardHeader>
              <CardTitle className='text-slate-800'>Team names</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamNamesEditor
                team1Name={gameState.team1Name}
                team2Name={gameState.team2Name}
                onChange={(team1Name, team2Name) =>
                  setGameState(updateTeamNames(gameState, team1Name, team2Name))
                }
              />
            </CardContent>
          </Card>

          <div className='flex justify-center pt-2 pb-6'>
            <Button
              onClick={handleStartGame}
              className='h-12 gap-2 bg-slate-800 px-8 text-base hover:bg-slate-700'
            >
              Start Game
              <ArrowRightIcon className='size-5' />
            </Button>
          </div>
        </div>
      </div>
    </AppBackground>
  )
}
