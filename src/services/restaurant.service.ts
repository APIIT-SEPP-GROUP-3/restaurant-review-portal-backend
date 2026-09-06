import prisma from "../config/prisma.js";
import { ROLES, Role } from "../constants/roles.js";
import type {
  CreateRestaurantInput,
  RestaurantSearchFilters,
  UpdateRestaurantInput,
} from "../types/restaurant.types.js";

export const createRestaurant = async (
  ownerId: number,
  data: CreateRestaurantInput
) => {
  return prisma.restaurant.create({
    data: {
      ownerId,
      name: data.name,
      description: data.description,
      address: data.address,
      city: data.city,
      phone: data.phone,
      email: data.email,
      website: data.website,
      openingHours: data.openingHours,
    },
  });
};

export const getRestaurantById = async (id: number) => {
  return prisma.restaurant.findUnique({
    where: {
      id,
    },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      categories: {
        include: {
          category: true,
        },
      },
      images: true,
      menuCategories: true,
      menuItems: true,
    },
  });
};

export const updateRestaurant = async (
  restaurantId: number,
  userId: number,
  userRole: Role,
  data: UpdateRestaurantInput
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

  return prisma.restaurant.update({
    where: {
      id: restaurantId,
    },
    data,
  });
};

export const getRestaurants = async (
  filters: RestaurantSearchFilters
) => {
  const skip = (filters.page - 1) * filters.limit;

  const where = {
    status: "ACTIVE" as const,

    ...(filters.search && {
      OR: [
        {
          name: {
            contains: filters.search,
            mode: "insensitive" as const,
          },
        },
        {
          description: {
            contains: filters.search,
            mode: "insensitive" as const,
          },
        },
        {
          menuItems: {
            some: {
              name: {
                contains: filters.search,
                mode: "insensitive" as const,
              },
            },
          },
        },
      ],
    }),

    ...(filters.city && {
      city: {
        equals: filters.city,
        mode: "insensitive" as const,
      },
    }),

    ...(filters.categoryId && {
      categories: {
        some: {
          categoryId: filters.categoryId,
        },
      },
    }),
  };

  const [restaurants, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,

      include: {
        categories: {
          include: {
            category: true,
          },
        },

        images: {
          where: {
            isPrimary: true,
          },
        },
      },

      orderBy: {
        [filters.sortBy]: filters.sortOrder,
      },

      skip,
      take: filters.limit,
    }),

    prisma.restaurant.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / filters.limit);

  return {
    restaurants,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages,
    },
  };
};
