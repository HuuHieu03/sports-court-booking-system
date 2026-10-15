import { Venue } from './venue.entity';

export const VENUE_REPOSITORY_TOKEN = Symbol('VENUE_REPOSITORY');

export interface IVenueRepository {
  findById(id: string): Promise<Venue | null>;
  findAll(): Promise<Venue[]>;
  findByManagerId(managerId: string): Promise<Venue[]>;
  save(venue: Venue): Promise<Venue>;
  delete(id: string): Promise<boolean>;
}
