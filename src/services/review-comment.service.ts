import prisma from "../config/prisma.js";

interface CreateReviewCommentInput {
  commentText: string;
  parentCommentId?: number;
}

export const createReviewComment = async (
  reviewId: number,
  userId: number,
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

  if (data.parentCommentId) {
    const parentComment =
      await prisma.reviewComment.findUnique({
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