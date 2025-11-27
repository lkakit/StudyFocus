export type WorkflowType = 'pomodoro' | 'university' | '52-17' | 'custom';

export interface SessionConfig {
  taskTitle: string;
  workTime: number;    // in seconds
  breakTime: number;   // in seconds
  longBreakTime: number; // in seconds
  rounds: number;
  roundsUntilLongBreak: number; // default 4
  workflowType: WorkflowType; 
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
  totalElapsedTime: number; 
  actualCompletedRounds: number;
}

export interface HistoryItem {
  id: string;
  taskName: string;
  date: Date;
  duration: number; // in seconds
  completedRounds: number;
  totalRounds: number;
  sessionConfig: SessionConfig;
  totalElapsedTime: number; 
  completionPercentage: number;
}

export interface HistoryState {
  items: HistoryItem[];
}