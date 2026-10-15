export type UserRole = 'ADMIN' | 'VENUE_MANAGER' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phoneNumber?: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  managerId: string;
  description?: string;
  openTime: string;
  closeTime: string;
}

export type SportType = 'BADMINTON' | 'TENNIS' | 'FOOTBALL' | 'BASKETBALL' | 'PICKLEBALL';
export type CourtStatus = 'AVAILABLE' | 'MAINTENANCE' | 'INACTIVE';

export interface Court {
  id: string;
  venueId: string;
  name: string;
  sportType: SportType;
  hourlyRate: number;
  status: CourtStatus;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  id: string;
  courtId: string;
  customerId: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: BookingStatus;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  timestamp: string;
}
