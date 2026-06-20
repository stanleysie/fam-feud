import { Badge } from '@/components/ui/badge'
import { Round } from '@/types/game'
import { ChevronDownIcon } from 'lucide-react'

interface QuestionsAccordionProps {
  rounds: Round[]
  currentRoundIndex?: number
}

export function QuestionsAccordion({
  rounds,
  currentRoundIndex,
}: QuestionsAccordionProps) {
  return (
    <div className='space-y-2'>
      {rounds.map((round, index) => {
        const isCurrent = currentRoundIndex === index

        return (
          <details
            key={index}
            open={isCurrent}
            className={`group rounded-lg border bg-white overflow-hidden ${
              isCurrent ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
            }`}
          >
            <summary className='flex cursor-pointer list-none items-center gap-3 px-4 py-3 hover:bg-slate-50 [&::-webkit-details-marker]:hidden'>
              <ChevronDownIcon className='size-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180' />
              <Badge variant='outline' className='shrink-0 bg-slate-50'>
                Q{index + 1}
              </Badge>
              <span className='flex-1 min-w-0 font-medium text-slate-800 text-left truncate'>
                {round.question}
              </span>
              {isCurrent && (
                <Badge className='shrink-0 bg-amber-500'>Current</Badge>
              )}
              <span className='shrink-0 text-xs text-slate-400'>
                {round.answers.length} answers
              </span>
            </summary>
            <div className='border-t border-slate-100 px-4 py-3 bg-slate-50/50'>
              <ol className='space-y-2'>
                {round.answers.map((answer, answerIndex) => (
                  <li
                    key={answerIndex}
                    className='flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2'
                  >
                    <div className='flex items-center gap-3 min-w-0'>
                      <span className='w-6 text-center text-xs font-bold text-slate-400'>
                        {answerIndex + 1}
                      </span>
                      <span className='font-medium text-slate-800 truncate'>
                        {answer.text}
                      </span>
                    </div>
                    <Badge variant='outline' className='shrink-0 text-amber-600 border-amber-200'>
                      {answer.points} pts
                    </Badge>
                  </li>
                ))}
              </ol>
            </div>
          </details>
        )
      })}
    </div>
  )
}
