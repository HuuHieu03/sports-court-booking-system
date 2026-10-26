import { BookingEntity } from './booking.entity';

export interface IBookingRepository {
  findById(id: string): Promise<BookingEntity | null>;
  findByUserId(userId: string): Promise<BookingEntity[]>;
  findByVenueId(venueId: string): Promise<BookingEntity[]>;
  findByCourtId(courtId: string): Promise<BookingEntity[]>;
  findConflictingBookings(
    courtId: string,
    startsAt: Date,
    endsAt: Date,
    excludeBookingId?: string,
  ): Promise<BookingEntity[]>;
  isCourtAvailable(
    courtId: string,
    startsAt: Date,
    endsAt: Date,
    excludeBookingId?: string,
  ): Promise<boolean>;
  save(booking: BookingEntity): Promise<BookingEntity>;
  update(booking: BookingEntity): Promise<BookingEntity>;
}
