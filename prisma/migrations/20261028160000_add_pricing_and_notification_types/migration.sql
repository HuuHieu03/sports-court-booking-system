-- AlterEnum
ALTER TYPE "notification_type" ADD VALUE IF NOT EXISTS 'MANAGER_APPOINTED';
ALTER TYPE "notification_type" ADD VALUE IF NOT EXISTS 'BOOKING_CONFIRMED';

-- AlterTable
ALTER TABLE "courts" ADD COLUMN "hourly_rate" INTEGER NOT NULL DEFAULT 300000;

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "total_price" INTEGER NOT NULL DEFAULT 0;

-- AddCheckConstraint
ALTER TABLE "courts" ADD CONSTRAINT "courts_hourly_rate_check" CHECK (hourly_rate >= 0);

-- AddCheckConstraint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_total_price_check" CHECK (total_price >= 0);
