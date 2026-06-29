'use client'

type SetupStep = 'add' | 'review' | 'host'

const STEPS: { id: SetupStep; label: string }[] = [
  { id: 'add', label: 'Add questions' },
  { id: 'review', label: 'Review & start' },
  { id: 'host', label: 'Host the game' },
]

type SetupStepIndicatorProps = {
  current: SetupStep
}

function stepIndex(step: SetupStep) {
  return STEPS.findIndex((s) => s.id === step)
}

export function SetupStepIndicator({ current }: SetupStepIndicatorProps) {
  const currentIndex = stepIndex(current)

  return (
    <nav
      aria-label='Setup progress'
      className='hidden justify-center sm:flex'
    >
      <ol className='inline-flex items-center'>
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex
          const isActive = index === currentIndex
          const isUpcoming = index > currentIndex

          return (
            <li key={step.id} className='flex items-center'>
              <div className='flex items-center gap-2'>
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isCompleted
                      ? 'bg-amber-500 text-white'
                      : isActive
                        ? 'bg-slate-800 text-white'
                        : 'border border-slate-200 bg-white text-slate-400'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? '✓' : index + 1}
                </span>
                <span
                  className={`hidden text-sm sm:inline ${
                    isActive
                      ? 'font-medium text-slate-800'
                      : isUpcoming
                        ? 'text-slate-400'
                        : 'text-slate-600'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`mx-3 hidden h-px w-10 sm:block sm:w-16 ${
                    isCompleted ? 'bg-amber-300' : 'bg-slate-200'
                  }`}
                  aria-hidden
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
