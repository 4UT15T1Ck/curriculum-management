-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REQUEST_AWAITING_YOU', 'REQUEST_RETURNED', 'REQUEST_REJECTED', 'REQUEST_APPROVED', 'REQUEST_OVERRIDDEN', 'REQUEST_COMMENTED');

-- CreateEnum
CREATE TYPE "NotificationReadStatus" AS ENUM ('UNREAD', 'READ');

-- AlterTable
ALTER TABLE "ChangeRequest" ADD COLUMN     "levelEnteredAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "changeRequestId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "notificationType" "NotificationType" NOT NULL,
    "content" TEXT NOT NULL,
    "changeRequestId" TEXT,
    "readStatus" "NotificationReadStatus" NOT NULL DEFAULT 'UNREAD',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Comment_changeRequestId_createdAt_idx" ON "Comment"("changeRequestId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_recipientId_readStatus_createdAt_idx" ON "Notification"("recipientId", "readStatus", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_changeRequestId_idx" ON "Notification"("changeRequestId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "ChangeRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "ChangeRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
