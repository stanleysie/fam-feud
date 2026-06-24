import { buildQuestionsExport } from '@/lib/export-questions'
import { Round } from '@/types/game'
import { describe, expect, it } from 'vitest'

describe('buildQuestionsExport', () => {
  it('exports rounds in the import-compatible format', () => {
    const rounds: Round[] = [
      {
        question: 'Name a color',
        answers: [
          { text: 'Red', points: 40 },
          { text: 'Blue', points: 30 },
        ],
      },
    ]

    expect(buildQuestionsExport(rounds)).toEqual({
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

  it('does not include game state fields', () => {
    const exported = buildQuestionsExport([
      {
        question: 'Test',
        answers: [{ text: 'A', points: 10 }],
      },
    ])

    expect(exported).not.toHaveProperty('team1Score')
    expect(exported).not.toHaveProperty('gameStarted')
    expect(Object.keys(exported)).toEqual(['rounds'])
  })
})
