'use client'

import { Button } from '@/components/ui/button'
import { ArrowRightIcon, SparklesIcon } from 'lucide-react'

type TrySampleBannerProps = {
  onTrySample: () => void
}

export function TrySampleBanner({ onTrySample }: TrySampleBannerProps) {
  return (
    <div className='flex flex-col gap-4 rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex gap-3'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600'>
          <SparklesIcon className='size-5' />
        </div>
        <div className='space-y-1'>
          <p className='text-sm font-medium text-slate-800'>
            Just want to see how it works?
          </p>
          <p className='text-sm text-slate-600'>
            Load 3 ready-made questions and jump to the review screen — no
            setup needed.
          </p>
        </div>
      </div>
      <Button
        onClick={onTrySample}
        className='shrink-0 gap-2 bg-slate-800 hover:bg-slate-700'
      >
        Try sample questions
        <ArrowRightIcon className='size-4' />
      </Button>
    </div>
  )
}
