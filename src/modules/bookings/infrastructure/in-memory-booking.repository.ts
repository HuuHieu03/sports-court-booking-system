import { Injectable } from '@nestjs/common';
import { IBookingRepository } from '../domain/booking.repository.interface';
import { BookingEntity } from '../domain/booking.entity';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

function vnTime(dayOffset: number, hour: number, minute = 0): Date {
  const now = new Date();
  const target = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
  target.setUTCHours(hour - 7, minute, 0, 0);
  return target;
}

export const SEED_BOOKINGS = {
  b1: id(6001),
  b2: id(6002),
  b3: id(6003),
  b4: id(6004),
  b5: id(6005),
  b6: id(6006),
};

@Injectable()
export class InMemoryBookingRepository implements IBookingRepository {
  private readonly bookings: Map<string, BookingEntity> = new Map();

  constructor() {
    this.seedInitialBookings();
  }

  private seedInitialBookings() {
    const now = new Date();
    const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

    const initial = [
      new BookingEntity({
        id: SEED_BOOKINGS.b1,
        courtId: id(3001),
        venueId: id(2001),
        userId: id(1005), // Lan
        startsAt: vnTime(1, 18),
        endsAt: vnTime(1, 19),
        totalPrice: 250000,
        status: 'CONFIRMED',
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      }),
      new BookingEntity({
        id: SEED_BOOKINGS.b2,
        courtId: id(3001),
        venueId: id(2001),
        userId: id(1006), // Huy
        startsAt: vnTime(1, 19),
        endsAt: vnTime(1, 20),
        totalPrice: 250000,
        status: 'CONFIRMED',
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      }),
      new BookingEntity({
        id: SEED_BOOKINGS.b3,
        courtId: id(3002),
        venueId: id(2001),
        userId: id(1005), // Lan
        startsAt: vnTime(2, 17),
        endsAt: vnTime(2, 18, 30),
        totalPrice: 375000,
        status: 'CANCELLED',
        cancelledAt: daysAgo(1),
        cancelledById: id(1005),
        cancellationReason: null,
        createdAt: daysAgo(3),
        updatedAt: daysAgo(1),
      }),
      new BookingEntity({
        id: SEED_BOOKINGS.b4,
        courtId: id(3003),
        venueId: id(2001),
        userId: id(1006), // Huy
        startsAt: vnTime(3, 20),
        endsAt: vnTime(3, 21),
        totalPrice: 350000,
        status: 'CANCELLED',
        cancelledAt: now,
        cancelledById: id(1004), // Minh
        cancellationReason: 'Sân cần sửa hệ thống chiếu sáng.',
        createdAt: daysAgo(1),
        updatedAt: now,
      }),
      new BookingEntity({
        id: SEED_BOOKINGS.b5,
        courtId: id(3007),
        venueId: id(2003),
        userId: id(1005), // Lan
        startsAt: vnTime(-1, 18),
        endsAt: vnTime(-1, 19),
        totalPrice: 250000,
        status: 'CONFIRMED',
        createdAt: daysAgo(5),
        updatedAt: daysAgo(5),
      }),
      new BookingEntity({
        id: SEED_BOOKINGS.b6,
        courtId: id(3008),
        venueId: id(2003),
        userId: id(1004), // Minh
        startsAt: vnTime(1, 7),
        endsAt: vnTime(1, 8),
        totalPrice: 350000,
        status: 'CONFIRMED',
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
      }),
    ];

    for (const b of initial) {
      this.bookings.set(b.id, b);
    }
  }

  async findById(id: string): Promise<BookingEntity | null> {
    return this.bookings.get(id) || null;
  }

  async findByUserId(userId: string): Promise<BookingEntity[]> {
    return Array.from(this.bookings.values())
      .filter((b) => b.userId === userId)
      .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());
  }

  async findByVenueId(venueId: string): Promise<BookingEntity[]> {
    return Array.from(this.bookings.values())
      .filter((b) => b.venueId === venueId)
      .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());
  }

  async findByCourtId(courtId: string): Promise<BookingEntity[]> {
    return Array.from(this.bookings.values()).filter((b) => b.courtId === courtId);
  }

  async findConflictingBookings(
    courtId: string,
    startsAt: Date,
    endsAt: Date,
    excludeBookingId?: string,
  ): Promise<BookingEntity[]> {
    return Array.from(this.bookings.values()).filter(
      (b) =>
        b.courtId === courtId &&
        b.id !== excludeBookingId &&
        b.isTimeOverlapping(startsAt, endsAt),
    );
  }

  async isCourtAvailable(
    courtId: string,
    startsAt: Date,
    endsAt: Date,
    excludeBookingId?: string,
  ): Promise<boolean> {
    const conflicts = await this.findConflictingBookings(
      courtId,
      startsAt,
      endsAt,
      excludeBookingId,
    );
    return conflicts.length === 0;
  }

  async save(booking: BookingEntity): Promise<BookingEntity> {
    this.bookings.set(booking.id, booking);
    return booking;
  }

  async update(booking: BookingEntity): Promise<BookingEntity> {
    this.bookings.set(booking.id, booking);
    return booking;
  }
}
