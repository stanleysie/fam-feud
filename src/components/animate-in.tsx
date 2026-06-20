import { cn } from '@/lib/utils'

type AnimateInProps = {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimateIn({ children, className, delay = 0 }: AnimateInProps) {
  return (
    <div
      className={cn('animate-landing-fade-up', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
