'use client'

import { QuestionsAccordion } from '@/components/questions-accordion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Round } from '@/types/game'

interface QuestionsModalProps {
  rounds: Round[]
  currentRoundIndex?: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuestionsModal({
  rounds,
  currentRoundIndex,
  open,
  onOpenChange,
}: QuestionsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[85vh] w-full flex-col overflow-hidden sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Questions &amp; Answers</DialogTitle>
          <DialogDescription>
            {rounds.length} question{rounds.length === 1 ? '' : 's'} loaded
          </DialogDescription>
        </DialogHeader>
        <div className='min-h-0 flex-1 overflow-y-auto pr-1'>
          <QuestionsAccordion
            rounds={rounds}
            currentRoundIndex={currentRoundIndex}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
