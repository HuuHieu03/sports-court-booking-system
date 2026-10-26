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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { VenuesService } from '../application/venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { DynamicManagerGuard } from '../../../common/guards/dynamic-manager.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser, AuthUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Công khai', 'Owner')
@Controller()
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Public()
  @Get('venues')
  @ApiOperation({ summary: 'Tìm và xem các Venue', operationId: 'getVenues' })
  @ApiQuery({ name: 'q', required: false, description: 'Từ khóa tìm kiếm theo tên hoặc địa chỉ' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'recruitmentOnly', required: false, type: Boolean })
  async getVenues(
    @Query('q') q?: string,
    @Query('search') search?: string,
    @Query('recruitmentOnly') recruitmentOnly?: string,
  ) {
    const keyword = q || search;
    const isRecruitment = recruitmentOnly === 'true';
    return this.venuesService.getVenues({ search: keyword, recruitmentOnly: isRecruitment });
  }

  @ApiBearerAuth()
  @Roles('OWNER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me/venues')
  @ApiOperation({ summary: 'Xem các Venue thuộc sở hữu', operationId: 'getMeVenues' })
  async getMeVenues(@CurrentUser() user: AuthUser) {
    return this.venuesService.getOwnerVenues(user.userId);
  }

  @Public()
  @Get('venues/:venueId')
  @ApiOperation({ summary: 'Xem chi tiết Venue', operationId: 'getVenueById' })
  async getVenueById(@Param('venueId') venueId: string) {
    return this.venuesService.getVenueDetail(venueId);
  }

  @ApiBearerAuth()
  @Roles('OWNER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('venues')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo Venue mới', operationId: 'postVenues' })
  async createVenue(@CurrentUser() user: AuthUser, @Body() dto: CreateVenueDto) {
    const venue = await this.venuesService.createVenue(user.userId, dto);
    return {
      id: venue.id,
      name: venue.name,
      address: venue.address,
      description: venue.description,
      managerRecruitment: {
        isOpen: venue.recruitmentOpen,
        message: venue.recruitmentMessage,
      },
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, DynamicManagerGuard)
  @Patch('venues/:venueId')
  @ApiOperation({ summary: 'Cập nhật thông tin Venue', operationId: 'patchVenueById' })
  async updateVenue(
    @CurrentUser() user: AuthUser,
    @Param('venueId') venueId: string,
    @Body() dto: UpdateVenueDto,
  ) {
    const updated = await this.venuesService.updateVenue(user.userId, venueId, dto);
    return {
      id: updated.id,
      name: updated.name,
      address: updated.address,
      description: updated.description,
      managerRecruitment: {
        isOpen: updated.recruitmentOpen,
        message: updated.recruitmentMessage,
      },
    };
  }

  @ApiBearerAuth()
  @Roles('OWNER')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('venues/:venueId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa logic Venue', operationId: 'deleteVenueById' })
  async deleteVenue(
    @CurrentUser() user: AuthUser,
    @Param('venueId') venueId: string,
  ): Promise<void> {
    await this.venuesService.deleteVenue(user.userId, venueId);
  }
}
