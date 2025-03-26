export interface SubjectPerformance {
  subject: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface DifficultyPerformance {
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface QuestionTypePerformance {
  questionType: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface RecentPerformance {
  quizId: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  submittedAt: string;
}

export interface TimeSpentAnalysis {
  totalTimeSpent: number;
  averageTimePerQuiz: number;
  averageTimePerQuestion: number;
}

export interface StudentAnalytics {
  totalAttempts: number;
  averageScore: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  subjectPerformance: SubjectPerformance[];
  difficultyPerformance: DifficultyPerformance[];
  questionTypePerformance: QuestionTypePerformance[];
  recentPerformance: RecentPerformance[];
  timeSpentAnalysis: TimeSpentAnalysis;
}