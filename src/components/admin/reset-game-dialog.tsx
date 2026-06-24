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

type ResetGameDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ResetGameDialog({
  open,
  onOpenChange,
  onConfirm,
}: ResetGameDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Reset game?</DialogTitle>
          <DialogDescription>
            This clears all scores, progress, and saved game state. You will need
            to import questions again to start a new game.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className='bg-red-500 hover:bg-red-600 text-white'>
            Reset game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
