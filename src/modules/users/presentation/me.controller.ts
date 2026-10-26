import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService, AccountProfileDto } from '../application/users.service';
import { CurrentUser, AuthUser } from '../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Tài khoản')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me')
export class MeController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Xem tài khoản của chính mình', operationId: 'getMe' })
  @ApiResponse({ status: 200, description: 'Thông tin tài khoản cá nhân' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  async getMe(@CurrentUser() user: AuthUser): Promise<AccountProfileDto> {
    return this.usersService.getMe(user.userId);
  }
}
