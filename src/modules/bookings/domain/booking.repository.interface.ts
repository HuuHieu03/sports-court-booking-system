import { Booking } from './booking.entity';

export const BOOKING_REPOSITORY_TOKEN = Symbol('BOOKING_REPOSITORY');

export interface IBookingRepository {
  findById(id: string): Promise<Booking | null>;
  findByCustomerId(customerId: string): Promise<Booking[]>;
  findByCourtAndDateRange(
    courtId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<Booking[]>;
  save(booking: Booking): Promise<Booking>;
  delete(id: string): Promise<boolean>;
}
