import { validateImportData } from '@/lib/import-validation'
import { validateTeamName } from '@/lib/team-names'
import {
  Action,
  GameState,
  RoundSnapshot,
} from '@/types/game'

export const GAME_STATE_SCHEMA_VERSION = 2

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isTeam(value: unknown): value is 1 | 2 {
  return value === 1 || value === 2
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isNonNegativeInt(value: unknown): value is number {
  return isFiniteNumber(value) && Number.isInteger(value) && value >= 0
}

function isIntArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.every((item) => isFiniteNumber(item) && Number.isInteger(item))
  )
}

function isRoundStatus(value: unknown): value is GameState['roundStatus'] {
  return value === 'active' || value === 'ended'
}

function validateAction(value: unknown): value is Action {
  if (!isRecord(value) || typeof value.type !== 'string') return false

  if (value.type === 'reveal') {
    return (
      isNonNegativeInt(value.answerIndex) && isFiniteNumber(value.points)
    )
  }

  if (value.type === 'wrong') {
    return value.answerIndex === -1
  }

  return false
}

function validateSnapshot(value: unknown): value is RoundSnapshot {
  if (!isRecord(value)) return false

  return (
    isIntArray(value.revealedAnswers) &&
    isNonNegativeInt(value.strikes) &&
    isFiniteNumber(value.roundPoints) &&
    value.roundPoints >= 0 &&
    (value.roundWinner === null || isTeam(value.roundWinner)) &&
    isTeam(value.activeTeam) &&
    typeof value.isStealPhase === 'boolean' &&
    value.roundStatus === 'ended' &&
    isFiniteNumber(value.team1Score) &&
    value.team1Score >= 0 &&
    isFiniteNumber(value.team2Score) &&
    value.team2Score >= 0
  )
}

function validateRevealedAnswers(
  revealedAnswers: number[],
  roundAnswerCount: number,
): boolean {
  const seen = new Set<number>()

  for (const index of revealedAnswers) {
    if (index < 0 || index >= roundAnswerCount) return false
    if (seen.has(index)) return false
    seen.add(index)
  }

  return true
}

function validateInvariants(state: GameState): string | null {
  const { rounds, currentRoundIndex, viewRoundIndex, roundSnapshots } = state

  if (currentRoundIndex < 0 || currentRoundIndex >= rounds.length) {
    return 'currentRoundIndex is out of range.'
  }

  if (viewRoundIndex < 0 || viewRoundIndex > currentRoundIndex) {
    return 'viewRoundIndex is out of range.'
  }

  if (roundSnapshots.length !== rounds.length) {
    return 'roundSnapshots length does not match rounds length.'
  }

  const currentRound = rounds[currentRoundIndex]
  if (!validateRevealedAnswers(state.revealedAnswers, currentRound.answers.length)) {
    return 'revealedAnswers contains invalid or duplicate indexes.'
  }

  if (state.strikes > 3) {
    return 'strikes cannot exceed 3.'
  }

  if (
    state.roundStatus === 'ended' &&
    state.roundWinner === null &&
    !state.gameEnded
  ) {
    return 'ended rounds must have a roundWinner.'
  }

  if (state.roundStatus === 'active' && state.roundWinner !== null) {
    return 'active rounds cannot have a roundWinner.'
  }

  for (let i = 0; i < roundSnapshots.length; i++) {
    const snapshot = roundSnapshots[i]
    if (snapshot === null) continue

    const round = rounds[i]
    if (!validateRevealedAnswers(snapshot.revealedAnswers, round.answers.length)) {
      return `roundSnapshots[${i}] has invalid revealedAnswers.`
    }
  }

  return null
}

