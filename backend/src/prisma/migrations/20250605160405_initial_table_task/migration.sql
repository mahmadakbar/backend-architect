-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "order" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updatedAt" DROP NOT NULL;
