import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { StaffingService } from '../application/staffing.service';
import { ApplyManagerDto } from './dto/apply-manager.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('User', 'Owner')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('venues/:venueId/manager-applications')
export class ApplicationsController {
  constructor(private readonly staffingService: StaffingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Nộp hồ sơ ứng tuyển làm quản lý Venue', operationId: 'postVenueManagerApplications' })
  @ApiResponse({ status: 201, description: 'Nộp đơn ứng tuyển thành công' })
  async apply(
    @CurrentUser() user: AuthUser,
    @Param('venueId') venueId: string,
    @Body() dto: ApplyManagerDto,
  ) {
    const consent = dto.consentToShareContact ?? dto.consented ?? false;
    return this.staffingService.applyForManager(user.userId, venueId, consent);
  }

  @Roles('OWNER')
  @UseGuards(RolesGuard)
  @Get()
  @ApiOperation({ summary: 'Xem danh sách hồ sơ ứng tuyển của Venue', operationId: 'getVenueManagerApplications' })
  @ApiResponse({ status: 200, description: 'Danh sách hồ sơ ứng tuyển kèm thông tin liên hệ' })
  async getApplications(
    @CurrentUser() user: AuthUser,
    @Param('venueId') venueId: string,
  ) {
    return this.staffingService.getApplications(user.userId, venueId);
  }
}
