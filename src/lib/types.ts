export type QuestionType = "mcq" | "short" | "long" | "subjective" | "other";

export interface SubQuestion {
  id: string;
  label: string;
  text: string;
}

export interface ExtractedQuestion {
  id: string;
  number: string;
  text: string;
  type: QuestionType;
  marks?: number;
  subQuestions?: SubQuestion[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExtractedAnswer {
  questionNumber: string;
  subQuestionLabel?: string;
  answerText: string;
  confidence: "high" | "medium" | "low";
  boundingBox?: BoundingBox;
  pageNumber?: number;
  isUnreadable?: boolean;
}

export interface MappedAnswer {
  questionId: string;
  questionNumber: string;
  questionText: string;
  subQuestionLabel?: string;
  answerText: string | null;
  status: "answered" | "unanswered" | "partial" | "unreadable";
  confidence?: "high" | "medium" | "low";
  boundingBox?: BoundingBox;
  pageNumber?: number;
  aiFeedback?: string;
}

export interface ExtractionSession {
  id: string;
  createdAt: string;
  status: "processing" | "completed" | "failed";
  questionPaperName: string;
  answerSheetName: string;
  questionPaperMime: string;
  answerSheetMime: string;
  questionPaperBase64: string;
  answerSheetBase64: string;
  questions: ExtractedQuestion[];
  mappedAnswers: MappedAnswer[];
  error?: string;
  stats: {
    totalQuestions: number;
    answered: number;
    unanswered: number;
    partial: number;
  };
}

export interface UploadFileInfo {
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
}
