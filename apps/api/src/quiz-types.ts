export type QuizCard = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  type: "minor" | "origin";
  thumbnailUrl?: string;
  accentColor?: string;
  field?: string;
  originDetail: {
    creator?: string;
    originYear?: number;
    platform?: string;
    description: string;
  };
};

export type QuizCardConfig = {
  id: string;
  memeId: string;
  field: string;
  enabled: boolean;
  sortOrder: number;
  updatedAt: string;
};

export type QuizLog = {
  id: string;
  sessionId: string;
  cardId: string;
  cardType: "minor" | "origin";
  response: "start" | "know" | "dont_know" | "view_detail" | "view_media" | "helpful" | "not_helpful" | "complete" | "open_meme" | "open_service";
  runId?: string;
  step?: number;
  destination?: string;
  timestamp: string;
};

export type QuizSurveyOption = {
  id: string;
  label: string;
};

export type QuizSurveyQuestion = {
  id: string;
  prompt: string;
  required: boolean;
  multiple?: boolean;
  sortOrder: number;
  updatedAt: string;
  options: QuizSurveyOption[];
};

export const QUIZ_EXPERIENCE_CHECKLIST: QuizSurveyQuestion = {
  id: "quiz-experience-checklist-v1",
  prompt: "해당되는 경험을 모두 선택해 주세요.",
  required: false,
  multiple: true,
  sortOrder: -1,
  updatedAt: "2026-07-22T00:00:00.000Z",
  options: [
    { id: "saw-unfamiliar-meme", label: "나는 이해 못한 밈을 본 적이 있다." },
    { id: "searched-original", label: "나는 밈이나 챌린지의 원본을 찾은 적이 있다." },
    { id: "checked-outdated-meme", label: "나는 유행이 다 지난 밈을 피하려고 찾아본 적이 있다." },
    { id: "searched-origin-story", label: "나는 밈·챌린지의 원본이나 유래를 찾아본 적이 있다." },
  ],
};

export type QuizSurveyAnswer = {
  id: string;
  sessionId: string;
  runId: string;
  questionId: string;
  optionId: string;
  questionPrompt: string;
  optionLabel: string;
  timestamp: string;
};

export type QuizSurveySubmission = {
  sessionId: string;
  runId: string;
  questionId: string;
  questionPrompt: string;
  timestamp: string;
};

export type QuizLogDocument = {
  logs: QuizLog[];
  cards?: QuizCardConfig[];
};
