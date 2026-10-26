import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
import { validateBookingTime } from '../lib/utils';

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

  login: (emailOrPhone: string, password?: string) => { success: boolean; error?: string; account?: Account };
  quickLogin: (accountId: string) => { success: boolean; error?: string; account?: Account };
  register: (data: { name: string; email: string; phone: string; role: 'USER' | 'OWNER'; password?: string }) => { success: boolean; error?: string; account?: Account };
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

  // Business Actions
  bookCourt: (courtId: string, bookingDate: string, startTime: string, endTime: string) => { success: boolean; error?: string };
  cancelMyBooking: (bookingId: string) => void;
  cancelCustomerBooking: (bookingId: string, reason: string) => { success: boolean; error?: string };
  addCourt: (court: Omit<Court, 'id'>) => void;
  updateCourt: (courtId: string, updatedData: Partial<Court>) => void;
  deleteCourt: (courtId: string) => { success: boolean; message: string };
  addVenue: (venue: Omit<Venue, 'id' | 'createdAt' | 'ownerId' | 'ownerName'>) => void;
  toggleRecruitment: (venueId: string, message?: string) => void;
  submitManagerApplication: (venueId: string, consented: boolean) => { success: boolean; error?: string };
  appointManager: (venueId: string, application: ManagerApplication) => { success: boolean; error?: string };
  revokeManager: (venueId: string) => void;
  reopenApplication: (applicationId: string) => void;
  addFeedback: (venueId: string, rating: number, comment: string) => void;
  toggleAccountStatus: (accountId: string, newStatus: 'ACTIVE' | 'LOCKED') => void;
  softDeleteAccount: (accountId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Domain data with persistent localStorage
  const [accounts, setAccounts] = useState<Account[]>(() =>
    loadFromStorage('pitchsync_accounts', INITIAL_ACCOUNTS)
  );
  const [venues, setVenues] = useState<Venue[]>(() =>
    loadFromStorage('pitchsync_venues', INITIAL_VENUES)
  );
  const [courts, setCourts] = useState<Court[]>(() =>
    loadFromStorage('pitchsync_courts', INITIAL_COURTS)
  );
  const [bookings, setBookings] = useState<Booking[]>(() =>
    loadFromStorage('pitchsync_bookings', INITIAL_BOOKINGS)
  );
  const [applications, setApplications] = useState<ManagerApplication[]>(() =>
    loadFromStorage('pitchsync_applications', INITIAL_APPLICATIONS)
  );
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() =>
    loadFromStorage('pitchsync_feedbacks', INITIAL_FEEDBACKS)
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadFromStorage('pitchsync_notifications', INITIAL_NOTIFICATIONS)
  );

  // Current logged in user (null = Guest)
  const [currentUser, setCurrentUser] = useState<Account | null>(() => {
    const saved = localStorage.getItem('pitchsync_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validate with current accounts
        const match = accounts.find(a => a.id === parsed.id);
        const resolved = match || parsed;
        if (resolved.status === 'LOCKED' || resolved.status === 'DELETED' || resolved.deletedAt) {
          localStorage.removeItem('pitchsync_user');
          return null;
        }
        return resolved;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<string>('explore');
  const [selectedVenueId, setSelectedVenueId] = useState<string>('VENUE-01');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('pitchsync_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('pitchsync_venues', JSON.stringify(venues));
  }, [venues]);

  useEffect(() => {
    localStorage.setItem('pitchsync_courts', JSON.stringify(courts));
  }, [courts]);

  useEffect(() => {
    localStorage.setItem('pitchsync_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('pitchsync_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('pitchsync_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  useEffect(() => {
    localStorage.setItem('pitchsync_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pitchsync_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pitchsync_user');
    }
  }, [currentUser]);

  // Keep currentUser synced if account info in `accounts` changes
  useEffect(() => {
    if (currentUser) {
      const updated = accounts.find(a => a.id === currentUser.id);
      if (updated) {
        if (updated.status === 'LOCKED' || updated.status === 'DELETED' || updated.deletedAt) {
          setCurrentUser(null);
          localStorage.removeItem('pitchsync_user');
          showToast('error', 'Phiên làm việc kết thúc', 'Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động.');
          return;
        }
        if (
          updated.status !== currentUser.status ||
          updated.name !== currentUser.name ||
          updated.appointedVenues !== currentUser.appointedVenues ||
          updated.role !== currentUser.role
        ) {
          setCurrentUser(updated);
        }
      }
    }
  }, [accounts, currentUser]);

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth computed status
  const isAuthenticated = Boolean(currentUser && currentUser.status === 'ACTIVE' && !currentUser.deletedAt);
  const isAdmin = Boolean(currentUser && currentUser.role === 'ADMIN');
  const isOwner = Boolean(currentUser && currentUser.role === 'OWNER');

  // Dynamic RBAC: manager status strictly reflects active appointment in DB
  const isManager = (venueId?: string): boolean => {
    if (!currentUser) return false;
    if (venueId) {
      return venues.some(
        v => v.id === venueId && v.activeManager?.userId === currentUser.id
      );
    }
    return venues.some(v => v.activeManager?.userId === currentUser.id);
  };

  const isManagerOrOwner = (venueId?: string): boolean => {
    return isOwner || isManager(venueId);
  };

  const currentRole: UserRole | 'GUEST' = useMemo(() => {
    if (!currentUser) return 'GUEST';
    if (currentUser.role === 'ADMIN') return 'ADMIN';
    if (currentUser.role === 'OWNER') return 'OWNER';
    if (isManager()) return 'MANAGER';
    return 'USER';
  }, [currentUser, venues]);

  // Auth operations
  const login = (emailOrPhone: string, _password?: string) => {
    const clean = emailOrPhone.trim().toLowerCase();
    const account = accounts.find(
      a => a.email.toLowerCase() === clean || a.phone === emailOrPhone.trim()
    );

    if (!account) {
      return { success: false, error: 'Email hoặc số điện thoại không tồn tại trong hệ thống.' };
    }

    if (account.deletedAt || account.status === 'DELETED') {
      return { success: false, error: 'Tài khoản này đã bị xóa hoặc vô hiệu hóa.' };
    }

    if (account.status === 'LOCKED') {
      return {
        success: false,
        error: 'Tài khoản của bạn đã bị khóa do vi phạm chính sách hệ thống. Vui lòng liên hệ Quản trị viên.',
      };
    }

    setCurrentUser(account);
    showToast('success', 'Đăng nhập thành công', `Chào mừng trở lại, ${account.name}!`);
    return { success: true, account };
  };

  const quickLogin = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) {
      showToast('error', 'Lỗi', 'Không tìm thấy tài khoản.');
      return { success: false, error: 'Tài khoản không tồn tại' };
    }

    if (account.status === 'LOCKED') {
      showToast('error', 'Tài khoản bị khóa', 'Tài khoản này đang ở trạng thái LOCKED do vi phạm chính sách hệ thống.');
      return {
        success: false,
        error: 'Tài khoản của bạn đã bị khóa do vi phạm chính sách hệ thống. Vui lòng liên hệ Quản trị viên.',
      };
    }

    setCurrentUser(account);
    showToast('success', 'Đăng nhập nhanh', `Đã đăng nhập: ${account.name} (${account.role})`);
    return { success: true, account };
  };

  const register = (data: {
    name: string;
    email: string;
    phone: string;
    role: 'USER' | 'OWNER';
    password?: string;
  }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone.trim();

    if (!data.name.trim()) {
      return { success: false, error: 'Vui lòng nhập họ và tên.' };
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Email không hợp lệ.' };
    }

    if (!cleanPhone || cleanPhone.length < 9) {
      return { success: false, error: 'Số điện thoại không hợp lệ (tối thiểu 9 số).' };
    }

    if (accounts.some(a => a.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Email này đã được sử dụng bởi tài khoản khác.' };
    }

    if (accounts.some(a => a.phone === cleanPhone)) {
      return { success: false, error: 'Số điện thoại này đã được sử dụng bởi tài khoản khác.' };
    }

    const newAccount: Account = {
      id: `ACC-${Date.now().toString().slice(-4)}`,
      name: data.name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      role: data.role,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    setAccounts(prev => [...prev, newAccount]);
    setCurrentUser(newAccount);
    showToast('success', 'Đăng ký thành công', `Tài khoản ${newAccount.name} đã được khởi tạo!`);
    return { success: true, account: newAccount };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pitchsync_user');
    showToast('info', 'Đã đăng xuất', 'Bạn đã đăng xuất khỏi hệ thống.');
  };

  // Backwards compatibility switchRole
  const switchRole = (role: UserRole) => {
    let match: Account | undefined;
    if (role === 'ADMIN') match = accounts.find(a => a.role === 'ADMIN');
    else if (role === 'OWNER') match = accounts.find(a => a.role === 'OWNER');
    else if (role === 'MANAGER') match = accounts.find(a => a.appointedVenues && a.appointedVenues.length > 0);
    else match = accounts.find(a => a.role === 'USER' && (!a.appointedVenues || a.appointedVenues.length === 0));

    if (match) {
      setCurrentUser(match);
      showToast('info', 'Chuyển vai trò', `Đang trải nghiệm dưới tài khoản: ${match.name}`);
    }
  };

  // 1. Book court with domain constraints (start in future, 30m - 4h duration)
  const bookCourt = (courtId: string, bookingDate: string, startTime: string, endTime: string) => {
    if (!currentUser) {
      return { success: false, error: 'Vui lòng đăng nhập để thực hiện đặt sân.' };
    }

    if (currentUser.status === 'LOCKED') {
      return { success: false, error: 'Tài khoản của bạn đã bị khóa.' };
    }

    const court = courts.find(c => c.id === courtId);
    if (!court) return { success: false, error: 'Sân không tồn tại.' };

    const venue = venues.find(v => v.id === court.venueId);
    const venueName = venue ? venue.name : 'Cụm Sân Thể Thao';

    const validation = validateBookingTime(bookingDate, startTime, endTime);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || 'Thời gian đặt sân không hợp lệ.',
      };
    }
    const duration = validation.durationMinutes;

    const price = Math.round((court.hourlyRate * duration) / 60);
    const newBooking: Booking = {
      id: `BK-${Date.now().toString().slice(-4)}`,
      venueId: court.venueId,
      venueName,
      courtId: court.id,
      courtName: court.name,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userPhone: currentUser.phone,
      bookingDate,
      startTime,
      endTime,
      durationMinutes: duration,
      totalPrice: price,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    setBookings(prev => [newBooking, ...prev]);

    // Outbox notification
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      recipientId: currentUser.id,
      recipientName: currentUser.name,
      title: 'Đặt sân thành công',
      message: `Lượt đặt ${court.name} (${startTime} - ${endTime} ngày ${bookingDate}) tại ${venueName} đã xác nhận.`,
      type: 'BOOKING_CONFIRMED',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast(
      'success',
      'Đặt sân thành công',
      `Bạn đã đặt ${court.name} từ ${startTime} đến ${endTime} ngày ${bookingDate}.`
    );

    return { success: true };
  };

  // 2. Customer cancel own booking
  const cancelMyBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? {
              ...b,
              status: 'CANCELLED',
              cancellationReason: 'Khách hàng chủ động hủy qua ứng dụng',
              cancelledBy: 'USER',
            }
          : b
      )
    );

    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      recipientId: booking.userId,
      recipientName: booking.userName,
      title: 'Hủy đặt sân thành công',
      message: `Bạn đã hủy thành công lượt đặt sân ${booking.courtName} ngày ${booking.bookingDate}.`,
      type: 'BOOKING_CANCELLED',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast('info', 'Đã hủy đặt sân', `Lượt đặt sân ${booking.courtName} đã được hủy.`);
  };

  // 3. Manager/Owner cancel customer booking with mandatory reason
  const cancelCustomerBooking = (bookingId: string, reason: string) => {
    if (!reason || reason.trim().length < 5) {
      return {
        success: false,
        error: 'Lý do hủy là bắt buộc và phải có ít nhất 5 ký tự.',
      };
    }

    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, error: 'Không tìm thấy thông tin đặt sân.' };

    const cancelledBy = currentUser?.role === 'OWNER' ? 'OWNER' : 'MANAGER';

    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? {
              ...b,
              status: 'CANCELLED',
              cancellationReason: reason.trim(),
              cancelledBy,
            }
          : b
      )
    );

    // Notify affected customer via Outbox
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      recipientId: booking.userId,
      recipientName: booking.userName,
      title: 'Thông báo hủy lịch từ Quản lý sân',
      message: `Lượt đặt ${booking.courtName} (${booking.startTime} - ${booking.endTime} ngày ${booking.bookingDate}) tại ${booking.venueName} đã bị hủy bởi quản lý. Lý do: "${reason.trim()}"`,
      type: 'BOOKING_CANCELLED',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast(
      'info',
      'Đã hủy lịch đặt của khách',
      `Lượt đặt ${booking.courtName} đã được hủy. Khách hàng đã được gửi thông báo kèm lý do.`
    );

    return { success: true };
  };

  // 4. CRUD Court
  const addCourt = (courtData: Omit<Court, 'id'>) => {
    const newCourt: Court = {
      ...courtData,
      id: `CRT-${Date.now().toString().slice(-4)}`,
    };
    setCourts(prev => [...prev, newCourt]);

    // Update court count in venue
    setVenues(prev =>
      prev.map(v =>
        v.id === courtData.venueId
          ? { ...v, courtsCount: (v.courtsCount || 0) + 1 }
          : v
      )
    );

    showToast('success', 'Thêm sân con thành công', `Sân ${newCourt.name} đã được đưa vào hệ thống.`);
  };

  const updateCourt = (courtId: string, updatedData: Partial<Court>) => {
    setCourts(prev =>
      prev.map(c => (c.id === courtId ? { ...c, ...updatedData } : c))
    );
    showToast('success', 'Cập nhật thành công', 'Thông tin sân con đã được lưu.');
  };

  const deleteCourt = (courtId: string) => {
    const court = courts.find(c => c.id === courtId);
    if (!court) return { success: false, message: 'Sân không tồn tại.' };

    const activeCourtBookings = bookings.filter(
      b => b.courtId === courtId && b.status === 'CONFIRMED'
    );

    if (activeCourtBookings.length > 0) {
      return {
        success: false,
        message: `Không thể xóa sân này vì hiện có ${activeCourtBookings.length} lịch đặt sân của khách đang hoạt động.`,
      };
    }

    setCourts(prev => prev.filter(c => c.id !== courtId));
    setVenues(prev =>
      prev.map(v =>
        v.id === court.venueId
          ? { ...v, courtsCount: Math.max(0, (v.courtsCount || 1) - 1) }
          : v
      )
    );

    showToast('info', 'Đã xóa sân', `Sân ${court.name} đã được gỡ bỏ khỏi cụm sân.`);
    return { success: true, message: `Sân ${court.name} đã được xóa thành công.` };
  };

  // 5. Add Venue
  const addVenue = (venueData: Omit<Venue, 'id' | 'createdAt' | 'ownerId' | 'ownerName'>) => {
    if (!currentUser) return;
    const newVenue: Venue = {
      ...venueData,
      id: `VENUE-${Date.now().toString().slice(-4)}`,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      createdAt: new Date().toISOString(),
      courtsCount: 0,
      activeManager: null,
    };
    setVenues(prev => [...prev, newVenue]);
    showToast('success', 'Tạo cụm sân mới', `Cụm sân "${newVenue.name}" đã được tạo.`);
  };

  // 6. Recruitment toggle
  const toggleRecruitment = (venueId: string, message?: string) => {
    setVenues(prev =>
      prev.map(v => {
        if (v.id === venueId) {
          const nextState = !v.isRecruiting;
          return {
            ...v,
            isRecruiting: nextState,
            recruitmentMessage: nextState ? message || v.recruitmentMessage : undefined,
          };
        }
        return v;
      })
    );
    showToast('info', 'Trạng thái tuyển dụng', 'Đã cập nhật trạng thái tuyển dụng Quản lý cho cụm sân.');
  };

  // 7. Submit Manager Application
  const submitManagerApplication = (venueId: string, consented: boolean) => {
    if (!currentUser) {
      return { success: false, error: 'Vui lòng đăng nhập để nộp đơn ứng tuyển.' };
    }

    if (!consented) {
      return {
        success: false,
        error: 'Bạn phải đồng ý với thỏa thuận điều hành trước khi nộp đơn.',
      };
    }

    const venue = venues.find(v => v.id === venueId);
    if (!venue) return { success: false, error: 'Cụm sân không tồn tại.' };

    const existing = applications.find(
      a => a.venueId === venueId && a.applicantId === currentUser.id
    );

    if (existing && (existing.status === 'SUBMITTED' || existing.status === 'APPROVED')) {
      return {
        success: false,
        error: 'Bạn đã có đơn ứng tuyển cho cụm sân này đang được xử lý hoặc đã duyệt.',
      };
    }

    const newApp: ManagerApplication = {
      id: `APP-${Date.now().toString().slice(-4)}`,
      venueId,
      venueName: venue.name,
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      applicantEmail: currentUser.email,
      applicantPhone: currentUser.phone,
      consented: true,
      status: 'SUBMITTED',
      appliedAt: new Date().toISOString(),
    };

    setApplications(prev => [newApp, ...prev]);

    // Send Outbox Notification to Venue Owner
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      recipientId: venue.ownerId,
      recipientName: venue.ownerName,
      title: 'Đơn ứng tuyển Quản lý mới',
      message: `Ứng viên ${currentUser.name} vừa gửi hồ sơ ứng tuyển tại ${venue.name}.`,
      type: 'APPLICATION_RECEIVED',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast('success', 'Nộp đơn thành công', `Hồ sơ của bạn đã được chuyển tới Chủ sân ${venue.ownerName}.`);
    return { success: true };
  };

  // 8. Appoint Manager
  const appointManager = (venueId: string, application: ManagerApplication) => {
    const venue = venues.find(v => v.id === venueId);
    if (!venue) return { success: false, error: 'Không tìm thấy cụm sân.' };

    if (venue.activeManager) {
      return {
        success: false,
        error: `Cụm sân hiện đã có Quản lý (${venue.activeManager.name}). Cần thu hồi quyền trước khi bổ nhiệm người mới.`,
      };
    }

    const appointmentId = `APPT-${Date.now().toString().slice(-4)}`;

    // Update venue's active manager
    setVenues(prev =>
      prev.map(v =>
        v.id === venueId
          ? {
              ...v,
              activeManager: {
                appointmentId,
                userId: application.applicantId,
                name: application.applicantName,
                email: application.applicantEmail,
                phone: application.applicantPhone,
                appointedAt: new Date().toLocaleDateString('vi-VN'),
              },
            }
          : v
      )
    );

    // Update application status
    setApplications(prev =>
      prev.map(a =>
        a.id === application.id ? { ...a, status: 'APPROVED' } : a
      )
    );

    // Update applicant's account appointedVenues
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === application.applicantId) {
          const currentVenues = acc.appointedVenues || [];
          return {
            ...acc,
            appointedVenues: currentVenues.includes(venueId) ? currentVenues : [...currentVenues, venueId],
          };
        }
        return acc;
      })
    );

    // If appointed manager is currentUser, update state
    if (currentUser && currentUser.id === application.applicantId) {
      const currentVenues = currentUser.appointedVenues || [];
      setCurrentUser({
        ...currentUser,
        appointedVenues: currentVenues.includes(venueId) ? currentVenues : [...currentVenues, venueId],
      });
    }

    // Outbox notification
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      recipientId: application.applicantId,
      recipientName: application.applicantName,
      title: 'Bổ nhiệm Quản lý sân thành công',
      message: `Chúc mừng! Bạn đã chính thức được bổ nhiệm làm Quản lý tại cụm sân ${venue.name}.`,
      type: 'MANAGER_APPOINTED',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast('success', 'Bổ nhiệm thành công', `Đã bổ nhiệm ${application.applicantName} làm Quản lý ${venue.name}.`);
    return { success: true };
  };

  // 9. Revoke Manager
  const revokeManager = (venueId: string) => {
    const venue = venues.find(v => v.id === venueId);
    if (!venue || !venue.activeManager) return;

    const managerUserId = venue.activeManager.userId;
    const managerName = venue.activeManager.name;

    setVenues(prev =>
      prev.map(v => (v.id === venueId ? { ...v, activeManager: null } : v))
    );

    // Update application status to REVOKED
    setApplications(prev =>
      prev.map(a =>
        a.venueId === venueId && a.applicantId === managerUserId && a.status === 'APPROVED'
          ? { ...a, status: 'REVOKED' }
          : a
      )
    );

    // Remove venueId from manager's appointedVenues
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === managerUserId) {
          return {
            ...acc,
            appointedVenues: (acc.appointedVenues || []).filter(id => id !== venueId),
          };
        }
        return acc;
      })
    );

    // If currentUser is the revoked manager, update state
    if (currentUser && currentUser.id === managerUserId) {
      setCurrentUser({
        ...currentUser,
        appointedVenues: (currentUser.appointedVenues || []).filter(id => id !== venueId),
      });
    }

    // Outbox notification
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      recipientId: managerUserId,
      recipientName: managerName,
      title: 'Thu hồi quyền Quản lý sân',
      message: `Quyền Quản lý tại cụm sân ${venue.name} của bạn đã được chủ sân thu hồi.`,
      type: 'MANAGER_REVOKED',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast('info', 'Thu hồi thành công', `Đã thu hồi quyền quản lý của ${managerName}.`);
  };

  // 10. Reopen application
  const reopenApplication = (applicationId: string) => {
    setApplications(prev =>
      prev.map(a => (a.id === applicationId ? { ...a, status: 'SUBMITTED' } : a))
    );
    showToast('info', 'Mở lại hồ sơ', 'Hồ sơ đã được chuyển lại trạng thái chờ duyệt.');
  };

  // 11. Add Feedback
  const addFeedback = (venueId: string, rating: number, comment: string) => {
    if (!currentUser) {
      showToast('error', 'Chưa đăng nhập', 'Vui lòng đăng nhập để gửi đánh giá.');
      return;
    }
    const newFeedback: Feedback = {
      id: `FB-${Date.now().toString().slice(-4)}`,
      venueId,
      userId: currentUser.id,
      userName: currentUser.name,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    setFeedbacks(prev => [newFeedback, ...prev]);
    showToast('success', 'Gửi đánh giá thành công', 'Cảm ơn ý kiến đóng góp quý báu của bạn!');
  };

  // 12. Toggle Account Status (Lock/Unlock)
  const toggleAccountStatus = (accountId: string, newStatus: 'ACTIVE' | 'LOCKED') => {
    setAccounts(prev =>
      prev.map(a => (a.id === accountId ? { ...a, status: newStatus } : a))
    );

    if (currentUser?.id === accountId) {
      if (newStatus === 'LOCKED') {
        logout();
        showToast('error', 'Tài khoản bị khóa', 'Tài khoản hiện tại của bạn đã bị khóa do vi phạm chính sách.');
        return;
      }
      setCurrentUser(prev => (prev ? { ...prev, status: newStatus } : null));
    }

    showToast(
      'info',
      'Cập nhật trạng thái tài khoản',
      `Tài khoản đã được chuyển sang trạng thái: ${newStatus}`
    );
  };

  // 13. Soft delete Account
  const softDeleteAccount = (accountId: string) => {
    const now = new Date().toISOString();
    setAccounts(prev =>
      prev.map(a =>
        a.id === accountId ? { ...a, status: 'DELETED', deletedAt: now } : a
      )
    );

    if (currentUser?.id === accountId) {
      logout();
    }

    showToast('info', 'Xóa mềm tài khoản', 'Tài khoản đã được đánh dấu xóa logic (soft delete).');
  };

  // 14. Mark Notification as Read
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
