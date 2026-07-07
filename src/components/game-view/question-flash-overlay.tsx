'use client'

type QuestionFlashOverlayProps = {
  question: string
  roundNumber: number
  totalRounds: number
}

export function QuestionFlashOverlay({
  question,
  roundNumber,
  totalRounds,
}: QuestionFlashOverlayProps) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/85 p-8 backdrop-blur-sm animate-question-flash-in'>
      <div className='mx-auto max-w-5xl space-y-6 text-center'>
        <div className='text-sm font-semibold uppercase tracking-[0.3em] text-amber-400/90'>
          Question {roundNumber} of {totalRounds}
        </div>
        <h2 className='animate-landing-fade-up text-4xl font-bold leading-tight text-white md:text-6xl'>
          {question}
        </h2>
      </div>
    </div>
  )
}
