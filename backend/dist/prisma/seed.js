"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./generated/prisma");
const encryption_helper_1 = require("../utils/helper/encryption.helper");
const prisma = new prisma_1.PrismaClient();
async function main() {
    console.log("Starting database seeding...");
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
                password: (0, encryption_helper_1.encrypt)(user.password),
                name: user.name,
                role_id: user.role_id,
            },
        });
        console.log(`✅ Created default user: ${user.username} (role_id: ${user.role_id})`);
    }
    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📝 Default user credentials:");
    console.log("┌─────────────┬──────────────────┬─────────────┐");
    console.log("│ Username    │ Password         │ Role        │");
    console.log("├─────────────┼──────────────────┼─────────────┤");
    console.log("│ superadmin  │ SuperAdmin@123   │ superadmin  │");
    console.log("│ admin       │ Admin@123        │ admin       │");
    console.log("│ user        │ User@123         │ user        │");
    console.log("└─────────────┴──────────────────┴─────────────┘");
    console.log("\n⚠️  IMPORTANT: Change these passwords in production!");
    // Create default products (Prices in IDR - Indonesian Rupiah)
    const defaultProducts = [
        {
            name: "Wireless Bluetooth Headphones",
            description: "Premium noise-cancelling headphones with 30-hour battery life",
            price: 1199000,
            stock: 50,
            category: "Electronics",
            image: "https://example.com/images/headphones.jpg",
        },
        {
            name: "Smart Fitness Watch",
            description: "Track your fitness goals with heart rate monitoring and GPS",
            price: 2999000,
            stock: 30,
            category: "Electronics",
            image: "https://example.com/images/fitness-watch.jpg",
        },
        {
            name: "Ergonomic Office Chair",
            description: "Comfortable office chair with lumbar support and adjustable height",
            price: 4499000,
            stock: 20,
            category: "Furniture",
            image: "https://example.com/images/office-chair.jpg",
        },
        {
            name: "Mechanical Gaming Keyboard",
            description: "RGB backlit mechanical keyboard with blue switches",
            price: 1349000,
            stock: 40,
            category: "Electronics",
            image: "https://example.com/images/keyboard.jpg",
        },
        {
            name: "4K Ultra HD Monitor",
            description: "27-inch 4K monitor with HDR support and 144Hz refresh rate",
            price: 6749000,
            stock: 15,
            category: "Electronics",
            image: "https://example.com/images/monitor.jpg",
        },
        {
            name: "Wireless Gaming Mouse",
            description: "High-precision wireless mouse with customizable buttons",
            price: 899000,
            stock: 60,
            category: "Electronics",
            image: "https://example.com/images/gaming-mouse.jpg",
        },
        {
            name: "Portable SSD 1TB",
            description: "Ultra-fast portable SSD with USB-C connectivity",
            price: 1799000,
            stock: 35,
            category: "Electronics",
            image: "https://example.com/images/ssd.jpg",
        },
        {
            name: "Coffee Maker Machine",
            description: "Programmable coffee maker with 12-cup capacity",
            price: 1199000,
            stock: 25,
            category: "Home Appliances",
            image: "https://example.com/images/coffee-maker.jpg",
        },
        {
            name: "Standing Desk Converter",
            description: "Adjustable standing desk converter for healthier work",
            price: 2249000,
            stock: 18,
            category: "Furniture",
            image: "https://example.com/images/standing-desk.jpg",
        },
        {
            name: "LED Desk Lamp",
            description: "Adjustable LED desk lamp with touch controls and USB charging",
            price: 524000,
            stock: 45,
            category: "Home & Office",
            image: "https://example.com/images/desk-lamp.jpg",
        },
        {
            name: "Wireless Charging Pad",
            description: "Fast wireless charging pad compatible with all Qi devices",
            price: 374000,
            stock: 70,
            category: "Electronics",
            image: "https://example.com/images/charging-pad.jpg",
        },
        {
            name: "Webcam HD 1080p",
            description: "Full HD webcam with auto-focus and built-in microphone",
            price: 1049000,
            stock: 40,
            category: "Electronics",
            image: "https://example.com/images/webcam.jpg",
        },
        {
            name: "Gaming Headset with Mic",
            description: "Surround sound gaming headset with noise-cancelling microphone",
            price: 1349000,
            stock: 32,
            category: "Electronics",
            image: "https://example.com/images/gaming-headset.jpg",
        },
        {
            name: "USB Hub 7-Port",
            description: "Powered USB 3.0 hub with individual switches",
            price: 449000,
            stock: 55,
            category: "Electronics",
            image: "https://example.com/images/usb-hub.jpg",
        },
        {
            name: "Laptop Cooling Pad",
            description: "Laptop cooling pad with 5 quiet fans and adjustable height",
            price: 599000,
            stock: 28,
            category: "Electronics",
            image: "https://example.com/images/cooling-pad.jpg",
        },
    ];
    // Seed products with unique codes
    for (let i = 0; i < defaultProducts.length; i++) {
        const product = defaultProducts[i];
        const code = `PRD${String(i + 1).padStart(4, "0")}`; // Generate code like PRD0001, PRD0002, etc.
        await prisma.product.create({
            data: {
                ...product,
                code,
            },
        });
    }
    console.log("\n✅ 15 default products seeded successfully");
    console.log("📦 Products categories: Electronics, Furniture, Home Appliances, Home & Office");
}
main()
    .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map