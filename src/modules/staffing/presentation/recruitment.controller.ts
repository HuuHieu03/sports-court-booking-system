import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { StaffingService } from '../application/staffing.service';
import { RecruitmentToggleDto } from './dto/recruitment-toggle.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Owner')
@ApiBearerAuth()
@Roles('OWNER')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('venues/:venueId/manager-recruitment')
export class RecruitmentController {
  constructor(private readonly staffingService: StaffingService) {}

  @Patch()
  @ApiOperation({ summary: 'Bật hoặc tắt tuyển dụng quản lý cho Venue', operationId: 'patchVenueRecruitment' })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái tuyển dụng thành công' })
  async toggleRecruitment(
    @CurrentUser() user: AuthUser,
    @Param('venueId') venueId: string,
    @Body() dto: RecruitmentToggleDto,
  ) {
    const isOpen = dto.isOpen !== undefined ? dto.isOpen : (dto.recruitmentOpen ?? false);
    const message = dto.message !== undefined ? dto.message : dto.recruitmentMessage;
    return this.staffingService.setRecruitment(
      user.userId,
      venueId,
      isOpen,
      message,
    );
  }
}
