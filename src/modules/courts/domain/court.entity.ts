export enum SportType {
  BADMINTON = 'BADMINTON',
  TENNIS = 'TENNIS',
  FOOTBALL = 'FOOTBALL',
  BASKETBALL = 'BASKETBALL',
  PICKLEBALL = 'PICKLEBALL',
}

export enum CourtStatus {
  AVAILABLE = 'AVAILABLE',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
}

export class Court {
  constructor(
    public readonly id: string,
    public readonly venueId: string,
    public readonly name: string,
    public readonly sportType: SportType,
    public readonly hourlyRate: number,
    public readonly status: CourtStatus = CourtStatus.AVAILABLE,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}
}
