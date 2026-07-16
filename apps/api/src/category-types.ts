export type Category = {
  id: string;
  slug: string;
  label: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CategoryDocument = { items: Category[] };

export type CategoryInput = Pick<
  Category,
  "slug" | "label" | "description" | "sortOrder" | "isActive"
>;
