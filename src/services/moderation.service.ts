import prisma from "../config/prisma.js";
import { ReviewStatus } from "../generated/prisma/client.js";

export const getReviewsForModeration = async (
  status: ReviewStatus
) => {
  return prisma.review.findMany({
    where: {
      moderationStatus: status,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      restaurant: {
        select: {
          id: true,
          name: true,
          city: true,
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
      createdAt: "asc",
    },
  });
};