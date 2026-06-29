import {
  JSON_IMPORT_FORMAT_EXAMPLE,
  SAMPLE_IMPORT_DATA,
  parseQuestionsJson,
  validateImportData,
} from '@/lib/import-validation'
import { buildQuestionsExport } from '@/lib/export-questions'
import { describe, expect, it } from 'vitest'

describe('validateImportData', () => {
  it('accepts valid question data', () => {
    expect(validateImportData(SAMPLE_IMPORT_DATA)).toBeNull()
  })

  it('rejects missing rounds array', () => {
    expect(validateImportData({ rounds: [] })).toMatch(/rounds/)
    expect(validateImportData({} as never)).toMatch(/rounds/)
  })

  it('rejects rounds without questions or answers', () => {
    expect(
      validateImportData({
        rounds: [{ question: '', answers: [{ text: 'A', points: 10 }] }],
      }),
    ).toMatch(/question/)

    expect(
      validateImportData({
        rounds: [{ question: 'Test?', answers: [] }],
      }),
    ).toMatch(/answer/)
  })

  it('rejects invalid answer fields', () => {
    expect(
      validateImportData({
        rounds: [{ question: 'Test?', answers: [{ text: '', points: 10 }] }],
      }),
    ).toMatch(/text/)

    expect(
      validateImportData({
        rounds: [{ question: 'Test?', answers: [{ text: 'A', points: '10' }] }],
      }),
    ).toMatch(/points/)

    expect(
      validateImportData({
        rounds: [{ question: 'Test?', answers: [{ text: 'A', points: NaN }] }],
      }),
    ).toMatch(/points/)
  })
})

describe('SAMPLE_IMPORT_DATA', () => {
  it('provides three demo rounds for try-sample import', () => {
    expect(SAMPLE_IMPORT_DATA.rounds).toHaveLength(3)
    expect(validateImportData(SAMPLE_IMPORT_DATA)).toBeNull()
  })
})

describe('JSON_IMPORT_FORMAT_EXAMPLE', () => {
  it('documents a valid import format that parses successfully', () => {
    expect(validateImportData(JSON.parse(JSON_IMPORT_FORMAT_EXAMPLE))).toBeNull()

    const result = parseQuestionsJson(JSON_IMPORT_FORMAT_EXAMPLE)
    expect(result).toEqual({
      rounds: [
        {
          question: 'Name something you bring to the beach',
          answers: [
            { text: 'Sunscreen', points: 35 },
            { text: 'Towel', points: 28 },
          ],
        },
      ],
    })
  })
})

describe('parseQuestionsJson', () => {
  it('parses valid JSON into rounds', () => {
    const json = JSON.stringify(SAMPLE_IMPORT_DATA)
    const result = parseQuestionsJson(json)

    expect(result).toEqual({ rounds: SAMPLE_IMPORT_DATA.rounds })
  })

  it('round-trips exported JSON', () => {
    const exported = buildQuestionsExport(SAMPLE_IMPORT_DATA.rounds)
    const result = parseQuestionsJson(JSON.stringify(exported, null, 2))

    expect(result).toEqual({ rounds: SAMPLE_IMPORT_DATA.rounds })
  })

  it('returns an error for invalid JSON syntax', () => {
    expect(parseQuestionsJson('{ not json')).toEqual({
      error: 'Invalid JSON. Please check the format.',
    })
  })

  it('returns an error for non-object JSON', () => {
    expect(parseQuestionsJson('"hello"')).toEqual({
      error: 'Invalid JSON. Please check the format.',
    })
  })

  it('returns validation errors for structurally invalid data', () => {
    expect(parseQuestionsJson(JSON.stringify({ rounds: [] }))).toEqual({
      error:
        'Invalid format: must have a "rounds" array with at least one round.',
    })
  })
})
