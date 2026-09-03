import prisma from "../config/prisma.js";

interface RatingInput {
  ratingTypeId: number;
  ratingValue: number;
}

interface CreateReviewInput {
  restaurantId: number;
  menuItemId?: number;
  title?: string;
  reviewText: string;
  ratings: RatingInput[];
}

export const createReview = async (
  userId: number,
  data: CreateReviewInput
) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id: data.restaurantId,
    },
  });

  if (!restaurant) {
    throw new Error("RESTAURANT_NOT_FOUND");
  }

  if (restaurant.status !== "ACTIVE") {
    throw new Error("RESTAURANT_NOT_ACTIVE");
  }

  if (data.menuItemId) {
    const menuItem = await prisma.menuItem.findUnique({
      where: {
        id: data.menuItemId,
      },
    });

    if (!menuItem) {
      throw new Error("MENU_ITEM_NOT_FOUND");
    }

    if (menuItem.restaurantId !== data.restaurantId) {
      throw new Error("INVALID_MENU_ITEM");
    }
  }

  const ratingTypeIds = data.ratings.map(
    (rating) => rating.ratingTypeId
  );

  const uniqueRatingTypeIds = new Set(ratingTypeIds);

  if (uniqueRatingTypeIds.size !== ratingTypeIds.length) {
    throw new Error("DUPLICATE_RATING_TYPE");
  }

  const ratingTypes = await prisma.ratingType.findMany({
    where: {
      id: {
        in: ratingTypeIds,
      },
      isActive: true,
    },
  });

  if (ratingTypes.length !== ratingTypeIds.length) {
    throw new Error("INVALID_RATING_TYPE");
  }

  const overallRating =
    data.ratings.reduce(
      (total, rating) => total + rating.ratingValue,
      0
    ) / data.ratings.length;

  return prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        userId,
        restaurantId: data.restaurantId,
        menuItemId: data.menuItemId,
        title: data.title?.trim(),
        reviewText: data.reviewText.trim(),
        overallRating,
        moderationStatus: "PENDING",
      },
    });

    await tx.reviewRating.createMany({
      data: data.ratings.map((rating) => ({
        reviewId: review.id,
        ratingTypeId: rating.ratingTypeId,
        ratingValue: rating.ratingValue,
      })),
    });

    return tx.review.findUnique({
      where: {
        id: review.id,
      },
      include: {
        ratings: {
          include: {
            ratingType: true,
          },
        },
      },
    });
  });
};

export const getApprovedReviewsByRestaurant = async (
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

  return prisma.review.findMany({
    where: {
      restaurantId,
      moderationStatus: "APPROVED",
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      menuItem: {
        select: {
          id: true,
          name: true,
        },
      },
      ratings: {
        include: {
          ratingType: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};