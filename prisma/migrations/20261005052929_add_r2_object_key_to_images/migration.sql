BEGIN;

-- Existing external images do not have an R2 object key.
ALTER TABLE "menu_item_image"
ADD COLUMN "object_key" TEXT,
ADD COLUMN "updated_at" TIMESTAMP(3);

ALTER TABLE "restaurant_image"
ADD COLUMN "object_key" TEXT,
ADD COLUMN "updated_at" TIMESTAMP(3);

-- Preserve existing image rows and use their creation time as the initial
-- update time. Prisma's @updatedAt manages subsequent writes.
UPDATE "menu_item_image" SET "updated_at" = "created_at";
UPDATE "restaurant_image" SET "updated_at" = "created_at";

ALTER TABLE "menu_item_image" ALTER COLUMN "updated_at" SET NOT NULL;
ALTER TABLE "restaurant_image" ALTER COLUMN "updated_at" SET NOT NULL;

COMMIT;
