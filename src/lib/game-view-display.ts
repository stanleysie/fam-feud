export type GameViewBannerInput = {
  roundStatus: 'active' | 'ended'
  roundWinner: 1 | 2 | null
  gameComplete: boolean
  finalScoresRevealed: boolean
}

export type GameViewBanners = {
  showRoundEnd: boolean
  showNoPoints: boolean
  showFinalScores: boolean
}

export function getGameViewBanners(input: GameViewBannerInput): GameViewBanners {
  const hideRoundBanner = input.gameComplete && input.finalScoresRevealed

  return {
    showRoundEnd:
      input.roundStatus === 'ended' &&
      input.roundWinner !== null &&
      !hideRoundBanner,
    showNoPoints:
      input.roundStatus === 'ended' &&
      input.roundWinner === null &&
      !hideRoundBanner,
    showFinalScores: input.gameComplete && input.finalScoresRevealed,
  }
}
