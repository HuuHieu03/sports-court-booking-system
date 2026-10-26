import { AccountEntity, AccountRole, AccountStatus } from './account.entity';

export interface AccountFilter {
  search?: string;
  role?: AccountRole;
  status?: AccountStatus;
}

export interface IAccountRepository {
  findById(id: string): Promise<AccountEntity | null>;
  findByEmail(email: string): Promise<AccountEntity | null>;
  findByPhone(phone: string): Promise<AccountEntity | null>;
  findAll(filter?: AccountFilter): Promise<AccountEntity[]>;
  save(account: AccountEntity): Promise<AccountEntity>;
  update(account: AccountEntity): Promise<AccountEntity>;
}
