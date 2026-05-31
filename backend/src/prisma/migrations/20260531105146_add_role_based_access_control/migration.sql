-- CreateTable (roles first)
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- Insert default roles
INSERT INTO "roles" ("id", "name") VALUES (1, 'superadmin');
INSERT INTO "roles" ("id", "name") VALUES (2, 'admin');
INSERT INTO "roles" ("id", "name") VALUES (3, 'user');

-- Reset the sequence to continue from 4
SELECT setval(pg_get_serial_sequence('roles', 'id'), 3, true);

-- AlterTable (add role_id column as nullable first)
ALTER TABLE "users" ADD COLUMN "role_id" INTEGER;

-- Update existing users to have 'user' role (role_id = 3)
UPDATE "users" SET "role_id" = 3 WHERE "role_id" IS NULL;

-- Make role_id non-nullable and set default
ALTER TABLE "users" ALTER COLUMN "role_id" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "role_id" SET DEFAULT 3;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
