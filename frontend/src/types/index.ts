export type UserRole = 'USER' | 'MANAGER' | 'OWNER' | 'ADMIN';

export interface Account {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'USER' | 'OWNER' | 'ADMIN';
  status: 'ACTIVE' | 'LOCKED' | 'DELETED';
  createdAt: string;
  deletedAt?: string;
  appointedVenues?: string[]; // IDs of venues currently appointed as manager
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  description?: string;
  ownerId: string;
  ownerName: string;
  isRecruiting: boolean;
  recruitmentMessage?: string;
  createdAt: string;
  courtsCount?: number;
  activeManager?: {
    appointmentId: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    appointedAt: string;
  } | null;
}

export type CourtType = 'FIVE_A_SIDE' | 'SEVEN_A_SIDE' | 'ELEVEN_A_SIDE';

export interface Court {
  id: string;
  venueId: string;
  name: string;
  courtType: CourtType;
  courtTypeLabel: string;
  description: string;
  hourlyRate: number;
  status: 'ACTIVE' | 'MAINTENANCE';
}

export interface TimeSlot {
  startTime: string; // HH:mm e.g. "16:00"
  endTime: string;   // HH:mm e.g. "17:00"
  durationMinutes: number;
  isAvailable: boolean;
  bookingId?: string;
}

export type BookingStatus = 'CONFIRMED' | 'CANCELLED';

export interface Booking {
  id: string;
  venueId: string;
  venueName: string;
  courtId: string;
  courtName: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string;   // HH:mm
  endTime: string;     // HH:mm
  durationMinutes: number;
  totalPrice: number;
  status: BookingStatus;
  cancellationReason?: string;
  cancelledBy?: 'USER' | 'MANAGER' | 'OWNER';
  createdAt: string;
}

export interface ManagerApplication {
  id: string;
  venueId: string;
  venueName: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  consented: boolean;
  status: 'SUBMITTED' | 'APPOINTED' | 'REVOKED';
  appliedAt: string;
}

export interface Feedback {
  id: string;
  venueId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export type NotificationType =
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'MANAGER_APPOINTED'
  | 'MANAGER_REVOKED'
  | 'APPLICATION_RECEIVED';

export interface NotificationItem {
  id: string;
  recipientId: string;
  recipientName: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}
