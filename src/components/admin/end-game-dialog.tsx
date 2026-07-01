'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type EndGameDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function EndGameDialog({
  open,
  onOpenChange,
  onConfirm,
}: EndGameDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>End game?</DialogTitle>
          <DialogDescription>
            This ends the game now and skips any remaining questions. Scores are
            kept as they are — the only thing left to do is reveal the final
            scores. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className='bg-amber-500 hover:bg-amber-600 text-white'
          >
            End game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
