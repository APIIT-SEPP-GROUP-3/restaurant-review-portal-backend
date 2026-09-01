import prisma from "../config/prisma.js";

interface CreateRestaurantImageInput {
  imageUrl: string;
  altText?: string;
  isPrimary?: boolean;
}

export const createRestaurantImage = async (
  restaurantId: number,
  userId: number,
  userRole: string,
  data: CreateRestaurantImageInput
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

  if (data.isPrimary) {
    await prisma.restaurantImage.updateMany({
      where: {
        restaurantId,
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });
  }

  return prisma.restaurantImage.create({
    data: {
      restaurantId,
      imageUrl: data.imageUrl,
      altText: data.altText?.trim(),
      isPrimary: data.isPrimary ?? false,
    },
  });
};