import { Action, GameState, Round, RoundSnapshot } from '@/types/game'

export function normalizeGameState(state: GameState): GameState {
  return {
    ...state,
    viewRoundIndex: state.viewRoundIndex ?? state.currentRoundIndex,
    roundSnapshots:
      state.roundSnapshots ?? state.rounds.map(() => null),
    finalScoresRevealed: state.finalScoresRevealed ?? false,
    endedWithUnrevealedAnswers: state.endedWithUnrevealedAnswers ?? false,
    gameStarted: state.gameStarted ?? false,
  }
}

export function startGame(state: GameState): GameState {
  const normalized = normalizeGameState(state)
  if (normalized.gameStarted) return normalized

  return {
    ...normalized,
    gameStarted: true,
    updatedAt: Date.now(),
  }
}

export function getActiveRound(state: GameState): Round | null {
  return state.rounds[state.currentRoundIndex] || null
}

export function hasNextRound(state: GameState): boolean {
  return state.currentRoundIndex < state.rounds.length - 1
}

export function isGameComplete(state: GameState): boolean {
  const normalized = normalizeGameState(state)
  return (
    !hasNextRound(normalized) &&
    normalized.roundStatus === 'ended' &&
    isLiveView(normalized)
  )
}

export function isLiveView(state: GameState): boolean {
  const normalized = normalizeGameState(state)
  return normalized.viewRoundIndex === normalized.currentRoundIndex
}

export function isReviewMode(state: GameState): boolean {
  return !isLiveView(state)
}

export function canGoPrevView(state: GameState): boolean {
  return normalizeGameState(state).viewRoundIndex > 0
}

export function canGoNextView(state: GameState): boolean {
  const normalized = normalizeGameState(state)
  return normalized.viewRoundIndex < normalized.currentRoundIndex
}

export function getEffectiveState(state: GameState): GameState {
  const normalized = normalizeGameState(state)
  if (isLiveView(normalized)) return normalized

  const snapshot = normalized.roundSnapshots[normalized.viewRoundIndex]
  if (!snapshot) return normalized

  return {
    ...normalized,
    currentRoundIndex: normalized.viewRoundIndex,
    revealedAnswers: snapshot.revealedAnswers,
    strikes: snapshot.strikes,
    roundPoints: snapshot.roundPoints,
    roundWinner: snapshot.roundWinner,
    activeTeam: snapshot.activeTeam,
    isStealPhase: snapshot.isStealPhase,
    roundStatus: snapshot.roundStatus,
    team1Score: snapshot.team1Score,
    team2Score: snapshot.team2Score,
    actionHistory: [],
  }
}

export function revealFinalScores(state: GameState): GameState {
  if (!isGameComplete(state)) return state
  return {
    ...normalizeGameState(state),
    finalScoresRevealed: true,
    updatedAt: Date.now(),
  }
}

export function getVisibleAnswers(state: GameState): number[] {
  const round = getActiveRound(state)
  if (!round) return []
  return round.answers.map((_, i) => i)
}

export function isAllRevealed(state: GameState): boolean {
  const visible = getVisibleAnswers(state)
  return visible.every((i) => state.revealedAnswers.includes(i))
}

export function canSteal(state: GameState): boolean {
  return state.isStealPhase && state.strikes >= 3
}

function createRoundSnapshot(state: GameState): RoundSnapshot {
  return {
    revealedAnswers: [...state.revealedAnswers],
    strikes: state.strikes,
    roundPoints: state.roundPoints,
    roundWinner: state.roundWinner,
    activeTeam: state.activeTeam,
    isStealPhase: state.isStealPhase,
    roundStatus: 'ended',
    team1Score: state.team1Score,
    team2Score: state.team2Score,
  }
}

function finishRound(
  state: GameState,
  winner: 1 | 2,
  viaSteal: boolean,
): GameState {
  const normalized = normalizeGameState(state)
  const withScore =
    winner === 1
      ? { ...normalized, team1Score: normalized.team1Score + normalized.roundPoints }
      : { ...normalized, team2Score: normalized.team2Score + normalized.roundPoints }

  const nextActiveTeam: 1 | 2 = viaSteal
    ? winner
    : winner === 1
      ? 2
      : 1

  const finished = {
    ...withScore,
    roundStatus: 'ended' as const,
    roundWinner: winner,
    isStealPhase: false,
    activeTeam: nextActiveTeam,
    endedWithUnrevealedAnswers: !isAllRevealed({
      ...withScore,
      roundStatus: 'ended' as const,
    }),
    updatedAt: Date.now(),
  }

  const roundSnapshots = [...finished.roundSnapshots]
  roundSnapshots[finished.currentRoundIndex] = createRoundSnapshot(finished)

  return { ...finished, roundSnapshots }
}

export function revealAnswer(state: GameState, answerIndex: number): GameState {
  const normalized = normalizeGameState(state)
  const round = getActiveRound(normalized)
  if (!round) return normalized
  if (normalized.revealedAnswers.includes(answerIndex)) return normalized
  if (normalized.roundStatus === 'ended') return normalized
  if (!isLiveView(normalized)) return normalized

  const points = round.answers[answerIndex].points
  const action: Action = { type: 'reveal', answerIndex, points }

  const updated = {
    ...normalized,
    revealedAnswers: [...normalized.revealedAnswers, answerIndex],
    roundPoints: normalized.roundPoints + points,
    actionHistory: [...normalized.actionHistory, action],
    updatedAt: Date.now(),
  }

  if (updated.isStealPhase) {
    return finishRound(updated, updated.activeTeam, true)
  }

  if (isAllRevealed(updated)) {
    return finishRound(updated, normalized.activeTeam, false)
  }

  return updated
}

