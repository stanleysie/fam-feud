import { cn } from '@/lib/utils'

type FeudTitleProps = {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function FeudTitle({ className, size = 'md' }: FeudTitleProps) {
  return (
    <h1
      className={cn(
        'font-bold leading-none tracking-tight',
        size === 'sm' && 'text-xl sm:text-2xl',
        size === 'md' && 'text-xl sm:text-2xl',
        size === 'lg' && 'text-3xl sm:text-4xl',
        className,
      )}
    >
      <span className='inline-block text-slate-800 transition-transform duration-300 hover:scale-105 hover:-rotate-1'>
        FAM
      </span>{' '}
      <span className='inline-block text-amber-500 transition-transform duration-300 hover:scale-110 hover:rotate-1 drop-shadow-sm'>
        FEUD
      </span>
    </h1>
  )
}
