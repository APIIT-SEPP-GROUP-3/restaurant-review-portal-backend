import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { ROLES } from "../src/constants/roles.js";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const roles = [
    {
      roleName: ROLES.CUSTOMER,
      description: "Regular customer account",
    },
    {
      roleName: ROLES.RESTAURANT_OWNER,
      description: "Restaurant owner account",
    },
    {
      roleName: ROLES.MODERATOR,
      description: "Review and comment moderator",
    },
    {
      roleName: ROLES.ADMIN,
      description: "System administrator",
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: {
        roleName: role.roleName,
      },
      update: {},
      create: role,
    });
  }

  const ratingTypes = [
    {
      name: "Food Quality",
      description: "Quality, taste and presentation of food",
      displayOrder: 1,
    },
    {
      name: "Customer Service",
      description: "Quality of customer service and staff support",
      displayOrder: 2,
    },
    {
      name: "Value for Money",
      description: "Value received compared with the price paid",
      displayOrder: 3,
    },
    {
      name: "Cleanliness",
      description: "Cleanliness of the restaurant and dining environment",
      displayOrder: 4,
    },
    {
      name: "Ambience",
      description: "Overall atmosphere and dining environment",
      displayOrder: 5,
    },
    {
      name: "Variety",
      description: "Variety of food and menu choices",
      displayOrder: 6,
    },
  ];

  for (const ratingType of ratingTypes) {
    await prisma.ratingType.upsert({
      where: {
        name: ratingType.name,
      },
      update: {},
      create: ratingType,
    });
  }

  console.log("Database seed completed successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
