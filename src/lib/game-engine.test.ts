import { createInitialState, GameState, Round } from '@/types/game'
import {
  canGoNextView,
  canGoPrevView,
  getActiveRound,
  getEffectiveState,
  getVisibleAnswers,
  goToLastRound,
  hasNextRound,
  isGameComplete,
  isLiveView,
  isReviewMode,
  markWrong,
  nextRound,
  nextRoundView,
  normalizeGameState,
  prevRoundView,
  revealAnswer,
  revealFinalScores,
  revealRemainingAnswer,
  startGame,
  switchActiveTeam,
  undoAction,
} from './game-engine'
import { describe, expect, it } from 'vitest'

const sampleRound: Round = {
  question: 'Name a color',
  answers: [
    { text: 'Red', points: 40 },
    { text: 'Blue', points: 30 },
    { text: 'Green', points: 20 },
  ],
}

const secondRound: Round = {
  question: 'Name a fruit',
  answers: [
    { text: 'Apple', points: 35 },
    { text: 'Banana', points: 25 },
  ],
}

function createTestState(
  rounds: Round[] = [sampleRound],
  overrides: Partial<GameState> = {},
): GameState {
  return {
    ...createInitialState(rounds),
    gameStarted: true,
    ...overrides,
  }
}

function revealAllAnswers(state: GameState): GameState {
  let current = state
  const round = getActiveRound(current)
  if (!round) return current

  for (let i = 0; i < round.answers.length; i++) {
    if (!current.revealedAnswers.includes(i)) {
      current = revealAnswer(current, i)
    }
  }
  return current
}

describe('normalizeGameState', () => {
  it('fills in missing optional fields', () => {
    const partial = {
      ...createInitialState([sampleRound]),
      viewRoundIndex: undefined as unknown as number,
      roundSnapshots: undefined as unknown as GameState['roundSnapshots'],
      finalScoresRevealed: undefined as unknown as boolean,
      gameStarted: undefined as unknown as boolean,
    }

    const normalized = normalizeGameState(partial)

    expect(normalized.viewRoundIndex).toBe(0)
    expect(normalized.roundSnapshots).toEqual([null])
    expect(normalized.finalScoresRevealed).toBe(false)
    expect(normalized.gameStarted).toBe(false)
  })
})

describe('startGame', () => {
  it('marks the game as started', () => {
    const state = createInitialState([sampleRound])
    const started = startGame(state)

    expect(started.gameStarted).toBe(true)
  })

  it('does not restart an already started game', () => {
    const state = createTestState()
    const restarted = startGame(state)

    expect(restarted.gameStarted).toBe(true)
    expect(restarted.rounds).toEqual(state.rounds)
    expect(restarted.team1Score).toBe(state.team1Score)
  })
})

describe('round navigation helpers', () => {
  it('returns the active round', () => {
    const state = createTestState([sampleRound, secondRound], {
      currentRoundIndex: 1,
    })

    expect(getActiveRound(state)?.question).toBe('Name a fruit')
  })

  it('detects when more rounds remain', () => {
    const state = createTestState([sampleRound, secondRound])
    expect(hasNextRound(state)).toBe(true)

    const lastRound = nextRound(revealAllAnswers(state))
    expect(hasNextRound(lastRound)).toBe(false)
  })

  it('tracks live view vs review mode', () => {
    const live = createTestState()
    expect(isLiveView(live)).toBe(true)
    expect(isReviewMode(live)).toBe(false)

    const reviewing = prevRoundView(
      nextRound(revealAllAnswers(createTestState([sampleRound, secondRound]))),
    )
    expect(isLiveView(reviewing)).toBe(false)
    expect(isReviewMode(reviewing)).toBe(true)
  })

  it('limits round view navigation', () => {
    const onFirstRound = createTestState([sampleRound, secondRound])
    expect(canGoPrevView(onFirstRound)).toBe(false)
    expect(canGoNextView(onFirstRound)).toBe(false)

    const onSecondRound = nextRound(revealAllAnswers(onFirstRound))
    expect(canGoPrevView(onSecondRound)).toBe(true)
    expect(canGoNextView(onSecondRound)).toBe(false)

    const reviewingFirst = prevRoundView(onSecondRound)
    expect(canGoNextView(reviewingFirst)).toBe(true)
  })
})

