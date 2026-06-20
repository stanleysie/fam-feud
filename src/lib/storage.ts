import { normalizeGameState } from '@/lib/game-engine';
import { GameState } from '@/types/game';

const STORAGE_KEY = 'gameState';

export function getGameState(): GameState | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return normalizeGameState(JSON.parse(raw) as GameState);
  } catch {
    return null;
  }
}

export function setGameState(state: GameState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event('storage'));
}

export function clearGameState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('storage'));
}

export function onUpdate(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}
