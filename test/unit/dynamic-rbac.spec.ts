import { StaffingService } from '../../src/modules/staffing/application/staffing.service';
import { InMemoryStaffingRepository } from '../../src/modules/staffing/infrastructure/in-memory-staffing.repository';
import { InMemoryVenueRepository } from '../../src/modules/venues/infrastructure/in-memory-venue.repository';
import { InMemoryCourtRepository } from '../../src/modules/venues/infrastructure/in-memory-court.repository';
import { VenuesService } from '../../src/modules/venues/application/venues.service';
import { InMemoryAccountRepository } from '../../src/modules/users/infrastructure/in-memory-account.repository';
import { InMemoryNotificationRepository } from '../../src/modules/notifications/infrastructure/in-memory-notification.repository';
import { UsersService } from '../../src/modules/users/application/users.service';
import { NotificationsService } from '../../src/modules/notifications/application/notifications.service';

describe('Dynamic RBAC Verification', () => {
  let staffingService: StaffingService;
  const ownerId = '00000000-0000-4000-8000-000000001002'; // ownerAnPhu
  const venueId = '00000000-0000-4000-8000-000000002001'; // anPhu
  const managerId = '00000000-0000-4000-8000-000000001004'; // managerMinh

  beforeEach(() => {
    const staffingRepo = new InMemoryStaffingRepository();
    const venueRepo = new InMemoryVenueRepository();
    const courtRepo = new InMemoryCourtRepository();
    const accountRepo = new InMemoryAccountRepository();
    const notifRepo = new InMemoryNotificationRepository();

    const notifService = new NotificationsService(notifRepo);
    const usersService = new UsersService(accountRepo);
    const venuesService = new VenuesService(venueRepo, courtRepo);
    staffingService = new StaffingService(staffingRepo, venuesService, usersService, notifService);
  });

  it('should confirm active manager has permission dynamically', async () => {
    const isActive = await staffingService.isUserActiveManager(managerId, venueId);
    expect(isActive).toBe(true);
  });

  it('should immediately revoke manager access in database state', async () => {
    await staffingService.revokeManager(ownerId, venueId, managerId);
    const isActive = await staffingService.isUserActiveManager(managerId, venueId);
    expect(isActive).toBe(false);
  });
});
