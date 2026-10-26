import { CourtEntity } from './court.entity';

export interface ICourtRepository {
  findById(id: string): Promise<CourtEntity | null>;
  findByVenueId(venueId: string, includeDeleted?: boolean): Promise<CourtEntity[]>;
  save(court: CourtEntity): Promise<CourtEntity>;
  update(court: CourtEntity): Promise<CourtEntity>;
}
