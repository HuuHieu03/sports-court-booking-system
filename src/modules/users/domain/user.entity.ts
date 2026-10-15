export enum UserRole {
  ADMIN = 'ADMIN',
  VENUE_MANAGER = 'VENUE_MANAGER',
  CUSTOMER = 'CUSTOMER',
}

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly fullName: string,
    public readonly role: UserRole,
    public readonly phoneNumber?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}
}
