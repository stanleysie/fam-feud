'use client'

import {
  clearGameState,
  getGameState,
  onUpdate,
  setGameState as persistGameState,
} from '@/lib/storage'
import { GameState } from '@/types/game'
import { useCallback, useSyncExternalStore } from 'react'

function subscribe(onStoreChange: () => void) {
  return onUpdate(onStoreChange)
}

function getServerSnapshot() {
  return null
}

export function useGameStateSync(): {
  gameState: GameState | null
  setGameState: (state: GameState | null) => void
  isReady: boolean
} {
  const isReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const gameState = useSyncExternalStore(
    subscribe,
    getGameState,
    getServerSnapshot,
  )

  const setGameState = useCallback((state: GameState | null) => {
    if (state) {
      persistGameState(state)
    } else {
      clearGameState()
    }
  }, [])

  return { gameState, setGameState, isReady }
}
