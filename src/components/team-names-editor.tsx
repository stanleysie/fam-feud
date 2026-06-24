'use client'

import { Input } from '@/components/ui/input'
import { MAX_TEAM_NAME_LENGTH } from '@/lib/team-names'

type TeamNamesEditorProps = {
  team1Name: string
  team2Name: string
  onChange: (team1Name: string, team2Name: string) => void
  disabled?: boolean
}

export function TeamNamesEditor({
  team1Name,
  team2Name,
  onChange,
  disabled = false,
}: TeamNamesEditorProps) {
  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      <label className='space-y-2'>
        <span className='text-sm font-medium text-slate-800'>Team 1 name</span>
        <Input
          value={team1Name}
          disabled={disabled}
          maxLength={MAX_TEAM_NAME_LENGTH}
          onChange={(e) => onChange(e.target.value, team2Name)}
          placeholder='Team 1'
          className='border-slate-200 bg-white'
        />
      </label>
      <label className='space-y-2'>
        <span className='text-sm font-medium text-slate-800'>Team 2 name</span>
        <Input
          value={team2Name}
          disabled={disabled}
          maxLength={MAX_TEAM_NAME_LENGTH}
          onChange={(e) => onChange(team1Name, e.target.value)}
          placeholder='Team 2'
          className='border-slate-200 bg-white'
        />
      </label>
    </div>
  )
}
