import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
  forwardRef,
} from '@nestjs/common';
import { COURT_REPOSITORY, VENUE_REPOSITORY } from '../../../common/constants/tokens';
import { ICourtRepository } from '../domain/court.repository.interface';
import { IVenueRepository } from '../domain/venue.repository.interface';
import { CourtEntity } from '../domain/court.entity';
import { BookingsService } from '../../bookings/application/bookings.service';

export interface CreateCourtInput {
  name: string;
  description?: string;
}

export interface UpdateCourtInput {
  name?: string;
  description?: string;
}

@Injectable()
export class CourtsService {
  constructor(
    @Inject(COURT_REPOSITORY)
    private readonly courtRepository: ICourtRepository,
    @Inject(VENUE_REPOSITORY)
    private readonly venueRepository: IVenueRepository,
    @Inject(forwardRef(() => BookingsService))
    private readonly bookingsService?: BookingsService,
  ) {}

  async getCourtsByVenue(venueId: string): Promise<CourtEntity[]> {
    return this.courtRepository.findByVenueId(venueId);
  }

  async getCourtById(courtId: string): Promise<CourtEntity> {
    const court = await this.courtRepository.findById(courtId);
    if (!court || court.deletedAt) {
      throw new NotFoundException('Sân con không tồn tại hoặc đã bị xóa');
    }
    return court;
  }

  async createCourt(venueId: string, input: CreateCourtInput): Promise<CourtEntity> {
    const venue = await this.venueRepository.findById(venueId);
    if (!venue || venue.deletedAt) {
      throw new NotFoundException('Cụm sân không tồn tại');
    }

    const court = new CourtEntity({
      id: crypto.randomUUID ? crypto.randomUUID() : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`,
      venueId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.courtRepository.save(court);
  }

  async updateCourt(courtId: string, input: UpdateCourtInput): Promise<CourtEntity> {
    const court = await this.courtRepository.findById(courtId);
    if (!court || court.deletedAt) {
      throw new NotFoundException('Sân con không tồn tại');
    }

    if (input.name !== undefined) court.name = input.name.trim();
    if (input.description !== undefined) court.description = input.description.trim() || null;
    court.updatedAt = new Date();

    return this.courtRepository.update(court);
  }

  async deleteCourt(courtId: string): Promise<void> {
    const court = await this.courtRepository.findById(courtId);
    if (!court || court.deletedAt) {
      throw new NotFoundException('Sân con không tồn tại');
    }

    // Constraint: Check active future bookings before soft deleting court
    if (this.bookingsService && typeof this.bookingsService.hasActiveFutureBookingsForCourt === 'function') {
      const hasActive = await this.bookingsService.hasActiveFutureBookingsForCourt(courtId);
      if (hasActive) {
        throw new ConflictException({
          code: 'COURT_HAS_ACTIVE_BOOKINGS',
          message: 'Chưa thể xóa Court vì còn booking chưa kết thúc.',
        });
      }
    }

    court.softDelete();
    await this.courtRepository.update(court);
  }

  async checkAvailability(courtId: string, startsAtStr: string, endsAtStr: string) {
    const court = await this.getCourtById(courtId);
    const startsAt = new Date(startsAtStr);
    const endsAt = new Date(endsAtStr);

    if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime())) {
      throw new BadRequestException('Thời gian bắt đầu hoặc kết thúc không hợp lệ');
    }
    if (endsAt <= startsAt) {
      throw new BadRequestException('Thời gian kết thúc phải sau thời gian bắt đầu');
    }
    const now = new Date();
    if (startsAt <= now) {
      throw new BadRequestException('Thời gian bắt đầu phải ở trong tương lai');
    }

    let available = true;
    if (this.bookingsService && typeof this.bookingsService.isCourtAvailable === 'function') {
      available = await this.bookingsService.isCourtAvailable(court.id, startsAt, endsAt);
    }

    return {
      courtId: court.id,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      available,
    };
  }

  async getCourtAvailability(courtId: string, dateStr?: string) {
    const court = await this.getCourtById(courtId);
    const date = dateStr ? new Date(dateStr) : new Date();

    let bookings = [];
    if (this.bookingsService && typeof this.bookingsService.getBookingsForCourtDate === 'function') {
      bookings = await this.bookingsService.getBookingsForCourtDate(courtId, date);
    }

    return {
      courtId: court.id,
      courtName: court.name,
      date: date.toISOString().split('T')[0],
      bookings: bookings.map((b) => ({
        id: b.id,
        startsAt: b.startsAt.toISOString(),
        endsAt: b.endsAt.toISOString(),
        status: b.status,
      })),
    };
  }

  async findById(courtId: string): Promise<CourtEntity | null> {
    return this.courtRepository.findById(courtId);
  }
}
