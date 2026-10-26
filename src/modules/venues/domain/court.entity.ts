export interface CourtProps {
  id: string;
  venueId: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class CourtEntity {
  public readonly id: string;
  public readonly venueId: string;
  public name: string;
  public description: string | null;
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date | null;

  constructor(props: CourtProps) {
    this.id = props.id;
    this.venueId = props.venueId;
    this.name = props.name;
    this.description = props.description ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt ?? null;
  }

  public isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  public softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }
}
