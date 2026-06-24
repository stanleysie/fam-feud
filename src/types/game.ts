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
  strikes: number;

  activeTeam: 1 | 2;
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;

  isStealPhase: boolean;

  roundStatus: 'active' | 'ended';
  roundWinner: 1 | 2 | null;
  roundPoints: number;

  actionHistory: Action[];

  finalScoresRevealed: boolean;
  gameStarted: boolean;

  schemaVersion?: number;
  updatedAt: number;
}

export function createInitialState(rounds: Round[]): GameState {
  return {
    rounds,
    currentRoundIndex: 0,
    viewRoundIndex: 0,
    roundSnapshots: rounds.map(() => null),
    revealedAnswers: [],
    strikes: 0,
    activeTeam: 1,
    team1Name: 'Team 1',
    team2Name: 'Team 2',
    team1Score: 0,
    team2Score: 0,
    isStealPhase: false,
    roundStatus: 'active',
    roundWinner: null,
    roundPoints: 0,
    actionHistory: [],
    finalScoresRevealed: false,
    gameStarted: false,
    updatedAt: Date.now(),
  };
}
