import prisma from "../config/prisma.js";
import { ReviewStatus,CommentStatus } from "../generated/prisma/client.js";

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

export const approveReview = async (
  reviewId: number,
  moderatorId: number
) => {
  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!review) {
    throw new Error("REVIEW_NOT_FOUND");
  }

  if (review.moderationStatus !== "PENDING") {
    throw new Error("REVIEW_NOT_PENDING");
  }

  return prisma.review.update({
    where: {
      id: reviewId,
    },
    data: {
      moderationStatus: "APPROVED",
      moderatedBy: moderatorId,
      moderatedAt: new Date(),
      rejectionReason: null,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      restaurant: {
        select: {
          id: true,
          name: true,
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
  });
};

export const rejectReview = async (
  reviewId: number,
  moderatorId: number,
  rejectionReason: string
) => {
  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!review) {
    throw new Error("REVIEW_NOT_FOUND");
  }

  if (review.moderationStatus !== "PENDING") {
    throw new Error("REVIEW_NOT_PENDING");
  }

  return prisma.review.update({
    where: {
      id: reviewId,
    },
    data: {
      moderationStatus: "REJECTED",
      moderatedBy: moderatorId,
      moderatedAt: new Date(),
      rejectionReason: rejectionReason.trim(),
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      restaurant: {
        select: {
          id: true,
          name: true,
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
  });
};

export const getCommentsForModeration = async (
  status: CommentStatus
) => {
  return prisma.reviewComment.findMany({
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
          role: {
            select: {
              roleName: true,
            },
          },
        },
      },

      review: {
        select: {
          id: true,
          title: true,
          reviewText: true,
          restaurant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },

      parentComment: {
        select: {
          id: true,
          commentText: true,
        },
      },
    },

    orderBy: {
      createdAt: "asc",
    },
  });
};