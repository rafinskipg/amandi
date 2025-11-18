-- CreateEnum
CREATE TYPE "StatusLogType" AS ENUM ('created', 'payment_confirmed', 'shipped', 'customer_contacted', 'reshipped', 'returned', 'delivered');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingCity" TEXT,
ADD COLUMN     "shippingCountry" TEXT,
ADD COLUMN     "shippingLine1" TEXT,
ADD COLUMN     "shippingLine2" TEXT,
ADD COLUMN     "shippingName" TEXT,
ADD COLUMN     "shippingPostalCode" TEXT,
ADD COLUMN     "shippingState" TEXT;

-- CreateTable
CREATE TABLE "OrderStatusLog" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "StatusLogType" NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderStatusLog_orderId_idx" ON "OrderStatusLog"("orderId");

-- CreateIndex
CREATE INDEX "OrderStatusLog_createdAt_idx" ON "OrderStatusLog"("createdAt");

-- CreateIndex
CREATE INDEX "OrderStatusLog_status_idx" ON "OrderStatusLog"("status");

-- AddForeignKey
ALTER TABLE "OrderStatusLog" ADD CONSTRAINT "OrderStatusLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
