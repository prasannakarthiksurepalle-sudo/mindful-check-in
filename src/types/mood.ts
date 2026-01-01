export interface MoodAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  moodTag: string;
  stressScore: number;
  suggestions: string[];
  timestamp: string;
  userText?: string;
}

export interface MoodHistory {
  entries: MoodAnalysis[];
}
