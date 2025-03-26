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

export interface ChapterPerformance {
  chapter: string;
  subject: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface TopicPerformance {
  topic: string;
  chapter: string;
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

export interface DetailedQuizReport {
  overallPerformance: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unattempted: number;
    score: number;
    maxScore: number;
    percentage: number;
    timeSpent: number; // in seconds
  };
  subjectWisePerformance: SubjectPerformance[];
  chapterWisePerformance: ChapterPerformance[];
  topicWisePerformance: TopicPerformance[];
  difficultyWisePerformance: DifficultyPerformance[];
  questionTypePerformance: QuestionTypePerformance[];
}