// Tag system types
export interface TagSystem {
  _id: string;
  exam_types: string[];
  difficulty_levels: string[];
  question_types: string[];
  sources: string[];
  subjects: Record<string, string[]>;
  chapters: Record<string, string[]>;
  topics: Record<string, string[]>;
  hierarchy: TagHierarchy;
}

export interface TagHierarchy {
  [examType: string]: {
    [subject: string]: {
      [chapter: string]: string[];
    };
  };
}

export interface Tags {
  exam_type?: string;
  subject?: string;
  chapter?: string;
  topic?: string;
  difficulty_level?: string;
  question_type?: string;
  source?: string;
}

export interface TagUploadResponse {
  success: boolean;
  message: string;
  counts: {
    exam_types: number;
    subjects: number;
    chapters: number;
    topics: number;
  };
  tagSystem?: {
    hierarchy: TagHierarchy;
    subjects: Record<string, string[]>;
    chapters: Record<string, string[]>;
    topics: Record<string, string[]>;
  };
}