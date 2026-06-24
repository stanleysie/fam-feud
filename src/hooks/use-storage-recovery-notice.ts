'use client'

import {
  dismissStorageRecoveryNotice,
  hasStorageRecoveryNotice,
  subscribeStorageRecoveryNotice,
} from '@/lib/storage'
import { useSyncExternalStore } from 'react'

export function useStorageRecoveryNotice() {
  const visible = useSyncExternalStore(
    subscribeStorageRecoveryNotice,
    hasStorageRecoveryNotice,
    () => false,
  )

  return { visible, dismiss: dismissStorageRecoveryNotice }
}
