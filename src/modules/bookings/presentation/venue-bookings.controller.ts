import { Controller, Get, Post, Param, Body, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from '../application/bookings.service';
import { CancelVenueBookingDto } from './dto/cancel-venue-booking.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { DynamicManagerGuard } from '../../../common/guards/dynamic-manager.guard';
import { CurrentUser, AuthUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Owner và Manager')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, DynamicManagerGuard)
@Controller('venues/:venueId/bookings')
export class VenueBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @ApiOperation({ summary: 'Xem danh sách booking của Venue', operationId: 'getVenueBookings' })
  @ApiQuery({ name: 'courtId', required: false, description: 'Lọc theo sân con' })
  @ApiQuery({ name: 'status', required: false, enum: ['CONFIRMED', 'CANCELLED'], description: 'Lọc theo trạng thái' })
  async getVenueBookings(
    @CurrentUser() user: AuthUser,
    @Param('venueId') venueId: string,
    @Query('courtId') courtId?: string,
    @Query('status') status?: 'CONFIRMED' | 'CANCELLED',
  ) {
    return this.bookingsService.getVenueBookings(user.userId, venueId, { courtId, status });
  }

  @Get(':bookingId')
  @ApiOperation({ summary: 'Xem chi tiết booking của Venue', operationId: 'getVenueBookingById' })
  async getVenueBookingById(
    @CurrentUser() user: AuthUser,
    @Param('venueId') venueId: string,
    @Param('bookingId') bookingId: string,
  ) {
    return this.bookingsService.getVenueBookingByIdWithProfile(
      user.userId,
      venueId,
      bookingId,
    );
  }

  @Post(':bookingId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hủy booking của khách kèm lý do bắt buộc', operationId: 'postVenueBookingCancel' })
  @ApiResponse({ status: 200, description: 'Hủy lịch đặt của khách thành công và đã ghi nhận thông báo Outbox' })
  @ApiResponse({ status: 400, description: 'Thiếu lý do hủy sân bắt buộc' })
  async cancelVenueBooking(
    @CurrentUser() user: AuthUser,
    @Param('venueId') venueId: string,
    @Param('bookingId') bookingId: string,
    @Body() dto: CancelVenueBookingDto,
  ) {
    const reason = dto.reason || dto.cancellationReason || '';
    const b = await this.bookingsService.cancelVenueBooking(
      user.userId,
      venueId,
      bookingId,
      reason,
    );
    return this.bookingsService.toBookingWithCustomerProfile(b);
  }

  @Get(':bookingId/customer-profile')
  @ApiOperation({ summary: 'Xem profile người đặt sân', operationId: 'getVenueBookingCustomerProfile' })
  async getCustomerProfile(
    @CurrentUser() user: AuthUser,
    @Param('venueId') venueId: string,
    @Param('bookingId') bookingId: string,
  ) {
    return this.bookingsService.getCustomerProfileForBooking(
      user.userId,
      venueId,
      bookingId,
    );
  }
}
