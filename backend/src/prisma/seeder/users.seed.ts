import { PrismaClient } from "../generated/prisma";
import { encrypt } from "../../utils/helper/encryption.helper";

export async function seedUsers(prisma: PrismaClient) {
  console.log("Starting users and roles seeding...");

  // Create roles
  const roles = [
    { id: 1, name: "superadmin" },
    { id: 2, name: "admin" },
    { id: 3, name: "user" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {},
      create: role,
    });
  }

  console.log("✅ Roles seeded successfully");

  // Create default users for each role
  const defaultUsers = [
    {
      username: "superadmin",
      password: "SuperAdmin@123",
      name: "Super Administrator",
      role_id: 1,
    },
    {
      username: "admin",
      password: "Admin@123",
      name: "Admin User",
      role_id: 2,
    },
    {
      username: "user",
      password: "User@123",
      name: "Regular User",
      role_id: 3,
    },
  ];

  for (const user of defaultUsers) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: {
        username: user.username,
        password: encrypt(user.password),
        name: user.name,
        role_id: user.role_id,
      },
    });
    console.log(
      `✅ Created default user: ${user.username} (role_id: ${user.role_id})`,
    );
  }

  console.log("\n📝 Default user credentials:");
  console.log("┌─────────────┬──────────────────┬─────────────┐");
  console.log("│ Username    │ Password         │ Role        │");
  console.log("├─────────────┼──────────────────┼─────────────┤");
  console.log("│ superadmin  │ SuperAdmin@123   │ superadmin  │");
  console.log("│ admin       │ Admin@123        │ admin       │");
  console.log("│ user        │ User@123         │ user        │");
  console.log("└─────────────┴──────────────────┴─────────────┘");
  console.log("⚠️  IMPORTANT: Change these passwords in production!");
}
