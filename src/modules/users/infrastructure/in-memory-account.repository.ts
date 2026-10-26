import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IAccountRepository, AccountFilter } from '../domain/account.repository.interface';
import { AccountEntity } from '../domain/account.entity';

// Seed UUIDs matching prisma/seed.ts
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

export const SEED_ACCOUNTS = {
  admin: id(1001),
  ownerAnPhu: id(1002),
  ownerThuDuc: id(1003),
  managerMinh: id(1004),
  userLan: id(1005),
  userHuy: id(1006),
  lockedUser: id(1007),
  deletedUser: id(1008),
};

@Injectable()
export class InMemoryAccountRepository implements IAccountRepository {
  private readonly accounts: Map<string, AccountEntity> = new Map();

  constructor() {
    this.seedInitialAccounts();
  }

  private seedInitialAccounts() {
    // Default password for all seed accounts is: Secret123@
    const defaultPasswordHash = bcrypt.hashSync('Secret123@', 10);
    const now = new Date();
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

    const initial = [
      new AccountEntity({
        id: SEED_ACCOUNTS.admin,
        fullName: 'Quản trị viên',
        email: 'admin@example.com',
        phone: '+84900000001',
        passwordHash: defaultPasswordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: tenDaysAgo,
        updatedAt: now,
      }),
      new AccountEntity({
        id: SEED_ACCOUNTS.ownerAnPhu,
        fullName: 'Trần Quốc An',
        email: 'owner.anphu@example.com',
        phone: '+84900000002',
        passwordHash: defaultPasswordHash,
        role: 'OWNER',
        status: 'ACTIVE',
        createdAt: tenDaysAgo,
        updatedAt: now,
      }),
      new AccountEntity({
        id: SEED_ACCOUNTS.ownerThuDuc,
        fullName: 'Lê Thu Hà',
        email: 'owner.thuduc@example.com',
        phone: '+84900000003',
        passwordHash: defaultPasswordHash,
        role: 'OWNER',
        status: 'ACTIVE',
        createdAt: tenDaysAgo,
        updatedAt: now,
      }),
      new AccountEntity({
        id: SEED_ACCOUNTS.managerMinh,
        fullName: 'Phạm Minh Đức',
        email: 'manager.minh@example.com',
        phone: '+84900000004',
        passwordHash: defaultPasswordHash,
        role: 'USER',
        status: 'ACTIVE',
        createdAt: tenDaysAgo,
        updatedAt: now,
      }),
      new AccountEntity({
        id: SEED_ACCOUNTS.userLan,
        fullName: 'Nguyễn Ngọc Lan',
        email: 'user.lan@example.com',
        phone: '+84900000005',
        passwordHash: defaultPasswordHash,
        role: 'USER',
        status: 'ACTIVE',
        createdAt: tenDaysAgo,
        updatedAt: now,
      }),
      new AccountEntity({
        id: SEED_ACCOUNTS.userHuy,
        fullName: 'Võ Gia Huy',
        email: 'user.huy@example.com',
        phone: '+84900000006',
        passwordHash: defaultPasswordHash,
        role: 'USER',
        status: 'ACTIVE',
        createdAt: tenDaysAgo,
        updatedAt: now,
      }),
      new AccountEntity({
        id: SEED_ACCOUNTS.lockedUser,
        fullName: 'Đỗ Văn Khóa',
        email: 'user.locked@example.com',
        phone: '+84900000007',
        passwordHash: defaultPasswordHash,
        role: 'USER',
        status: 'LOCKED',
        createdAt: tenDaysAgo,
        updatedAt: now,
      }),
      new AccountEntity({
        id: SEED_ACCOUNTS.deletedUser,
        fullName: 'Bùi Thị Xóa',
        email: 'user.deleted@example.com',
        phone: '+84900000008',
        passwordHash: defaultPasswordHash,
        role: 'USER',
        status: 'DELETED',
        createdAt: tenDaysAgo,
        updatedAt: now,
        deletedAt: tenDaysAgo,
      }),
    ];

    for (const acc of initial) {
      this.accounts.set(acc.id, acc);
    }
  }

  async findById(id: string): Promise<AccountEntity | null> {
    return this.accounts.get(id) || null;
  }

  async findByEmail(email: string): Promise<AccountEntity | null> {
    const normalized = email.toLowerCase().trim();
    for (const account of this.accounts.values()) {
      if (account.email === normalized) {
        return account;
      }
    }
    return null;
  }

  async findByPhone(phone: string): Promise<AccountEntity | null> {
    const normalized = phone.trim();
    for (const account of this.accounts.values()) {
      if (account.phone === normalized) {
        return account;
      }
    }
    return null;
  }

  async findAll(filter?: AccountFilter): Promise<AccountEntity[]> {
    let result = Array.from(this.accounts.values());
    if (filter) {
      if (filter.role) {
        result = result.filter((a) => a.role === filter.role);
      }
      if (filter.status) {
        result = result.filter((a) => a.status === filter.status);
      }
      if (filter.search) {
        const s = filter.search.toLowerCase();
        result = result.filter(
          (a) =>
            a.fullName.toLowerCase().includes(s) ||
            a.email.toLowerCase().includes(s) ||
            a.phone.includes(s),
        );
      }
    }
    return result;
  }

  async save(account: AccountEntity): Promise<AccountEntity> {
    this.accounts.set(account.id, account);
    return account;
  }

  async update(account: AccountEntity): Promise<AccountEntity> {
    this.accounts.set(account.id, account);
    return account;
  }
}
