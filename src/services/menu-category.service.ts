import prisma from "../config/prisma.js";

interface CreateMenuCategoryInput {
  name: string;
  displayOrder?: number;
}

export const createMenuCategory = async (
  restaurantId: number,
  userId: number,
  userRole: string,
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
    userRole !== "ADMIN" &&
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