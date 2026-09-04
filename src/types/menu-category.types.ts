export interface CreateMenuCategoryInput {
  name: string;
  displayOrder?: number;
}

export interface UpdateMenuCategoryInput {
  name?: string;
  displayOrder?: number;
}
