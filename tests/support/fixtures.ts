import prisma from "../../src/config/prisma.js";
import { ROLES, type Role } from "../../src/constants/roles.js";
import { hashPassword } from "../../src/utils/password.js";
import { generateToken } from "../../src/utils/jwt.js";

export { prisma };
export const password = "Test-password-123!";

export async function actor(role: Role, label = role.toLowerCase()) {
  const record = await prisma.role.upsert({ where: { roleName: role }, create: { roleName: role }, update: {} });
  const user = await prisma.user.create({ data: {
    firstName: "Test", lastName: "User", email: `${label}@example.test`,
    passwordHash: await hashPassword(password), roleId: record.id,
  } });
  return { ...user, token: generateToken({ userId: user.id, role }) };
}

export async function restaurant(ownerId: number) {
  return prisma.restaurant.create({ data: { ownerId, name: "Test Restaurant", address: "123 Test Street", city: "Colombo" } });
}

export async function reviewFixture(status: "PENDING" | "APPROVED" | "REJECTED" = "PENDING") {
  const customer = await actor(ROLES.CUSTOMER);
  const owner = await actor(ROLES.RESTAURANT_OWNER);
  const place = await restaurant(owner.id);
  const category = await prisma.menuCategory.create({ data: { restaurantId: place.id, name: "Mains" } });
  const item = await prisma.menuItem.create({ data: { restaurantId: place.id, menuCategoryId: category.id, name: "Rice", price: 500 } });
  const rating = await prisma.ratingType.create({ data: { name: "Taste" } });
  const review = await prisma.review.create({ data: {
    userId: customer.id, restaurantId: place.id, menuItemId: item.id,
    reviewText: "A delicious meal", moderationStatus: status, overallRating: 4,
    ratings: { create: { ratingTypeId: rating.id, ratingValue: 4 } },
  } });
  return { customer, owner, place, item, rating, review };
}
