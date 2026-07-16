export type ProposalSection =
  | "origin"
  | "trending"
  | "related"
  | "timeline"
  | "description";

export type ProposalComment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

export type Proposal = {
  id: string;
  memeId: string;
  memeTitle: string;
  section: ProposalSection;
  author: string;
  body: string;
  evidenceUrl?: string;
  createdAt: string;
  agree: number;
  disagree: number;
  comments: ProposalComment[];
};

const proposalStorageKey = "origin-proposals-v1";
export const proposalUpdateEvent = "origin-proposals-updated";

export const proposalSectionLabels: Record<ProposalSection, string> = {
  origin: "현재 확인된 원본",
  trending: "유행을 크게 만든 영상",
  related: "관련 영상",
  timeline: "시작부터 유행까지",
  description: "밈 설명",
};

export function readProposals() {
  if (typeof window === "undefined") return [] as Proposal[];

  try {
    return JSON.parse(
      window.localStorage.getItem(proposalStorageKey) ?? "[]",
    ) as Proposal[];
  } catch {
    return [] as Proposal[];
  }
}

export function getProposalSnapshot() {
  return window.localStorage.getItem(proposalStorageKey) ?? "[]";
}

export function subscribeToProposals(listener: () => void) {
  window.addEventListener(proposalUpdateEvent, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(proposalUpdateEvent, listener);
    window.removeEventListener("storage", listener);
  };
}

export function writeProposals(proposals: Proposal[]) {
  window.localStorage.setItem(proposalStorageKey, JSON.stringify(proposals));
  window.dispatchEvent(new CustomEvent(proposalUpdateEvent));
}

export function makeLocalId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
