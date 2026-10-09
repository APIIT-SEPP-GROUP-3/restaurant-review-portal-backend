import type { PrismaClient } from "../src/generated/prisma/client.js";
import { hashPassword } from "../src/utils/password.js";
import { ROLES } from "../src/constants/roles.js";

import { dishImage, diningImages, dishImages } from "./demo-images.js";
import { localRestaurants } from "./local-restaurants.js";

export async function seedDemo(prisma: PrismaClient) {
  // Imported rows with explicit IDs can leave PostgreSQL sequences behind.
  // Advance counters only; preserve existing records and higher sequence values.
  await prisma.$executeRawUnsafe(`DO $$
    DECLARE entry record; maximum bigint; current_value bigint;
    BEGIN
      FOR entry IN
        SELECT table_name, pg_get_serial_sequence(format('%I.%I', table_schema, table_name), 'id') AS sequence_name
        FROM information_schema.columns
        WHERE table_schema = current_schema() AND column_name = 'id'
          AND table_name IN ('role', 'user', 'restaurant', 'restaurant_category', 'menu_category',
            'menu_item', 'restaurant_image', 'menu_item_image', 'review', 'rating_type', 'review_rating', 'review_comment')
      LOOP
        IF entry.sequence_name IS NOT NULL THEN
          EXECUTE format('SELECT max(id) FROM %I', entry.table_name) INTO maximum;
          EXECUTE format('SELECT last_value FROM %s', entry.sequence_name) INTO current_value;
          IF maximum IS NOT NULL AND maximum >= current_value THEN
            PERFORM setval(entry.sequence_name::regclass, maximum, true);
          END IF;
        END IF;
      END LOOP;
    END $$`);
  const passwordHash = await hashPassword("DemoPass123!");
  await prisma.$transaction(async (tx) => {
    const accounts = [
      ["admin", "Amaya", "Perera", ROLES.ADMIN],
      ["moderator", "Nimal", "Silva", ROLES.MODERATOR],
      ["owner", "Dilani", "Fernando", ROLES.RESTAURANT_OWNER],
      ["customer", "Kasun", "Jayasinghe", ROLES.CUSTOMER],
      ["customer2", "Anjali", "Wijesinghe", ROLES.CUSTOMER],
    ];
    const users: Record<string, number> = {};
    for (const [key, firstName, lastName, roleName] of accounts) {
      const role = await tx.role.findUniqueOrThrow({ where: { roleName } });
      const user = await tx.user.upsert({
        where: { email: `${key}@demo.example` },
        update: {},
        create: { firstName, lastName, email: `${key}@demo.example`, passwordHash, roleId: role.id },
      });
      users[key] = user.id;
    }
    const cuisines = [...new Set(localRestaurants.flatMap((restaurant) => restaurant.categories))];
    const categories: Record<string, number> = {};
    for (const name of cuisines) {
      const category = await tx.restaurantCategory.upsert({
        where: { name }, update: {}, create: { name, description: `${name} dining and menu options` },
      });
      categories[name] = category.id;
    }
    const ratingTypes = await tx.ratingType.findMany({ where: { isActive: true }, orderBy: { displayOrder: "asc" } });
    for (const [index, sample] of localRestaurants.entries()) {
      const existing = await tx.restaurant.findFirst({
        where: { ownerId: users.owner, name: { in: [sample.name, sample.previousName] } },
      });
      const data = {
        name: sample.name, description: sample.description, address: sample.address,
        city: sample.city, openingHours: "Monday–Sunday: 07:00–22:00",
      };
      const restaurant = existing
        ? await tx.restaurant.update({ where: { id: existing.id }, data })
        : await tx.restaurant.create({ data: { ...data, ownerId: users.owner, status: index === 5 ? "INACTIVE" : "ACTIVE" } });
      for (const name of sample.categories) {
        await tx.restaurantCategoryMapping.upsert({
          where: { restaurantId_categoryId: { restaurantId: restaurant.id, categoryId: categories[name] } },
          update: {}, create: { restaurantId: restaurant.id, categoryId: categories[name] },
        });
      }
      // Remove only the old seed cuisine when a venue's menu changes.
      const oldCuisine = index === 1 ? "Italian" : index === 3 ? "Vegetarian" : null;
      if (oldCuisine && !sample.categories.includes(oldCuisine)) {
        await tx.restaurantCategoryMapping.deleteMany({ where: { restaurantId: restaurant.id, category: { name: oldCuisine } } });
      }
      const knownImages = Object.values(dishImages);
      for (const isPrimary of [true, false]) {
        const imageData = {
          imageUrl: isPrimary ? dishImage(sample.dishes[0].image) : diningImages[index],
          altText: isPrimary ? `${sample.name} — ${sample.dishes[0].name}` : `${sample.name} — dining interior`,
        };
        const image = await tx.restaurantImage.findFirst({ where: { restaurantId: restaurant.id, isPrimary } });
        if (!image) await tx.restaurantImage.create({ data: { ...imageData, restaurantId: restaurant.id, isPrimary } });
        else if (!image.objectKey && (knownImages.includes(image.imageUrl) || diningImages.includes(image.imageUrl) || image.imageUrl.startsWith("https://picsum.photos/"))) {
          await tx.restaurantImage.update({ where: { id: image.id }, data: imageData });
        }
      }
      let firstItemId = 0;
      const menuNames = [...new Set(sample.dishes.map((item) => item.category))];
      for (const [order, name] of menuNames.entries()) {
        const previousCategory = await tx.menuCategory.findFirst({ where: { restaurantId: restaurant.id, name } });
        const menuCategory = previousCategory ?? await tx.menuCategory.create({ data: { restaurantId: restaurant.id, name, displayOrder: order + 1 } });
        for (const dish of sample.dishes.filter((item) => item.category === name)) {
          const previousItem = await tx.menuItem.findFirst({ where: {
            restaurantId: restaurant.id, name: { in: [dish.name, ...(dish.previousName ? [dish.previousName] : [])] },
          } });
          const itemData = {
            menuCategoryId: menuCategory.id, name: dish.name, description: dish.description,
            price: dish.price, isAvailable: dish.isAvailable ?? true,
          };
          const item = previousItem
            ? await tx.menuItem.update({ where: { id: previousItem.id }, data: itemData })
            : await tx.menuItem.create({ data: { ...itemData, restaurantId: restaurant.id } });
          const imageData = { imageUrl: dishImage(dish.image), altText: dish.name };
          const image = await tx.menuItemImage.findFirst({ where: { menuItemId: item.id, isPrimary: true } });
          if (!image) await tx.menuItemImage.create({ data: { ...imageData, menuItemId: item.id, isPrimary: true } });
          else if (!image.objectKey && (knownImages.includes(image.imageUrl) || image.imageUrl.startsWith("https://picsum.photos/"))) {
            await tx.menuItemImage.update({ where: { id: image.id }, data: imageData });
          }
          if (!firstItemId) firstItemId = item.id;
        }
      }
      // Existing reviews and replies remain attached to the same record IDs.
      if (existing) continue;
      for (const [reviewIndex, moderationStatus] of (["APPROVED", "APPROVED", "PENDING", "REJECTED"] as const).entries()) {
        const values = ratingTypes.map((_, ratingIndex) => 3 + ((index + reviewIndex + ratingIndex) % 3));
        const moderated = moderationStatus !== "PENDING";
        const review = await tx.review.create({ data: {
          userId: reviewIndex % 2 ? users.customer2 : users.customer,
          restaurantId: restaurant.id, menuItemId: reviewIndex % 2 ? null : firstItemId,
          title: ["Lovely food and friendly staff", "A relaxed lunch spot", "My recent visit", "Disappointing visit"][reviewIndex],
          reviewText: ["The food was fresh and full of flavour. Staff were welcoming and the portions were generous.", "Comfortable seating and a good menu selection. Service was a little slow during lunch, but I would visit again.", "Enjoyed my visit and would recommend trying the signature dishes.", "The lunch service took too long, and my meal arrived cold."][reviewIndex],
          overallRating: Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)),
          moderationStatus, moderatedBy: moderated ? users.moderator : null,
          moderatedAt: moderated ? new Date() : null,
          rejectionReason: moderationStatus === "REJECTED" ? "Content does not meet review guidelines." : null,
          ratings: { create: ratingTypes.map((type, i) => ({ ratingTypeId: type.id, ratingValue: values[i] })) },
        } });
        if (moderationStatus !== "APPROVED") continue;
        const comment = await tx.reviewComment.create({ data: {
          reviewId: review.id, userId: users.customer2, commentText: "Thanks for sharing! Was there a good selection of drinks?",
          moderationStatus: "APPROVED", moderatedBy: users.moderator, moderatedAt: new Date(),
        } });
        await tx.reviewComment.create({ data: {
          reviewId: review.id, userId: users.owner, parentCommentId: comment.id,
          commentText: "Yes, we offer fresh juices and Ceylon tea. We hope to welcome you soon!",
          moderationStatus: "APPROVED", moderatedBy: users.moderator, moderatedAt: new Date(),
        } });
        for (const status of ["PENDING", "REJECTED"] as const) {
          await tx.reviewComment.create({ data: {
            reviewId: review.id, userId: users.customer,
            commentText: status === "PENDING" ? "Are reservations available on weekends?" : "Please visit my shop for special offers.",
            moderationStatus: status, moderatedBy: status === "REJECTED" ? users.moderator : null,
            moderatedAt: status === "REJECTED" ? new Date() : null,
            rejectionReason: status === "REJECTED" ? "Off-topic promotional comment." : null,
          } });
        }
      }
    }
  }, { timeout: 60000 });
}
