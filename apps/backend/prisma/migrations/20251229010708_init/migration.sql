-- DropForeignKey
ALTER TABLE "UserResponse" DROP CONSTRAINT "UserResponse_userId_fkey";

-- AlterTable
ALTER TABLE "UserResponse" ALTER COLUMN "userId" DROP NOT NULL;
