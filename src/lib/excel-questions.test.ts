import {
  isExcelFile,
  isJsonFile,
  parseExcelBuffer,
  parseQuestionRows,
  roundsToExcelRows,
} from '@/lib/excel-questions'
import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'

describe('roundsToExcelRows', () => {
  it('flattens rounds into one row per answer', () => {
    expect(
      roundsToExcelRows([
        {
          question: 'Name a color',
          answers: [
            { text: 'Red', points: 40 },
            { text: 'Blue', points: 30 },
          ],
        },
      ]),
    ).toEqual([
      { round: 1, question: 'Name a color', answer: 'Red', points: 40 },
      { round: 1, question: '', answer: 'Blue', points: 30 },
    ])
  })
})

describe('parseQuestionRows', () => {
  it('parses grouped rows into rounds', () => {
    const result = parseQuestionRows([
      [1, 'Name a color', 'Red', 40],
      [1, '', 'Blue', 30],
      [2, 'Name a fruit', 'Apple', 35],
    ])

    expect(result).toEqual({
      rounds: [
        {
          question: 'Name a color',
          answers: [
            { text: 'Red', points: 40 },
            { text: 'Blue', points: 30 },
          ],
        },
        {
          question: 'Name a fruit',
          answers: [{ text: 'Apple', points: 35 }],
        },
      ],
    })
  })

  it('rejects rows with missing questions on the first round entry', () => {
    const result = parseQuestionRows([[1, '', 'Red', 40]])

    expect(result).toEqual({
      error: 'Row 1: Question is required on the first row for round 1.',
    })
  })

  it('rejects conflicting questions within the same round', () => {
    const result = parseQuestionRows([
      [1, 'Name a color', 'Red', 40],
      [1, 'Different question', 'Blue', 30],
    ])

    expect(result).toEqual({
      error: 'Row 2: Round 1 has conflicting questions.',
    })
  })

  it('rejects invalid round numbers', () => {
    const result = parseQuestionRows([[0, 'Name a color', 'Red', 40]])

    expect(result).toEqual({
      error: 'Row 1: Round must be a whole number starting at 1.',
    })
  })

  it('rejects rows with missing answers', () => {
    const result = parseQuestionRows([[1, 'Name a color', '', 40]])

    expect(result).toEqual({
      error: 'Row 1: Answer is required.',
    })
  })

  it('rejects rows with non-numeric points', () => {
    const result = parseQuestionRows([[1, 'Name a color', 'Red', 'lots']])

    expect(result).toEqual({
      error: 'Row 1: Points must be a number.',
    })
  })

  it('rejects files with no question rows', () => {
    const result = parseQuestionRows([])

    expect(result).toEqual({
      error: 'No question rows found in the Excel file.',
    })
  })
})

describe('parseExcelBuffer', () => {
  it('reads the Questions sheet from a workbook', () => {
    const workbook = XLSX.utils.book_new()
    const sheet = XLSX.utils.aoa_to_sheet([
      ['Round', 'Question', 'Answer', 'Points'],
      [1, 'Name a color', 'Red', 40],
      [1, '', 'Blue', 30],
    ])
    XLSX.utils.book_append_sheet(workbook, sheet, 'Questions')

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const result = parseExcelBuffer(buffer)

    expect(result).toEqual({
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

  it('rejects workbooks without the expected header row', () => {
    const workbook = XLSX.utils.book_new()
    const sheet = XLSX.utils.aoa_to_sheet([['Wrong', 'Headers', 'Here']])
    XLSX.utils.book_append_sheet(workbook, sheet, 'Questions')

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const result = parseExcelBuffer(buffer)

    expect(result).toEqual({
      error:
        'Could not find the header row. Expected columns: Round, Question, Answer, Points.',
    })
  })

  it('rejects unreadable workbook content', () => {
    const result = parseExcelBuffer(new TextEncoder().encode('not excel').buffer)

    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toMatch(
        /Could not read the Excel file|Could not find the header row/,
      )
    }
  })
})

describe('isExcelFile', () => {
  it('accepts xlsx files by extension and mime type', () => {
    expect(
      isExcelFile(
        new File([''], 'questions.xlsx', {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
      ),
    ).toBe(true)
    expect(isExcelFile(new File([''], 'questions.xls', { type: '' }))).toBe(true)
  })

  it('rejects non-excel files', () => {
    expect(
      isExcelFile(new File(['{}'], 'questions.json', { type: 'application/json' })),
    ).toBe(false)
  })
})

describe('isJsonFile', () => {
  it('accepts json files by extension and mime type', () => {
    expect(
      isJsonFile(new File(['{}'], 'questions.json', { type: 'application/json' })),
    ).toBe(true)
    expect(isJsonFile(new File(['{}'], 'data.JSON', { type: '' }))).toBe(true)
  })

  it('rejects non-json files', () => {
    expect(
      isJsonFile(
        new File([''], 'questions.xlsx', {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
      ),
    ).toBe(false)
  })
})
