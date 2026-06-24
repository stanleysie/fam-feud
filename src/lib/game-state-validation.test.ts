import { createInitialState, GameState } from '@/types/game'
import { revealAnswer } from './game-engine'
import {
  GAME_STATE_SCHEMA_VERSION,
  parseGameState,
  validateGameState,
} from './game-state-validation'
import { describe, expect, it } from 'vitest'

const sampleRound = {
  question: 'Name a color',
  answers: [
    { text: 'Red', points: 40 },
    { text: 'Blue', points: 30 },
  ],
}

function validState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialState([sampleRound]),
    gameStarted: true,
    schemaVersion: GAME_STATE_SCHEMA_VERSION,
    ...overrides,
  }
}

describe('validateGameState', () => {
  it('accepts a valid saved game state', () => {
    const state = revealAnswer(validState(), 0)
    expect(validateGameState(state)).toBeNull()
  })

  it('rejects non-objects', () => {
    expect(validateGameState(null)).toMatch(/expected an object/)
    expect(validateGameState('game')).toMatch(/expected an object/)
  })

  it('rejects unsupported schema versions', () => {
    expect(
      validateGameState({
        ...validState(),
        schemaVersion: 99,
      }),
    ).toMatch(/Unsupported game state schema version/)
  })

  it('rejects invalid rounds using import validation', () => {
    expect(
      validateGameState({
        ...validState(),
        rounds: [],
      }),
    ).toMatch(/rounds/)
  })

  it('rejects out-of-range round indexes', () => {
    expect(
      validateGameState({
        ...validState(),
        currentRoundIndex: 5,
      }),
    ).toMatch(/currentRoundIndex/)
  })

  it('rejects review views beyond the current round', () => {
    expect(
      validateGameState({
        ...validState(),
        viewRoundIndex: 2,
        currentRoundIndex: 0,
      }),
    ).toMatch(/viewRoundIndex/)
  })

  it('rejects invalid revealed answer indexes', () => {
    expect(
      validateGameState({
        ...validState(),
        revealedAnswers: [99],
      }),
    ).toMatch(/revealedAnswers/)
  })

  it('rejects ended rounds without a winner', () => {
    expect(
      validateGameState({
        ...validState(),
        roundStatus: 'ended',
        roundWinner: null,
      }),
    ).toMatch(/roundWinner/)
  })

  it('rejects malformed action history', () => {
    expect(
      validateGameState({
        ...validState(),
        actionHistory: [{ type: 'reveal', answerIndex: 0 }],
      }),
    ).toMatch(/actionHistory/)
  })
})

describe('parseGameState', () => {
  it('parses valid JSON into a game state', () => {
    const state = validState()
    expect(parseGameState(JSON.stringify(state))).toEqual(state)
  })

  it('returns null for invalid JSON', () => {
    expect(parseGameState('{not json')).toBeNull()
  })

  it('returns null for structurally invalid state', () => {
    expect(parseGameState(JSON.stringify({ rounds: [] }))).toBeNull()
  })
})
