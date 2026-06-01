import { PrismaClient } from "./generated/prisma";

const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "error" },
    { emit: "event", level: "info" },
    { emit: "event", level: "warn" },
  ],
});

// Log queries for debugging (optional)
prisma.$on("query" as never, (e: any) => {
  console.log("Query: " + e.query);
  console.log("Duration: " + e.duration + "ms");
});

export { prisma };
