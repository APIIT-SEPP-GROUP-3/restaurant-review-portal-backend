import prisma from "../config/prisma.js";

interface CreateMenuItemInput {
  menuCategoryId: number;
  name: string;
  description?: string;
  price: number;
  isAvailable?: boolean;
}

export const createMenuItem = async (
  restaurantId: number,
  userId: number,
  userRole: string,
  data: CreateMenuItemInput
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

  const menuCategory = await prisma.menuCategory.findUnique({
    where: {
      id: data.menuCategoryId,
    },
  });

  if (!menuCategory) {
    throw new Error("MENU_CATEGORY_NOT_FOUND");
  }

  if (menuCategory.restaurantId !== restaurantId) {
    throw new Error("INVALID_MENU_CATEGORY");
  }

  return prisma.menuItem.create({
    data: {
      restaurantId,
      menuCategoryId: data.menuCategoryId,
      name: data.name.trim(),
      description: data.description?.trim(),
      price: data.price,
      isAvailable: data.isAvailable ?? true,
    },
  });
};
export const getMenuItemsByRestaurant = async (
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

  return prisma.menuItem.findMany({
    where: {
      restaurantId,
    },
    include: {
      menuCategory: true,
      images: true,
    },
    orderBy: [
      {
        menuCategory: {
          displayOrder: "asc",
        },
      },
      {
        name: "asc",
      },
    ],
  });
};