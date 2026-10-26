import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  forwardRef,
  Logger,
} from '@nestjs/common';
import { VENUE_REPOSITORY, COURT_REPOSITORY } from '../../../common/constants/tokens';
import { IVenueRepository, VenueFilter } from '../domain/venue.repository.interface';
import { ICourtRepository } from '../domain/court.repository.interface';
import { VenueEntity } from '../domain/venue.entity';
import { BookingsService } from '../../bookings/application/bookings.service';
import { StaffingService } from '../../staffing/application/staffing.service';

export interface CreateVenueInput {
  name: string;
  address: string;
  description?: string;
  recruitmentOpen?: boolean;
  recruitmentMessage?: string;
}

export interface UpdateVenueInput {
  name?: string;
  address?: string;
  description?: string;
}

@Injectable()
export class VenuesService {
  private readonly logger = new Logger(VenuesService.name);

  constructor(
    @Inject(VENUE_REPOSITORY)
    private readonly venueRepository: IVenueRepository,
    @Inject(COURT_REPOSITORY)
    private readonly courtRepository: ICourtRepository,
    @Inject(forwardRef(() => BookingsService))
    private readonly bookingsService?: BookingsService,
    @Inject(forwardRef(() => StaffingService))
    private readonly staffingService?: StaffingService,
  ) {}

  /**
   * HOOK-02: N+1 Query Problem in Read APIs
   *
   * In this Baseline implementation, fetching a list of venues executes 1 initial query
   * to get the venues, then runs a sequential for-loop to fetch courts for EACH venue (N queries),
   * and inside each court queries related active bookings (M queries).
   * For 50 venues x 5 courts, this explodes to 1 + 50 + 250 = 301 distinct repository calls.
   */
  async getVenues(filter?: VenueFilter) {
    // Query 1: Get venues
    const venues = await this.venueRepository.findAll(filter);

    const result = [];
    // N queries: Sequential loop over venues
    for (const v of venues) {
      this.logger.debug(`[HOOK-02] Sequential N+1 query: fetching courts for venue ${v.id}`);
      const courts = await this.courtRepository.findByVenueId(v.id);

      let totalUpcomingBookings = 0;
      // M queries: Sequential loop over courts
      for (const court of courts) {
        if (this.bookingsService && typeof this.bookingsService.getUpcomingBookingCountByCourt === 'function') {
          const count = await this.bookingsService.getUpcomingBookingCountByCourt(court.id);
          totalUpcomingBookings += count;
        }
      }

      result.push({
        id: v.id,
        ownerId: v.ownerId,
        name: v.name,
        address: v.address,
        description: v.description,
        managerRecruitment: {
          isOpen: v.recruitmentOpen,
          message: v.recruitmentMessage,
        },
        recruitmentOpen: v.recruitmentOpen,
        recruitmentMessage: v.recruitmentMessage,
        courtCount: courts.length,
        totalUpcomingBookings,
        createdAt: v.createdAt.toISOString(),
        updatedAt: v.updatedAt.toISOString(),
      });
    }

    return result;
  }

  async getVenueDetail(venueId: string) {
    const venue = await this.venueRepository.findById(venueId);
    if (!venue || venue.deletedAt) {
      throw new NotFoundException('Cụm sân không tồn tại hoặc đã bị xóa');
    }

    return {
      id: venue.id,
      name: venue.name,
      address: venue.address,
      description: venue.description,
      managerRecruitment: {
        isOpen: venue.recruitmentOpen,
        message: venue.recruitmentMessage,
      },
      createdAt: venue.createdAt.toISOString(),
      updatedAt: venue.updatedAt.toISOString(),
    };
  }

