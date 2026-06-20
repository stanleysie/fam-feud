import { ImportData } from '@/types/game'

export const SAMPLE_IMPORT_DATA: ImportData = {
  rounds: [
    {
      question: 'Name something you bring to the beach',
      answers: [
        { text: 'Sunscreen', points: 35 },
        { text: 'Towel', points: 28 },
        { text: 'Umbrella', points: 20 },
        { text: 'Cooler', points: 12 },
        { text: 'Chair', points: 5 },
      ],
    },
    {
      question: 'Name a popular pizza topping',
      answers: [
        { text: 'Pepperoni', points: 40 },
        { text: 'Mushrooms', points: 22 },
        { text: 'Sausage', points: 18 },
        { text: 'Onions', points: 12 },
        { text: 'Bell Peppers', points: 8 },
      ],
    },
    {
      question: 'Name something you find in a toolbox',
      answers: [
        { text: 'Hammer', points: 30 },
        { text: 'Screwdriver', points: 25 },
        { text: 'Wrench', points: 20 },
        { text: 'Pliers', points: 15 },
        { text: 'Tape Measure', points: 10 },
      ],
    },
  ],
}

export function validateImportData(data: ImportData): string | null {
  if (!data.rounds || !Array.isArray(data.rounds) || data.rounds.length === 0) {
    return 'Invalid format: must have a "rounds" array with at least one round.'
  }
  for (const round of data.rounds) {
    if (
      !round.question ||
      !Array.isArray(round.answers) ||
      round.answers.length === 0
    ) {
      return 'Each round must have a "question" and at least one "answer".'
    }
    for (const answer of round.answers) {
      if (
        !answer.text ||
        typeof answer.points !== 'number' ||
        !Number.isFinite(answer.points)
      ) {
        return 'Each answer must have "text" (string) and "points" (number).'
      }
    }
  }
  return null
}
