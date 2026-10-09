import prisma from "../config/prisma.js";

import { ROLES } from "../constants/roles.js";

import {
  deleteR2Object,
  generatePresignedUploadUrl,
  getPublicR2Url,
  r2ObjectExists,
} from "./r2.service.js";

import type { Role } from "../constants/roles.js";

import type {
  PresignImageUploadInput,
  SaveUploadedImageInput,
} from "../validators/image-upload.validator.js";

const verifyRestaurantOwnership = async (
  restaurantId: number,
  userId: number,
  userRole: Role,
) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id: restaurantId,
    },
    select: {
      id: true,
      ownerId: true,
    },
  });

  if (!restaurant) {
    throw new Error("RESTAURANT_NOT_FOUND");
  }

  if (userRole !== ROLES.RESTAURANT_OWNER || restaurant.ownerId !== userId) {
    throw new Error("FORBIDDEN");
  }

  return restaurant;
};

const getOwnedMenuItem = async (
  menuItemId: number,
  userId: number,
  userRole: Role,
) => {
  const menuItem = await prisma.menuItem.findUnique({
    where: {
      id: menuItemId,
    },
    include: {
      restaurant: {
        select: {
          id: true,
          ownerId: true,
        },
      },
    },
  });

  if (!menuItem) {
    throw new Error("MENU_ITEM_NOT_FOUND");
  }

  if (userRole !== ROLES.RESTAURANT_OWNER || menuItem.restaurant.ownerId !== userId) {
    throw new Error("FORBIDDEN");
  }

  return menuItem;
};

/* -------------------------------- */
/* RESTAURANT PRESIGN               */
/* -------------------------------- */

export const generateRestaurantImagePresignedUrl = async (
  restaurantId: number,
  userId: number,
  userRole: Role,
  input: PresignImageUploadInput,
) => {
  await verifyRestaurantOwnership(restaurantId, userId, userRole);

  return generatePresignedUploadUrl({
    directory: `restaurants/${restaurantId}`,
    fileName: input.fileName,
    contentType: input.contentType,
  });
};

/* -------------------------------- */
/* MENU ITEM PRESIGN                */
/* -------------------------------- */

export const generateMenuItemImagePresignedUrl = async (
  menuItemId: number,
  userId: number,
  userRole: Role,
  input: PresignImageUploadInput,
) => {
  await getOwnedMenuItem(menuItemId, userId, userRole);

  return generatePresignedUploadUrl({
    directory: `menu-items/${menuItemId}`,
    fileName: input.fileName,
    contentType: input.contentType,
  });
};

/* -------------------------------- */
/* SAVE RESTAURANT IMAGE            */
/* -------------------------------- */

export const saveRestaurantImage = async (
  restaurantId: number,
  userId: number,
  userRole: Role,
  input: SaveUploadedImageInput,
) => {
  await verifyRestaurantOwnership(restaurantId, userId, userRole);

  const expectedPrefix = `restaurants/${restaurantId}/`;

  if (!input.objectKey.startsWith(expectedPrefix)) {
    throw new Error("INVALID_OBJECT_KEY");
  }

  const exists = await r2ObjectExists(input.objectKey);

  if (!exists) {
    throw new Error("R2_OBJECT_NOT_FOUND");
  }

  if (input.isPrimary) {
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
      objectKey: input.objectKey,
      imageUrl: getPublicR2Url(input.objectKey),
      altText: input.altText,
      isPrimary: input.isPrimary,
    },
  });
};

/* -------------------------------- */
/* SAVE MENU ITEM IMAGE             */
/* -------------------------------- */

export const saveMenuItemImage = async (
  menuItemId: number,
  userId: number,
  userRole: Role,
  input: SaveUploadedImageInput,
) => {
  await getOwnedMenuItem(menuItemId, userId, userRole);

  const expectedPrefix = `menu-items/${menuItemId}/`;

  if (!input.objectKey.startsWith(expectedPrefix)) {
    throw new Error("INVALID_OBJECT_KEY");
  }

  const exists = await r2ObjectExists(input.objectKey);

  if (!exists) {
    throw new Error("R2_OBJECT_NOT_FOUND");
  }

  if (input.isPrimary) {
    await prisma.menuItemImage.updateMany({
      where: {
        menuItemId,
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });
  }

  return prisma.menuItemImage.create({
    data: {
      menuItemId,
      objectKey: input.objectKey,
      imageUrl: getPublicR2Url(input.objectKey),
      altText: input.altText,
      isPrimary: input.isPrimary,
    },
  });
};

/* -------------------------------- */
/* DELETE RESTAURANT IMAGE          */
/* -------------------------------- */

export const deleteRestaurantImage = async (
  restaurantId: number,
  imageId: number,
  userId: number,
  userRole: Role,
) => {
  await verifyRestaurantOwnership(restaurantId, userId, userRole);

  const image = await prisma.restaurantImage.findFirst({
    where: {
      id: imageId,
      restaurantId,
    },
  });

  if (!image) {
    throw new Error("IMAGE_NOT_FOUND");
  }

  if (image.objectKey) {
    await deleteR2Object(image.objectKey);
  }

  await prisma.restaurantImage.delete({
    where: {
      id: imageId,
    },
  });
};

/* -------------------------------- */
/* DELETE MENU ITEM IMAGE           */
/* -------------------------------- */

export const deleteMenuItemImage = async (
  menuItemId: number,
  imageId: number,
  userId: number,
  userRole: Role,
) => {
  await getOwnedMenuItem(menuItemId, userId, userRole);

  const image = await prisma.menuItemImage.findFirst({
    where: {
      id: imageId,
      menuItemId,
    },
  });

  if (!image) {
    throw new Error("IMAGE_NOT_FOUND");
  }

  if (image.objectKey) {
    await deleteR2Object(image.objectKey);
  }

  await prisma.menuItemImage.delete({
    where: {
      id: imageId,
    },
  });
};
