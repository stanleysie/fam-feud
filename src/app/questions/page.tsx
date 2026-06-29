'use client'

import { AppBackground } from '@/components/app-background'
import { QuestionsAccordion } from '@/components/questions-accordion'
import { ExportQuestionsButtons } from '@/components/export-questions-button'
import { SetupStepIndicator } from '@/components/setup-step-indicator'
import { StorageRecoveryNotice } from '@/components/storage-recovery-notice'
import { TeamNamesEditor } from '@/components/team-names-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGameStateSync } from '@/hooks/use-game-state-sync'
import { startGame } from '@/lib/game-engine'
import { updateTeamNames } from '@/lib/team-names'
import { ArrowRightIcon, MonitorIcon } from 'lucide-react'
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
                  Add your questions from the setup page first.
                </p>
                <Button
                  nativeButton={false}
                  render={<Link href='/admin' />}
                  className='w-full bg-slate-800 hover:bg-slate-700'
                >
                  Go to setup
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppBackground>
    )
  }

  return (
    <AppBackground variant='subtle' className='flex flex-col text-slate-800'>
      <div className='flex-1 p-4 pb-36 md:p-8 md:pb-32'>
        <div className='mx-auto w-11/12 space-y-6 lg:w-2/3'>
          <SetupStepIndicator current='review' />

          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold text-slate-800'>
                Questions &amp; Answers
              </h1>
              <p className='text-slate-500 text-sm mt-1'>
                {gameState.rounds.length} question
                {gameState.rounds.length === 1 ? '' : 's'} imported — review
                your questions, set team names, then start the game.
              </p>
            </div>
            <ExportQuestionsButtons
              rounds={gameState.rounds}
              className='[&_button]:border-slate-200 [&_button]:bg-white/80'
            />
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
        </div>
      </div>

      <div className='fixed bottom-0 left-0 right-0 z-10 border-t border-slate-200/80 bg-white/95 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] backdrop-blur-sm'>
        <div className='mx-auto w-11/12 space-y-2 lg:w-2/3'>
          <div className='flex flex-col gap-2 sm:flex-row'>
            <Button
              nativeButton={false}
              render={
                <Link href='/game-view' target='_blank' rel='noopener noreferrer' />
              }
              variant='outline'
              className='h-11 border-slate-200 sm:min-w-[10rem]'
            >
              <MonitorIcon />
              Open Game View
            </Button>
            <Button
              onClick={handleStartGame}
              className='h-11 flex-1 gap-2 bg-slate-800 text-base hover:bg-slate-700'
            >
              Start Game
              <ArrowRightIcon className='size-5' />
            </Button>
          </div>
          <p className='text-center text-xs text-slate-400'>
            Open Game View on your TV or projector, then start the game to
            control the board from here.
          </p>
        </div>
      </div>
    </AppBackground>
  )
}
