import { normalizeGameState } from '@/lib/game-engine';
import { GameState } from '@/types/game';

const STORAGE_KEY = 'gameState';

let cachedRaw: string | null | undefined;
let cachedState: GameState | null = null;

function readFromStorage(): GameState | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) {
    return cachedState;
  }

  cachedRaw = raw;
  if (!raw) {
    cachedState = null;
    return null;
  }

  try {
    cachedState = normalizeGameState(JSON.parse(raw) as GameState);
    return cachedState;
  } catch {
    cachedState = null;
    return null;
  }
}

export function getGameState(): GameState | null {
  return readFromStorage();
}

export function setGameState(state: GameState): void {
  if (typeof window === 'undefined') return;

  const normalized = normalizeGameState(state);
  const raw = JSON.stringify(normalized);
  localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedState = normalized;
  window.dispatchEvent(new Event('storage'));
}

export function clearGameState(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STORAGE_KEY);
  cachedRaw = null;
  cachedState = null;
  window.dispatchEvent(new Event('storage'));
}

export function onUpdate(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}
