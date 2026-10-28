import { BookingsService } from '../../src/modules/bookings/application/bookings.service';
import { InMemoryBookingRepository } from '../../src/modules/bookings/infrastructure/in-memory-booking.repository';
import { InMemoryCourtRepository } from '../../src/modules/venues/infrastructure/in-memory-court.repository';
import { InMemoryVenueRepository } from '../../src/modules/venues/infrastructure/in-memory-venue.repository';
import { InMemoryStaffingRepository } from '../../src/modules/staffing/infrastructure/in-memory-staffing.repository';
import { InMemoryAccountRepository } from '../../src/modules/users/infrastructure/in-memory-account.repository';
import { InMemoryNotificationRepository } from '../../src/modules/notifications/infrastructure/in-memory-notification.repository';
import { CourtsService } from '../../src/modules/venues/application/courts.service';
import { VenuesService } from '../../src/modules/venues/application/venues.service';
import { StaffingService } from '../../src/modules/staffing/application/staffing.service';
import { UsersService } from '../../src/modules/users/application/users.service';
import { NotificationsService } from '../../src/modules/notifications/application/notifications.service';
import { BadRequestException } from '@nestjs/common';

describe('Booking Business Rules', () => {
  let bookingsService: BookingsService;
  const courtId = '00000000-0000-4000-8000-000000003001';

  beforeEach(() => {
    const bookingRepo = new InMemoryBookingRepository();
    const courtRepo = new InMemoryCourtRepository();
    const venueRepo = new InMemoryVenueRepository();
    const staffingRepo = new InMemoryStaffingRepository();
    const accountRepo = new InMemoryAccountRepository();
    const notifRepo = new InMemoryNotificationRepository();

    const notifService = new NotificationsService(notifRepo);
    const usersService = new UsersService(accountRepo);
    const venuesService = new VenuesService(venueRepo, courtRepo);
    const courtsService = new CourtsService(courtRepo, venueRepo);
    const staffingService = new StaffingService(staffingRepo, venuesService, usersService, notifService);

    bookingsService = new BookingsService(
      bookingRepo,
      venuesService,
      courtsService,
      staffingService,
      usersService,
      notifService,
    );
  });

  it('should reject booking shorter than 30 minutes', async () => {
    const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 20 * 60 * 1000); // 20 mins

    await expect(
      bookingsService.createBooking('user-1', {
        courtId,
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject booking longer than 4 hours', async () => {
    const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 250 * 60 * 1000); // 4h10m

    await expect(
      bookingsService.createBooking('user-1', {
        courtId,
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject booking starting in the past', async () => {
    const start = new Date(Date.now() - 60 * 60 * 1000);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    await expect(
      bookingsService.createBooking('user-1', {
        courtId,
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should calculate totalPrice accurately for 1 hour booking based on court hourly rate', async () => {
    const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour

    const booking = await bookingsService.createBooking('user-1', {
      courtId,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
    });

    // court 3001 has hourlyRate 250000
    expect(booking.totalPrice).toBe(250000);
  });

  it('should calculate proportional totalPrice accurately for 90-minute booking', async () => {
    const start = new Date(Date.now() + 26 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 90 * 60 * 1000); // 1.5 hours

    const booking = await bookingsService.createBooking('user-1', {
      courtId,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
    });

    // 250000 * 90 / 60 = 375000
    expect(booking.totalPrice).toBe(375000);
  });
});