  async getOwnerVenues(ownerId: string) {
    const venues = await this.venueRepository.findByOwnerId(ownerId);
    return venues.map((v) => ({
      id: v.id,
      ownerId: v.ownerId,
      name: v.name,
      address: v.address,
      description: v.description,
      managerRecruitment: {
        isOpen: v.recruitmentOpen,
        message: v.recruitmentMessage,
      },
      recruitmentOpen: v.recruitmentOpen,
      recruitmentMessage: v.recruitmentMessage,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    }));
  }

  async createVenue(ownerId: string, input: CreateVenueInput): Promise<VenueEntity> {
    const newVenue = new VenueEntity({
      id: crypto.randomUUID ? crypto.randomUUID() : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`,
      ownerId,
      name: input.name.trim(),
      address: input.address.trim(),
      description: input.description?.trim() || null,
      recruitmentOpen: input.recruitmentOpen ?? false,
      recruitmentMessage: input.recruitmentMessage?.trim() || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.venueRepository.save(newVenue);
  }

  async updateVenue(requesterId: string, venueId: string, input: UpdateVenueInput): Promise<VenueEntity> {
    const venue = await this.venueRepository.findById(venueId);
    if (!venue || venue.deletedAt) {
      throw new NotFoundException('Cụm sân không tồn tại');
    }
    const isOwner = venue.ownerId === requesterId;
    const isManager = this.staffingService
      ? await this.staffingService.isUserActiveManager(requesterId, venueId)
      : false;
    if (!isOwner && !isManager) {
      throw new ForbiddenException('Bạn không có quyền cập nhật cụm sân này');
    }

    if (input.name !== undefined) venue.name = input.name.trim();
    if (input.address !== undefined) venue.address = input.address.trim();
    if (input.description !== undefined) venue.description = input.description.trim() || null;
    venue.updatedAt = new Date();

    return this.venueRepository.update(venue);
  }

  async deleteVenue(ownerId: string, venueId: string): Promise<void> {
    const venue = await this.venueRepository.findById(venueId);
    if (!venue || venue.deletedAt) {
      throw new NotFoundException('Cụm sân không tồn tại');
    }
    if (venue.ownerId !== ownerId) {
      throw new ForbiddenException('Bạn không phải chủ sở hữu của cụm sân này');
    }

    // Constraint: Check active future bookings before soft deleting venue
    if (this.bookingsService && typeof this.bookingsService.hasActiveFutureBookingsForVenue === 'function') {
      const hasActive = await this.bookingsService.hasActiveFutureBookingsForVenue(venueId);
      if (hasActive) {
        throw new ConflictException({
          code: 'VENUE_HAS_ACTIVE_BOOKINGS',
          message: 'Chưa thể xóa Venue vì còn booking chưa kết thúc.',
        });
      }
    }

    // Soft delete all courts belonging to venue
    const courts = await this.courtRepository.findByVenueId(venueId);
    for (const c of courts) {
      c.softDelete();
      await this.courtRepository.update(c);
    }

    // Close recruitment and revoke current manager
    venue.recruitmentOpen = false;
    venue.recruitmentMessage = null;

    if (this.staffingService && typeof this.staffingService.revokeManagerOnVenueDeletion === 'function') {
      await this.staffingService.revokeManagerOnVenueDeletion(venueId);
    }

    venue.softDelete();
    await this.venueRepository.update(venue);
  }

  async setRecruitment(
    ownerId: string,
    venueId: string,
    recruitmentOpen: boolean,
    recruitmentMessage?: string | null,
  ): Promise<VenueEntity> {
    const venue = await this.venueRepository.findById(venueId);
    if (!venue || venue.deletedAt) {
      throw new NotFoundException('Cụm sân không tồn tại');
    }
    if (venue.ownerId !== ownerId) {
      throw new ForbiddenException('Bạn không phải chủ sở hữu của cụm sân này');
    }

    venue.setRecruitment(recruitmentOpen, recruitmentMessage);
    return this.venueRepository.update(venue);
  }

  async findById(id: string): Promise<VenueEntity | null> {
    return this.venueRepository.findById(id);
  }
}
