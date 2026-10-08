import { afterAll, afterEach, beforeEach, jest } from "@jest/globals";

export const r2 = {
  generatePresignedUploadUrl: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  r2ObjectExists: jest.fn<(key: string) => Promise<boolean>>(),
  deleteR2Object: jest.fn<(key: string) => Promise<void>>(),
  getPublicR2Url: jest.fn<(key: string) => string>(),
};

// Register before app imports: even the R2 client configuration is never loaded.
jest.unstable_mockModule("../../src/services/r2.service.js", () => r2);

const { default: prisma } = await import("../../src/config/prisma.js");
const { prisma: secondaryPrisma } = await import("../../src/lib/prisma.js");

export async function resetDatabase() {
  if (process.env.NODE_ENV !== "test" || process.env.DATABASE_URL !== process.env.TEST_DATABASE_URL) {
    throw new Error("Refusing database cleanup outside the test environment");
  }
  // Explicit tables in one statement handle all foreign keys, including comment replies.
  // Do not CASCADE into unrelated tables or touch Prisma's migration history.
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "review_comment", "review_rating", "review", "menu_item_image", "restaurant_image", "menu_item", "menu_category", "restaurant_category_mapping", "restaurant_category", "restaurant", "rating_type", "user", "role" RESTART IDENTITY`);
}

beforeEach(async () => {
  await resetDatabase();
  jest.clearAllMocks();
  r2.r2ObjectExists.mockResolvedValue(true);
  r2.deleteR2Object.mockResolvedValue(undefined);
  r2.getPublicR2Url.mockImplementation((key) => `https://images.example.test/${key}`);
  r2.generatePresignedUploadUrl.mockResolvedValue({ uploadUrl: "https://upload.example.test", expiresIn: 600 });
});
afterEach(resetDatabase);
afterAll(async () => {
  await Promise.all([prisma.$disconnect(), secondaryPrisma.$disconnect()]);
});
