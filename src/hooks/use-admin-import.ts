'use client'

import { isExcelFile, isJsonFile, parseExcelBuffer } from '@/lib/excel-questions'
import { parseQuestionsJson, SAMPLE_IMPORT_DATA } from '@/lib/import-validation'
import { createInitialState, GameState, Round } from '@/types/game'
import { useCallback, useRef, useState } from 'react'

type FileKind = 'excel' | 'json'

type UseAdminImportOptions = {
  onImport: (rounds: Round[]) => void
}

export function useAdminImport({ onImport }: UseAdminImportOptions) {
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState<FileKind | null>(null)
  const excelFileInputRef = useRef<HTMLInputElement>(null)
  const jsonFileInputRef = useRef<HTMLInputElement>(null)

  const completeImport = useCallback(
    (rounds: Round[]) => {
      onImport(rounds)
    },
    [onImport],
  )

  const handleExcelFileImport = useCallback(
    (file: File) => {
      if (!isExcelFile(file)) {
        setError('Please upload an Excel (.xlsx) file.')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const buffer = e.target?.result
        if (!(buffer instanceof ArrayBuffer)) {
          setError('Could not read the Excel file.')
          return
        }

        const result = parseExcelBuffer(buffer)
        if ('error' in result) {
          setError(result.error)
          return
        }

        setError('')
        completeImport(result.rounds)
      }
      reader.readAsArrayBuffer(file)
    },
    [completeImport],
  )

  const handleJsonFileImport = useCallback(
    (file: File) => {
      if (!isJsonFile(file)) {
        setError('Please upload a JSON (.json) file.')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result
        if (typeof content !== 'string') {
          setError('Could not read the JSON file.')
          return
        }

        const result = parseQuestionsJson(content)
        if ('error' in result) {
          setError(result.error)
          return
        }

        setError('')
        completeImport(result.rounds)
      }
      reader.readAsText(file)
    },
    [completeImport],
  )

  const handleDrop = useCallback(
    (kind: FileKind) => (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(null)
      const file = e.dataTransfer.files[0]
      if (!file) return

      if (kind === 'excel') {
        handleExcelFileImport(file)
        return
      }

      handleJsonFileImport(file)
    },
    [handleExcelFileImport, handleJsonFileImport],
  )

  const handleDragOver = useCallback(
    (kind: FileKind) => (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(kind)
    },
    [],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(null)
  }, [])

  const handleTrySample = useCallback(() => {
    setError('')
    completeImport(SAMPLE_IMPORT_DATA.rounds)
  }, [completeImport])

  const handleBuilderSubmit = useCallback(
    (rounds: Round[]) => {
      setError('')
      completeImport(rounds)
    },
    [completeImport],
  )

  const clearError = useCallback(() => setError(''), [])

  return {
    error,
    clearError,
    dragActive,
    excelFileInputRef,
    jsonFileInputRef,
    handleExcelFileImport,
    handleJsonFileImport,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleTrySample,
    handleBuilderSubmit,
  }
}

export function createImportedGameState(rounds: Round[]): GameState {
  return createInitialState(rounds)
}