describe('getEffectiveState', () => {
  it('returns live state unchanged', () => {
    const state = createTestState()
    expect(getEffectiveState(state)).toStrictEqual(state)
  })

  it('returns snapshot data when reviewing a past round', () => {
    const finishedFirst = revealAllAnswers(createTestState([sampleRound, secondRound]))
    const onSecondRound = nextRound(finishedFirst)
    const reviewingFirst = prevRoundView(onSecondRound)

    const effective = getEffectiveState(reviewingFirst)

    expect(effective.currentRoundIndex).toBe(0)
    expect(effective.roundStatus).toBe('ended')
    expect(effective.roundWinner).toBe(1)
    expect(effective.roundPoints).toBe(90)
    expect(effective.revealedAnswers).toEqual([0, 1, 2])
    expect(effective.actionHistory).toEqual([])
  })
})

describe('revealAnswer', () => {
  it('reveals an answer and adds points', () => {
    const state = createTestState()
    const updated = revealAnswer(state, 0)

    expect(updated.revealedAnswers).toEqual([0])
    expect(updated.roundPoints).toBe(40)
    expect(updated.actionHistory).toHaveLength(1)
    expect(updated.actionHistory[0]).toEqual({
      type: 'reveal',
      answerIndex: 0,
      points: 40,
    })
  })

  it('ignores duplicate reveals', () => {
    const state = revealAnswer(createTestState(), 0)
    const duplicate = revealAnswer(state, 0)

    expect(duplicate).toStrictEqual(state)
  })

  it('ignores reveals in review mode', () => {
    const onSecondRound = nextRound(
      revealAllAnswers(createTestState([sampleRound, secondRound])),
    )
    const reviewing = prevRoundView(onSecondRound)
    const updated = revealAnswer(reviewing, 0)

    expect(updated).toStrictEqual(reviewing)
  })

  it('ends the round when all answers are revealed', () => {
    const finished = revealAllAnswers(createTestState())

    expect(finished.roundStatus).toBe('ended')
    expect(finished.roundWinner).toBe(1)
    expect(finished.team1Score).toBe(90)
    expect(finished.team2Score).toBe(0)
    expect(finished.activeTeam).toBe(2)
    expect(finished.roundSnapshots[0]?.roundPoints).toBe(90)
  })

  it('awards the round to the stealing team on a successful steal', () => {
    let state = createTestState()
    state = markWrong(state)
    state = markWrong(state)
    state = markWrong(state)

    expect(state.isStealPhase).toBe(true)
    expect(state.activeTeam).toBe(2)
    expect(state.roundPoints).toBe(0)

    const stolen = revealAnswer(state, 0)

    expect(stolen.roundStatus).toBe('ended')
    expect(stolen.roundWinner).toBe(2)
    expect(stolen.team2Score).toBe(40)
    expect(stolen.team1Score).toBe(0)
    expect(stolen.activeTeam).toBe(2)
  })
})

describe('revealRemainingAnswer', () => {
  it('reveals unanswered slots after the round ends without changing scores', () => {
    let state = createTestState()
    state = markWrong(state)
    state = markWrong(state)
    state = markWrong(state)
    state = revealAnswer(state, 0)

    const updated = revealRemainingAnswer(state, 1)

    expect(updated.revealedAnswers).toEqual([0, 1])
    expect(updated.roundPoints).toBe(40)
    expect(updated.team2Score).toBe(40)
    expect(updated.roundSnapshots[0]?.revealedAnswers).toEqual([0, 1])
  })

  it('does nothing while the round is still active', () => {
    const state = createTestState()
    const updated = revealRemainingAnswer(state, 1)

    expect(updated).toStrictEqual(state)
  })
})

describe('markWrong', () => {
  it('increments strikes and records the action', () => {
    const state = createTestState()
    const updated = markWrong(state)

    expect(updated.strikes).toBe(1)
    expect(updated.actionHistory).toEqual([{ type: 'wrong', answerIndex: -1 }])
  })

  it('enters steal phase after three strikes', () => {
    let state = createTestState()
    state = markWrong(state)
    state = markWrong(state)
    state = markWrong(state)

    expect(state.strikes).toBe(3)
    expect(state.isStealPhase).toBe(true)
    expect(state.activeTeam).toBe(2)
  })

  it('awards the round to the original team when the steal fails', () => {
    let state = createTestState()
    state = markWrong(state)
    state = markWrong(state)
    state = markWrong(state)
    state = markWrong(state)

    expect(state.roundStatus).toBe('ended')
    expect(state.roundWinner).toBe(1)
    expect(state.team1Score).toBe(0)
    expect(state.team2Score).toBe(0)
    expect(state.isStealPhase).toBe(false)
  })
})

