import { getGameViewBanners } from '@/lib/game-view-display'
import { describe, expect, it } from 'vitest'

describe('getGameViewBanners', () => {
  it('shows the round-end banner during a normal ended round', () => {
    expect(
      getGameViewBanners({
        roundStatus: 'ended',
        roundWinner: 1,
        gameComplete: false,
        finalScoresRevealed: false,
      }),
    ).toEqual({
      showRoundEnd: true,
      showNoPoints: false,
      showFinalScores: false,
    })
  })

  it('shows the no-points banner when a round ends without a winner', () => {
    expect(
      getGameViewBanners({
        roundStatus: 'ended',
        roundWinner: null,
        gameComplete: false,
        finalScoresRevealed: false,
      }),
    ).toEqual({
      showRoundEnd: false,
      showNoPoints: true,
      showFinalScores: false,
    })
  })

  it('shows the final round banner before final scores are revealed', () => {
    expect(
      getGameViewBanners({
        roundStatus: 'ended',
        roundWinner: 2,
        gameComplete: true,
        finalScoresRevealed: false,
      }),
    ).toEqual({
      showRoundEnd: true,
      showNoPoints: false,
      showFinalScores: false,
    })
  })

  it('shows the final scores banner after the host reveals them', () => {
    expect(
      getGameViewBanners({
        roundStatus: 'ended',
        roundWinner: 1,
        gameComplete: true,
        finalScoresRevealed: true,
      }),
    ).toEqual({
      showRoundEnd: false,
      showNoPoints: false,
      showFinalScores: true,
    })
  })

  it('hides round banners while a round is still active', () => {
    expect(
      getGameViewBanners({
        roundStatus: 'active',
        roundWinner: null,
        gameComplete: false,
        finalScoresRevealed: false,
      }),
    ).toEqual({
      showRoundEnd: false,
      showNoPoints: false,
      showFinalScores: false,
    })
  })

  it('shows no-points on the final round before final scores are revealed', () => {
    expect(
      getGameViewBanners({
        roundStatus: 'ended',
        roundWinner: null,
        gameComplete: true,
        finalScoresRevealed: false,
      }),
    ).toEqual({
      showRoundEnd: false,
      showNoPoints: true,
      showFinalScores: false,
    })
  })
})
