import { createImportedGameState } from '@/hooks/use-admin-import'
import { getAdminPageView } from '@/lib/admin-route'
import { revealFinalScores, startGame } from '@/lib/game-engine'
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

  it('resets gameplay fields when replacing an in-progress setup', () => {
    const started = startGame(createImportedGameState(SAMPLE_IMPORT_DATA.rounds))
    const revealed = revealFinalScores({
      ...started,
      currentRoundIndex: started.rounds.length - 1,
      roundStatus: 'ended',
      roundWinner: 1,
    })

    const reimported = createImportedGameState([
      {
        question: 'Replacement question',
        answers: [{ text: 'Only answer', points: 10 }],
      },
    ])

    expect(reimported.gameStarted).toBe(false)
    expect(reimported.finalScoresRevealed).toBe(false)
    expect(reimported.rounds).toHaveLength(1)
    expect(reimported.rounds[0]?.question).toBe('Replacement question')
    expect(reimported).not.toEqual(revealed)
  })

  it('routes a fresh import to review and change-questions back to setup', () => {
    const imported = createImportedGameState(SAMPLE_IMPORT_DATA.rounds)

    expect(getAdminPageView(true, imported, false)).toBe('redirecting')
    expect(getAdminPageView(true, imported, true)).toBe('import')
  })
})
