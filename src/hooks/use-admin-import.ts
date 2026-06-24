'use client'

import { SAMPLE_IMPORT_DATA, validateImportData } from '@/lib/import-validation'
import {
  isExcelFile,
  isJsonFile,
  parseExcelBuffer,
} from '@/lib/excel-questions'
import { createInitialState, GameState, ImportData, Round } from '@/types/game'
import { useCallback, useEffect, useRef, useState } from 'react'

type UseAdminImportOptions = {
  gameState: GameState | null
  onImport: (rounds: Round[]) => void
}

export function useAdminImport({ gameState, onImport }: UseAdminImportOptions) {
  const [jsonInput, setJsonInput] = useState('')
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [importHover, setImportHover] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateAndImport = useCallback((data: ImportData) => {
    const validationError = validateImportData(data)
    if (validationError) {
      setError(validationError)
      return false
    }
    setError('')
    return true
  }, [])

  const completeImport = useCallback(
    (rounds: Round[]) => {
      onImport(rounds)
      setJsonInput('')
    },
    [onImport],
  )

  const handleImport = useCallback(() => {
    try {
      const data: ImportData = JSON.parse(jsonInput)
      if (validateAndImport(data)) {
        completeImport(data.rounds)
      }
    } catch {
      setError('Invalid JSON. Please check the format.')
    }
  }, [completeImport, jsonInput, validateAndImport])

  const handleFileImport = useCallback(
    (file: File) => {
      if (isExcelFile(file)) {
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
        return
      }

      if (!isJsonFile(file)) {
        setError('Please upload an Excel (.xlsx) or JSON (.json) file.')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setJsonInput(content)
        try {
          const data: ImportData = JSON.parse(content)
          if (validateAndImport(data)) {
            completeImport(data.rounds)
          }
        } catch {
          setError('Invalid JSON file. Please check the format.')
        }
      }
      reader.readAsText(file)
    },
    [completeImport, validateAndImport],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      const file = e.dataTransfer.files[0]
      if (!file) return

      if (isExcelFile(file) || isJsonFile(file)) {
        handleFileImport(file)
        return
      }

      setError('Please drop an Excel (.xlsx) or JSON (.json) file.')
    },
    [handleFileImport],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const handleLoadSample = useCallback(() => {
    setJsonInput(JSON.stringify(SAMPLE_IMPORT_DATA, null, 2))
  }, [])

  const handleBuilderSubmit = useCallback(
    (rounds: Round[]) => {
      setError('')
      completeImport(rounds)
    },
    [completeImport],
  )

  useEffect(() => {
    if (gameState) return
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleImport()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [gameState, handleImport])

  return {
    jsonInput,
    setJsonInput,
    error,
    dragActive,
    importHover,
    setImportHover,
    fileInputRef,
    handleImport,
    handleFileImport,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleLoadSample,
    handleBuilderSubmit,
  }
}

export function createImportedGameState(rounds: Round[]): GameState {
  return createInitialState(rounds)
}
