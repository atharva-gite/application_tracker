-- AlterEnum
ALTER TYPE "FollowUpType" ADD VALUE 'HIRING_MANAGER';

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN "entity_type" TEXT;
ALTER TABLE "notifications" ADD COLUMN "entity_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "notifications_type_entity_id_key" ON "notifications"("type", "entity_id");

-- CreateIndex
CREATE INDEX "notifications_scheduled_for_sent_at_idx" ON "notifications"("scheduled_for", "sent_at");
