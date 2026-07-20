export type MemePulseVote = {
  id: string;
  memeId: string;
  sessionId: string;
  seen: boolean;
  observedOn: string;
  timestamp: string;
};

export type MemePulseDocument = { items: MemePulseVote[] };
