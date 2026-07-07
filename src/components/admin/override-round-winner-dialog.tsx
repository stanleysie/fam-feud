'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getTeamName } from '@/lib/team-names'
import { GameState } from '@/types/game'

type OverrideRoundWinnerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  gameState: GameState
  roundIndex: number
  roundPoints: number
  currentWinner: 1 | 2
  onConfirm: (newWinner: 1 | 2) => void
}

export function OverrideRoundWinnerDialog({
  open,
  onOpenChange,
  gameState,
  roundIndex,
  roundPoints,
  currentWinner,
  onConfirm,
}: OverrideRoundWinnerDialogProps) {
  const otherTeam = currentWinner === 1 ? 2 : 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Change round winner?</DialogTitle>
          <DialogDescription>
            Question {roundIndex + 1}: {roundPoints} points were awarded to{' '}
            {getTeamName(gameState, currentWinner)}. Reassign them to{' '}
            {getTeamName(gameState, otherTeam)} instead? Total scores will be
            recalculated.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='flex-col gap-2 sm:flex-col'>
          <Button
            onClick={() => onConfirm(otherTeam)}
            className='w-full bg-slate-800 hover:bg-slate-700'
          >
            Award to {getTeamName(gameState, otherTeam)}
          </Button>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='w-full'
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
