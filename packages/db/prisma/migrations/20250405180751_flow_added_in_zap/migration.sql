/*
  Warnings:

  - You are about to drop the column `userId` on the `Flow` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[zapId]` on the table `Flow` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `zapId` to the `Flow` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Flow" DROP CONSTRAINT "Flow_userId_fkey";

-- DropIndex
DROP INDEX "Flow_userId_key";

-- AlterTable
ALTER TABLE "Flow" DROP COLUMN "userId",
ADD COLUMN     "zapId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Flow_zapId_key" ON "Flow"("zapId");

-- AddForeignKey
ALTER TABLE "Flow" ADD CONSTRAINT "Flow_zapId_fkey" FOREIGN KEY ("zapId") REFERENCES "Zap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
