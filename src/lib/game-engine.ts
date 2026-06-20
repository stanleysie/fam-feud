import { Action, GameState, Round } from '@/types/game'

export function getActiveRound(state: GameState): Round | null {
  return state.rounds[state.currentRoundIndex] || null
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

export function revealAnswer(state: GameState, answerIndex: number): GameState {
  const round = getActiveRound(state)
  if (!round) return state
  if (state.revealedAnswers.includes(answerIndex)) return state
  if (state.roundStatus === 'ended') return state

  const points = round.answers[answerIndex].points
  const action: Action = { type: 'reveal', answerIndex, points }

  const updated = {
    ...state,
    revealedAnswers: [...state.revealedAnswers, answerIndex],
    roundPoints: state.roundPoints + points,
    actionHistory: [...state.actionHistory, action],
    updatedAt: Date.now(),
  }

  if (isAllRevealed(updated)) {
    updated.roundStatus = 'ended'
    updated.roundWinner = state.activeTeam
  }

  return updated
}

export function markWrong(state: GameState): GameState {
  if (state.roundStatus === 'ended') return state

  const action: Action = { type: 'wrong', answerIndex: -1 }
  const newStrikes = state.strikes + 1

  const updated = {
    ...state,
    strikes: newStrikes,
    actionHistory: [...state.actionHistory, action],
    updatedAt: Date.now(),
  }

  if (newStrikes >= 3) {
    updated.isStealPhase = true
    updated.activeTeam = state.activeTeam === 1 ? 2 : 1
  }

  return updated
}

export function resolveSteal(state: GameState, success: boolean): GameState {
  if (!state.isStealPhase) return state

  const stealingTeam = state.activeTeam
  const originalTeam = state.activeTeam === 1 ? 2 : 1

  const updated = {
    ...state,
    isStealPhase: false,
    roundStatus: 'ended' as const,
  }

  if (success) {
    updated.roundWinner = stealingTeam
    if (stealingTeam === 1) {
      updated.team1Score = state.team1Score + state.roundPoints
    } else {
      updated.team2Score = state.team2Score + state.roundPoints
    }
  } else {
    updated.roundWinner = originalTeam
    if (originalTeam === 1) {
      updated.team1Score = state.team1Score + state.roundPoints
    } else {
      updated.team2Score = state.team2Score + state.roundPoints
    }
  }

  return updated
}

export function endRound(state: GameState): GameState {
  if (state.roundStatus === 'ended') return state

  const updated = {
    ...state,
    roundStatus: 'ended' as const,
    isStealPhase: false,
  }

  if (state.isStealPhase) {
    const originalTeam = state.activeTeam === 1 ? 2 : 1
    updated.roundWinner = originalTeam
    if (originalTeam === 1) {
      updated.team1Score = state.team1Score + state.roundPoints
    } else {
      updated.team2Score = state.team2Score + state.roundPoints
    }
  } else if (isAllRevealed(state)) {
    updated.roundWinner = state.activeTeam
    if (state.activeTeam === 1) {
      updated.team1Score = state.team1Score + state.roundPoints
    } else {
      updated.team2Score = state.team2Score + state.roundPoints
    }
  } else {
    updated.roundWinner = null
  }

  return updated
}

export function nextRound(state: GameState): GameState {
  const nextIndex = state.currentRoundIndex + 1
  return {
    ...state,
    currentRoundIndex: nextIndex,
    revealedAnswers: [],
    wrongAnswers: [],
    strikes: 0,
    roundStatus: 'active',
    roundWinner: null,
    roundPoints: 0,
    actionHistory: [],
    isStealPhase: false,
    updatedAt: Date.now(),
  }
}

export function prevRound(state: GameState): GameState {
  const prevIndex = Math.max(0, state.currentRoundIndex - 1)
  return {
    ...state,
    currentRoundIndex: prevIndex,
    revealedAnswers: [],
    wrongAnswers: [],
    strikes: 0,
    roundStatus: 'active',
    roundWinner: null,
    roundPoints: 0,
    actionHistory: [],
    isStealPhase: false,
    updatedAt: Date.now(),
  }
}

export function undoAction(state: GameState): GameState {
  if (state.actionHistory.length === 0) return state
  if (state.roundStatus === 'ended') return state

  const lastAction = state.actionHistory[state.actionHistory.length - 1]
  const newHistory = state.actionHistory.slice(0, -1)

  switch (lastAction.type) {
    case 'reveal':
      return {
        ...state,
        revealedAnswers: state.revealedAnswers.filter(
          (i) => i !== lastAction.answerIndex,
        ),
        roundPoints: state.roundPoints - lastAction.points,
        actionHistory: newHistory,
        updatedAt: Date.now(),
      }
    case 'wrong': {
      const newStrikes = Math.max(0, state.strikes - 1)
      const wasStealPhase = state.isStealPhase
      return {
        ...state,
        strikes: newStrikes,
        isStealPhase: newStrikes >= 3,
        activeTeam:
          wasStealPhase && newStrikes < 3
            ? state.activeTeam === 1
              ? 2
              : 1
            : state.activeTeam,
        actionHistory: newHistory,
        updatedAt: Date.now(),
      }
    }
    default:
      return state
  }
}

export function switchActiveTeam(state: GameState): GameState {
  return {
    ...state,
    activeTeam: state.activeTeam === 1 ? 2 : 1,
    updatedAt: Date.now(),
  }
}
