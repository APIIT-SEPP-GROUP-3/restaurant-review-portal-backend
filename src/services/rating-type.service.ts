import prisma from "../config/prisma.js";

export const getAllRatingTypes = async () => {
  return prisma.ratingType.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      displayOrder: "asc",
    },
  });
};