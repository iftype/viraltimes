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

export type QuizLogDocument = {
  logs: QuizLog[];
  cards?: QuizCardConfig[];
};
