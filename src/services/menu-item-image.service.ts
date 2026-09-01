import prisma from "../config/prisma.js";

interface CreateMenuItemImageInput {
  imageUrl: string;
  altText?: string;
  isPrimary?: boolean;
}

export const createMenuItemImage = async (
  menuItemId: number,
  userId: number,
  userRole: string,
  data: CreateMenuItemImageInput
) => {
  const menuItem = await prisma.menuItem.findUnique({
    where: {
      id: menuItemId,
    },
    include: {
      restaurant: true,
    },
  });

  if (!menuItem) {
    throw new Error("MENU_ITEM_NOT_FOUND");
  }

  if (
    userRole !== "ADMIN" &&
    menuItem.restaurant.ownerId !== userId
  ) {
    throw new Error("FORBIDDEN");
  }

  if (data.isPrimary) {
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
      imageUrl: data.imageUrl,
      altText: data.altText?.trim(),
      isPrimary: data.isPrimary ?? false,
    },
  });
};