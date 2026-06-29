/**
 * @vitest-environment node
 */
import { startGame } from '@/lib/game-engine'
import {
  clearGameState,
  dismissStorageRecoveryNotice,
  getGameState,
  hasStorageRecoveryNotice,
  onUpdate,
  setGameState,
} from '@/lib/storage'
import { createInitialState } from '@/types/game'
import { Window } from 'happy-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sampleRound = {
  question: 'Name a color',
  answers: [
    { text: 'Red', points: 40 },
    { text: 'Blue', points: 30 },
  ],
}

function createSavedState() {
  return startGame(createInitialState([sampleRound]))
}

function installBrowserGlobals() {
  const browserWindow = new Window()
  vi.stubGlobal('window', browserWindow)
  vi.stubGlobal('localStorage', browserWindow.localStorage)
  vi.stubGlobal('sessionStorage', browserWindow.sessionStorage)
  vi.stubGlobal('Event', browserWindow.Event)
}

beforeEach(() => {
  installBrowserGlobals()
})

afterEach(() => {
  clearGameState()
  dismissStorageRecoveryNotice()
  sessionStorage.clear()
  vi.unstubAllGlobals()
})

describe('setGameState / getGameState', () => {
  it('persists and reads back a normalized game state', () => {
    const state = createSavedState()

    setGameState(state)
    const loaded = getGameState()

    expect(loaded).toMatchObject({
      gameStarted: true,
      team1Name: 'Team 1',
      rounds: [sampleRound],
    })
  })

  it('returns null when nothing is stored', () => {
    expect(getGameState()).toBeNull()
  })
})

describe('clearGameState', () => {
  it('removes persisted state', () => {
    setGameState(createSavedState())
    clearGameState()

    expect(getGameState()).toBeNull()
  })
})

describe('corrupt storage recovery', () => {
  it('clears invalid json, returns null, and shows a recovery notice', () => {
    localStorage.setItem('gameState', '{not json')

    expect(getGameState()).toBeNull()
    expect(localStorage.getItem('gameState')).toBeNull()
    expect(hasStorageRecoveryNotice()).toBe(true)
  })
})

describe('onUpdate', () => {
  it('notifies subscribers when game state changes', () => {
    const listener = vi.fn()
    const unsubscribe = onUpdate(listener)

    setGameState(createSavedState())

    expect(listener).toHaveBeenCalledTimes(1)

    clearGameState()
    expect(listener).toHaveBeenCalledTimes(2)

    unsubscribe()
  })
})
