export type QuizCard = {
  id: string;
  title: string;
  summary: string;
  type: "minor" | "origin";
  thumbnailUrl: string;
  accentColor?: string;
  originDetail: {
    creator?: string;
    originYear?: number;
    platform?: string;
    description: string;
  };
};

export type QuizLog = {
  id: string;
  sessionId: string;
  cardId: string;
  cardType: "minor" | "origin";
  response: "know" | "dont_know" | "view_detail";
  timestamp: string;
};

export type QuizLogDocument = {
  logs: QuizLog[];
};
