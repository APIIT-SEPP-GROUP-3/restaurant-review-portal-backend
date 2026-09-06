export interface CreateRestaurantInput {
  name: string;
  description?: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: string;
}

export interface UpdateRestaurantInput {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: string;
}

export interface RestaurantSearchFilters {
  search?: string;
  city?: string;
  categoryId?: number;
  page: number;
  limit: number;
  sortBy: "name" | "city" | "createdAt";
  sortOrder: "asc" | "desc";
}
