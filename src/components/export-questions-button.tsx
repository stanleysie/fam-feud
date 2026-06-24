'use client'

import { Button } from '@/components/ui/button'
import { downloadQuestionsJson } from '@/lib/export-questions'
import { Round } from '@/types/game'
import { DownloadIcon } from 'lucide-react'

type ExportQuestionsButtonProps = {
  rounds: Round[]
  filename?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  className?: string
  showLabel?: boolean
}

export function ExportQuestionsButton({
  rounds,
  filename,
  variant = 'outline',
  className,
  showLabel = true,
}: ExportQuestionsButtonProps) {
  return (
    <Button
      type='button'
      variant={variant}
      className={className}
      onClick={() => downloadQuestionsJson(rounds, filename)}
    >
      <DownloadIcon />
      {showLabel ? 'Export questions' : null}
    </Button>
  )
}
