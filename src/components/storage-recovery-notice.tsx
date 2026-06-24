'use client'

import { useStorageRecoveryNotice } from '@/hooks/use-storage-recovery-notice'
import { cn } from '@/lib/utils'
import { AlertTriangleIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

type StorageRecoveryNoticeProps = {
  className?: string
}

export function StorageRecoveryNotice({ className }: StorageRecoveryNoticeProps) {
  const { visible, dismiss } = useStorageRecoveryNotice()

  if (!visible) return null

  return (
    <div
      role='alert'
      className={cn(
        'flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm',
        className,
      )}
    >
      <AlertTriangleIcon className='mt-0.5 size-5 shrink-0 text-amber-600' />
      <div className='min-w-0 flex-1 space-y-1'>
        <p className='font-semibold'>Saved game could not be restored</p>
        <p className='text-amber-900/80'>
          The previous game data was invalid or from an unsupported version, so
          it was cleared. Import your questions again to start fresh.
        </p>
      </div>
      <Button
        type='button'
        variant='ghost'
        size='icon-sm'
        onClick={dismiss}
        className='shrink-0 text-amber-700 hover:bg-amber-100 hover:text-amber-900'
        aria-label='Dismiss recovery notice'
      >
        <XIcon className='size-4' />
      </Button>
    </div>
  )
}
