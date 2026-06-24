'use client'

import { Button } from '@/components/ui/button'
import {
  downloadExcelTemplate,
  downloadQuestionsExcel,
} from '@/lib/excel-questions'
import { downloadQuestionsJson } from '@/lib/export-questions'
import { Round } from '@/types/game'
import { DownloadIcon, FileSpreadsheetIcon, FileTextIcon } from 'lucide-react'

type ExportQuestionsButtonsProps = {
  rounds: Round[]
  className?: string
}

export function ExportQuestionsButtons({
  rounds,
  className,
}: ExportQuestionsButtonsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ''}`}>
      <Button
        type='button'
        variant='outline'
        onClick={() => downloadQuestionsExcel(rounds)}
      >
        <FileSpreadsheetIcon />
        Export Excel
      </Button>
      <Button
        type='button'
        variant='outline'
        onClick={() => downloadQuestionsJson(rounds)}
      >
        <FileTextIcon />
        Export JSON
      </Button>
    </div>
  )
}

type DownloadExcelTemplateButtonProps = {
  className?: string
}

export function DownloadExcelTemplateButton({
  className,
}: DownloadExcelTemplateButtonProps) {
  return (
    <Button
      type='button'
      variant='outline'
      className={className}
      onClick={() => downloadExcelTemplate()}
    >
      <DownloadIcon />
      Download Excel template
    </Button>
  )
}

// Backwards-compatible alias for older imports.
export const ExportQuestionsButton = ExportQuestionsButtons