export function revealRemainingAnswer(
  state: GameState,
  answerIndex: number,
): GameState {
  const normalized = normalizeGameState(state)
  const round = getActiveRound(normalized)
  if (!round) return normalized
  if (normalized.revealedAnswers.includes(answerIndex)) return normalized
  if (normalized.roundStatus !== 'ended') return normalized
  if (!isLiveView(normalized)) return normalized

  const updated = {
    ...normalized,
    revealedAnswers: [...normalized.revealedAnswers, answerIndex],
    updatedAt: Date.now(),
  }

  const roundSnapshots = [...updated.roundSnapshots]
  roundSnapshots[updated.currentRoundIndex] = createRoundSnapshot(updated)

  return { ...updated, roundSnapshots }
}

export function markWrong(state: GameState): GameState {
  const normalized = normalizeGameState(state)
  if (normalized.roundStatus === 'ended') return normalized
  if (!isLiveView(normalized)) return normalized

  if (normalized.isStealPhase) {
    return resolveSteal(normalized, false)
  }

  const action: Action = { type: 'wrong', answerIndex: -1 }
  const newStrikes = normalized.strikes + 1

  const updated = {
    ...normalized,
    strikes: newStrikes,
    actionHistory: [...normalized.actionHistory, action],
    updatedAt: Date.now(),
  }

  if (newStrikes >= 3) {
    updated.isStealPhase = true
    updated.activeTeam = normalized.activeTeam === 1 ? 2 : 1
  }

  return updated
}

export function resolveSteal(state: GameState, success: boolean): GameState {
  const normalized = normalizeGameState(state)
  if (!normalized.isStealPhase) return normalized

  const stealingTeam = normalized.activeTeam
  const originalTeam = normalized.activeTeam === 1 ? 2 : 1
  const winner = success ? stealingTeam : originalTeam

  return finishRound(normalized, winner, true)
}

export function nextRound(state: GameState): GameState {
  const normalized = normalizeGameState(state)
  if (!hasNextRound(normalized)) return normalized

  return resetRoundState(normalized, normalized.currentRoundIndex + 1)
}

export function prevRoundView(state: GameState): GameState {
  const normalized = normalizeGameState(state)
  if (!canGoPrevView(normalized)) return normalized

  return {
    ...normalized,
    viewRoundIndex: normalized.viewRoundIndex - 1,
    updatedAt: Date.now(),
  }
}

export function nextRoundView(state: GameState): GameState {
  const normalized = normalizeGameState(state)
  if (!canGoNextView(normalized)) return normalized

  return {
    ...normalized,
    viewRoundIndex: normalized.viewRoundIndex + 1,
    updatedAt: Date.now(),
  }
}

export function goToLastRound(state: GameState): GameState {
  const normalized = normalizeGameState(state)
  if (normalized.rounds.length === 0) return normalized
  const lastIndex = normalized.rounds.length - 1
  if (normalized.currentRoundIndex <= lastIndex) return normalized
  return resetRoundState(normalized, lastIndex)
}

function resetRoundState(state: GameState, roundIndex: number): GameState {
  return {
    ...state,
    currentRoundIndex: roundIndex,
    viewRoundIndex: roundIndex,
    revealedAnswers: [],
    wrongAnswers: [],
    strikes: 0,
    roundStatus: 'active',
    roundWinner: null,
    roundPoints: 0,
    actionHistory: [],
    isStealPhase: false,
    finalScoresRevealed: false,
    endedWithUnrevealedAnswers: false,
    updatedAt: Date.now(),
  }
}

export function undoAction(state: GameState): GameState {
  const normalized = normalizeGameState(state)
  if (normalized.actionHistory.length === 0) return normalized
  if (normalized.roundStatus === 'ended') return normalized
  if (!isLiveView(normalized)) return normalized

  const lastAction = normalized.actionHistory[normalized.actionHistory.length - 1]
  const newHistory = normalized.actionHistory.slice(0, -1)

  switch (lastAction.type) {
    case 'reveal':
      return {
        ...normalized,
        revealedAnswers: normalized.revealedAnswers.filter(
          (i) => i !== lastAction.answerIndex,
        ),
        roundPoints: normalized.roundPoints - lastAction.points,
        actionHistory: newHistory,
        updatedAt: Date.now(),
      }
    case 'wrong': {
      const newStrikes = Math.max(0, normalized.strikes - 1)
      const wasStealPhase = normalized.isStealPhase
      return {
        ...normalized,
        strikes: newStrikes,
        isStealPhase: newStrikes >= 3,
        activeTeam:
          wasStealPhase && newStrikes < 3
            ? normalized.activeTeam === 1
              ? 2
              : 1
            : normalized.activeTeam,
        actionHistory: newHistory,
        updatedAt: Date.now(),
      }
    }
    default:
      return normalized
  }
}

export function switchActiveTeam(state: GameState): GameState {
  const normalized = normalizeGameState(state)
  if (!isLiveView(normalized) || normalized.roundStatus === 'ended') {
    return normalized
  }

  return {
    ...normalized,
    activeTeam: normalized.activeTeam === 1 ? 2 : 1,
    updatedAt: Date.now(),
  }
}
