-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'payment_received';

-- Update existing 'completed' orders to 'payment_received' (if they haven't been delivered)
-- Note: We keep 'completed' for backward compatibility, but new orders will use 'payment_received'
UPDATE "Order" SET status = 'payment_received' WHERE status = 'completed' AND status != 'delivered';
