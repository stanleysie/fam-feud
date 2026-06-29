import { createInitialState } from '@/types/game'
import {
  CHANGE_QUESTIONS_IMPORT_PATH,
  getAdminPageView,
  isEditingImport,
  shouldRedirectToReview,
} from '@/lib/admin-route'
import { SAMPLE_IMPORT_DATA } from '@/lib/import-validation'
import { startGame } from '@/lib/game-engine'
import { describe, expect, it } from 'vitest'

const importedState = createInitialState(SAMPLE_IMPORT_DATA.rounds)
const startedState = startGame(importedState)

describe('isEditingImport', () => {
  it('is true only for import=1', () => {
    expect(isEditingImport('1')).toBe(true)
    expect(isEditingImport(null)).toBe(false)
    expect(isEditingImport('')).toBe(false)
    expect(isEditingImport('true')).toBe(false)
  })
})

describe('getAdminPageView', () => {
  it('shows loading until game state sync is ready', () => {
    expect(getAdminPageView(false, null, false)).toBe('loading')
    expect(getAdminPageView(false, importedState, false)).toBe('loading')
  })

  it('shows import when there is no game state', () => {
    expect(getAdminPageView(true, null, false)).toBe('import')
  })

  it('shows import when changing questions from review via import=1', () => {
    expect(getAdminPageView(true, importedState, true)).toBe('import')
  })

  it('redirects to review when questions are loaded but the game has not started', () => {
    expect(getAdminPageView(true, importedState, false)).toBe('redirecting')
  })

  it('shows the host panel after the game has started', () => {
    expect(getAdminPageView(true, startedState, false)).toBe('game')
    expect(getAdminPageView(true, startedState, true)).toBe('game')
  })
})

describe('shouldRedirectToReview', () => {
  it('redirects after a normal import when not editing', () => {
    expect(shouldRedirectToReview(true, importedState, false)).toBe(true)
  })

  it('does not redirect when returning to setup to change questions', () => {
    expect(shouldRedirectToReview(true, importedState, true)).toBe(false)
  })

  it('does not redirect while loading, without state, or after the game starts', () => {
    expect(shouldRedirectToReview(false, importedState, false)).toBe(false)
    expect(shouldRedirectToReview(true, null, false)).toBe(false)
    expect(shouldRedirectToReview(true, startedState, false)).toBe(false)
  })
})

describe('CHANGE_QUESTIONS_IMPORT_PATH', () => {
  it('points to the admin import query used by the review page', () => {
    expect(CHANGE_QUESTIONS_IMPORT_PATH).toBe('/admin?import=1')
  })
})
