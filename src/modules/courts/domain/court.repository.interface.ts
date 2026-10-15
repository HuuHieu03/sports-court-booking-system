import { Court } from './court.entity';

export const COURT_REPOSITORY_TOKEN = Symbol('COURT_REPOSITORY');

export interface ICourtRepository {
  findById(id: string): Promise<Court | null>;
  findByVenueId(venueId: string): Promise<Court[]>;
  save(court: Court): Promise<Court>;
  delete(id: string): Promise<boolean>;
}
