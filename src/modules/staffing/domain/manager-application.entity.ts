export type ApplicationStatus = 'SUBMITTED' | 'APPOINTED' | 'REVOKED';

export interface ManagerApplicationProps {
  id: string;
  venueId: string;
  applicantId: string;
  status: ApplicationStatus;
  consentedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class ManagerApplicationEntity {
  public readonly id: string;
  public readonly venueId: string;
  public readonly applicantId: string;
  public status: ApplicationStatus;
  public readonly consentedAt: Date;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(props: ManagerApplicationProps) {
    this.id = props.id;
    this.venueId = props.venueId;
    this.applicantId = props.applicantId;
    this.status = props.status;
    this.consentedAt = props.consentedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public appoint(): void {
    this.status = 'APPOINTED';
    this.updatedAt = new Date();
  }

  public revoke(): void {
    this.status = 'REVOKED';
    this.updatedAt = new Date();
  }
}
