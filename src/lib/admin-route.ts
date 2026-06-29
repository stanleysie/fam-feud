import { GameState } from '@/types/game'

export const CHANGE_QUESTIONS_IMPORT_PATH = '/admin?import=1'

export type AdminPageView = 'loading' | 'import' | 'redirecting' | 'game'

export function isEditingImport(importParam: string | null): boolean {
  return importParam === '1'
}

export function getAdminPageView(
  isReady: boolean,
  gameState: GameState | null,
  editingImport: boolean,
): AdminPageView {
  if (!isReady) return 'loading'
  if (!gameState || (editingImport && !gameState.gameStarted)) return 'import'
  if (!gameState.gameStarted) return 'redirecting'
  return 'game'
}

export function shouldRedirectToReview(
  isReady: boolean,
  gameState: GameState | null,
  editingImport: boolean,
): boolean {
  if (!isReady || !gameState || gameState.gameStarted) return false
  return !editingImport
}
