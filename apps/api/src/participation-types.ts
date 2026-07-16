export const participationTypes = ["comment", "proposal"] as const;
export const proposalSections = [
  "description",
  "origin",
  "trending",
  "related",
  "timeline",
] as const;

export type ParticipationType = (typeof participationTypes)[number];
export type ProposalSection = (typeof proposalSections)[number];

export type ParticipationEntry = {
  id: string;
  type: ParticipationType;
  memeId: string;
  author: string;
  body: string;
  section?: ProposalSection;
  action?: string;
  evidenceUrl?: string;
  status: "visible" | "pending" | "hidden";
  createdAt: string;
  updatedAt: string;
};

export type ParticipationDocument = { items: ParticipationEntry[] };
