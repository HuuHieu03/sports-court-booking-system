-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "account_role" AS ENUM ('USER', 'OWNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "account_status" AS ENUM ('ACTIVE', 'LOCKED', 'DELETED');

-- CreateEnum
CREATE TYPE "booking_status" AS ENUM ('CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "application_status" AS ENUM ('SUBMITTED', 'APPOINTED', 'REVOKED');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('BOOKING_CANCELLED_BY_VENUE');

-- CreateEnum
CREATE TYPE "notification_status" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "full_name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "account_role" NOT NULL,
    "status" "account_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venues" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "address" VARCHAR(500) NOT NULL,
    "description" VARCHAR(2000),
    "recruitment_open" BOOLEAN NOT NULL DEFAULT false,
    "recruitment_message" VARCHAR(2000),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "venue_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" VARCHAR(2000),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "courts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "court_id" UUID NOT NULL,
    "venue_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "starts_at" TIMESTAMPTZ(3) NOT NULL,
    "ends_at" TIMESTAMPTZ(3) NOT NULL,
    "status" "booking_status" NOT NULL DEFAULT 'CONFIRMED',
    "cancelled_at" TIMESTAMPTZ(3),
    "cancelled_by_id" UUID,
    "cancellation_reason" VARCHAR(1000),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "venue_id" UUID NOT NULL,
    "applicant_id" UUID NOT NULL,
    "status" "application_status" NOT NULL DEFAULT 'SUBMITTED',
    "consented_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manager_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_appointments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "venue_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "appointed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(3),

    CONSTRAINT "manager_appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "venue_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "content" VARCHAR(2000) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipient_id" UUID NOT NULL,
    "booking_id" UUID,
    "type" "notification_type" NOT NULL,
    "status" "notification_status" NOT NULL DEFAULT 'PENDING',
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMPTZ(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_phone_key" ON "accounts"("phone");

-- CreateIndex
CREATE INDEX "venues_owner_id_idx" ON "venues"("owner_id") WHERE (deleted_at IS NULL);

-- CreateIndex
CREATE INDEX "courts_venue_id_idx" ON "courts"("venue_id") WHERE (deleted_at IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "courts_id_venue_id_key" ON "courts"("id", "venue_id");

-- CreateIndex
CREATE INDEX "bookings_court_id_starts_at_idx" ON "bookings"("court_id", "starts_at");

-- CreateIndex
CREATE INDEX "bookings_venue_id_starts_at_idx" ON "bookings"("venue_id", "starts_at");

-- CreateIndex
CREATE INDEX "bookings_user_id_starts_at_idx" ON "bookings"("user_id", "starts_at");

-- CreateIndex
CREATE INDEX "manager_applications_venue_id_created_at_idx" ON "manager_applications"("venue_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "manager_applications_venue_id_applicant_id_key" ON "manager_applications"("venue_id", "applicant_id") WHERE (status = ANY (ARRAY['SUBMITTED'::application_status, 'APPOINTED'::application_status]));

-- CreateIndex
CREATE UNIQUE INDEX "manager_appointments_application_id_key" ON "manager_appointments"("application_id");

-- CreateIndex
CREATE INDEX "manager_appointments_user_id_idx" ON "manager_appointments"("user_id") WHERE (revoked_at IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "manager_appointments_venue_id_key" ON "manager_appointments"("venue_id") WHERE (revoked_at IS NULL);

-- CreateIndex
CREATE INDEX "feedback_venue_id_created_at_idx" ON "feedback"("venue_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at") WHERE (status = 'PENDING');

-- CreateIndex
CREATE UNIQUE INDEX "notifications_type_booking_id_key" ON "notifications"("type", "booking_id");

-- AddForeignKey
ALTER TABLE "venues" ADD CONSTRAINT "venues_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courts" ADD CONSTRAINT "courts_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_court_id_venue_id_fkey" FOREIGN KEY ("court_id", "venue_id") REFERENCES "courts"("id", "venue_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_cancelled_by_id_fkey" FOREIGN KEY ("cancelled_by_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_applications" ADD CONSTRAINT "manager_applications_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_applications" ADD CONSTRAINT "manager_applications_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_appointments" ADD CONSTRAINT "manager_appointments_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "manager_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_appointments" ADD CONSTRAINT "manager_appointments_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_appointments" ADD CONSTRAINT "manager_appointments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CHECK constraint viết tay vì Prisma schema không hỗ trợ.
-- Baseline cố ý chưa có ràng buộc chống chồng giờ booking; ràng buộc đó thuộc migration của bản cải tiến.

-- AddCheckConstraint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_email_lowercase_check" CHECK (email = lower(email));

-- AddCheckConstraint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_deleted_state_check" CHECK ((status = 'DELETED') = (deleted_at IS NOT NULL));

-- AddCheckConstraint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_time_range_check" CHECK (ends_at > starts_at);

-- AddCheckConstraint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_cancellation_state_check" CHECK (
    (status = 'CONFIRMED' AND cancelled_at IS NULL AND cancelled_by_id IS NULL AND cancellation_reason IS NULL)
    OR (status = 'CANCELLED' AND cancelled_at IS NOT NULL AND cancelled_by_id IS NOT NULL)
);

-- AddCheckConstraint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_venue_cancel_reason_check" CHECK (
    status <> 'CANCELLED' OR cancelled_by_id = user_id OR cancellation_reason IS NOT NULL
);

-- AddCheckConstraint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_cancellation_reason_not_blank_check" CHECK (
    cancellation_reason IS NULL OR btrim(cancellation_reason) <> ''
);

-- AddCheckConstraint
ALTER TABLE "manager_appointments" ADD CONSTRAINT "manager_appointments_revoked_after_appointed_check" CHECK (
    revoked_at IS NULL OR revoked_at >= appointed_at
);

-- AddCheckConstraint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_content_not_blank_check" CHECK (btrim(content) <> '');

-- AddCheckConstraint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_attempt_count_check" CHECK (attempt_count >= 0);

-- AddCheckConstraint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sent_state_check" CHECK ((status = 'SENT') = (sent_at IS NOT NULL));
