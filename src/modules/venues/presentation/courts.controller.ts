import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CourtsService } from '../application/courts.service';
import { VenuesService } from '../application/venues.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { DynamicManagerGuard } from '../../../common/guards/dynamic-manager.guard';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser, AuthUser } from '../../../common/decorators/current-user.decorator';
import { StaffingService } from '../../staffing/application/staffing.service';

@ApiTags('Công khai', 'Owner và Manager')
@Controller()
export class CourtsController {
  constructor(
    private readonly courtsService: CourtsService,
    private readonly venuesService: VenuesService,
    private readonly staffingService: StaffingService,
  ) {}

  @Public()
  @Get('venues/:venueId/courts')
  @ApiOperation({ summary: 'Xem các Court thuộc Venue', operationId: 'getVenueCourts' })
  async getVenueCourts(@Param('venueId') venueId: string) {
    const courts = await this.courtsService.getCourtsByVenue(venueId);
    return courts.map((c) => ({
      id: c.id,
      venueId: c.venueId,
      name: c.name,
      description: c.description,
      hourlyRate: c.hourlyRate,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, DynamicManagerGuard)
  @Post('venues/:venueId/courts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Thêm Court mới vào Venue', operationId: 'postVenueCourts' })
  async createCourt(
    @Param('venueId') venueId: string,
    @Body() dto: CreateCourtDto,
  ) {
    const court = await this.courtsService.createCourt(venueId, dto);
    return {
      id: court.id,
      venueId: court.venueId,
      name: court.name,
      description: court.description,
      hourlyRate: court.hourlyRate,
      createdAt: court.createdAt.toISOString(),
      updatedAt: court.updatedAt.toISOString(),
    };
  }

  @Public()
  @Get('courts/:courtId')
  @ApiOperation({ summary: 'Xem chi tiết Court', operationId: 'getCourtById' })
  async getCourtById(@Param('courtId') courtId: string) {
    const c = await this.courtsService.getCourtById(courtId);
    return {
      id: c.id,
      venueId: c.venueId,
      name: c.name,
      description: c.description,
      hourlyRate: c.hourlyRate,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('courts/:courtId')
  @ApiOperation({ summary: 'Cập nhật thông tin Court', operationId: 'patchCourtById' })
  async updateCourt(
    @CurrentUser() user: AuthUser,
    @Param('courtId') courtId: string,
    @Body() dto: UpdateCourtDto,
  ) {
    const court = await this.courtsService.getCourtById(courtId);
    await this.assertCanManageVenue(user.userId, court.venueId);

    const updated = await this.courtsService.updateCourt(courtId, dto);
    return {
      id: updated.id,
      venueId: updated.venueId,
      name: updated.name,
      description: updated.description,
      hourlyRate: updated.hourlyRate,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('courts/:courtId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa logic Court', operationId: 'deleteCourtById' })
  async deleteCourt(
    @CurrentUser() user: AuthUser,
    @Param('courtId') courtId: string,
  ): Promise<void> {
    const court = await this.courtsService.getCourtById(courtId);
    await this.assertCanManageVenue(user.userId, court.venueId);
    await this.courtsService.deleteCourt(courtId);
  }

  @Public()
  @Get('courts/:courtId/availability')
  @ApiOperation({ summary: 'Kiểm tra sân trống trong khung giờ', operationId: 'getCourtAvailability' })
  @ApiQuery({ name: 'startsAt', required: true, description: 'Giờ bắt đầu có múi giờ' })
  @ApiQuery({ name: 'endsAt', required: true, description: 'Giờ kết thúc có múi giờ' })
  async getAvailability(
    @Param('courtId') courtId: string,
    @Query('startsAt') startsAt?: string,
    @Query('endsAt') endsAt?: string,
  ) {
    if (!startsAt || !endsAt) {
      throw new BadRequestException('startsAt và endsAt là bắt buộc');
    }
    return this.courtsService.checkAvailability(courtId, startsAt, endsAt);
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
      throw new ForbiddenException('Bạn không có quyền quản lý sân con này');
    }
  }
}
