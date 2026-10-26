export interface ManagerAppointmentProps {
  id: string;
  applicationId: string;
  venueId: string;
  userId: string;
  appointedAt: Date;
  revokedAt?: Date | null;
}

export class ManagerAppointmentEntity {
  public readonly id: string;
  public readonly applicationId: string;
  public readonly venueId: string;
  public readonly userId: string;
  public readonly appointedAt: Date;
  public revokedAt: Date | null;

  constructor(props: ManagerAppointmentProps) {
    this.id = props.id;
    this.applicationId = props.applicationId;
    this.venueId = props.venueId;
    this.userId = props.userId;
    this.appointedAt = props.appointedAt;
    this.revokedAt = props.revokedAt ?? null;
  }

  public isActive(): boolean {
    return this.revokedAt === null;
  }

  public revoke(): void {
    this.revokedAt = new Date();
  }
}
