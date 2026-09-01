import prisma from "../config/prisma.js";
import { ROLES, Role } from "../constants/roles.js";

interface CreateRestaurantImageInput {
  imageUrl: string;
  altText?: string;
  isPrimary?: boolean;
}

export const createRestaurantImage = async (
  restaurantId: number,
  userId: number,
  userRole: Role,
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
    userRole !== ROLES.ADMIN &&
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

export const deleteRestaurantImage = async (
  restaurantId: number,
  imageId: number,
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

  if (userRole !== ROLES.ADMIN && restaurant.ownerId !== userId) {
    throw new Error("FORBIDDEN");
  }

  const image = await prisma.restaurantImage.findFirst({
    where: {
      id: imageId,
      restaurantId,
    },
  });

  if (!image) {
    throw new Error("IMAGE_NOT_FOUND");
  }

  return prisma.restaurantImage.delete({
    where: {
      id: imageId,
    },
  });
};