describe('round transitions', () => {
  it('advances to the next round and resets round fields', () => {
    const finished = revealAllAnswers(createTestState([sampleRound, secondRound]))
    const next = nextRound(finished)

    expect(next.currentRoundIndex).toBe(1)
    expect(next.viewRoundIndex).toBe(1)
    expect(next.roundStatus).toBe('active')
    expect(next.revealedAnswers).toEqual([])
    expect(next.strikes).toBe(0)
    expect(next.roundPoints).toBe(0)
    expect(next.team1Score).toBe(90)
  })

  it('does not advance past the final round', () => {
    const lastRound = revealAllAnswers(createTestState([sampleRound]))
    const unchanged = nextRound(lastRound)

    expect(unchanged).toStrictEqual(lastRound)
  })

  it('moves the view between completed rounds', () => {
    const onSecondRound = nextRound(
      revealAllAnswers(createTestState([sampleRound, secondRound])),
    )

    const reviewingFirst = prevRoundView(onSecondRound)
    expect(reviewingFirst.viewRoundIndex).toBe(0)

    const backToLive = nextRoundView(reviewingFirst)
    expect(backToLive.viewRoundIndex).toBe(1)
  })

  it('jumps back to the last round when the index is out of range', () => {
    const outOfRange = createTestState([sampleRound, secondRound], {
      currentRoundIndex: 5,
      viewRoundIndex: 5,
    })

    const corrected = goToLastRound(outOfRange)

    expect(corrected.currentRoundIndex).toBe(1)
    expect(corrected.viewRoundIndex).toBe(1)
    expect(corrected.roundStatus).toBe('active')
  })
})

describe('undoAction', () => {
  it('undoes a reveal', () => {
    const revealed = revealAnswer(createTestState(), 0)
    const undone = undoAction(revealed)

    expect(undone.revealedAnswers).toEqual([])
    expect(undone.roundPoints).toBe(0)
    expect(undone.actionHistory).toEqual([])
  })

  it('undoes a strike and exits steal phase', () => {
    let state = createTestState()
    state = markWrong(state)
    state = markWrong(state)
    state = markWrong(state)
    const undone = undoAction(state)

    expect(undone.strikes).toBe(2)
    expect(undone.isStealPhase).toBe(false)
    expect(undone.activeTeam).toBe(1)
  })

  it('does nothing when there is no action history', () => {
    const state = createTestState()
    expect(undoAction(state)).toStrictEqual(state)
  })

  it('does nothing after a round ends', () => {
    const ended = revealAllAnswers(createTestState())
    expect(undoAction(ended)).toStrictEqual(ended)
  })
})

describe('switchActiveTeam', () => {
  it('toggles the active team during live play', () => {
    const state = createTestState()
    const switched = switchActiveTeam(state)

    expect(switched.activeTeam).toBe(2)
  })

  it('does not switch teams in review mode or after the round ends', () => {
    const ended = revealAllAnswers(createTestState())
    expect(switchActiveTeam(ended)).toStrictEqual(ended)

    const reviewing = prevRoundView(
      nextRound(revealAllAnswers(createTestState([sampleRound, secondRound]))),
    )
    expect(switchActiveTeam(reviewing)).toStrictEqual(reviewing)
  })
})

describe('game completion', () => {
  it('detects when the final round is complete', () => {
    const finished = revealAllAnswers(createTestState([sampleRound]))
    expect(isGameComplete(finished)).toBe(true)
  })

  it('is not complete while earlier rounds remain', () => {
    const finishedFirst = revealAllAnswers(
      createTestState([sampleRound, secondRound]),
    )
    expect(isGameComplete(finishedFirst)).toBe(false)
  })

  it('reveals final scores only after the game is complete', () => {
    const finished = revealAllAnswers(createTestState([sampleRound]))
    const withScores = revealFinalScores(finished)

    expect(withScores.finalScoresRevealed).toBe(true)

    const midGame = createTestState([sampleRound, secondRound])
    expect(revealFinalScores(midGame)).toBe(midGame)
  })
})

describe('getVisibleAnswers', () => {
  it('returns answer indexes for the active round', () => {
    expect(getVisibleAnswers(createTestState())).toEqual([0, 1, 2])
  })

  it('returns an empty list when there is no active round', () => {
    const state = createTestState([], { currentRoundIndex: 0 })
    expect(getVisibleAnswers(state)).toEqual([])
  })
})
