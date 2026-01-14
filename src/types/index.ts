// File: src/types/index.ts
export interface Question {
  id: string;
  word: string;
  sentence: string;
  meaning: string;
  audioUrl: string;
  options: string[];
}

export interface UserData {
  name: string;
  phone: string;
  email: string;
}

export interface ExamResult {
  id?: string;
  name: string;
  score: number;
  duration: number;
  created_at?: string;
}
