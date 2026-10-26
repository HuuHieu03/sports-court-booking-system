import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { StaffingService } from '../application/staffing.service';
import { AppointManagerDto } from './dto/appoint-manager.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Owner', 'Owner và Manager')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('venues/:venueId/managers')
export class AppointmentsController {
  constructor(private readonly staffingService: StaffingService) {}

  @Roles('OWNER')
  @UseGuards(RolesGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bổ nhiệm Manager cho Venue', operationId: 'postVenueManagers' })
  @ApiResponse({ status: 201, description: 'Bổ nhiệm thành công' })
  @ApiResponse({ status: 409, description: 'Đã có quản lý đương nhiệm' })
  async appoint(
    @CurrentUser() user: AuthUser,
    @Param('venueId') venueId: string,
    @Body() dto: AppointManagerDto,
  ) {
    return this.staffingService.appointManager(user.userId, venueId, dto.applicationId);
  }

  @Get()
  @ApiOperation({ summary: 'Xem danh sách quản lý và lịch sử bổ nhiệm', operationId: 'getVenueManagers' })
  async getManagers(
    @CurrentUser() user: AuthUser,
    @Param('venueId') venueId: string,
  ) {
    return this.staffingService.getManagers(user.userId, venueId);
  }

  @Roles('OWNER')
  @UseGuards(RolesGuard)
  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Thu hồi quyền Manager tại Venue', operationId: 'deleteVenueManagerByUserId' })
  @ApiResponse({ status: 204, description: 'Thu hồi quyền thành công' })
  async revoke(
    @CurrentUser() user: AuthUser,
    @Param('venueId') venueId: string,
    @Param('userId') targetUserId: string,
  ): Promise<void> {
    await this.staffingService.revokeManager(user.userId, venueId, targetUserId);
  }
}
