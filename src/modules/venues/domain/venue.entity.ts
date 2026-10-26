export interface VenueProps {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  description?: string | null;
  recruitmentOpen?: boolean;
  recruitmentMessage?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class VenueEntity {
  public readonly id: string;
  public readonly ownerId: string;
  public name: string;
  public address: string;
  public description: string | null;
  public recruitmentOpen: boolean;
  public recruitmentMessage: string | null;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date | null;

  constructor(props: VenueProps) {
    this.id = props.id;
    this.ownerId = props.ownerId;
    this.name = props.name;
    this.address = props.address;
    this.description = props.description ?? null;
    this.recruitmentOpen = props.recruitmentOpen ?? false;
    this.recruitmentMessage = props.recruitmentMessage ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt ?? null;
  }

  public isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  public softDelete(): void {
    this.deletedAt = new Date();
    this.recruitmentOpen = false;
    this.updatedAt = new Date();
  }

  public setRecruitment(open: boolean, message?: string | null): void {
    this.recruitmentOpen = open;
    this.recruitmentMessage = open ? (message ?? null) : null;
    this.updatedAt = new Date();
  }
}
