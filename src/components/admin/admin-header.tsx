'use client'

import { FeudTitle } from '@/components/feud-title'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

type AdminHeaderProps = {
  label?: string
  review?: boolean
  actions: React.ReactNode
}

export function AdminHeader({ label = 'Admin panel', review, actions }: AdminHeaderProps) {
  return (
    <Card className='border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-amber-200/60 hover:shadow-md'>
      <CardContent className='flex flex-wrap items-center justify-between gap-3 p-4'>
        <div className='flex min-w-0 items-center gap-3'>
          <FeudTitle />
          <div className='hidden h-6 w-px bg-slate-200 sm:block' />
          <span className='hidden text-sm leading-none text-slate-500 sm:inline'>
            {label}
          </span>
          {review && <Badge className='bg-slate-500'>Reviewing</Badge>}
        </div>
        <div className='flex flex-wrap items-center gap-2'>{actions}</div>
      </CardContent>
    </Card>
  )
}
