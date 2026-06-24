import { normalizeGameState } from '@/lib/game-engine';
import {
  GAME_STATE_SCHEMA_VERSION,
  parseGameState,
} from '@/lib/game-state-validation';
import { GameState } from '@/types/game';

const STORAGE_KEY = 'gameState';
const RECOVERY_NOTICE_KEY = 'fam-feud:storage-recovery';
const RECOVERY_NOTICE_EVENT = 'fam-feud:recovery-notice';

let cachedRaw: string | null | undefined;
let cachedState: GameState | null = null;

function notifyRecoveryNoticeChange(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(RECOVERY_NOTICE_EVENT));
}

export function markStorageCorrupted(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(RECOVERY_NOTICE_KEY, '1');
  notifyRecoveryNoticeChange();
}

export function hasStorageRecoveryNotice(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(RECOVERY_NOTICE_KEY) === '1';
}

export function dismissStorageRecoveryNotice(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(RECOVERY_NOTICE_KEY);
  notifyRecoveryNoticeChange();
}

function clearStorageRecoveryNotice(): void {
  dismissStorageRecoveryNotice();
}

export function subscribeStorageRecoveryNotice(
  callback: () => void,
): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(RECOVERY_NOTICE_EVENT, callback);
  return () => window.removeEventListener(RECOVERY_NOTICE_EVENT, callback);
}

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
    const parsed = parseGameState(raw);
    if (!parsed) {
      localStorage.removeItem(STORAGE_KEY);
      markStorageCorrupted();
      cachedRaw = null;
      cachedState = null;
      return null;
    }
    cachedState = normalizeGameState(parsed);
    return cachedState;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    markStorageCorrupted();
    cachedRaw = null;
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
  const raw = JSON.stringify({
    ...normalized,
    schemaVersion: GAME_STATE_SCHEMA_VERSION,
  });
  localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedState = normalized;
  clearStorageRecoveryNotice();
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
