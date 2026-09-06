import prisma from "../config/prisma.js";
import { ROLES, Role } from "../constants/roles.js";
import type {
  CreateMenuCategoryInput,
  UpdateMenuCategoryInput,
} from "../types/menu-category.types.js";

export const createMenuCategory = async (
  restaurantId: number,
  userId: number,
  userRole: Role,
  data: CreateMenuCategoryInput
) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id: restaurantId,
    },
  });

  if (!restaurant) {
    throw new Error("RESTAURANT_NOT_FOUND");
  }

  if (
    userRole !== ROLES.ADMIN &&
    restaurant.ownerId !== userId
  ) {
    throw new Error("FORBIDDEN");
  }

  return prisma.menuCategory.create({
    data: {
      restaurantId,
      name: data.name.trim(),
      displayOrder: data.displayOrder ?? 0,
    },
  });
};

export const getMenuCategoriesByRestaurant = async (
  restaurantId: number
) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id: restaurantId,
    },
  });

  if (!restaurant) {
    throw new Error("RESTAURANT_NOT_FOUND");
  }

  return prisma.menuCategory.findMany({
    where: {
      restaurantId,
    },
    orderBy: {
      displayOrder: "asc",
    },
  });
};

export const updateMenuCategory = async (
  menuCategoryId: number,
  userId: number,
  userRole: Role,
  data: UpdateMenuCategoryInput
) => {
  const menuCategory = await prisma.menuCategory.findUnique({
    where: {
      id: menuCategoryId,
    },
    include: {
      restaurant: true,
    },
  });

  if (!menuCategory) {
    throw new Error("MENU_CATEGORY_NOT_FOUND");
  }

  if (
    userRole !== ROLES.ADMIN &&
    menuCategory.restaurant.ownerId !== userId
  ) {
    throw new Error("FORBIDDEN");
  }

  return prisma.menuCategory.update({
    where: {
      id: menuCategoryId,
    },
    data: {
      ...(data.name !== undefined && {
        name: data.name.trim(),
      }),
      ...(data.displayOrder !== undefined && {
        displayOrder: data.displayOrder,
      }),
    },
  });
};
