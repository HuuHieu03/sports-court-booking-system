import { BookingsService } from '../src/modules/bookings/application/bookings.service';
import { InMemoryBookingRepository } from '../src/modules/bookings/infrastructure/in-memory-booking.repository';
import { InMemoryCourtRepository } from '../src/modules/venues/infrastructure/in-memory-court.repository';
import { InMemoryVenueRepository } from '../src/modules/venues/infrastructure/in-memory-venue.repository';
import { InMemoryStaffingRepository } from '../src/modules/staffing/infrastructure/in-memory-staffing.repository';
import { InMemoryAccountRepository } from '../src/modules/users/infrastructure/in-memory-account.repository';
import { InMemoryNotificationRepository } from '../src/modules/notifications/infrastructure/in-memory-notification.repository';
import { CourtsService } from '../src/modules/venues/application/courts.service';
import { VenuesService } from '../src/modules/venues/application/venues.service';
import { StaffingService } from '../src/modules/staffing/application/staffing.service';
import { UsersService } from '../src/modules/users/application/users.service';
import { NotificationsService } from '../src/modules/notifications/application/notifications.service';

/**
 * REPRODUCTION SCRIPT FOR HOOK-01: Concurrency Race Condition (Double Booking)
 *
 * This test simulates concurrent user requests targeting the same court and overlapping time slot.
 * On Baseline: Because there is no mutex, row lock, or DB exclusion constraint,
 * multiple concurrent requests pass the availability check simultaneously and create duplicate bookings.
 */
export async function runRaceConditionSimulation() {
  console.log('=== [HOOK-01] Testing Concurrency Race Condition in Baseline ===');

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

  const bookingsService = new BookingsService(
    bookingRepo,
    venuesService,
    courtsService,
    staffingService,
    usersService,
    notifService,
  );

  const targetCourtId = '00000000-0000-4000-8000-000000003001'; // An Phú Sân 1
  const futureTomorrow = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const startsAt = new Date(futureTomorrow);
  startsAt.setUTCHours(10, 0, 0, 0);
  const endsAt = new Date(futureTomorrow);
  endsAt.setUTCHours(11, 0, 0, 0);

  const startIso = startsAt.toISOString();
  const endIso = endsAt.toISOString();

  const concurrentRequests = 10;
  console.log(`Sending ${concurrentRequests} simultaneous booking requests for Court: ${targetCourtId}...`);

  const results = await Promise.allSettled(
    Array.from({ length: concurrentRequests }).map((_, i) =>
      bookingsService.createBooking(`user-${i}`, {
        courtId: targetCourtId,
        startsAt: startIso,
        endsAt: endIso,
      }),
    ),
  );

  const succeeded = results.filter((r) => r.status === 'fulfilled');
  const rejected = results.filter((r) => r.status === 'rejected');

  console.log(`Simulation Results:`);
  console.log(`- Succeeded bookings: ${succeeded.length}`);
  console.log(`- Rejected bookings: ${rejected.length}`);

  if (succeeded.length > 1) {
    console.log(`⚠️ DEFECT REPRODUCED: ${succeeded.length} bookings were created concurrently for the same slot!`);
    console.log(`This confirms the intentional HOOK-01 race condition exists on the Baseline as expected.`);
  } else {
    console.log(`Only 1 booking succeeded.`);
  }

  return { succeededCount: succeeded.length, rejectedCount: rejected.length };
}

if (require.main === module) {
  runRaceConditionSimulation().catch(console.error);
}
