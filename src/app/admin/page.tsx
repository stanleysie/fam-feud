'use client'

import { AppBackground } from '@/components/app-background'
import { AdminGameView } from '@/components/admin/admin-game-view'
import { AdminImportView } from '@/components/admin/admin-import-view'
import { createImportedGameState } from '@/hooks/use-admin-import'
import { useGameStateSync } from '@/hooks/use-game-state-sync'
import { Round } from '@/types/game'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'

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
      router.push('/questions')
    },
    [router, setGameState],
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
    return <AdminImportView onImport={handleImport} />
  }

  return (
    <AdminGameView
      gameState={gameState}
      onUpdateState={setGameState}
      onReset={handleReset}
    />
  )
}
