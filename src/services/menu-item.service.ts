import prisma from "../config/prisma.js";
import { ROLES, Role } from "../constants/roles.js";

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
  userRole: Role,
  data: CreateMenuItemInput,
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

export const getMenuItemsByRestaurant = async (restaurantId: number) => {
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

export const getMenuItemById = async (id: number) => {
  return prisma.menuItem.findUnique({
    where: {
      id,
    },
    include: {
      menuCategory: true,
      restaurant: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
      images: true,
    },
  });
};

interface UpdateMenuItemInput {
  menuCategoryId?: number;
  name?: string;
  description?: string;
  price?: number;
  isAvailable?: boolean;
}

export const updateMenuItem = async (
  menuItemId: number,
  userId: number,
  userRole: Role,
  data: UpdateMenuItemInput
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
    userRole !== ROLES.ADMIN &&
    menuItem.restaurant.ownerId !== userId
  ) {
    throw new Error("FORBIDDEN");
  }

  if (data.menuCategoryId !== undefined) {
    const menuCategory = await prisma.menuCategory.findUnique({
      where: {
        id: data.menuCategoryId,
      },
    });

    if (!menuCategory) {
      throw new Error("MENU_CATEGORY_NOT_FOUND");
    }

    if (menuCategory.restaurantId !== menuItem.restaurantId) {
      throw new Error("INVALID_MENU_CATEGORY");
    }
  }

  return prisma.menuItem.update({
    where: {
      id: menuItemId,
    },
    data: {
      ...(data.menuCategoryId !== undefined && {
        menuCategoryId: data.menuCategoryId,
      }),
      ...(data.name !== undefined && {
        name: data.name.trim(),
      }),
      ...(data.description !== undefined && {
        description: data.description.trim(),
      }),
      ...(data.price !== undefined && {
        price: data.price,
      }),
      ...(data.isAvailable !== undefined && {
        isAvailable: data.isAvailable,
      }),
    },
  });
};

export const updateMenuItemAvailability = async (
  menuItemId: number,
  userId: number,
  userRole: Role,
  isAvailable: boolean
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
    userRole !== ROLES.ADMIN &&
    menuItem.restaurant.ownerId !== userId
  ) {
    throw new Error("FORBIDDEN");
  }

  return prisma.menuItem.update({
    where: {
      id: menuItemId,
    },
    data: {
      isAvailable,
    },
  });
};

interface MenuItemSearchFilters {
  search?: string;
  restaurantId?: number;
  menuCategoryId?: number;
  isAvailable?: boolean;
}

export const getMenuItems = async (
  filters: MenuItemSearchFilters
) => {
  return prisma.menuItem.findMany({
    where: {
      ...(filters.search && {
        OR: [
          {
            name: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
        ],
      }),

      ...(filters.restaurantId && {
        restaurantId: filters.restaurantId,
      }),

      ...(filters.menuCategoryId && {
        menuCategoryId: filters.menuCategoryId,
      }),

      ...(filters.isAvailable !== undefined && {
        isAvailable: filters.isAvailable,
      }),

      restaurant: {
        status: "ACTIVE",
      },
    },

    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },

      menuCategory: true,

      images: {
        where: {
          isPrimary: true,
        },
      },
    },

    orderBy: {
      name: "asc",
    },
  });
};