import { PrismaClient } from "../generated/prisma";

export async function seedOrders(prisma: PrismaClient) {
  console.log("\nStarting orders seeding...");

  // Get the first user to create sample orders
  const user = await prisma.user.findFirst({
    where: { username: "user" },
  });

  if (!user) {
    console.log("⚠️  No user found, skipping orders seeding");
    return;
  }

  // Get some products to create orders
  const products = await prisma.product.findMany({
    take: 5,
    where: { status: 1 },
  });

  if (products.length === 0) {
    console.log("⚠️  No products found, skipping orders seeding");
    return;
  }

  // Create sample orders
  const sampleOrders = [
    {
      code: "ORD0001",
      user_id: user.id,
      status: "COMPLETED" as const,
      items: [
        { product_id: products[0].id, quantity: 2, price: products[0].price },
        { product_id: products[1].id, quantity: 1, price: products[1].price },
      ],
    },
    {
      code: "ORD0002",
      user_id: user.id,
      status: "PROCESSING" as const,
      items: [
        { product_id: products[2].id, quantity: 1, price: products[2].price },
      ],
    },
    {
      code: "ORD0003",
      user_id: user.id,
      status: "PENDING" as const,
      items: [
        { product_id: products[3].id, quantity: 3, price: products[3].price },
        { product_id: products[4].id, quantity: 1, price: products[4].price },
      ],
    },
  ];

  for (const orderData of sampleOrders) {
    // Check if order already exists
    const existingOrder = await prisma.order.findUnique({
      where: { code: orderData.code },
    });

    if (existingOrder) {
      console.log(`⚠️  Order ${orderData.code} already exists, skipping`);
      continue;
    }

    // Calculate total amount
    const totalAmount = orderData.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    // Create order with items
    await prisma.order.create({
      data: {
        code: orderData.code,
        user_id: orderData.user_id,
        status: orderData.status,
        totalAmount,
        orderItems: {
          create: orderData.items.map((item, index) => ({
            code: `${orderData.code}-ITM${String(index + 1).padStart(3, "0")}`,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    console.log(`✅ Created sample order: ${orderData.code}`);
  }

  console.log(`✅ Orders seeding completed`);
}
