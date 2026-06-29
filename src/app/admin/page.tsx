'use client'

import { AppBackground } from '@/components/app-background'
import { AdminGameView } from '@/components/admin/admin-game-view'
import { AdminImportView } from '@/components/admin/admin-import-view'
import { createImportedGameState } from '@/hooks/use-admin-import'
import { useGameStateSync } from '@/hooks/use-game-state-sync'
import { Round } from '@/types/game'
import { useRouter } from 'next/navigation'
import { Suspense, useCallback, useEffect } from 'react'

export default function AdminPage() {
  const router = useRouter()
  const { gameState, setGameState, isReady } = useGameStateSync()

  useEffect(() => {
    if (!isReady || !gameState || gameState.gameStarted) return
    router.replace('/questions')
  }, [isReady, gameState, router])

  const handleImport = useCallback(
    (rounds: Round[]) => {
      setGameState(createImportedGameState(rounds))
    },
    [setGameState],
  )

  const handleReset = useCallback(() => {
    setGameState(null)
  }, [setGameState])

  if (!isReady) {
    return (
      <AppBackground className='min-h-screen'>
        <div className='flex-1' />
      </AppBackground>
    )
  }

  if (!gameState) {
    return (
      <Suspense
        fallback={
          <AppBackground className='min-h-screen'>
            <div className='flex-1' />
          </AppBackground>
        }
      >
        <AdminImportView onImport={handleImport} />
      </Suspense>
    )
  }

  if (!gameState.gameStarted) {
    return (
      <AppBackground className='min-h-screen'>
        <div className='flex-1' />
      </AppBackground>
    )
  }

  return (
    <AdminGameView
      gameState={gameState}
      onUpdateState={setGameState}
      onReset={handleReset}
    />
  )
}
