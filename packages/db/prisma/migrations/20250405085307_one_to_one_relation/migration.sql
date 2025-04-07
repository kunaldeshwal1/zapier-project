/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Flow` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Flow` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Flow" ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Flow_userId_key" ON "Flow"("userId");

-- AddForeignKey
ALTER TABLE "Flow" ADD CONSTRAINT "Flow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
