import { SAMPLE_IMPORT_DATA, validateImportData } from '@/lib/import-validation'
import { Round } from '@/types/game'
import * as XLSX from 'xlsx'

export const QUESTIONS_SHEET_NAME = 'Questions'
export const INSTRUCTIONS_SHEET_NAME = 'How to use'
export const EXCEL_HEADERS = ['Round', 'Question', 'Answer', 'Points'] as const

const TEMPLATE_FILENAME = 'fam-feud-questions-template.xlsx'
const EXPORT_FILENAME = 'fam-feud-questions.xlsx'

type ExcelQuestionRow = {
  round: number
  question: string
  answer: string
  points: number
}

function triggerDownload(buffer: ArrayBuffer, filename: string, mimeType: string) {
  const blob = new Blob([buffer], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

function findHeaderRowIndex(rows: unknown[][]): number {
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index].map(normalizeHeader)
    if (
      row[0] === 'round' &&
      row[1] === 'question' &&
      row[2] === 'answer' &&
      row[3] === 'points'
    ) {
      return index
    }
  }
  return -1
}

function parseRoundNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Number.isInteger(value) && value > 0 ? value : null
  }

  const trimmed = String(value ?? '').trim()
  if (!trimmed) return null

  const parsed = Number(trimmed)
  if (!Number.isInteger(parsed) || parsed <= 0) return null
  return parsed
}

function parsePoints(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  const trimmed = String(value ?? '').trim()
  if (!trimmed) return null

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function isBlankRow(row: unknown[]): boolean {
  return row.every((cell) => String(cell ?? '').trim() === '')
}

export function roundsToExcelRows(rounds: Round[]): ExcelQuestionRow[] {
  const rows: ExcelQuestionRow[] = []

  rounds.forEach((round, roundIndex) => {
    round.answers.forEach((answer, answerIndex) => {
      rows.push({
        round: roundIndex + 1,
        question: answerIndex === 0 ? round.question : '',
        answer: answer.text,
        points: answer.points,
      })
    })
  })

  return rows
}

export function parseQuestionRows(
  dataRows: unknown[][],
): { rounds: Round[] } | { error: string } {
  const grouped = new Map<
    number,
    { question: string; answers: { text: string; points: number }[] }
  >()
  const questionByRound = new Map<number, string>()

  for (const [rowIndex, row] of dataRows.entries()) {
    if (isBlankRow(row)) continue

    const round = parseRoundNumber(row[0])
    if (round === null) {
      return {
        error: `Row ${rowIndex + 1}: Round must be a whole number starting at 1.`,
      }
    }

    const rawQuestion = String(row[1] ?? '').trim()
    const answer = String(row[2] ?? '').trim()
    const points = parsePoints(row[3])

    if (!answer) {
      return {
        error: `Row ${rowIndex + 1}: Answer is required.`,
      }
    }

    if (points === null) {
      return {
        error: `Row ${rowIndex + 1}: Points must be a number.`,
      }
    }

    const knownQuestion = questionByRound.get(round)
    if (rawQuestion) {
      if (knownQuestion && knownQuestion !== rawQuestion) {
        return {
          error: `Row ${rowIndex + 1}: Round ${round} has conflicting questions.`,
        }
      }
      questionByRound.set(round, rawQuestion)
    }

    const question = rawQuestion || knownQuestion || ''
    if (!question) {
      return {
        error: `Row ${rowIndex + 1}: Question is required on the first row for round ${round}.`,
      }
    }

    if (!grouped.has(round)) {
      grouped.set(round, { question, answers: [] })
    }

    const group = grouped.get(round)!
    if (group.question !== question) {
      return {
        error: `Row ${rowIndex + 1}: Round ${round} has conflicting questions.`,
      }
    }

    group.answers.push({ text: answer, points })
  }

  if (grouped.size === 0) {
    return { error: 'No question rows found in the Excel file.' }
  }

  const rounds = [...grouped.entries()]
    .sort(([left], [right]) => left - right)
    .map(([, value]) => value)

  const validationError = validateImportData({ rounds })
  if (validationError) {
    return { error: validationError }
  }

  return { rounds }
}

export function parseExcelBuffer(
  buffer: ArrayBuffer,
): { rounds: Round[] } | { error: string } {
  let workbook: XLSX.WorkBook

  try {
    workbook = XLSX.read(buffer, { type: 'array' })
  } catch {
    return { error: 'Could not read the Excel file. Please use a valid .xlsx file.' }
  }

  const sheet =
    workbook.Sheets[QUESTIONS_SHEET_NAME] ?? workbook.Sheets[workbook.SheetNames[0]]

  if (!sheet) {
    return { error: 'The Excel file does not contain any worksheets.' }
  }

  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
  }) as unknown[][]

  const headerIndex = findHeaderRowIndex(rows)
  if (headerIndex === -1) {
    return {
      error:
        'Could not find the header row. Expected columns: Round, Question, Answer, Points.',
    }
  }

  return parseQuestionRows(rows.slice(headerIndex + 1))
}

function buildInstructionsSheet(): XLSX.WorkSheet {
  const instructions = [
    ['How to fill out the Questions sheet'],
    [],
    ['1. Each row is one answer.'],
    ['2. Rows with the same Round number belong to the same question.'],
    [
      '3. Type the question on the first row for each round. You can leave Question blank on the following rows for that round.',
    ],
    ['4. Points are survey points — higher means a more popular answer.'],
    ['5. List answers from highest to lowest points (recommended).'],
    [],
    ['Do not rename the column headers on the Questions sheet.'],
  ]

  const sheet = XLSX.utils.aoa_to_sheet(instructions)
  sheet['!cols'] = [{ wch: 92 }]
  return sheet
}

function buildQuestionsSheet(rounds: Round[]): XLSX.WorkSheet {
  const rows = [
    [...EXCEL_HEADERS],
    ...roundsToExcelRows(rounds).map((row) => [
      row.round,
      row.question,
      row.answer,
      row.points,
    ]),
  ]

  const sheet = XLSX.utils.aoa_to_sheet(rows)
  sheet['!cols'] = [
    { wch: 8 },
    { wch: 42 },
    { wch: 24 },
    { wch: 10 },
  ]
  return sheet
}

function buildWorkbook(rounds: Round[]): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(
    workbook,
    buildQuestionsSheet(rounds),
    QUESTIONS_SHEET_NAME,
  )
  XLSX.utils.book_append_sheet(
    workbook,
    buildInstructionsSheet(),
    INSTRUCTIONS_SHEET_NAME,
  )
  return workbook
}

export function downloadExcelTemplate(
  filename = TEMPLATE_FILENAME,
): void {
  const workbook = buildWorkbook(SAMPLE_IMPORT_DATA.rounds)
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  triggerDownload(
    buffer,
    filename,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
}

export function downloadQuestionsExcel(
  rounds: Round[],
  filename = EXPORT_FILENAME,
): void {
  const workbook = buildWorkbook(rounds)
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  triggerDownload(
    buffer,
    filename,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
}

export function isExcelFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return (
    name.endsWith('.xlsx') ||
    name.endsWith('.xls') ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel'
  )
}

export function isJsonFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return name.endsWith('.json') || file.type === 'application/json'
}
