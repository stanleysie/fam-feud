'use client'

import { AppBackground } from '@/components/app-background'
import { AdminGameView } from '@/components/admin/admin-game-view'
import { AdminImportView } from '@/components/admin/admin-import-view'
import { createImportedGameState } from '@/hooks/use-admin-import'
import { useGameStateSync } from '@/hooks/use-game-state-sync'
import {
  getAdminPageView,
  isEditingImport,
  shouldRedirectToReview,
} from '@/lib/admin-route'
import { Round } from '@/types/game'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect } from 'react'

function AdminPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editingImport = isEditingImport(searchParams.get('import'))
  const { gameState, setGameState, isReady } = useGameStateSync()

  useEffect(() => {
    if (!shouldRedirectToReview(isReady, gameState, editingImport)) return
    router.replace('/questions')
  }, [isReady, gameState, editingImport, router])

  const handleImport = useCallback(
    (rounds: Round[]) => {
      setGameState(createImportedGameState(rounds))
      router.replace('/questions')
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

  const view = getAdminPageView(isReady, gameState, editingImport)

  if (view === 'import') {
    return <AdminImportView onImport={handleImport} />
  }

  if (view === 'redirecting') {
    return (
      <AppBackground className='min-h-screen'>
        <div className='flex-1' />
      </AppBackground>
    )
  }

  if (!gameState) {
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

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <AppBackground className='min-h-screen'>
          <div className='flex-1' />
        </AppBackground>
      }
    >
      <AdminPageContent />
    </Suspense>
  )
}
