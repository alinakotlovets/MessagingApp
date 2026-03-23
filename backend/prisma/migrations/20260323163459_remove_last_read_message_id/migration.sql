/*
  Warnings:

  - You are about to drop the column `lastReadMessageId` on the `ChatUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatUser" DROP COLUMN "lastReadMessageId";
