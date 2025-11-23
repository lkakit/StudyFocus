export interface SessionConfig {
  workTime: number;    // in seconds
  breakTime: number;   // in seconds
  longBreakTime: number; // in seconds
  rounds: number;
  roundsUntilLongBreak: number; // usually 4
}

export interface Session {
  type: 'work' | 'break' | 'longBreak';
  duration: number;    // in seconds
  round: number;       // current round number
  totalRounds: number;
}

export interface SessionProgress {
  currentSession: Session;
  completedRounds: number;
  isCompleted: boolean;
}