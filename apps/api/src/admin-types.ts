export const inboxCategories = [
  "meme_request",
  "origin_tip",
  "feedback",
  "proposal",
  "report",
] as const;

export const inboxStatuses = ["new", "review", "resolved", "rejected"] as const;

export type InboxCategory = (typeof inboxCategories)[number];
export type InboxStatus = (typeof inboxStatuses)[number];

export type InboxItem = {
  id: string;
  category: InboxCategory;
  status: InboxStatus;
  title: string;
  author: string;
  description: string;
  sourceUrl?: string;
  subjectId?: string;
  createdAt: string;
  updatedAt: string;
};

export type InboxDocument = {
  items: InboxItem[];
};
