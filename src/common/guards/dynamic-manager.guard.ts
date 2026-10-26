import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { VenuesService } from '../../modules/venues/application/venues.service';
import { StaffingService } from '../../modules/staffing/application/staffing.service';
import { AuthUser } from '../decorators/current-user.decorator';

/**
 * HOOK-04: Uncached Dynamic RBAC Database Throttling
 *
 * To guarantee that revoked managers lose access immediately without relying on stale tokens,
 * every single incoming request queries the underlying services for venue ownership
 * and active manager appointments without any short-lived Redis cache.
 * In high-load scenarios, this causes repository/database connection contention.
 */
@Injectable()
export class DynamicManagerGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => VenuesService))
    private readonly venuesService: VenuesService,
    @Inject(forwardRef(() => StaffingService))
    private readonly staffingService: StaffingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser;

    if (!user) {
      throw new ForbiddenException('Yêu cầu xác thực tài khoản');
    }

    // Extract venueId from route parameters: venueId or id
    const venueId = request.params.venueId || request.params.id;
    if (!venueId) {
      return true; // No venue context in route param
    }

    // Uncached query 1: Fetch venue to verify owner
    const venue = await this.venuesService.findById(venueId);
    if (!venue || venue.deletedAt) {
      throw new NotFoundException('Cụm sân không tồn tại hoặc đã bị xóa');
    }

    // Check if user is the Owner of the venue
    if (venue.ownerId === user.userId) {
      request.isVenueOwner = true;
      request.isVenueManager = false;
      return true;
    }

    // Uncached query 2: Check active manager appointment in staffing service
    const isManager = await this.staffingService.isUserActiveManager(
      user.userId,
      venueId,
    );

    if (isManager) {
      request.isVenueOwner = false;
      request.isVenueManager = true;
      return true;
    }

    throw new ForbiddenException(
      'Bạn không có quyền quản lý cụm sân này (chỉ dành cho Chủ sân hoặc Quản lý được bổ nhiệm)',
    );
  }
}
