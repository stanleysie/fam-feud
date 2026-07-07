'use client'

import { AnimateIn } from '@/components/animate-in'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  canGoNextView,
  canGoPrevView,
} from '@/lib/game-engine'
import { getTeamName } from '@/lib/team-names'
import { GameState, Round } from '@/types/game'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FlagIcon,
  MonitorIcon,
  RotateCcwIcon,
  SkipForwardIcon,
  XIcon,
} from 'lucide-react'

type AdminTeamScoresProps = {
  gameState: GameState
  displayActiveTeam: 1 | 2
  team1Score: number
  team2Score: number
  live: boolean
  onSwitchTeam: () => void
}

export function AdminTeamScores({
  gameState,
  displayActiveTeam,
  team1Score,
  team2Score,
  live,
  onSwitchTeam,
}: AdminTeamScoresProps) {
  const disabled = !live || gameState.roundStatus === 'ended'

  return (
    <AnimateIn delay={60} className='w-full'>
      <div className='grid grid-cols-2 gap-3'>
        {([1, 2] as const).map((team) => {
          const active = displayActiveTeam === team
          const score = team === 1 ? team1Score : team2Score
          const name = getTeamName(gameState, team)

          return (
            <button
              key={team}
              onClick={onSwitchTeam}
              disabled={disabled}
              className={`rounded-xl border-2 p-4 text-center transition-all duration-300 ${
                active
                  ? 'scale-[1.02] border-blue-600 bg-blue-500 text-white shadow-md shadow-blue-200/50'
                  : 'border-slate-200/80 bg-white/90 backdrop-blur-sm hover:scale-[1.02] hover:border-slate-300 hover:shadow-md'
              } ${disabled ? 'cursor-default opacity-80' : 'active:scale-[0.98]'}`}
            >
              <div
                className={`mb-1 text-xs font-semibold tracking-wider uppercase ${active ? 'text-blue-100' : 'text-slate-400'}`}
              >
                {name}
              </div>
              <div
                className={`text-3xl font-bold ${active ? 'text-white' : 'text-slate-800'}`}
              >
                {score}
              </div>
            </button>
          )
        })}
      </div>
    </AnimateIn>
  )
}

type AdminRoundInfoProps = {
  gameState: GameState
  round: Round | null
  viewState: GameState
  review: boolean
  live: boolean
  questionFlashVisible: boolean
  onShowQuestion?: () => void
  onHideQuestion?: () => void
}

export function AdminRoundInfo({
  gameState,
  round,
  viewState,
  review,
  live,
  questionFlashVisible,
  onShowQuestion,
  onHideQuestion,
}: AdminRoundInfoProps) {
  return (
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
              {live && round && questionFlashVisible && onHideQuestion && (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={onHideQuestion}
                  className='shrink-0 border-slate-200'
                >
                  <MonitorIcon />
                  Hide from display
                </Button>
              )}
              {live && round && !questionFlashVisible && onShowQuestion && (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={onShowQuestion}
                  className='shrink-0 border-slate-200'
                >
                  <MonitorIcon />
                  Show on display
                </Button>
              )}
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
                    STEAL - {getTeamName(gameState, viewState.activeTeam)}
                  </Badge>
                ) : viewState.roundStatus === 'ended' ? (
                  <Badge className='bg-green-500 px-2.5 py-1 text-sm font-semibold'>
                    ENDED
                  </Badge>
                ) : review ? (
                  <Badge variant='outline' className='px-2.5 py-1 text-sm font-semibold'>
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
  )
}

type AdminRoundEndSummaryProps = {
  gameState: GameState
  hasUnrevealedAnswers: boolean
  canGoNext: boolean
  finalScoresRevealed: boolean
  onNextQuestion: () => void
  onRevealFinalScores: () => void
  onChangeWinner?: () => void
}

