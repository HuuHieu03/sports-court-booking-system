import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { BookingsService } from '../application/bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đặt sân', operationId: 'postBookings' })
  @ApiResponse({ status: 201, description: 'Đặt sân thành công' })
  @ApiResponse({ status: 400, description: 'Ràng buộc thời gian hoặc dữ liệu không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Sân đã có người đặt trong khung giờ này' })
  async createBooking(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateBookingDto,
  ) {
    const booking = await this.bookingsService.createBooking(user.userId, dto);
    return {
      id: booking.id,
      courtId: booking.courtId,
      venueId: booking.venueId,
      userId: booking.userId,
      startsAt: booking.startsAt.toISOString(),
      endsAt: booking.endsAt.toISOString(),
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };
  }
}
