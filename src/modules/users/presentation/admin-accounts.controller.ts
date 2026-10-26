import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UsersService } from '../application/users.service';
import { UpdateAccountStatusDto } from './dto/update-account-status.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../../common/decorators/current-user.decorator';
import { AccountRole, AccountStatus } from '../domain/account.entity';

@ApiTags('Admin')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/accounts')
export class AdminAccountsController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Xem danh sách tài khoản', operationId: 'getAdminAccounts' })
  @ApiQuery({ name: 'q', required: false, description: 'Tìm theo tên hoặc email' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'role', required: false, enum: ['USER', 'OWNER', 'ADMIN'] })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'LOCKED', 'DELETED'] })
  async getAccounts(
    @Query('q') q?: string,
    @Query('search') search?: string,
    @Query('role') role?: AccountRole,
    @Query('status') status?: AccountStatus,
  ) {
    const keyword = q || search;
    const accounts = await this.usersService.listAccounts({ search: keyword, role, status });
    const result = [];
    for (const a of accounts) {
      const managedVenueIds = await this.usersService.getManagedVenueIds(a.id);
      result.push({
        id: a.id,
        fullName: a.fullName,
        email: a.email,
        phone: a.phone,
        role: a.role,
        status: a.status,
        managedVenueIds,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
        deletedAt: a.deletedAt ? a.deletedAt.toISOString() : null,
      });
    }
    return result;
  }

  @Get(':accountId')
  @ApiOperation({ summary: 'Xem chi tiết tài khoản', operationId: 'getAdminAccountById' })
  async getAccountById(@Param('accountId') accountId: string) {
    const a = await this.usersService.findById(accountId);
    if (!a) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }
    const managedVenueIds = await this.usersService.getManagedVenueIds(a.id);
    return {
      id: a.id,
      fullName: a.fullName,
      email: a.email,
      phone: a.phone,
      role: a.role,
      status: a.status,
      managedVenueIds,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      deletedAt: a.deletedAt ? a.deletedAt.toISOString() : null,
    };
  }

  @Patch(':accountId/status')
  @ApiOperation({ summary: 'Khóa hoặc mở khóa tài khoản', operationId: 'patchAdminAccountStatus' })
  async updateStatus(
    @CurrentUser() user: AuthUser,
    @Param('accountId') accountId: string,
    @Body() dto: UpdateAccountStatusDto,
  ) {
    if (user.userId === accountId && dto.status === 'LOCKED') {
      throw new ConflictException({
        code: 'ADMIN_CANNOT_LOCK_SELF',
        message: 'Admin không thể tự khóa tài khoản của chính mình',
      });
    }

    const updated = await this.usersService.updateAccountStatus(accountId, dto.status);
    const managedVenueIds = await this.usersService.getManagedVenueIds(updated.id);
    return {
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      status: updated.status,
      managedVenueIds,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      deletedAt: updated.deletedAt ? updated.deletedAt.toISOString() : null,
    };
  }

  @Delete(':accountId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa logic tài khoản', operationId: 'deleteAdminAccount' })
  async deleteAccount(
    @CurrentUser() user: AuthUser,
    @Param('accountId') accountId: string,
  ): Promise<void> {
    if (user.userId === accountId) {
      throw new ConflictException({
        code: 'SELF_DELETE_NOT_ALLOWED',
        message: 'Không thể tự xóa tài khoản Admin đang đăng nhập',
      });
    }
    await this.usersService.softDeleteAccount(accountId);
  }
}
