-- AddCheckConstraint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_duration_check" CHECK (
    ends_at - starts_at >= INTERVAL '30 minutes'
    AND ends_at - starts_at <= INTERVAL '4 hours'
);
