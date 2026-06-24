import {
  getTeamName,
  updateTeamNames,
  validateTeamName,
  withNormalizedTeamNames,
} from '@/lib/team-names'
import { createInitialState } from '@/types/game'
import { describe, expect, it } from 'vitest'

describe('team names', () => {
  it('uses defaults when names are missing', () => {
    const state = createInitialState([])
    expect(getTeamName(state, 1)).toBe('Team 1')
    expect(getTeamName(state, 2)).toBe('Team 2')
  })

  it('trims and applies custom names', () => {
    const state = updateTeamNames(createInitialState([]), '  Smiths  ', 'Joneses')
    expect(getTeamName(state, 1)).toBe('Smiths')
    expect(getTeamName(state, 2)).toBe('Joneses')
  })

  it('falls back to defaults for blank input', () => {
    const state = updateTeamNames(createInitialState([]), '   ', 'Joneses')
    expect(getTeamName(state, 1)).toBe('Team 1')
    expect(getTeamName(state, 2)).toBe('Joneses')
  })

  it('validates team name shape', () => {
    expect(validateTeamName('Family A')).toBeNull()
    expect(validateTeamName('')).toMatch(/empty/)
    expect(validateTeamName(42)).toMatch(/strings/)
  })

  it('normalizes persisted state without team names', () => {
    const base = createInitialState([])
    const state = withNormalizedTeamNames({
      ...base,
      ...{ team1Name: undefined, team2Name: undefined },
    } as typeof base)
    expect(state.team1Name).toBe('Team 1')
    expect(state.team2Name).toBe('Team 2')
  })
})
