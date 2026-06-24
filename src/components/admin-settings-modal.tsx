'use client'

import { TeamNamesEditor } from '@/components/team-names-editor'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { updateTeamNames } from '@/lib/team-names'
import { playCorrectSound, playWrongSound } from '@/lib/sounds'
import { GameState } from '@/types/game'
import { Volume2Icon } from 'lucide-react'

type AdminSettingsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  gameState?: GameState | null
  onUpdateGameState?: (state: GameState) => void
}

export function AdminSettingsModal({
  open,
  onOpenChange,
  gameState,
  onUpdateGameState,
}: AdminSettingsModalProps) {
  const handleTeamNamesChange = (team1Name: string, team2Name: string) => {
    if (!gameState || !onUpdateGameState) return
    onUpdateGameState(updateTeamNames(gameState, team1Name, team2Name))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize teams and test sound effects before you host.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {gameState && onUpdateGameState && (
            <div className='space-y-3'>
              <p className='text-sm font-medium text-slate-800'>Team names</p>
              <TeamNamesEditor
                team1Name={gameState.team1Name}
                team2Name={gameState.team2Name}
                onChange={handleTeamNamesChange}
              />
            </div>
          )}

          <div className='space-y-3'>
            <p className='text-sm font-medium text-slate-800'>Sound check</p>
            <p className='text-sm text-slate-500'>
              Browsers may block audio until you interact with the page. Use these
              buttons to confirm your volume is working.
            </p>
            <div className='flex flex-wrap gap-2'>
              <Button
                type='button'
                onClick={playCorrectSound}
                variant='outline'
                className='border-green-200 text-green-700 hover:bg-green-50'
              >
                <Volume2Icon />
                Play correct sound
              </Button>
              <Button
                type='button'
                onClick={playWrongSound}
                variant='outline'
                className='border-red-200 text-red-700 hover:bg-red-50'
              >
                <Volume2Icon />
                Play wrong sound
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
