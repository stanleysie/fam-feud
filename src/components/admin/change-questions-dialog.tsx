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

type ChangeQuestionsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ChangeQuestionsDialog({
  open,
  onOpenChange,
  onConfirm,
}: ChangeQuestionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Change questions?</DialogTitle>
          <DialogDescription>
            You&apos;ll go back to setup to upload a new file or build a
            different question set. Your current questions will be replaced when
            you import again.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className='bg-slate-800 hover:bg-slate-700'>
            Go to setup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
