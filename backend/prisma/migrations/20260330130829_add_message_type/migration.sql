-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('MESSAGE', 'IMAGE');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'MESSAGE';
