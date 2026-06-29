import { createImportedGameState } from '@/hooks/use-admin-import'
import { SAMPLE_IMPORT_DATA } from '@/lib/import-validation'
import { describe, expect, it } from 'vitest'

describe('createImportedGameState', () => {
  it('creates a fresh game state from imported rounds', () => {
    const state = createImportedGameState(SAMPLE_IMPORT_DATA.rounds)

    expect(state.rounds).toEqual(SAMPLE_IMPORT_DATA.rounds)
    expect(state.gameStarted).toBe(false)
    expect(state.finalScoresRevealed).toBe(false)
    expect(state.currentRoundIndex).toBe(0)
    expect(state.roundStatus).toBe('active')
  })

  it('supports one-click try-sample import data', () => {
    const state = createImportedGameState(SAMPLE_IMPORT_DATA.rounds)

    expect(state.rounds).toHaveLength(3)
    expect(state.team1Name).toBe('Team 1')
    expect(state.team2Name).toBe('Team 2')
  })
})
