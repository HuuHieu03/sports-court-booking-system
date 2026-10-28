import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Account,
  Venue,
  Court,
  Booking,
  ManagerApplication,
  Feedback,
  NotificationItem,
  UserRole,
} from '../types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_VENUES,
  INITIAL_COURTS,
  INITIAL_BOOKINGS,
  INITIAL_APPLICATIONS,
  INITIAL_FEEDBACKS,
  INITIAL_NOTIFICATIONS,
} from '../lib/mock-data';
import { apiRequest } from '../lib/api-client';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  // Current user & authentication
  currentUser: Account | null;
  isAuthenticated: boolean;
  currentRole: UserRole | 'GUEST';
  isAdmin: boolean;
  isOwner: boolean;
  isManager: (venueId?: string) => boolean;
  isManagerOrOwner: (venueId?: string) => boolean;

  login: (emailOrPhone: string, password?: string) => Promise<{ success: boolean; error?: string; account?: Account }>;
  quickLogin: (accountId: string) => Promise<{ success: boolean; error?: string; account?: Account }>;
  register: (data: { name: string; email: string; phone: string; role: 'USER' | 'OWNER'; password?: string }) => Promise<{ success: boolean; error?: string; account?: Account }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Selected venue context for drill-down
  selectedVenueId: string;
  setSelectedVenueId: (id: string) => void;

  // Domain data
  accounts: Account[];
  venues: Venue[];
  courts: Court[];
  bookings: Booking[];
  applications: ManagerApplication[];
  feedbacks: Feedback[];
  notifications: NotificationItem[];

  // Toast feedback
  toasts: ToastMessage[];
  showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Business Actions (Async connected to Backend API)
  bookCourt: (courtId: string, bookingDate: string, startTime: string, endTime: string) => Promise<{ success: boolean; error?: string }>;
  cancelMyBooking: (bookingId: string) => Promise<void>;
  cancelCustomerBooking: (bookingId: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  addCourt: (court: Omit<Court, 'id'>) => Promise<void>;
  updateCourt: (courtId: string, updatedData: Partial<Court>) => Promise<void>;
  deleteCourt: (courtId: string) => Promise<{ success: boolean; message: string }>;
  addVenue: (venue: Omit<Venue, 'id' | 'createdAt' | 'ownerId' | 'ownerName'>) => Promise<void>;
  toggleRecruitment: (venueId: string, message?: string) => Promise<void>;
  submitManagerApplication: (venueId: string, consented: boolean) => Promise<{ success: boolean; error?: string }>;
  appointManager: (venueId: string, application: ManagerApplication) => Promise<{ success: boolean; error?: string }>;
  revokeManager: (venueId: string, targetUserId?: string) => Promise<void>;
  reopenApplication: (applicationId: string) => void;
  addFeedback: (venueId: string, rating: number, comment: string) => Promise<void>;
  toggleAccountStatus: (accountId: string, newStatus: 'ACTIVE' | 'LOCKED') => Promise<void>;
  softDeleteAccount: (accountId: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper date formatters
const formatLocalDate = (iso: string): string => {
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatLocalTime = (iso: string): string => {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

const localDateTimeToISO = (dateStr: string, timeStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [h, min] = timeStr.split(':').map(Number);
  const localDate = new Date(y, m - 1, d, h, min, 0, 0);
  return localDate.toISOString();
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [venues, setVenues] = useState<Venue[]>(INITIAL_VENUES);
  const [courts, setCourts] = useState<Court[]>(INITIAL_COURTS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [applications, setApplications] = useState<ManagerApplication[]>(INITIAL_APPLICATIONS);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(INITIAL_FEEDBACKS);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const venuesRef = useRef<Venue[]>(venues);
  const courtsRef = useRef<Court[]>(courts);
  useEffect(() => {
    venuesRef.current = venues;
  }, [venues]);
  useEffect(() => {
    courtsRef.current = courts;
  }, [courts]);

  const [currentUser, setCurrentUser] = useState<Account | null>(() => {
    const saved = localStorage.getItem('pitchsync_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<string>('explore');
  const [selectedVenueId, setSelectedVenueId] = useState<string>('00000000-0000-4000-8000-000000002001');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 1. Fetch Venues & Courts from Backend
  const reloadVenuesAndCourts = useCallback(async () => {
    try {
      const backendVenues = await apiRequest<any[]>('/venues');
      if (Array.isArray(backendVenues)) {
        setVenues(prev => {
          const activeManagerMap = new Map<string, any>();
          prev.forEach(v => {
            if (v.activeManager) activeManagerMap.set(v.id, v.activeManager);
          });

          return backendVenues.map(v => ({
            id: v.id,
            name: v.name,
            address: v.address,
            description: v.description || '',
            ownerId: v.ownerId,
            ownerName: 'Chủ sân ' + v.name.replace(/^Sân bóng\s*/i, ''),
            isRecruiting: v.recruitmentOpen ?? v.managerRecruitment?.isOpen ?? false,
            recruitmentMessage: v.recruitmentMessage ?? v.managerRecruitment?.message ?? '',
            createdAt: v.createdAt,
            courtsCount: v.courtCount || 0,
            activeManager: activeManagerMap.get(v.id) || null,
          }));
        });

        // Fetch courts for each venue
        const courtPromises = backendVenues.map(v =>
          apiRequest<any[]>(`/venues/${v.id}/courts`).catch(() => [])
        );
        const courtResults = await Promise.all(courtPromises);
        const allCourts: Court[] = [];

        courtResults.forEach(courtsList => {
          if (Array.isArray(courtsList)) {
            courtsList.forEach(c => {
              allCourts.push({
                id: c.id,
                venueId: c.venueId,
                name: c.name,
                courtType: c.name.includes('7') ? 'SEVEN_A_SIDE' : 'FIVE_A_SIDE',
                courtTypeLabel: c.name.includes('7') ? 'Sân 7 người' : 'Sân 5 người',
                description: c.description || 'Sân cỏ nhân tạo tiêu chuẩn.',
                hourlyRate: typeof c.hourlyRate === 'number' ? c.hourlyRate : (c.name.includes('7') ? 350000 : 250000),
                status: 'ACTIVE',
              });
            });
          }
        });

        if (allCourts.length > 0) {
          setCourts(allCourts);
        }
      }
    } catch (err) {
      console.warn('[PitchSync] Failed to fetch venues from Backend:', err);
    }
  }, []);

  // 2. Fetch User Specific Data
  const reloadUserData = useCallback(async (user: Account) => {
    try {
      // Fetch my bookings
      const myBookings = await apiRequest<any[]>('/me/bookings').catch(() => []);
      const mappedMyBookings: Booking[] = Array.isArray(myBookings)
        ? myBookings.map(b => {
            const startD = new Date(b.startsAt);
            const endD = new Date(b.endsAt);
            const duration = Math.round((endD.getTime() - startD.getTime()) / (1000 * 60));
            const foundVenue = venuesRef.current.find(v => v.id === b.venueId);
            const foundCourt = courtsRef.current.find(c => c.id === b.courtId);
            return {
              id: b.id,
              venueId: b.venueId,
              venueName: foundVenue?.name || 'Cụm Sân Bóng',
              courtId: b.courtId,
              courtName: foundCourt?.name || 'Sân con',
              userId: b.userId,
              userName: user.name,
              userEmail: user.email,
              userPhone: user.phone,
              bookingDate: formatLocalDate(b.startsAt),
              startTime: formatLocalTime(b.startsAt),
              endTime: formatLocalTime(b.endsAt),
              durationMinutes: duration,
              totalPrice: typeof b.totalPrice === 'number' ? b.totalPrice : Math.round((duration * (foundCourt?.hourlyRate || 300000)) / 60),
              status: b.status,
              cancellationReason: b.cancellationReason || undefined,
              cancelledBy: b.cancelledById ? (b.cancelledById === user.id ? 'USER' : 'MANAGER') : undefined,
              createdAt: b.createdAt,
            };
          })
        : [];

      // Determine venue IDs to load bookings, applications, and managers for:
      // Point 5: Owner must load bookings for owned venues (user.appointedVenues is empty for Owner)
      const ownedVenueIds: string[] = [];
      if (user.role === 'OWNER') {
        const myVenues = await apiRequest<any[]>('/me/venues').catch(() => []);
        if (Array.isArray(myVenues) && myVenues.length > 0) {
          myVenues.forEach((v: any) => {
            if (v && v.id) ownedVenueIds.push(v.id);
          });
        } else {
          // Fallback to locally loaded owned venues
          venuesRef.current
            .filter(v => v.ownerId === user.id)
            .forEach(v => ownedVenueIds.push(v.id));
        }
      }

      // Relevant venues: manager appointed venues + owner owned venues
      const relevantVenueIds = Array.from(
        new Set([...(user.appointedVenues || []), ...ownedVenueIds])
      );

      // Fetch bookings for all relevant venues
      const venueBookingsPromises = relevantVenueIds.map(vid =>
        apiRequest<any[]>(`/venues/${vid}/bookings`).catch(() => [])
      );
      const venueBookingsLists = await Promise.all(venueBookingsPromises);
      const allVenueBookings: Booking[] = [];

      venueBookingsLists.forEach(bList => {
        if (Array.isArray(bList)) {
          bList.forEach(b => {
            const startD = new Date(b.startsAt);
            const endD = new Date(b.endsAt);
            const duration = Math.round((endD.getTime() - startD.getTime()) / (1000 * 60));
            const foundVenue = venuesRef.current.find(v => v.id === b.venueId);
            const foundCourt = courtsRef.current.find(c => c.id === b.courtId);
            allVenueBookings.push({
              id: b.id,
              venueId: b.venueId,
              venueName: foundVenue?.name || 'Cụm Sân Quản Lý',
              courtId: b.courtId,
              courtName: foundCourt?.name || 'Sân con',
              userId: b.userId,
              userName: b.customerProfile?.fullName || 'Khách đặt sân',
              userEmail: b.customerProfile?.email || '',
              userPhone: b.customerProfile?.phone || '',
              bookingDate: formatLocalDate(b.startsAt),
              startTime: formatLocalTime(b.startsAt),
              endTime: formatLocalTime(b.endsAt),
              durationMinutes: duration,
              totalPrice: typeof b.totalPrice === 'number' ? b.totalPrice : Math.round((duration * (foundCourt?.hourlyRate || 300000)) / 60),
              status: b.status,
              cancellationReason: b.cancellationReason || undefined,
              cancelledBy: b.cancelledById ? (b.cancelledById === b.userId ? 'USER' : 'MANAGER') : undefined,
              createdAt: b.createdAt,
            });
          });
        }
      });

      // Merge bookings unique by id
      const mergedMap = new Map<string, Booking>();
      [...mappedMyBookings, ...allVenueBookings].forEach(b => mergedMap.set(b.id, b));
      if (mergedMap.size > 0) {
        setBookings(Array.from(mergedMap.values()));
      }

      // Point 3: Fetch real manager applications from Backend API for Owner
      if (user.role === 'OWNER' && ownedVenueIds.length > 0) {
        const appsPromises = ownedVenueIds.map(vid =>
          apiRequest<any[]>(`/venues/${vid}/manager-applications`).catch(() => [])
        );
        const appsLists = await Promise.all(appsPromises);
        const allFetchedApps: ManagerApplication[] = [];

        appsLists.forEach(appList => {
          if (Array.isArray(appList)) {
            appList.forEach((item: any) => {
              const app = item.application || item;
              const contact = item.contact || {};
              const foundVenue = venuesRef.current.find(v => v.id === app.venueId);
              allFetchedApps.push({
                id: app.id,
                venueId: app.venueId,
                venueName: foundVenue?.name || 'Cụm sân',
                applicantId: app.applicantId,
                applicantName: contact.fullName || 'Ứng viên',
                applicantEmail: contact.email || '',
                applicantPhone: contact.phone || '',
                consented: app.consentToShareContact ?? true,
                status: app.status as 'SUBMITTED' | 'APPOINTED' | 'REVOKED',
                appliedAt: app.createdAt || app.consentedAt || new Date().toISOString(),
              });
            });
          }
        });

        if (allFetchedApps.length > 0) {
          setApplications(prev => {
            const appMap = new Map<string, ManagerApplication>();
            prev.forEach(a => appMap.set(a.id, a));
            allFetchedApps.forEach(a => appMap.set(a.id, a));
            return Array.from(appMap.values());
          });
        }
      }

      // Fetch active manager for relevant venues to populate activeManager on venues
      if (relevantVenueIds.length > 0) {
        const managerPromises = relevantVenueIds.map(vid =>
          apiRequest<any[]>(`/venues/${vid}/managers`)
            .then(mgrs => ({ vid, mgrs }))
            .catch(() => ({ vid, mgrs: [] }))
        );
        const managerResults = await Promise.all(managerPromises);
        const venueManagerMap = new Map<string, any>();

        managerResults.forEach(({ vid, mgrs }) => {
          if (Array.isArray(mgrs)) {
            const active = mgrs.find((m: any) => !m.appointment.revokedAt);
            if (active) {
              venueManagerMap.set(vid, {
                appointmentId: active.appointment.id,
                userId: active.appointment.userId,
                name: active.profile?.fullName || 'Quản lý sân',
                email: active.profile?.email || '',
                phone: active.profile?.phone || '',
                appointedAt: formatLocalDate(active.appointment.appointedAt),
              });
            }
          }
        });

        setVenues(prev =>
          prev.map(v => {
            if (relevantVenueIds.includes(v.id)) {
              return {
                ...v,
                activeManager: venueManagerMap.get(v.id) || null,
              };
            }
            return v;
          })
        );
      }

      // If Admin, fetch all accounts
      if (user.role === 'ADMIN') {
        const adminAccounts = await apiRequest<any[]>('/admin/accounts').catch(() => []);
        if (Array.isArray(adminAccounts) && adminAccounts.length > 0) {
          setAccounts(
            adminAccounts.map(a => ({
              id: a.id,
              name: a.fullName,
              email: a.email,
              phone: a.phone,
              role: a.role,
              status: a.status,
              appointedVenues: a.managedVenueIds || [],
              createdAt: a.createdAt,
              deletedAt: a.deletedAt || undefined,
            }))
          );
        }
      }
    } catch (err) {
      console.warn('[PitchSync] Failed to reload user data from Backend:', err);
    }
  }, []);

  // Initial Bootstrapping
  useEffect(() => {
    reloadVenuesAndCourts();

    const token = localStorage.getItem('access_token');
    if (token) {
      apiRequest<any>('/me')
        .then(account => {
          const userAccount: Account = {
            id: account.id,
            name: account.fullName,
            email: account.email,
            phone: account.phone,
            role: account.role,
            status: account.status,
            appointedVenues: account.managedVenueIds || [],
            createdAt: account.createdAt,
            deletedAt: account.deletedAt || undefined,
          };
          setCurrentUser(userAccount);
          localStorage.setItem('pitchsync_user', JSON.stringify(userAccount));
          reloadUserData(userAccount);
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('pitchsync_user');
          setCurrentUser(null);
        });
    }
  }, [reloadVenuesAndCourts, reloadUserData]);

  // Auth computed status
  const isAuthenticated = Boolean(currentUser && currentUser.status === 'ACTIVE' && !currentUser.deletedAt);
  const isAdmin = Boolean(currentUser && currentUser.role === 'ADMIN');
  const isOwner = Boolean(currentUser && currentUser.role === 'OWNER');

  // Dynamic RBAC: check if user is appointed manager of venue
  const isManager = useCallback((venueId?: string): boolean => {
    if (!currentUser) return false;
    const appointed = currentUser.appointedVenues || [];
    if (venueId) {
      return appointed.includes(venueId);
    }
    return appointed.length > 0;
  }, [currentUser]);

  const isManagerOrOwner = useCallback((venueId?: string): boolean => {
    return isOwner || isManager(venueId);
  }, [isOwner, isManager]);

  const currentRole: UserRole | 'GUEST' = useMemo(() => {
    if (!currentUser) return 'GUEST';
    if (currentUser.role === 'ADMIN') return 'ADMIN';
    if (currentUser.role === 'OWNER') return 'OWNER';
    if (isManager()) return 'MANAGER';
    return 'USER';
  }, [currentUser, isManager]);

  // Auth operations
  const login = async (emailOrPhone: string, password?: string) => {
    try {
      const clean = emailOrPhone.trim().toLowerCase();
      const res = await apiRequest<{ accessToken: string; account: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: clean,
          password: password || 'Secret123@',
        }),
      });

      localStorage.setItem('access_token', res.accessToken);
      const userAccount: Account = {
        id: res.account.id,
        name: res.account.fullName,
        email: res.account.email,
        phone: res.account.phone,
        role: res.account.role,
        status: res.account.status,
        appointedVenues: res.account.managedVenueIds || [],
        createdAt: res.account.createdAt,
        deletedAt: res.account.deletedAt || undefined,
      };

      setCurrentUser(userAccount);
      localStorage.setItem('pitchsync_user', JSON.stringify(userAccount));
      await reloadUserData(userAccount);
      showToast('success', 'Đăng nhập thành công', `Chào mừng trở lại, ${userAccount.name}!`);
      return { success: true, account: userAccount };
    } catch (err: any) {
      return { success: false, error: err.message || 'Đăng nhập không thành công.' };
    }
  };

  const quickLogin = async (accountIdOrEmail: string) => {
    let email = accountIdOrEmail;
    if (accountIdOrEmail === 'ACC-99' || accountIdOrEmail.includes('admin') || accountIdOrEmail.includes('1001')) {
      email = 'admin@example.com';
    } else if (accountIdOrEmail === 'ACC-04' || accountIdOrEmail.includes('owner.anphu') || accountIdOrEmail.includes('1002')) {
      email = 'owner.anphu@example.com';
    } else if (accountIdOrEmail.includes('owner.thuduc') || accountIdOrEmail.includes('1003')) {
      email = 'owner.thuduc@example.com';
    } else if (accountIdOrEmail.includes('owner')) {
      email = 'owner.anphu@example.com';
    } else if (accountIdOrEmail === 'ACC-03' || accountIdOrEmail.includes('manager') || accountIdOrEmail.includes('1004')) {
      email = 'manager.minh@example.com';
    } else if (accountIdOrEmail === 'ACC-01' || accountIdOrEmail.includes('lan') || accountIdOrEmail.includes('1005')) {
      email = 'user.lan@example.com';
    } else if (accountIdOrEmail === 'ACC-02' || accountIdOrEmail.includes('huy') || accountIdOrEmail.includes('1006')) {
      email = 'user.huy@example.com';
    } else if (accountIdOrEmail === 'ACC-05' || accountIdOrEmail.includes('locked') || accountIdOrEmail.includes('1007')) {
      email = 'user.locked@example.com';
    }
    return login(email, 'Secret123@');
  };

  const register = async (data: {
    name: string;
    email: string;
    phone: string;
    role: 'USER' | 'OWNER';
    password?: string;
  }) => {
    try {
      const res = await apiRequest<{ accessToken: string; account: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone.trim(),
          role: data.role,
          password: data.password || 'Secret123@',
        }),
      });

      localStorage.setItem('access_token', res.accessToken);
      const userAccount: Account = {
        id: res.account.id,
        name: res.account.fullName,
        email: res.account.email,
        phone: res.account.phone,
        role: res.account.role,
        status: res.account.status,
        appointedVenues: res.account.managedVenueIds || [],
        createdAt: res.account.createdAt,
        deletedAt: res.account.deletedAt || undefined,
      };

      setCurrentUser(userAccount);
      localStorage.setItem('pitchsync_user', JSON.stringify(userAccount));
      await reloadUserData(userAccount);
      showToast('success', 'Đăng ký thành công', `Tài khoản ${userAccount.name} đã được khởi tạo!`);
      return { success: true, account: userAccount };
    } catch (err: any) {
      return { success: false, error: err.message || 'Đăng ký không thành công.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('pitchsync_user');
    setCurrentUser(null);
    showToast('info', 'Đã đăng xuất', 'Bạn đã đăng xuất khỏi hệ thống.');
  };

  const switchRole = (role: UserRole) => {
    if (role === 'ADMIN') quickLogin('admin@example.com');
    else if (role === 'OWNER') quickLogin('owner.anphu@example.com');
    else if (role === 'MANAGER') quickLogin('manager.minh@example.com');
    else quickLogin('user.lan@example.com');
  };

  // 1. Book Court (Connected to Backend POST /bookings)
  const bookCourt = async (courtId: string, bookingDate: string, startTime: string, endTime: string) => {
    try {
      const startsAt = localDateTimeToISO(bookingDate, startTime);
      const endsAt = localDateTimeToISO(bookingDate, endTime);

      await apiRequest<any>('/bookings', {
        method: 'POST',
        body: JSON.stringify({ courtId, startsAt, endsAt }),
      });

      if (currentUser) {
        await reloadUserData(currentUser);
      }
      showToast('success', 'Đặt sân thành công!', `Lịch đặt của bạn (${startTime} - ${endTime} ngày ${bookingDate}) đã được xác nhận.`);
      return { success: true };
    } catch (err: any) {
      if (err.status === 409) {
        return {
          success: false,
          error: 'Sân đã có người đặt trong khung giờ này (Race Condition)! Vui lòng chọn khung giờ khác.',
        };
      }
      return { success: false, error: err.message || 'Đặt sân không thành công.' };
    }
  };

  // 2. Customer Cancel Own Booking (POST /bookings/:id/cancel)
  const cancelMyBooking = async (bookingId: string) => {
    try {
      await apiRequest(`/bookings/${bookingId}/cancel`, { method: 'POST' });
      if (currentUser) {
        await reloadUserData(currentUser);
      }
      showToast('success', 'Đã hủy đặt sân', 'Lịch đặt của bạn đã được hủy thành công.');
    } catch (err: any) {
      showToast('error', 'Hủy sân thất bại', err.message || 'Không thể hủy lịch.');
    }
  };

  // 3. Manager/Owner Cancel Customer Booking (POST /venues/:venueId/bookings/:bookingId/cancel)
  const cancelCustomerBooking = async (bookingId: string, reason: string) => {
    try {
      const target = bookings.find(b => b.id === bookingId);
      const venueId = target?.venueId || selectedVenueId;
      await apiRequest(`/venues/${venueId}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });

      if (currentUser) {
        await reloadUserData(currentUser);
      }
      showToast('success', 'Đã hủy lịch của khách', `Lý do: "${reason}" đã được ghi nhận vào hệ thống.`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Không thể hủy lịch của khách.' };
    }
  };

  // 4. Add Court
  const addCourt = async (courtData: Omit<Court, 'id'>) => {
    try {
      await apiRequest(`/venues/${courtData.venueId}/courts`, {
        method: 'POST',
        body: JSON.stringify({
          name: courtData.name,
          description: courtData.description,
          hourlyRate: courtData.hourlyRate,
        }),
      });
      await reloadVenuesAndCourts();
      showToast('success', 'Thêm sân con thành công', `Đã thêm ${courtData.name}.`);
    } catch (err: any) {
      showToast('error', 'Thêm sân con thất bại', err.message || 'Có lỗi xảy ra.');
    }
  };

  // 5. Update Court
  const updateCourt = async (courtId: string, updatedData: Partial<Court>) => {
    try {
      await apiRequest(`/courts/${courtId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: updatedData.name,
          description: updatedData.description,
          hourlyRate: updatedData.hourlyRate,
        }),
      });
      await reloadVenuesAndCourts();
      showToast('success', 'Cập nhật thành công', 'Thông tin sân con đã được lưu.');
    } catch (err: any) {
      showToast('error', 'Cập nhật thất bại', err.message || 'Có lỗi xảy ra.');
    }
  };

  // 6. Delete Court
  const deleteCourt = async (courtId: string) => {
    try {
      await apiRequest(`/courts/${courtId}`, { method: 'DELETE' });
      await reloadVenuesAndCourts();
      showToast('success', 'Đã xóa sân con', 'Sân con đã được xóa logic.');
      return { success: true, message: 'Đã xóa sân con' };
    } catch (err: any) {
      showToast('error', 'Xóa sân con thất bại', err.message || 'Không thể xóa sân con đang có lịch đặt active.');
      return { success: false, message: err.message || 'Không thể xóa sân con.' };
    }
  };

  // 7. Add Venue
  const addVenue = async (venueData: Omit<Venue, 'id' | 'createdAt' | 'ownerId' | 'ownerName'>) => {
    try {
      await apiRequest('/venues', {
        method: 'POST',
        body: JSON.stringify({
          name: venueData.name,
          address: venueData.address,
          description: venueData.description || 'Cụm sân bóng đá cỏ nhân tạo.',
        }),
      });
      await reloadVenuesAndCourts();
      showToast('success', 'Tạo cụm sân thành công', `Cụm sân "${venueData.name}" đã được tạo.`);
    } catch (err: any) {
      showToast('error', 'Tạo cụm sân thất bại', err.message || 'Có lỗi xảy ra.');
    }
  };

  // 8. Toggle Recruitment
  const toggleRecruitment = async (venueId: string, message?: string) => {
    try {
      const venue = venues.find(v => v.id === venueId);
      const isOpen = !venue?.isRecruiting;
      await apiRequest(`/venues/${venueId}/manager-recruitment`, {
        method: 'PATCH',
        body: JSON.stringify({
          isOpen,
          message: message || venue?.recruitmentMessage || 'Đang mở tuyển dụng Quản lý sân.',
        }),
      });
      await reloadVenuesAndCourts();
      showToast('success', 'Cập nhật tuyển dụng', isOpen ? 'Đã mở chiến dịch tuyển dụng Manager!' : 'Đã đóng chiến dịch tuyển dụng.');
    } catch (err: any) {
      showToast('error', 'Cập nhật thất bại', err.message || 'Có lỗi xảy ra.');
    }
  };

  // 9. Submit Manager Application
  const submitManagerApplication = async (venueId: string, consented: boolean) => {
    try {
      const res = await apiRequest<any>(`/venues/${venueId}/manager-applications`, {
        method: 'POST',
        body: JSON.stringify({ consentToShareContact: consented }),
      });
      if (currentUser) {
        const newApp: ManagerApplication = {
          id: res?.id || `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`,
          venueId,
          venueName: venues.find(v => v.id === venueId)?.name || 'Cụm sân',
          applicantId: currentUser.id,
          applicantName: currentUser.name,
          applicantEmail: currentUser.email,
          applicantPhone: currentUser.phone,
          status: 'SUBMITTED',
          consented,
          appliedAt: res?.createdAt || new Date().toISOString(),
        };
        setApplications(prev => [newApp, ...prev.filter(a => !(a.venueId === venueId && a.applicantId === currentUser.id))]);
        await reloadUserData(currentUser);
      }
      showToast('success', 'Nộp đơn thành công', 'Hồ sơ ứng tuyển của bạn đã được gửi tới Chủ sân!');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Không thể gửi hồ sơ.' };
    }
  };

  // 10. Appoint Manager
  const appointManager = async (venueId: string, application: ManagerApplication) => {
    try {
      const res = await apiRequest<any>(`/venues/${venueId}/managers`, {
        method: 'POST',
        body: JSON.stringify({ applicationId: application.id }),
      });

      // 1. Immediately update applications state: mark this app APPOINTED
      setApplications(prev =>
        prev.map(app =>
          app.id === application.id
            ? { ...app, status: 'APPOINTED' }
            : app.venueId === venueId && app.status === 'APPOINTED'
            ? { ...app, status: 'REVOKED' }
            : app
        )
      );

      // 2. Immediately update venues state: set activeManager
      setVenues(prev =>
        prev.map(v => {
          if (v.id === venueId) {
            return {
              ...v,
              activeManager: {
                appointmentId: res?.id || `appt-${Date.now()}`,
                userId: application.applicantId,
                name: application.applicantName,
                email: application.applicantEmail,
                phone: application.applicantPhone,
                appointedAt: formatLocalDate(new Date().toISOString()),
              },
            };
          }
          return v;
        })
      );

      // 3. If current user was appointed as manager, update appointedVenues
      if (currentUser && currentUser.id === application.applicantId) {
        const appointed = currentUser.appointedVenues || [];
        if (!appointed.includes(venueId)) {
          const updatedUser = { ...currentUser, appointedVenues: [...appointed, venueId] };
          setCurrentUser(updatedUser);
          localStorage.setItem('pitchsync_user', JSON.stringify(updatedUser));
        }
      }

      await reloadVenuesAndCourts();
      if (currentUser) {
        await reloadUserData(currentUser);
      }
      showToast('success', 'Bổ nhiệm thành công', 'Đã cấp quyền Quản lý sân cho ứng viên.');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Không thể bổ nhiệm ứng viên.' };
    }
  };

  // 11. Revoke Manager
  const revokeManager = async (venueId: string, targetUserId?: string) => {
    try {
      let userId = targetUserId;
      if (!userId) {
        const venue = venues.find(v => v.id === venueId);
        userId = venue?.activeManager?.userId;
      }
      if (!userId) {
        // Fallback to active appointment from backend
        const managers = await apiRequest<any[]>(`/venues/${venueId}/managers`).catch(() => []);
        if (Array.isArray(managers)) {
          const active = managers.find((m: any) => !m.appointment.revokedAt);
          if (active) {
            userId = active.appointment.userId;
          }
        }
      }
      if (!userId) {
        showToast('error', 'Lỗi', 'Không tìm thấy Quản lý đương nhiệm.');
        return;
      }

      await apiRequest(`/venues/${venueId}/managers/${userId}`, { method: 'DELETE' });

      // 1. Immediately update venues state: remove activeManager
      setVenues(prev =>
        prev.map(v => (v.id === venueId ? { ...v, activeManager: null } : v))
      );

      // 2. Immediately update applications state: mark APPOINTED -> REVOKED
      setApplications(prev =>
        prev.map(app =>
          app.venueId === venueId && app.status === 'APPOINTED'
            ? { ...app, status: 'REVOKED' }
            : app
        )
      );

      // 3. If current user was revoked, update appointedVenues
      if (currentUser && currentUser.id === userId) {
        const updatedAppointed = (currentUser.appointedVenues || []).filter(id => id !== venueId);
        const updatedUser = { ...currentUser, appointedVenues: updatedAppointed };
        setCurrentUser(updatedUser);
        localStorage.setItem('pitchsync_user', JSON.stringify(updatedUser));
      }

      await reloadVenuesAndCourts();
      if (currentUser) {
        await reloadUserData(currentUser);
      }
      showToast('success', 'Đã thu hồi quyền', 'Quyền Manager tại cụm sân này đã bị thu hồi ngay lập tức.');
    } catch (err: any) {
      showToast('error', 'Thu hồi thất bại', err.message || 'Không thể thu hồi quyền.');
    }
  };

  const reopenApplication = (applicationId: string) => {
    setApplications(prev =>
      prev.map(a => (a.id === applicationId ? { ...a, status: 'SUBMITTED' } : a))
    );
    showToast('info', 'Thông báo', 'Hồ sơ đã được đánh dấu mở lại để xem xét.');
  };

  // 12. Add Feedback
  const addFeedback = async (venueId: string, rating: number, comment: string) => {
    try {
      await apiRequest(`/venues/${venueId}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ content: comment }),
      });
      const newFb: Feedback = {
        id: `fb-${Date.now()}`,
        venueId,
        userId: currentUser?.id || 'anonymous',
        userName: currentUser?.name || 'Khách hàng',
        rating,
        comment,
        createdAt: new Date().toISOString(),
      };
      setFeedbacks(prev => [newFb, ...prev]);
      showToast('success', 'Gửi góp ý thành công', 'Cảm ơn bạn đã đóng góp ý kiến cho cụm sân!');
    } catch (err: any) {
      showToast('error', 'Gửi góp ý thất bại', err.message || 'Có lỗi xảy ra.');
    }
  };

  // 13. Admin Toggle Account Status
  const toggleAccountStatus = async (accountId: string, newStatus: 'ACTIVE' | 'LOCKED') => {
    try {
      await apiRequest(`/admin/accounts/${accountId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (currentUser) {
        await reloadUserData(currentUser);
      }
      showToast('info', 'Trạng thái tài khoản', `Đã chuyển tài khoản sang trạng thái ${newStatus}.`);
    } catch (err: any) {
      showToast('error', 'Cập nhật thất bại', err.message || 'Không thể thay đổi trạng thái.');
    }
  };

  // 14. Admin Soft Delete Account
  const softDeleteAccount = async (accountId: string) => {
    try {
      await apiRequest(`/admin/accounts/${accountId}`, { method: 'DELETE' });
      if (currentUser) {
        await reloadUserData(currentUser);
      }
      showToast('success', 'Xóa tài khoản thành công', 'Tài khoản đã được xóa logic (deleted_at).');
    } catch (err: any) {
      showToast('error', 'Xóa tài khoản thất bại', err.message || 'Không thể xóa tài khoản.');
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        currentRole,
        isAdmin,
        isOwner,
        isManager,
        isManagerOrOwner,
        login,
        quickLogin,
        register,
        logout,
        switchRole,
        activeTab,
        setActiveTab,
        selectedVenueId,
        setSelectedVenueId,
        accounts,
        venues,
        courts,
        bookings,
        applications,
        feedbacks,
        notifications,
        toasts,
        showToast,
        removeToast,
        bookCourt,
        cancelMyBooking,
        cancelCustomerBooking,
        addCourt,
        updateCourt,
        deleteCourt,
        addVenue,
        toggleRecruitment,
        submitManagerApplication,
        appointManager,
        revokeManager,
        reopenApplication,
        addFeedback,
        toggleAccountStatus,
        softDeleteAccount,
        markNotificationAsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
