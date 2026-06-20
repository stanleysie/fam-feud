export interface Answer {
  text: string;
  points: number;
}

export interface Round {
  question: string;
  answers: Answer[];
}

export interface ImportData {
  rounds: Round[];
}

export type Action =
  | { type: 'reveal'; answerIndex: number; points: number }
  | { type: 'wrong'; answerIndex: number };

export interface RoundSnapshot {
  revealedAnswers: number[];
  strikes: number;
  roundPoints: number;
  roundWinner: 1 | 2 | null;
  activeTeam: 1 | 2;
  isStealPhase: boolean;
  roundStatus: 'ended';
  team1Score: number;
  team2Score: number;
}

export interface GameState {
  rounds: Round[];
  currentRoundIndex: number;
  viewRoundIndex: number;
  roundSnapshots: (RoundSnapshot | null)[];

  revealedAnswers: number[];
  wrongAnswers: number[];
  strikes: number;

  activeTeam: 1 | 2;
  team1Score: number;
  team2Score: number;

  isStealPhase: boolean;

  roundStatus: 'active' | 'ended';
  roundWinner: 1 | 2 | null;
  roundPoints: number;

  actionHistory: Action[];

  finalScoresRevealed: boolean;
  endedWithUnrevealedAnswers: boolean;
  gameStarted: boolean;

  updatedAt: number;
}

export function createInitialState(rounds: Round[]): GameState {
  return {
    rounds,
    currentRoundIndex: 0,
    viewRoundIndex: 0,
    roundSnapshots: rounds.map(() => null),
    revealedAnswers: [],
    wrongAnswers: [],
    strikes: 0,
    activeTeam: 1,
    team1Score: 0,
    team2Score: 0,
    isStealPhase: false,
    roundStatus: 'active',
    roundWinner: null,
    roundPoints: 0,
    actionHistory: [],
    finalScoresRevealed: false,
    endedWithUnrevealedAnswers: false,
    gameStarted: false,
    updatedAt: Date.now(),
  };
}
