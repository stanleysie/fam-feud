import {
  importExcelBuffer,
  importJsonText,
  readExcelImportResult,
  readJsonImportResult,
  validateExcelFile,
  validateJsonFile,
} from '@/lib/import-files'
import { SAMPLE_IMPORT_DATA } from '@/lib/import-validation'
import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'

function createExcelBuffer(): ArrayBuffer {
  const workbook = XLSX.utils.book_new()
  const sheet = XLSX.utils.aoa_to_sheet([
    ['Round', 'Question', 'Answer', 'Points'],
    [1, 'Name a color', 'Red', 40],
    [1, '', 'Blue', 30],
  ])
  XLSX.utils.book_append_sheet(workbook, sheet, 'Questions')
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
}

describe('validateExcelFile', () => {
  it('accepts xlsx files', () => {
    const file = new File([''], 'questions.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    expect(validateExcelFile(file)).toBeNull()
  })

  it('rejects non-excel files', () => {
    const file = new File(['{}'], 'questions.json', { type: 'application/json' })
    expect(validateExcelFile(file)).toEqual({
      ok: false,
      error: 'Please upload an Excel (.xlsx) file.',
    })
  })
})

describe('validateJsonFile', () => {
  it('accepts json files', () => {
    const file = new File(['{}'], 'questions.json', { type: 'application/json' })
    expect(validateJsonFile(file)).toBeNull()
  })

  it('rejects non-json files', () => {
    const file = new File([''], 'questions.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    expect(validateJsonFile(file)).toEqual({
      ok: false,
      error: 'Please upload a JSON (.json) file.',
    })
  })
})

describe('importExcelBuffer', () => {
  it('imports rounds from a valid workbook buffer', () => {
    const result = importExcelBuffer(createExcelBuffer())

    expect(result).toEqual({
      ok: true,
      rounds: [
        {
          question: 'Name a color',
          answers: [
            { text: 'Red', points: 40 },
            { text: 'Blue', points: 30 },
          ],
        },
      ],
    })
  })

  it('returns an error for unreadable workbook content', () => {
    const result = importExcelBuffer(new TextEncoder().encode('not excel').buffer)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(
        /Could not read the Excel file|Could not find the header row/,
      )
    }
  })
})

describe('importJsonText', () => {
  it('imports rounds from valid json', () => {
    const result = importJsonText(JSON.stringify(SAMPLE_IMPORT_DATA))

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.rounds).toHaveLength(3)
    }
  })

  it('returns validation errors for invalid json', () => {
    const result = importJsonText('{ not json')

    expect(result).toEqual({
      ok: false,
      error: 'Invalid JSON. Please check the format.',
    })
  })
})

describe('readExcelImportResult', () => {
  it('returns an error when the buffer is missing', () => {
    expect(readExcelImportResult(undefined)).toEqual({
      ok: false,
      error: 'Could not read the Excel file.',
    })
  })
})

describe('readJsonImportResult', () => {
  it('returns an error when file content is not a string', () => {
    expect(readJsonImportResult(new ArrayBuffer(8))).toEqual({
      ok: false,
      error: 'Could not read the JSON file.',
    })
  })
})
