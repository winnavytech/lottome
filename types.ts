
export interface Winner {
  id: string;
  name: string;
  timestamp: number;
  cheerMessage?: string;
}

export interface Settings {
  removeAfterPick: boolean;
  soundEnabled: boolean;
  autoAI: boolean;
}
