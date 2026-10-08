import type { PrismaClient } from "../src/generated/prisma/client.js";
import { hashPassword } from "../src/utils/password.js";
import { ROLES } from "../src/constants/roles.js";

import { dishImage, diningImages } from "./demo-images.js";

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
    const cuisines = ["Sri Lankan", "Italian", "Cafe", "Seafood", "Vegetarian"];
    const categories: Record<string, number> = {};
    for (const name of cuisines) {
      const category = await tx.restaurantCategory.upsert({
        where: { name }, update: {}, create: { name, description: `${name} dining and menu options` },
      });
      categories[name] = category.id;
    }
    const ratingTypes = await tx.ratingType.findMany({ where: { isActive: true }, orderBy: { displayOrder: "asc" } });
    const restaurants = [
      { name: "Demo Cinnamon Kitchen", city: "Colombo", cuisine: "Sri Lankan", dishes: ["Chicken Kottu", "Rice and Curry", "Coconut Roti"], price: 1250 },
      { name: "Demo Bella Napoli", city: "Kandy", cuisine: "Italian", dishes: ["Margherita Pizza", "Creamy Mushroom Pasta", "Bruschetta"], price: 2100 },
      { name: "Demo Ocean Table", city: "Galle", cuisine: "Seafood", dishes: ["Grilled Fish", "Garlic Prawns", "Seafood Fried Rice"], price: 2400 },
      { name: "Demo Green Garden", city: "Colombo", cuisine: "Vegetarian", dishes: ["Vegetable Buddha Bowl", "Chickpea Curry", "Avocado Toast"], price: 1450 },
      { name: "Demo Hill Country Cafe", city: "Nuwara Eliya", cuisine: "Cafe", dishes: ["Breakfast Sandwich", "Chocolate Cake", "Strawberry Waffles"], price: 1100 },
      { name: "Demo Sunset Bistro", city: "Negombo", cuisine: "Cafe", dishes: ["Grilled Chicken", "Garden Salad", "Club Sandwich"], price: 1800 },
    ];
    for (const [index, sample] of restaurants.entries()) {
      // Identify demo records by their owner and reserved demo name, never by a fixed database ID.
      const existing = await tx.restaurant.findFirst({ where: { ownerId: users.owner, name: sample.name } });
      if (existing) {
        // Upgrade the original placeholders without overwriting user-added photos.
        await tx.restaurantImage.updateMany({
          where: { restaurantId: existing.id, imageUrl: { startsWith: "https://picsum.photos/" }, isPrimary: true },
          data: { imageUrl: dishImage(sample.dishes[0]), altText: `${sample.name} — ${sample.dishes[0]}` },
        });
        await tx.restaurantImage.updateMany({
          where: { restaurantId: existing.id, imageUrl: { startsWith: "https://picsum.photos/" }, isPrimary: false },
          data: { imageUrl: diningImages[index], altText: `${sample.name} — sample dining interior` },
        });
        const items = await tx.menuItem.findMany({ where: { restaurantId: existing.id } });
        for (const item of items) {
          if (![...sample.dishes, "Fresh Lime Juice", "Ceylon Tea"].includes(item.name)) continue;
          await tx.menuItemImage.updateMany({
            where: { menuItemId: item.id, imageUrl: { startsWith: "https://picsum.photos/" } },
            data: { imageUrl: dishImage(item.name), altText: item.name },
          });
        }
        continue;
      }
      const restaurant = await tx.restaurant.create({ data: {
        ownerId: users.owner, name: sample.name,
        description: `${sample.cuisine} favourites in ${sample.city}, with friendly service and fresh local ingredients. Sample restaurant for frontend testing.`,
        address: `${20 + index * 10} Sample Garden Road`, city: sample.city,
        phone: `+9411234500${index}`, email: `restaurant${index + 1}@demo.example`,
        website: "https://example.com", openingHours: "Monday–Sunday: 09:00–22:00",
        status: index === 5 ? "INACTIVE" : "ACTIVE",
        categories: { create: { categoryId: categories[sample.cuisine] } },
        images: { create: [
          { imageUrl: dishImage(sample.dishes[0]), altText: `${sample.name} — ${sample.dishes[0]}`, isPrimary: true },
          { imageUrl: diningImages[index], altText: `${sample.name} — sample dining interior` },
        ] },
      } });
      let firstItemId = 0;
      for (const [order, name] of ["Main Dishes", "Drinks"].entries()) {
        const menuCategory = await tx.menuCategory.create({ data: { restaurantId: restaurant.id, name, displayOrder: order + 1 } });
        const dishes = order === 0 ? sample.dishes : ["Fresh Lime Juice", "Ceylon Tea"];
        for (const [dishIndex, dish] of dishes.entries()) {
          const item = await tx.menuItem.create({ data: {
            restaurantId: restaurant.id, menuCategoryId: menuCategory.id, name: dish,
            description: `${dish}, freshly prepared to order.`,
            price: order === 0 ? sample.price + dishIndex * 200 : 450 + dishIndex * 100,
            isAvailable: !(order === 0 && dishIndex === 2),
            images: { create: { imageUrl: dishImage(dish), altText: dish, isPrimary: true } },
          } });
          if (!firstItemId) firstItemId = item.id;
        }
      }
      for (const [reviewIndex, moderationStatus] of (["APPROVED", "APPROVED", "PENDING", "REJECTED"] as const).entries()) {
        const values = ratingTypes.map((_, ratingIndex) => 3 + ((index + reviewIndex + ratingIndex) % 3));
        const moderated = moderationStatus !== "PENDING";
        const review = await tx.review.create({ data: {
          userId: reviewIndex % 2 ? users.customer2 : users.customer,
          restaurantId: restaurant.id, menuItemId: reviewIndex % 2 ? null : firstItemId,
          title: ["Lovely food and friendly staff", "A relaxed lunch spot", "My recent visit", "Sample rejected review"][reviewIndex],
          reviewText: ["The food was fresh and full of flavour. Staff were welcoming and the portions were generous.", "Comfortable seating and a good menu selection. Service was a little slow during lunch, but I would visit again.", "Enjoyed my visit and would recommend trying the signature dishes.", "Sample content to test the rejected review view."][reviewIndex],
          overallRating: Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)),
          moderationStatus, moderatedBy: moderated ? users.moderator : null,
          moderatedAt: moderated ? new Date() : null,
          rejectionReason: moderationStatus === "REJECTED" ? "Demo rejection: content does not meet review guidelines." : null,
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
            commentText: status === "PENDING" ? "Are reservations available on weekends?" : "Sample comment for the rejected comments view.",
            moderationStatus: status, moderatedBy: status === "REJECTED" ? users.moderator : null,
            moderatedAt: status === "REJECTED" ? new Date() : null,
            rejectionReason: status === "REJECTED" ? "Demo rejection: off-topic comment." : null,
          } });
        }
      }
    }
  }, { timeout: 60000 });
}
