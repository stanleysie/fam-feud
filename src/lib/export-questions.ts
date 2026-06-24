import { ImportData, Round } from '@/types/game'

export function buildQuestionsExport(rounds: Round[]): ImportData {
  return {
    rounds: rounds.map((round) => ({
      question: round.question,
      answers: round.answers.map((answer) => ({
        text: answer.text,
        points: answer.points,
      })),
    })),
  }
}

export function downloadQuestionsJson(
  rounds: Round[],
  filename = 'fam-feud-questions.json',
): void {
  const data = buildQuestionsExport(rounds)
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
