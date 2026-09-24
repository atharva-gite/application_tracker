-- CreateTable
CREATE TABLE "product_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entity_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_events_user_id_created_at_idx" ON "product_events"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "product_events_name_created_at_idx" ON "product_events"("name", "created_at");

-- AddForeignKey
ALTER TABLE "product_events" ADD CONSTRAINT "product_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
