'use client'

import { JSON_IMPORT_FORMAT_EXAMPLE } from '@/lib/import-validation'

export function JsonFormatGuide() {
  return (
    <div className='space-y-3'>
      <p className='text-sm text-slate-600'>
        Upload a{' '}
        <code className='rounded bg-slate-100 px-1 py-0.5 text-xs'>.json</code>{' '}
        file in this structure. You can also export a file in this format from
        the review screen after importing once.
      </p>

      <ul className='list-disc space-y-1 pl-5 text-xs text-slate-500'>
        <li>
          The file must have a top-level{' '}
          <code className='rounded bg-slate-100 px-1 py-0.5'>rounds</code> array
        </li>
        <li>
          Each round needs a{' '}
          <code className='rounded bg-slate-100 px-1 py-0.5'>question</code> and
          an{' '}
          <code className='rounded bg-slate-100 px-1 py-0.5'>answers</code> array
        </li>
        <li>
          Each answer needs{' '}
          <code className='rounded bg-slate-100 px-1 py-0.5'>text</code> and{' '}
          <code className='rounded bg-slate-100 px-1 py-0.5'>points</code>{' '}
          (higher points = more popular answer)
        </li>
      </ul>

      <div>
        <p className='mb-1.5 text-xs font-medium text-slate-600'>
          Example format
        </p>
        <pre className='overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-700'>
          {JSON_IMPORT_FORMAT_EXAMPLE}
        </pre>
      </div>
    </div>
  )
}
