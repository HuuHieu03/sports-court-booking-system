export type AccountRole = 'USER' | 'OWNER' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'LOCKED' | 'DELETED';

export interface AccountProps {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: AccountRole;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class AccountEntity {
  public readonly id: string;
  public fullName: string;
  public email: string;
  public phone: string;
  public passwordHash: string;
  public role: AccountRole;
  public status: AccountStatus;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date | null;

  constructor(props: AccountProps) {
    this.id = props.id;
    this.fullName = props.fullName;
    this.email = props.email.toLowerCase().trim();
    this.phone = props.phone.trim();
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt ?? null;
  }

  public isActive(): boolean {
    return this.status === 'ACTIVE' && this.deletedAt === null;
  }

  public isLocked(): boolean {
    return this.status === 'LOCKED';
  }

  public isDeleted(): boolean {
    return this.status === 'DELETED' || this.deletedAt !== null;
  }

  public lock(): void {
    this.status = 'LOCKED';
    this.updatedAt = new Date();
  }

  public activate(): void {
    if (this.deletedAt !== null) {
      throw new Error('Không thể kích hoạt lại tài khoản đã xóa logic');
    }
    this.status = 'ACTIVE';
    this.updatedAt = new Date();
  }

  public softDelete(): void {
    this.status = 'DELETED';
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }
}