export function AdminRoundEndSummary({
  gameState,
  hasUnrevealedAnswers,
  canGoNext,
  finalScoresRevealed,
  onNextQuestion,
  onRevealFinalScores,
  onChangeWinner,
}: AdminRoundEndSummaryProps) {
  const canChangeWinner =
    onChangeWinner &&
    gameState.roundWinner !== null &&
    gameState.roundPoints > 0

  return (
    <AnimateIn delay={120} className='w-full'>
      <Card className='border-amber-200/80 bg-amber-50/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md'>
        <CardContent className='p-4 text-center'>
          <div className='mb-2 text-lg font-bold text-slate-800'>
            {gameState.roundWinner
              ? `${getTeamName(gameState, gameState.roundWinner)} wins ${gameState.roundPoints} points!`
              : 'No points awarded'}
          </div>
          {hasUnrevealedAnswers && (
            <p className='mb-3 text-sm text-slate-600'>
              Reveal remaining answers below before moving on (no extra points).
            </p>
          )}
          <div className='flex flex-col items-center gap-2'>
            {canGoNext ? (
              <Button onClick={onNextQuestion} className='bg-slate-800 hover:bg-slate-700'>
                Next Question
              </Button>
            ) : finalScoresRevealed ? (
              <div className='space-y-1 font-medium text-slate-600'>
                <p className='text-sm font-semibold tracking-wider text-slate-400 uppercase'>
                  Final scores
                </p>
                <p>
                  {getTeamName(gameState, 1)}: {gameState.team1Score} ·{' '}
                  {getTeamName(gameState, 2)}: {gameState.team2Score}
                </p>
              </div>
            ) : (
              <Button
                onClick={onRevealFinalScores}
                className='bg-amber-500 hover:bg-amber-600'
              >
                Reveal Final Scores
              </Button>
            )}
            {canChangeWinner && (
              <Button variant='outline' onClick={onChangeWinner}>
                Change winner
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </AnimateIn>
  )
}

type AdminAnswersListProps = {
  gameState: GameState
  round: Round
  viewState: GameState
  review: boolean
  live: boolean
  onReveal: (answerIndex: number) => void
}

export function AdminAnswersList({
  gameState,
  round,
  viewState,
  review,
  live,
  onReveal,
}: AdminAnswersListProps) {
  return (
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
                  <div className='w-7 text-center text-sm font-bold text-slate-400'>
                    {index + 1}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='truncate font-medium text-slate-800'>
                      {answer.text}
                    </div>
                    <div className='text-sm text-slate-500'>{answer.points} pts</div>
                  </div>
                  <div className='flex shrink-0 items-center gap-2'>
                    {isRevealed ? (
                      <Badge className='bg-green-500'>Revealed</Badge>
                    ) : review ? (
                      <Badge variant='outline'>Hidden</Badge>
                    ) : canReveal ? (
                      <Button
                        size='sm'
                        onClick={() => onReveal(index)}
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
  )
}

type AdminControlPanelProps = {
  gameState: GameState
  live: boolean
  canUndo: boolean
  canGoNext: boolean
  onPrev: () => void
  onNextView: () => void
  onUndo: () => void
  onWrong: () => void
  onSkipQuestion: () => void
  onEndGame: () => void
}

export function AdminControlPanel({
  gameState,
  live,
  canUndo,
  canGoNext,
  onPrev,
  onNextView,
  onUndo,
  onWrong,
  onSkipQuestion,
  onEndGame,
}: AdminControlPanelProps) {
  return (
    <AnimateIn delay={160} className='w-full'>
      <Card className='border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md'>
        <CardContent className='space-y-4 p-4'>
          {live && gameState.roundStatus === 'active' && (
            <div className='space-y-2'>
              <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
                Round actions
              </p>
              <div className='flex flex-wrap gap-2'>
                <Button
                  onClick={onUndo}
                  variant='outline'
                  disabled={!canUndo}
                  className='border-slate-200'
                >
                  <RotateCcwIcon />
                  Undo
                </Button>
                <Button
                  onClick={onWrong}
                  disabled={!gameState.isStealPhase && gameState.strikes >= 3}
                  className='min-w-[9rem] bg-red-500 text-white hover:bg-red-600'
                >
                  <XIcon />
                  {gameState.isStealPhase ? 'Steal failed' : 'Wrong answer'}
                </Button>
                <Button
                  onClick={onSkipQuestion}
                  variant='outline'
                  disabled={!canGoNext}
                  className='min-w-[9rem] border-amber-300 text-amber-700 hover:bg-amber-50'
                >
                  <SkipForwardIcon />
                  Skip question
                </Button>
                <Button
                  onClick={onEndGame}
                  variant='outline'
                  className='min-w-[9rem] border-red-300 text-red-700 hover:bg-red-50'
                >
                  <FlagIcon />
                  End game
                </Button>
              </div>
              <p className='text-xs text-slate-500'>
                {gameState.isStealPhase
                  ? 'Reveal an answer if the steal is correct, or press Wrong answer if it is not.'
                  : 'Press Wrong answer when the active team misses. Undo reverses the last action.'}
              </p>
              <p className='text-xs text-slate-500'>
                End game finishes now and skips remaining questions — jump
                straight to the final scores.
              </p>
            </div>
          )}

          {live && gameState.roundStatus === 'active' && (
            <div className='border-t border-slate-100' />
          )}

          <div className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
              Review questions
            </p>
            <div className='flex flex-wrap gap-2'>
              <Button
                onClick={onPrev}
                variant='outline'
                disabled={!canGoPrevView(gameState)}
                className='min-w-[8.5rem] border-slate-200'
              >
                <ChevronLeftIcon />
                Previous
              </Button>
              <Button
                onClick={onNextView}
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
        </CardContent>
      </Card>
    </AnimateIn>
  )
}
