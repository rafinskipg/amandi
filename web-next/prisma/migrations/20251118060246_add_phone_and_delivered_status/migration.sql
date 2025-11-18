-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'delivered';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerPhone" TEXT;

-- CreateIndex
CREATE INDEX "Order_customerEmail_idx" ON "Order"("customerEmail");
