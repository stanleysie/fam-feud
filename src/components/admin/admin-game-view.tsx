'use client'

import { AnimateIn } from '@/components/animate-in'
import { AppBackground } from '@/components/app-background'
import { AdminSettingsModal } from '@/components/admin-settings-modal'
import { AdminHeader } from '@/components/admin/admin-header'
import {
  AdminAnswersList,
  AdminControlPanel,
  AdminRoundEndSummary,
  AdminRoundInfo,
  AdminTeamScores,
} from '@/components/admin/admin-game-panels'
import { ResetGameDialog } from '@/components/admin/reset-game-dialog'
import { QuestionsModal } from '@/components/questions-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
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
import { playCorrectSound, playWrongSound } from '@/lib/sounds'
import { GameState } from '@/types/game'
import {
  ListIcon,
  MonitorIcon,
  RotateCcwIcon,
  SettingsIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useState } from 'react'

type AdminGameViewProps = {
  gameState: GameState
  onUpdateState: (state: GameState) => void
  onReset: () => void
}

export function AdminGameView({
  gameState,
  onUpdateState,
  onReset,
}: AdminGameViewProps) {
  const [questionsOpen, setQuestionsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)

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

  const handleReveal = useCallback(
    (answerIndex: number) => {
      if (!isLiveView(gameState)) return
      const isCosmeticReveal = gameState.roundStatus === 'ended'
      const newState = isCosmeticReveal
        ? revealRemainingAnswer(gameState, answerIndex)
        : revealAnswer(gameState, answerIndex)
      if (!isCosmeticReveal) {
        playCorrectSound()
      }
      onUpdateState(newState)
    },
    [gameState, onUpdateState],
  )

  const handleWrong = useCallback(() => {
    const wasStealPhase = gameState.isStealPhase
    const newState = markWrong(gameState)
    if (!wasStealPhase) {
      playWrongSound()
    }
    onUpdateState(newState)
  }, [gameState, onUpdateState])

  const handleReset = useCallback(() => {
    onReset()
    setResetConfirmOpen(false)
  }, [onReset])

  return (
    <AppBackground className='p-4 text-slate-800 md:p-6'>
      <div className='mx-auto w-5/6 min-w-0 space-y-4 pb-4 lg:w-2/3'>
        <AnimateIn className='w-full'>
          <AdminHeader
            review={review}
            actions={
              <>
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
                  onClick={() => setSettingsOpen(true)}
                  variant='outline'
                  className='border-slate-200 transition-all duration-200 hover:scale-105 hover:border-amber-300 active:scale-100'
                >
                  <SettingsIcon />
                  Settings
                </Button>
                <Button
                  onClick={() => setResetConfirmOpen(true)}
                  variant='outline'
                  className='border-red-200 text-red-600 transition-all duration-200 hover:scale-105 hover:bg-red-50 active:scale-100'
                >
                  <RotateCcwIcon />
                  Reset game
                </Button>
              </>
            }
          />
        </AnimateIn>

        <ResetGameDialog
          open={resetConfirmOpen}
          onOpenChange={setResetConfirmOpen}
          onConfirm={handleReset}
        />

        <QuestionsModal
          rounds={gameState.rounds}
          currentRoundIndex={gameState.currentRoundIndex}
          open={questionsOpen}
          onOpenChange={setQuestionsOpen}
        />

        <AdminSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

        <AdminTeamScores
          gameState={gameState}
          displayActiveTeam={displayActiveTeam}
          team1Score={viewState.team1Score}
          team2Score={viewState.team2Score}
          live={live}
          onSwitchTeam={() => onUpdateState(switchActiveTeam(gameState))}
        />

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

        {!round && (
          <AnimateIn className='w-full'>
            <Card className='border-red-200/80 bg-red-50/90 backdrop-blur-sm'>
              <CardContent className='space-y-3 p-4 text-center'>
                <div className='font-medium text-red-800'>
                  Past the last question (Q{gameState.currentRoundIndex + 1}/
                  {gameState.rounds.length})
                </div>
                <Button
                  onClick={() => onUpdateState(goToLastRound(gameState))}
                  variant='outline'
                >
                  Go to last question
                </Button>
              </CardContent>
            </Card>
          </AnimateIn>
        )}

        <AdminRoundInfo
          gameState={gameState}
          round={round}
          viewState={viewState}
          review={review}
        />

        {live && gameState.roundStatus === 'ended' && (
          <AdminRoundEndSummary
            gameState={gameState}
            hasUnrevealedAnswers={!!hasUnrevealedAnswers}
            canGoNext={canGoNext}
            onNextQuestion={() => onUpdateState(nextRound(gameState))}
          />
        )}

        {showAnswers && round && (
          <AdminAnswersList
            gameState={gameState}
            round={round}
            viewState={viewState}
            review={review}
            live={live}
            onReveal={handleReveal}
          />
        )}

        <AdminControlPanel
          gameState={gameState}
          live={live}
          canUndo={canUndo}
          canGoNext={canGoNext}
          onPrev={() => onUpdateState(prevRoundView(gameState))}
          onNextView={() => onUpdateState(nextRoundView(gameState))}
          onUndo={() => onUpdateState(undoAction(gameState))}
          onWrong={handleWrong}
          onSkipQuestion={() => onUpdateState(nextRound(gameState))}
        />
      </div>
    </AppBackground>
  )
}
