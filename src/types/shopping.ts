export interface ShoppingListSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count: { items: number };
}

export interface ShoppingListItem {
  id: string;
  originalText: string;
  normalizedName?: string | null;
  quantity?: string | null;
  unit?: string | null;
  note?: string | null;
  checked: boolean;
  createdAt: string;
  updatedAt: string;
  recipe?: { id: string; title: string } | null;
}

export interface ShoppingListDetail {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  items: ShoppingListItem[];
}

export interface ShoppingListsResponse {
  success: boolean;
  lists: ShoppingListSummary[];
}

export interface ShoppingListResponse {
  success: boolean;
  list: ShoppingListDetail;
}

