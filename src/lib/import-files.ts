import { isExcelFile, isJsonFile, parseExcelBuffer } from '@/lib/excel-questions'
import { parseQuestionsJson } from '@/lib/import-validation'
import { Round } from '@/types/game'

export type ImportFileResult =
  | { ok: true; rounds: Round[] }
  | { ok: false; error: string }

export function importExcelBuffer(buffer: ArrayBuffer): ImportFileResult {
  const result = parseExcelBuffer(buffer)
  if ('error' in result) {
    return { ok: false, error: result.error }
  }
  return { ok: true, rounds: result.rounds }
}

export function importJsonText(content: string): ImportFileResult {
  const result = parseQuestionsJson(content)
  if ('error' in result) {
    return { ok: false, error: result.error }
  }
  return { ok: true, rounds: result.rounds }
}

export function validateExcelFile(file: File): ImportFileResult | null {
  if (!isExcelFile(file)) {
    return { ok: false, error: 'Please upload an Excel (.xlsx) file.' }
  }
  return null
}

export function validateJsonFile(file: File): ImportFileResult | null {
  if (!isJsonFile(file)) {
    return { ok: false, error: 'Please upload a JSON (.json) file.' }
  }
  return null
}

export function readExcelImportResult(
  buffer: ArrayBuffer | null | undefined,
): ImportFileResult {
  if (!(buffer instanceof ArrayBuffer)) {
    return { ok: false, error: 'Could not read the Excel file.' }
  }
  return importExcelBuffer(buffer)
}

export function readJsonImportResult(
  content: string | ArrayBuffer | null | undefined,
): ImportFileResult {
  if (typeof content !== 'string') {
    return { ok: false, error: 'Could not read the JSON file.' }
  }
  return importJsonText(content)
}
