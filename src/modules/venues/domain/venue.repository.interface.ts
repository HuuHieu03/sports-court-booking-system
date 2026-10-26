import { VenueEntity } from './venue.entity';

export interface VenueFilter {
  search?: string;
  recruitmentOnly?: boolean;
}

export interface IVenueRepository {
  findById(id: string): Promise<VenueEntity | null>;
  findByOwnerId(ownerId: string): Promise<VenueEntity[]>;
  findAll(filter?: VenueFilter): Promise<VenueEntity[]>;
  save(venue: VenueEntity): Promise<VenueEntity>;
  update(venue: VenueEntity): Promise<VenueEntity>;
}
