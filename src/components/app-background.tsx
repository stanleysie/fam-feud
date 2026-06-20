import { cn } from '@/lib/utils'

export const FLOATING_CHIPS = [
  {
    label: '100',
    className: 'top-[12%] left-[6%] text-amber-500/20',
    delay: '0s',
  },
  {
    label: '✗',
    className: 'top-[18%] right-[10%] text-red-400/15',
    delay: '1s',
  },
  {
    label: '50',
    className: 'bottom-[22%] left-[12%] text-amber-500/15',
    delay: '2s',
  },
  {
    label: '30',
    className: 'bottom-[15%] right-[8%] text-amber-500/20',
    delay: '0.5s',
  },
  {
    label: '✗',
    className: 'top-[42%] left-[4%] text-red-400/10',
    delay: '1.5s',
  },
  {
    label: '75',
    className: 'top-[58%] right-[5%] text-amber-500/15',
    delay: '2.5s',
  },
] as const

type AppBackgroundProps = {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'subtle'
}

export function AppBackground({
  children,
  className,
  variant = 'default',
}: AppBackgroundProps) {
  const subtle = variant === 'subtle'

  return (
    <div
      className={cn(
        'relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-amber-50/40',
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 animate-landing-glow',
          subtle && 'opacity-60',
        )}
        aria-hidden
      >
        <div className='absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl' />
        <div className='absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-slate-400/10 blur-3xl' />
      </div>

      {FLOATING_CHIPS.map((chip) => (
        <span
          key={chip.label + chip.className}
          aria-hidden
          className={cn(
            'pointer-events-none absolute select-none font-black animate-landing-float',
            subtle ? 'text-4xl md:text-5xl opacity-50' : 'text-5xl md:text-7xl',
            chip.className,
          )}
          style={{ animationDelay: chip.delay }}
        >
          {chip.label}
        </span>
      ))}

      <div className='relative z-10 flex w-full flex-1 flex-col'>{children}</div>
    </div>
  )
}
