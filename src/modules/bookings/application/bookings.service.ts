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
import { BOOKING_REPOSITORY } from '../../../common/constants/tokens';
import { IBookingRepository } from '../domain/booking.repository.interface';
import { BookingEntity } from '../domain/booking.entity';
import { VenuesService } from '../../venues/application/venues.service';
import { CourtsService } from '../../venues/application/courts.service';
import { StaffingService } from '../../staffing/application/staffing.service';
import { UsersService } from '../../users/application/users.service';
import { NotificationsService } from '../../notifications/application/notifications.service';

export interface CreateBookingInput {
  courtId: string;
  startsAt: string;
  endsAt: string;
}

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,
    @Inject(forwardRef(() => VenuesService))
    private readonly venuesService: VenuesService,
    @Inject(forwardRef(() => CourtsService))
    private readonly courtsService: CourtsService,
    @Inject(forwardRef(() => StaffingService))
    private readonly staffingService: StaffingService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * HOOK-01: Intentional Concurrency Race Condition (Check-Then-Act without Locking)
   *
   * In this Baseline implementation, the service checks availability using `isCourtAvailable()`,
   * but does not acquire a PostgreSQL row-level lock (`SELECT ... FOR UPDATE`), distributed lock (Redis),
   * nor does the database schema enforce a GIST tsrange exclusion constraint.
   * A short delay (50ms) is deliberately introduced between check and write to reliably reproduce
   * double-booking anomalies during concurrent load testing (e.g. k6 / artillery / Promise.all).
   */
  async createBooking(userId: string, input: CreateBookingInput): Promise<BookingEntity> {
    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(input.endsAt);

    if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime())) {
      throw new BadRequestException('Thời gian bắt đầu hoặc kết thúc không hợp lệ');
    }

    if (endsAt <= startsAt) {
      throw new BadRequestException('Thời gian kết thúc phải sau thời gian bắt đầu');
    }

    const durationMinutes = Math.round((endsAt.getTime() - startsAt.getTime()) / (1000 * 60));
    if (durationMinutes < 30 || durationMinutes > 240) {
      throw new BadRequestException('Thời lượng đặt sân phải từ 30 phút đến 4 giờ');
    }

    const now = new Date();
    if (startsAt <= now) {
      throw new BadRequestException('Thời gian bắt đầu đặt sân phải ở trong tương lai');
    }

    // Verify court and venue exist and are not deleted
    const court = await this.courtsService.getCourtById(input.courtId);
    const venue = await this.venuesService.findById(court.venueId);
    if (!venue || venue.deletedAt) {
      throw new BadRequestException('Cụm sân của sân con này đã ngừng hoạt động');
    }

    // HOOK-01 Check step:
    const isAvailable = await this.bookingRepository.isCourtAvailable(court.id, startsAt, endsAt);
    if (!isAvailable) {
      throw new ConflictException('Sân đã có người đặt trong khung giờ này');
    }

    // HOOK-01 Artificial delay window to expose the race condition
    await new Promise((resolve) => setTimeout(resolve, 50));

    // HOOK-01 Act step: Save booking without concurrency barrier
    const booking = new BookingEntity({
      id: crypto.randomUUID ? crypto.randomUUID() : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`,
      courtId: court.id,
      venueId: court.venueId,
      userId,
      startsAt,
      endsAt,
      status: 'CONFIRMED',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await this.bookingRepository.save(booking);
    this.logger.debug(`[HOOK-01] Created booking ${saved.id} for court ${court.id}`);
    return saved;
  }

  async getUserBookings(userId: string, status?: 'CONFIRMED' | 'CANCELLED'): Promise<BookingEntity[]> {
    const bookings = await this.bookingRepository.findByUserId(userId);
    if (status) {
      return bookings.filter((b) => b.status === status);
    }
    return bookings;
  }

  async getUserBookingById(userId: string, bookingId: string): Promise<BookingEntity> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Không tìm thấy lịch đặt');
    }
    if (booking.userId !== userId) {
      throw new ForbiddenException('Bạn không phải chủ sở hữu của lượt đặt sân này');
    }
    return booking;
  }

  async cancelCustomerBooking(userId: string, bookingId: string): Promise<BookingEntity> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Không tìm thấy lịch đặt');
    }
    if (booking.userId !== userId) {
      throw new ForbiddenException('Bạn không phải chủ sở hữu của lượt đặt sân này');
    }
    if (booking.isCancelled()) {
      throw new BadRequestException('Lượt đặt sân này đã bị hủy trước đó');
    }

    // Constraint: Customer can only cancel at least 30 minutes before startsAt
    const now = Date.now();
    const leadTimeMs = booking.startsAt.getTime() - now;
    if (leadTimeMs < 30 * 60 * 1000) {
      throw new BadRequestException('Khách chỉ được tự hủy trước giờ bắt đầu tối thiểu 30 phút');
    }

    booking.cancel(userId, null);
    return this.bookingRepository.update(booking);
  }

  async getVenueBookings(
    requesterId: string,
    venueId: string,
    filter?: { courtId?: string; status?: 'CONFIRMED' | 'CANCELLED' },
  ): Promise<any[]> {
    await this.assertCanManageVenue(requesterId, venueId);
    let bookings = await this.bookingRepository.findByVenueId(venueId);
    if (filter?.courtId) {
      bookings = bookings.filter((b) => b.courtId === filter.courtId);
    }
    if (filter?.status) {
      bookings = bookings.filter((b) => b.status === filter.status);
    }
    return Promise.all(bookings.map((b) => this.toBookingWithCustomerProfile(b)));
  }

  async getVenueBookingById(
    requesterId: string,
    venueId: string,
    bookingId: string,
  ): Promise<BookingEntity> {
    await this.assertCanManageVenue(requesterId, venueId);
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking || booking.venueId !== venueId) {
      throw new NotFoundException('Không tìm thấy lịch đặt tại cụm sân này');
    }
    return booking;
  }

  async getVenueBookingByIdWithProfile(
    requesterId: string,
    venueId: string,
    bookingId: string,
  ): Promise<any> {
    const booking = await this.getVenueBookingById(requesterId, venueId, bookingId);
    return this.toBookingWithCustomerProfile(booking);
  }

  async toBookingWithCustomerProfile(booking: BookingEntity): Promise<any> {
    const user = await this.usersService.findById(booking.userId);
    return {
      id: booking.id,
      venueId: booking.venueId,
      courtId: booking.courtId,
      userId: booking.userId,
      startsAt: booking.startsAt.toISOString(),
      endsAt: booking.endsAt.toISOString(),
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
      cancelledAt: booking.cancelledAt ? booking.cancelledAt.toISOString() : null,
      cancellationReason: booking.cancellationReason ?? null,
      customerProfile: user
        ? {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
          }
        : {
            id: booking.userId,
            fullName: 'Khách hàng',
            email: 'unknown@example.com',
            phone: '+84000000000',
          },
    };
  }

  /**
   * Venue Cancellation with HOOK-03 Synchronous Notification Dispatch
   */
  async cancelVenueBooking(
    requesterId: string,
    venueId: string,
    bookingId: string,
    cancellationReason: string,
  ): Promise<BookingEntity> {
    await this.assertCanManageVenue(requesterId, venueId);

    if (!cancellationReason || cancellationReason.trim().length === 0) {
      throw new BadRequestException(
        'Lý do hủy sân là bắt buộc đối với chủ sân và quản lý',
      );
    }
    if (cancellationReason.length > 1000) {
      throw new BadRequestException('Lý do hủy không được vượt quá 1000 ký tự');
    }

    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking || booking.venueId !== venueId) {
      throw new NotFoundException('Không tìm thấy lịch đặt tại cụm sân này');
    }
    if (booking.isCancelled()) {
      throw new BadRequestException('Lịch đặt sân này đã bị hủy trước đó');
    }

    booking.cancel(requesterId, cancellationReason.trim());
    const updatedBooking = await this.bookingRepository.update(booking);

    const court = await this.courtsService.getCourtById(booking.courtId);

    // HOOK-03: Synchronous Notification Coupling
    await this.notificationsService.dispatchSync({
      recipientId: booking.userId,
      bookingId: booking.id,
      type: 'BOOKING_CANCELLED_BY_VENUE',
      message: `Lịch đặt tại sân ${court.name} đã bị hủy bởi quản lý. Lý do: ${cancellationReason}`,
    });

    return updatedBooking;
  }

  async getCustomerProfileForBooking(
    requesterId: string,
    venueId: string,
    bookingId: string,
  ) {
    await this.assertCanManageVenue(requesterId, venueId);
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking || booking.venueId !== venueId) {
      throw new NotFoundException('Không tìm thấy lịch đặt tại cụm sân này');
    }

    const user = await this.usersService.findById(booking.userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin khách hàng đặt sân');
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
    };
  }

  async hasActiveFutureBookingsForCourt(courtId: string): Promise<boolean> {
    const bookings = await this.bookingRepository.findByCourtId(courtId);
    const now = new Date();
    return bookings.some((b) => b.isConfirmed() && b.endsAt > now);
  }

  async hasActiveFutureBookingsForVenue(venueId: string): Promise<boolean> {
    const bookings = await this.bookingRepository.findByVenueId(venueId);
    const now = new Date();
    return bookings.some((b) => b.isConfirmed() && b.endsAt > now);
  }

  async getUpcomingBookingCountByCourt(courtId: string): Promise<number> {
    const bookings = await this.bookingRepository.findByCourtId(courtId);
    const now = new Date();
    return bookings.filter((b) => b.isConfirmed() && b.endsAt > now).length;
  }

  async getBookingsForCourtDate(courtId: string, date: Date): Promise<BookingEntity[]> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const bookings = await this.bookingRepository.findByCourtId(courtId);
    return bookings.filter(
      (b) =>
        b.isConfirmed() &&
        b.startsAt.getTime() <= endOfDay.getTime() &&
        b.endsAt.getTime() >= startOfDay.getTime(),
    );
  }

  async isCourtAvailable(courtId: string, startsAt: Date, endsAt: Date): Promise<boolean> {
    return this.bookingRepository.isCourtAvailable(courtId, startsAt, endsAt);
  }

  private async assertCanManageVenue(userId: string, venueId: string): Promise<void> {
    const venue = await this.venuesService.findById(venueId);
    if (!venue || venue.deletedAt) {
      throw new NotFoundException('Cụm sân không tồn tại');
    }
    if (venue.ownerId === userId) {
      return;
    }
    const isManager = await this.staffingService.isUserActiveManager(userId, venueId);
    if (!isManager) {
      throw new ForbiddenException(
        'Bạn không có quyền quản lý lịch đặt của cụm sân này',
      );
    }
  }
}
