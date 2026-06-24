import { GameState } from '@/types/game'

export const DEFAULT_TEAM_1_NAME = 'Team 1'
export const DEFAULT_TEAM_2_NAME = 'Team 2'
export const MAX_TEAM_NAME_LENGTH = 24

export function normalizeTeamName(
  value: string | undefined,
  fallback: string,
): string {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return fallback
  return trimmed.slice(0, MAX_TEAM_NAME_LENGTH)
}

export function getTeamName(
  state: Pick<GameState, 'team1Name' | 'team2Name'>,
  team: 1 | 2,
): string {
  return team === 1
    ? normalizeTeamName(state.team1Name, DEFAULT_TEAM_1_NAME)
    : normalizeTeamName(state.team2Name, DEFAULT_TEAM_2_NAME)
}

export function withNormalizedTeamNames(state: GameState): GameState {
  return {
    ...state,
    team1Name: normalizeTeamName(state.team1Name, DEFAULT_TEAM_1_NAME),
    team2Name: normalizeTeamName(state.team2Name, DEFAULT_TEAM_2_NAME),
  }
}

export function updateTeamNames(
  state: GameState,
  team1Name: string,
  team2Name: string,
): GameState {
  return {
    ...withNormalizedTeamNames(state),
    team1Name: normalizeTeamName(team1Name, DEFAULT_TEAM_1_NAME),
    team2Name: normalizeTeamName(team2Name, DEFAULT_TEAM_2_NAME),
    updatedAt: Date.now(),
  }
}

export function validateTeamName(value: unknown): string | null {
  if (value === undefined) return null

  if (typeof value !== 'string') {
    return 'Team names must be strings.'
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return 'Team names cannot be empty.'
  }

  if (trimmed.length > MAX_TEAM_NAME_LENGTH) {
    return `Team names must be ${MAX_TEAM_NAME_LENGTH} characters or fewer.`
  }

  return null
}
