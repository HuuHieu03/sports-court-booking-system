import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
  forwardRef,
} from '@nestjs/common';
import { ACCOUNT_REPOSITORY } from '../../../common/constants/tokens';
import { IAccountRepository, AccountFilter } from '../domain/account.repository.interface';
import { AccountEntity, AccountRole, AccountStatus } from '../domain/account.entity';
import { StaffingService } from '../../staffing/application/staffing.service';

export interface AccountProfileDto {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: AccountRole;
  status: AccountStatus;
  managedVenueIds: string[];
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class UsersService {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
    @Inject(forwardRef(() => StaffingService))
    private readonly staffingService?: StaffingService,
  ) {}

  async findById(id: string): Promise<AccountEntity | null> {
    return this.accountRepository.findById(id);
  }

  async findByEmail(email: string): Promise<AccountEntity | null> {
    return this.accountRepository.findByEmail(email);
  }

  async findByPhone(phone: string): Promise<AccountEntity | null> {
    return this.accountRepository.findByPhone(phone);
  }

  async create(data: {
    fullName: string;
    email: string;
    phone: string;
    passwordHash: string;
    role: AccountRole;
  }): Promise<AccountEntity> {
    const existingEmail = await this.accountRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    const existingPhone = await this.accountRepository.findByPhone(data.phone);
    if (existingPhone) {
      throw new ConflictException('Số điện thoại này đã được sử dụng');
    }

    const newAccount = new AccountEntity({
      id: crypto.randomUUID ? crypto.randomUUID() : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      passwordHash: data.passwordHash,
      role: data.role,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.accountRepository.save(newAccount);
  }

  async getManagedVenueIds(userId: string): Promise<string[]> {
    if (this.staffingService && typeof this.staffingService.getActiveManagedVenueIds === 'function') {
      return this.staffingService.getActiveManagedVenueIds(userId);
    }
    return [];
  }

  async getMe(userId: string): Promise<AccountProfileDto> {
    const account = await this.accountRepository.findById(userId);
    if (!account || account.deletedAt) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }

    const managedVenueIds = await this.getManagedVenueIds(userId);

    return {
      id: account.id,
      fullName: account.fullName,
      email: account.email,
      phone: account.phone,
      role: account.role,
      status: account.status,
      managedVenueIds,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    };
  }

  async listAccounts(filter?: AccountFilter): Promise<AccountEntity[]> {
    return this.accountRepository.findAll(filter);
  }

  async updateAccountStatus(accountId: string, status: 'ACTIVE' | 'LOCKED'): Promise<AccountEntity> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }
    if (account.deletedAt) {
      throw new ConflictException({
        code: 'ACCOUNT_STATUS_CONFLICT',
        message: 'Không thể thay đổi trạng thái của tài khoản đã xóa logic',
      });
    }

    if (status === 'ACTIVE') {
      account.activate();
    } else {
      account.lock();
    }

    return this.accountRepository.update(account);
  }

  async softDeleteAccount(accountId: string): Promise<void> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }
    if (account.deletedAt !== null) {
      return;
    }

    account.softDelete();
    await this.accountRepository.update(account);
  }
}
