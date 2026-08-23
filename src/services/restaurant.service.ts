import prisma from "../config/prisma.js";

interface CreateRestaurantInput {
  name: string;
  description?: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: string;
}

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