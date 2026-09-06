import prisma from "../config/prisma.js";
import { ROLES, Role } from "../constants/roles.js";
import type { CreateRestaurantCategoryInput } from "../types/restaurant-category.types.js";

export const getAllRestaurantCategories = async () => {
  return prisma.restaurantCategory.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

export const assignCategoriesToRestaurant = async (
  restaurantId: number,
  categoryIds: number[],
  userId: number,
  userRole: Role
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

  const categories = await prisma.restaurantCategory.findMany({
    where: {
      id: {
        in: categoryIds,
      },
    },
  });

  if (categories.length !== categoryIds.length) {
    throw new Error("INVALID_CATEGORY");
  }

  await prisma.restaurantCategoryMapping.deleteMany({
    where: {
      restaurantId,
    },
  });

  await prisma.restaurantCategoryMapping.createMany({
    data: categoryIds.map((categoryId) => ({
      restaurantId,
      categoryId,
    })),
  });

  return prisma.restaurant.findUnique({
    where: {
      id: restaurantId,
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });
};

export const createRestaurantCategory = async (
  data: CreateRestaurantCategoryInput
) => {
  const existingCategory =
    await prisma.restaurantCategory.findUnique({
      where: {
        name: data.name.trim(),
      },
    });

  if (existingCategory) {
    throw new Error("CATEGORY_ALREADY_EXISTS");
  }

  return prisma.restaurantCategory.create({
    data: {
      name: data.name.trim(),
      description: data.description?.trim(),
    },
  });
};
