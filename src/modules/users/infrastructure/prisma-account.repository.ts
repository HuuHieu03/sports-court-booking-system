import { Injectable } from '@nestjs/common';
import { IAccountRepository, AccountFilter } from '../domain/account.repository.interface';
import { AccountEntity, AccountRole, AccountStatus } from '../domain/account.entity';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { Account as PrismaAccount } from '../../../generated/prisma/client';

@Injectable()
export class PrismaAccountRepository implements IAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(raw: PrismaAccount): AccountEntity {
    return new AccountEntity({
      id: raw.id,
      fullName: raw.fullName,
      email: raw.email,
      phone: raw.phone,
      passwordHash: raw.passwordHash,
      role: raw.role as AccountRole,
      status: raw.status as AccountStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  async findById(id: string): Promise<AccountEntity | null> {
    const record = await this.prisma.account.findUnique({ where: { id } });
    return record ? this.toEntity(record) : null;
  }

  async findByEmail(email: string): Promise<AccountEntity | null> {
    const normalized = email.toLowerCase().trim();
    const record = await this.prisma.account.findUnique({ where: { email: normalized } });
    return record ? this.toEntity(record) : null;
  }

  async findByPhone(phone: string): Promise<AccountEntity | null> {
    const normalized = phone.trim();
    const record = await this.prisma.account.findUnique({ where: { phone: normalized } });
    return record ? this.toEntity(record) : null;
  }

  async findAll(filter?: AccountFilter): Promise<AccountEntity[]> {
    const where: any = {};
    if (filter?.role) {
      where.role = filter.role;
    }
    if (filter?.status) {
      where.status = filter.status;
    }
    if (filter?.search) {
      const s = filter.search.toLowerCase().trim();
      where.OR = [
        { fullName: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { phone: { contains: s } },
      ];
    }

    const records = await this.prisma.account.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.toEntity(r));
  }

  async save(account: AccountEntity): Promise<AccountEntity> {
    const created = await this.prisma.account.create({
      data: {
        id: account.id,
        fullName: account.fullName,
        email: account.email,
        phone: account.phone,
        passwordHash: account.passwordHash,
        role: account.role as any,
        status: account.status as any,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
        deletedAt: account.deletedAt,
      },
    });
    return this.toEntity(created);
  }

  async update(account: AccountEntity): Promise<AccountEntity> {
    const updated = await this.prisma.account.update({
      where: { id: account.id },
      data: {
        fullName: account.fullName,
        email: account.email,
        phone: account.phone,
        passwordHash: account.passwordHash,
        role: account.role as any,
        status: account.status as any,
        updatedAt: account.updatedAt,
        deletedAt: account.deletedAt,
      },
    });
    return this.toEntity(updated);
  }
}
