'use client'

import { Button } from '@/components/ui/button'
import { BracesIcon, FileSpreadsheetIcon, PencilIcon } from 'lucide-react'

export type ImportMethod = 'excel' | 'json' | 'build'

type ImportMethodPickerProps = {
  value: ImportMethod
  onChange: (method: ImportMethod) => void
}

const METHODS: {
  id: ImportMethod
  label: string
  icon: typeof FileSpreadsheetIcon
}[] = [
  { id: 'excel', label: 'Excel or Google Sheets', icon: FileSpreadsheetIcon },
  { id: 'json', label: 'JSON file', icon: BracesIcon },
  { id: 'build', label: 'Build here', icon: PencilIcon },
]

export function ImportMethodPicker({ value, onChange }: ImportMethodPickerProps) {
  return (
    <div
      role='tablist'
      aria-label='Import method'
      className='flex gap-2'
    >
      {METHODS.map(({ id, label, icon: Icon }) => {
        const isSelected = value === id
        return (
          <Button
            key={id}
            type='button'
            role='tab'
            aria-selected={isSelected}
            aria-label={label}
            title={label}
            variant={isSelected ? 'default' : 'outline'}
            onClick={() => onChange(id)}
            className={`h-11 w-11 shrink-0 gap-2 px-0 sm:flex-1 sm:w-auto sm:px-4 ${
              isSelected
                ? 'bg-slate-800 hover:bg-slate-700'
                : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
            }`}
          >
            <Icon className='size-5 sm:size-4' />
            <span className='hidden sm:inline'>{label}</span>
          </Button>
        )
      })}
    </div>
  )
}
