-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "WorkDetails" DROP CONSTRAINT "WorkDetails_userId_fkey";

-- AlterTable
ALTER TABLE "WorkDetails" ADD COLUMN     "ApprovalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "WorkDetails" ADD CONSTRAINT "WorkDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