export function validateGameState(data: unknown): string | null {
  if (!isRecord(data)) {
    return 'Invalid game state: expected an object.'
  }

  if (data.schemaVersion !== undefined) {
    if (data.schemaVersion !== 1 && data.schemaVersion !== 2) {
      return `Unsupported game state schema version: ${String(data.schemaVersion)}.`
    }
  }

  const roundsError = validateImportData({ rounds: data.rounds as GameState['rounds'] })
  if (roundsError) {
    return roundsError
  }

  const rounds = data.rounds as GameState['rounds']

  if (!isNonNegativeInt(data.currentRoundIndex)) {
    return 'currentRoundIndex must be a non-negative integer.'
  }
  if (!isNonNegativeInt(data.viewRoundIndex)) {
    return 'viewRoundIndex must be a non-negative integer.'
  }
  if (!Array.isArray(data.roundSnapshots)) {
    return 'roundSnapshots must be an array.'
  }
  if (!isIntArray(data.revealedAnswers)) {
    return 'revealedAnswers must be an array of integers.'
  }
  if (!isNonNegativeInt(data.strikes)) {
    return 'strikes must be a non-negative integer.'
  }
  if (!isTeam(data.activeTeam)) {
    return 'activeTeam must be 1 or 2.'
  }

  const team1NameError = validateTeamName(data.team1Name)
  if (team1NameError && data.team1Name !== undefined) {
    return `team1Name: ${team1NameError}`
  }

  const team2NameError = validateTeamName(data.team2Name)
  if (team2NameError && data.team2Name !== undefined) {
    return `team2Name: ${team2NameError}`
  }

  if (!isFiniteNumber(data.team1Score) || data.team1Score < 0) {
    return 'team1Score must be a non-negative number.'
  }
  if (!isFiniteNumber(data.team2Score) || data.team2Score < 0) {
    return 'team2Score must be a non-negative number.'
  }
  if (typeof data.isStealPhase !== 'boolean') {
    return 'isStealPhase must be a boolean.'
  }
  if (!isRoundStatus(data.roundStatus)) {
    return 'roundStatus must be "active" or "ended".'
  }
  if (data.roundWinner !== null && !isTeam(data.roundWinner)) {
    return 'roundWinner must be null, 1, or 2.'
  }
  if (!isFiniteNumber(data.roundPoints) || data.roundPoints < 0) {
    return 'roundPoints must be a non-negative number.'
  }
  if (!Array.isArray(data.actionHistory)) {
    return 'actionHistory must be an array.'
  }
  if (!data.actionHistory.every(validateAction)) {
    return 'actionHistory contains invalid actions.'
  }
  if (typeof data.finalScoresRevealed !== 'boolean') {
    return 'finalScoresRevealed must be a boolean.'
  }
  if (typeof data.gameStarted !== 'boolean') {
    return 'gameStarted must be a boolean.'
  }
  if (data.gameEnded !== undefined && typeof data.gameEnded !== 'boolean') {
    return 'gameEnded must be a boolean.'
  }
  if (
    data.questionFlashVisible !== undefined &&
    typeof data.questionFlashVisible !== 'boolean'
  ) {
    return 'questionFlashVisible must be a boolean.'
  }
  if (!isFiniteNumber(data.updatedAt)) {
    return 'updatedAt must be a finite number.'
  }

  for (const snapshot of data.roundSnapshots) {
    if (snapshot !== null && !validateSnapshot(snapshot)) {
      return 'roundSnapshots contains an invalid snapshot.'
    }
  }

  const candidate: GameState = {
    rounds,
    currentRoundIndex: data.currentRoundIndex,
    viewRoundIndex: data.viewRoundIndex,
    roundSnapshots: data.roundSnapshots as GameState['roundSnapshots'],
    revealedAnswers: data.revealedAnswers,
    strikes: data.strikes,
    activeTeam: data.activeTeam,
    team1Name:
      typeof data.team1Name === 'string' ? data.team1Name : 'Team 1',
    team2Name:
      typeof data.team2Name === 'string' ? data.team2Name : 'Team 2',
    team1Score: data.team1Score,
    team2Score: data.team2Score,
    isStealPhase: data.isStealPhase,
    roundStatus: data.roundStatus,
    roundWinner: data.roundWinner,
    roundPoints: data.roundPoints,
    actionHistory: data.actionHistory as Action[],
    finalScoresRevealed: data.finalScoresRevealed,
    questionFlashVisible:
      typeof data.questionFlashVisible === 'boolean'
        ? data.questionFlashVisible
        : false,
    gameStarted: data.gameStarted,
    gameEnded: typeof data.gameEnded === 'boolean' ? data.gameEnded : false,
    updatedAt: data.updatedAt,
  }

  return validateInvariants(candidate)
}

export function parseGameState(raw: string): GameState | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (validateGameState(parsed) !== null) return null
    return parsed as GameState
  } catch {
    return null
  }
}
