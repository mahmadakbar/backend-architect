/*
  Warnings:

  - You are about to drop the column `userId` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_userId_fkey";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "userId",
ALTER COLUMN "order" SET DATA TYPE DOUBLE PRECISION;

-- DropTable
DROP TABLE "users";
