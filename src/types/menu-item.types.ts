export interface CreateMenuItemInput {
  menuCategoryId: number;
  name: string;
  description?: string;
  price: number;
  isAvailable?: boolean;
}

export interface UpdateMenuItemInput {
  menuCategoryId?: number;
  name?: string;
  description?: string;
  price?: number;
  isAvailable?: boolean;
}

export interface MenuItemSearchFilters {
  search?: string;
  restaurantId?: number;
  menuCategoryId?: number;
  isAvailable?: boolean;
  page: number;
  limit: number;
  sortBy: "name" | "price" | "createdAt";
  sortOrder: "asc" | "desc";
}
