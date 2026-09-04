import prisma from "../config/prisma.js";
import { ROLES, type Role } from "../constants/roles.js";

interface CreateReviewCommentInput {
  commentText: string;
  parentCommentId?: number;
}

export const createReviewComment = async (
  reviewId: number,
  userId: number,
  userRole: Role,
  data: CreateReviewCommentInput
) => {
  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
    include: {
      restaurant: true,
    },
  });

  if (!review) {
    throw new Error("REVIEW_NOT_FOUND");
  }

  if (review.moderationStatus !== "APPROVED") {
    throw new Error("REVIEW_NOT_APPROVED");
  }

  // Restaurant owners can only respond to reviews
  // belonging to restaurants they own.
  if (
    userRole === ROLES.RESTAURANT_OWNER &&
    review.restaurant.ownerId !== userId
  ) {
    throw new Error("FORBIDDEN");
  }

  if (data.parentCommentId) {
    const parentComment = await prisma.reviewComment.findUnique({
      where: {
        id: data.parentCommentId,
      },
    });

    if (!parentComment) {
      throw new Error("PARENT_COMMENT_NOT_FOUND");
    }

    if (parentComment.reviewId !== reviewId) {
      throw new Error("INVALID_PARENT_COMMENT");
    }
  }

  return prisma.reviewComment.create({
    data: {
      reviewId,
      userId,
      parentCommentId: data.parentCommentId,
      commentText: data.commentText.trim(),
      moderationStatus: "PENDING",
    },
  });
};

export const getApprovedCommentsByReview = async (
  reviewId: number
) => {
  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!review) {
    throw new Error("REVIEW_NOT_FOUND");
  }

  if (review.moderationStatus !== "APPROVED") {
    throw new Error("REVIEW_NOT_APPROVED");
  }

  return prisma.reviewComment.findMany({
    where: {
      reviewId,
      moderationStatus: "APPROVED",
      parentCommentId: null,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: {
            select: {
              roleName: true,
            },
          },
        },
      },
      replies: {
        where: {
          moderationStatus: "APPROVED",
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: {
                select: {
                  roleName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};
