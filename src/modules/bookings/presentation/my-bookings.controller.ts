import { Controller, Get, Post, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from '../application/bookings.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class MyBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('me/bookings')
  @ApiOperation({ summary: 'Xem lịch sử đặt sân của chính mình', operationId: 'getMeBookings' })
  @ApiQuery({ name: 'status', required: false, enum: ['CONFIRMED', 'CANCELLED'], description: 'Lọc theo trạng thái' })
  async getMyBookings(
    @CurrentUser() user: AuthUser,
    @Query('status') status?: 'CONFIRMED' | 'CANCELLED',
  ) {
    const bookings = await this.bookingsService.getUserBookings(user.userId, status);
    return bookings.map((b) => ({
      id: b.id,
      courtId: b.courtId,
      venueId: b.venueId,
      userId: b.userId,
      startsAt: b.startsAt.toISOString(),
      endsAt: b.endsAt.toISOString(),
      totalPrice: b.totalPrice,
      status: b.status,
      cancelledAt: b.cancelledAt ? b.cancelledAt.toISOString() : null,
      cancelledById: b.cancelledById,
      cancellationReason: b.cancellationReason,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    }));
  }

  @Get('me/bookings/:bookingId')
  @ApiOperation({ summary: 'Xem chi tiết lượt đặt sân của mình', operationId: 'getMeBookingById' })
  async getMyBookingById(
    @CurrentUser() user: AuthUser,
    @Param('bookingId') bookingId: string,
  ) {
    const b = await this.bookingsService.getUserBookingById(user.userId, bookingId);
    return {
      id: b.id,
      courtId: b.courtId,
      venueId: b.venueId,
      userId: b.userId,
      startsAt: b.startsAt.toISOString(),
      endsAt: b.endsAt.toISOString(),
      totalPrice: b.totalPrice,
      status: b.status,
      cancelledAt: b.cancelledAt ? b.cancelledAt.toISOString() : null,
      cancelledById: b.cancelledById,
      cancellationReason: b.cancellationReason,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    };
  }

  @Post('bookings/:bookingId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Khách tự hủy lịch đặt trước 30 phút', operationId: 'postBookingCancel' })
  @ApiResponse({ status: 200, description: 'Hủy lịch đặt thành công' })
  @ApiResponse({ status: 400, description: 'Hủy quá sát giờ (< 30 phút)' })
  async cancelMyBooking(
    @CurrentUser() user: AuthUser,
    @Param('bookingId') bookingId: string,
  ) {
    const b = await this.bookingsService.cancelCustomerBooking(user.userId, bookingId);
    return {
      id: b.id,
      courtId: b.courtId,
      venueId: b.venueId,
      userId: b.userId,
      startsAt: b.startsAt.toISOString(),
      endsAt: b.endsAt.toISOString(),
      totalPrice: b.totalPrice,
      status: b.status,
      createdAt: b.createdAt.toISOString(),
      cancelledAt: b.cancelledAt ? b.cancelledAt.toISOString() : null,
      cancelledById: b.cancelledById,
      cancellationReason: b.cancellationReason,
      updatedAt: b.updatedAt.toISOString(),
    };
  }
}
