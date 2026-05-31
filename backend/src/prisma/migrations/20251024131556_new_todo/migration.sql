/*
  Warnings:

  - You are about to drop the column `completed` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `created_by` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."tasks" DROP CONSTRAINT "tasks_userId_fkey";

-- DropIndex
DROP INDEX "public"."users_email_key";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "completed",
DROP COLUMN "order",
DROP COLUMN "userId",
ADD COLUMN     "created_by" TEXT NOT NULL,
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "email",
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
