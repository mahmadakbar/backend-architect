import { PrismaClient } from "../generated/prisma";
import { seedUsers } from "./users.seed";
import { seedProducts } from "./products.seed";
import { seedOrders } from "./orders.seed";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...\n");

  try {
    // Seed in order: users -> products -> orders
    await seedUsers(prisma);
    await seedProducts(prisma);
    await seedOrders(prisma);

    console.log("\n🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
