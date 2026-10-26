import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../../app/AppContext';
import { Modal } from '../../../components/Modal';
import { DatePicker } from '../../../components/DatePicker';
import {
  formatVND,
  formatDateVN,
  calculateDurationMinutes,
  isTimeOverlapping,
  getTomorrowDateString,
  validateBookingTime,
} from '../../../lib/utils';
import { Court } from '../../../types';
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  UserCheck,
  Star,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface SelectedSlot {
  court: Court;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalPrice: number;
}

export const VenueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    venues,
    courts,
    bookings,
    applications,
    selectedVenueId,
    bookCourt,
    feedbacks,
    addFeedback,
    submitManagerApplication,
    currentUser,
    isAuthenticated,
    showToast,
  } = useApp();

  // Dynamic default date: from search params or tomorrow in local ISO YYYY-MM-DD
  const [bookingDate, setBookingDate] = useState(() => searchParams.get('date') || getTomorrowDateString());
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  // Feedback form state
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  const venueId = id || selectedVenueId;
  const venue = venues.find(v => v.id === venueId);
  const venueCourts = courts.filter(c => c.venueId === venue?.id);
  const venueFeedbacks = feedbacks.filter(f => f.venueId === venue?.id);
  const myApp = currentUser
    ? applications.find(a => a.venueId === venue?.id && a.applicantId === currentUser.id)
    : undefined;

  // Standard predefined time slots for display covering morning, afternoon, and evening
  const standardSlots = [
    { start: '06:00', end: '07:30', period: 'Sáng' },
    { start: '07:30', end: '09:00', period: 'Sáng' },
    { start: '15:30', end: '17:00', period: 'Chiều' },
    { start: '17:00', end: '18:00', period: 'Chiều' },
    { start: '18:00', end: '19:00', period: 'Tối (Prime)' },
    { start: '19:00', end: '20:30', period: 'Tối (Prime)' },
    { start: '20:30', end: '22:00', period: 'Tối (Prime)' },
    { start: '22:00', end: '23:30', period: 'Đêm' },
  ];

  const handleSelectSlot = (court: Court, start: string, end: string) => {
    // If clicking on already selected slot, toggle deselect it
    if (
      selectedSlot &&
      selectedSlot.court.id === court.id &&
      selectedSlot.startTime === start &&
      selectedSlot.endTime === end
    ) {
      setSelectedSlot(null);
      return;
    }

    const duration = calculateDurationMinutes(start, end);
    const price = Math.round((court.hourlyRate * duration) / 60);
    setSelectedSlot({
      court,
      startTime: start,
      endTime: end,
      durationMinutes: duration,
      totalPrice: price,
    });
  };

  // Restore pending actions or booking parameters from query params (e.g. returning from login redirect)
  useEffect(() => {
    const qAction = searchParams.get('action');
    if (qAction === 'apply') {
      if (currentUser && isAuthenticated) {
        if (venue && venue.ownerId === currentUser.id) {
          showToast('info', 'Thông báo', 'Bạn là chủ của cụm sân này, không thể nộp đơn ứng tuyển.');
        } else if (venue && !venue.isRecruiting) {
          showToast('warning', 'Thông báo', 'Cụm sân này hiện không có nhu cầu tuyển dụng Quản lý.');
        } else if (myApp?.status === 'SUBMITTED') {
          showToast('info', 'Thông báo', 'Bạn đã nộp hồ sơ ứng tuyển cụm sân này và đang chờ duyệt.');
        } else if (myApp?.status === 'APPROVED') {
          showToast('info', 'Thông báo', 'Bạn hiện đang là Quản lý của cụm sân này.');
        } else {
          setIsApplyModalOpen(true);
        }
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('action');
        setSearchParams(newParams, { replace: true });
        return;
      }
    }

    const qCourtId = searchParams.get('courtId');
    const qDate = searchParams.get('date');
    const qStart = searchParams.get('start');
    const qEnd = searchParams.get('end');

    if (qDate) {
      setBookingDate(qDate);
    }

    if (qCourtId && qStart && qEnd && venue) {
      const targetCourt = courts.find(c => c.id === qCourtId && c.venueId === venue.id);
      if (!targetCourt) {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('courtId');
        newParams.delete('date');
        newParams.delete('start');
        newParams.delete('end');
        setSearchParams(newParams, { replace: true });
        return;
      }

      if (targetCourt.status === 'MAINTENANCE') {
        showToast(
          'warning',
          'Sân đang bảo trì',
          `Sân ${targetCourt.name} hiện đang bảo trì kỹ thuật, vui lòng chọn sân khác!`
        );
        setSelectedSlot(null);
        setIsConfirmModalOpen(false);
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('courtId');
        newParams.delete('date');
        newParams.delete('start');
        newParams.delete('end');
        setSearchParams(newParams, { replace: true });
        return;
      }

      const targetDate = qDate || bookingDate;
      const validation = validateBookingTime(targetDate, qStart, qEnd);
      if (!validation.isValid) {
        showToast(
          'warning',
          'Khung giờ không khả dụng',
          validation.error || 'Khung giờ bạn chọn không hợp lệ hoặc đã qua.'
        );
        setSelectedSlot(null);
        setIsConfirmModalOpen(false);
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('courtId');
        newParams.delete('date');
        newParams.delete('start');
        newParams.delete('end');
        setSearchParams(newParams, { replace: true });
        return;
      }

      const isSlotBooked = bookings.some(
        b =>
          b.courtId === targetCourt.id &&
          b.bookingDate === targetDate &&
          b.status === 'CONFIRMED' &&
          isTimeOverlapping(qStart, qEnd, b.startTime, b.endTime)
      );

      if (isSlotBooked) {
        showToast(
          'warning',
          'Khung giờ không khả dụng',
          'Khung giờ bạn chọn vừa có người đặt trước. Vui lòng chọn khung giờ khác!'
        );
        setSelectedSlot(null);
        setIsConfirmModalOpen(false);
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('courtId');
        newParams.delete('date');
        newParams.delete('start');
        newParams.delete('end');
        setSearchParams(newParams, { replace: true });
      } else {
        const duration = calculateDurationMinutes(qStart, qEnd);
        const price = Math.round((targetCourt.hourlyRate * duration) / 60);
        setSelectedSlot({
          court: targetCourt,
          startTime: qStart,
          endTime: qEnd,
          durationMinutes: duration,
          totalPrice: price,
        });
        if (currentUser && isAuthenticated) {
          setIsConfirmModalOpen(true);
        }
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('courtId');
        newParams.delete('date');
        newParams.delete('start');
        newParams.delete('end');
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [searchParams, venue, courts, bookings, currentUser, isAuthenticated, myApp]);

  const handleOpenConfirmModal = () => {
    if (!currentUser || !isAuthenticated) {
      showToast('info', 'Yêu cầu đăng nhập', 'Vui lòng đăng nhập để tiến hành đặt sân.');
      const returnPath = selectedSlot && venue
        ? `/venues/${venue.id}?courtId=${encodeURIComponent(selectedSlot.court.id)}&date=${encodeURIComponent(bookingDate)}&start=${encodeURIComponent(selectedSlot.startTime)}&end=${encodeURIComponent(selectedSlot.endTime)}`
        : `/venues/${venue?.id || venueId}`;
      navigate(`/login?redirect=${encodeURIComponent(returnPath)}`);
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    if (searchParams.get('courtId')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('courtId');
      newParams.delete('date');
      newParams.delete('start');
      newParams.delete('end');
      setSearchParams(newParams, { replace: true });
    }
  };

  const handleConfirmBooking = async () => {
    if (!currentUser || !isAuthenticated) {
      setIsConfirmModalOpen(false);
      showToast('info', 'Yêu cầu đăng nhập', 'Vui lòng đăng nhập để tiến hành đặt sân.');
      navigate(`/login?redirect=${encodeURIComponent(`/venues/${venue?.id || venueId}`)}`);
      return;
    }
    if (!selectedSlot) return;
    const res = await bookCourt(
      selectedSlot.court.id,
      bookingDate,
      selectedSlot.startTime,
      selectedSlot.endTime
    );
    if (res.success) {
      setIsConfirmModalOpen(false);
      setSelectedSlot(null);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('courtId');
      newParams.delete('date');
      newParams.delete('start');
      newParams.delete('end');
      setSearchParams(newParams, { replace: true });
      navigate('/my-bookings');
    } else {
      showToast('error', 'Đặt sân không thành công', res.error || 'Có lỗi xảy ra.');
    }
  };

  const handleOpenApplyModal = () => {
    if (!currentUser || !isAuthenticated) {
      showToast('info', 'Yêu cầu đăng nhập', 'Vui lòng đăng nhập để nộp đơn ứng tuyển.');
      const currentVenueId = venue?.id || venueId;
      navigate(`/login?redirect=${encodeURIComponent(`/venues/${currentVenueId}?action=apply`)}`);
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleSubmitApplication = async () => {
    if (!venue) return;
    const res = await submitManagerApplication(venue.id, hasConsented);
    if (res.success) {
      setIsApplyModalOpen(false);
      setHasConsented(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isAuthenticated) {
      showToast('info', 'Yêu cầu đăng nhập', 'Vui lòng đăng nhập để gửi đánh giá.');
      navigate(`/login?redirect=${encodeURIComponent(`/venues/${venue?.id || venueId}`)}`);
      return;
    }
    if (!venue || !feedbackComment.trim()) return;
    await addFeedback(venue.id, rating, feedbackComment.trim());
    setFeedbackComment('');
  };

  if (!venue) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-800/80 mx-auto flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/40">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-white">Không Tìm Thấy Cụm Sân Bóng</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Cụm sân bạn đang tìm kiếm với mã &quot;{venueId}&quot; không tồn tại hoặc đã bị gỡ khỏi hệ thống.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Về trang khám phá sân
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in pb-16">
      {/* Top back navigation */}
      <button
        onClick={() => navigate('/')}
        className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách cụm sân
      </button>

      {/* Venue Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">{venue.name}</h1>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800/60">
              Tự động duyệt tức thì
            </span>
            {venue.isRecruiting && (
              <span className="text-xs font-semibold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-800/60">
                Đang tuyển Manager
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            {venue.address} • Chủ sân: <strong className="text-slate-300">{venue.ownerName}</strong>
          </p>
          <p className="text-[11px] text-emerald-400/90 font-medium pt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            Ràng buộc hệ thống: Mỗi lượt đặt từ 30 phút đến 4 giờ (240 phút) • Miễn phí hủy trước 30 phút
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {venue.isRecruiting && (!currentUser || venue.ownerId !== currentUser.id) && (
            myApp?.status === 'SUBMITTED' ? (
              <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 font-semibold text-xs">
                <Clock className="w-4 h-4" />
                Đã nộp đơn (Chờ duyệt)
              </span>
            ) : myApp?.status === 'APPROVED' ? (
              <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                Đang là Quản lý
              </span>
            ) : (
              <button
                onClick={handleOpenApplyModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/50 text-amber-300 font-semibold text-xs transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                {myApp?.status === 'REVOKED' ? 'Nộp lại đơn ứng tuyển' : 'Ứng tuyển Manager'}
              </button>
            )
          )}

          <DatePicker
            value={bookingDate}
            onChange={setBookingDate}
            label="Ngày đặt:"
            minDate={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* Interactive Court Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/40">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Lịch Đặt & Bảng Khung Giờ Trống (Ngày {formatDateVN(bookingDate)})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chọn sân con và click vào khung giờ mong muốn để đặt sân.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-950 border border-emerald-500/50 inline-block" />
              <span className="text-slate-400">Còn trống</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
              <span className="text-white font-semibold">Đang chọn</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-800/80 border border-slate-700/60 inline-block" />
              <span className="text-slate-500">Đã có người đặt</span>
            </div>
          </div>
        </div>

        {venueCourts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            Cụm sân này hiện chưa có sân con nào được cấu hình.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {venueCourts.map(court => {
              // Get active bookings on selected date for this court
              const courtBookings = bookings.filter(
                b =>
                  b.courtId === court.id &&
                  b.bookingDate === bookingDate &&
                  b.status === 'CONFIRMED'
              );

              return (
                <div key={court.id} className="p-4 sm:p-5 space-y-3 hover:bg-slate-800/20 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm sm:text-base">
                          {court.name}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          {court.courtTypeLabel}
                        </span>
                        {court.status === 'MAINTENANCE' && (
                          <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/80 border border-amber-800/60 px-1.5 py-0.2 rounded">
                            Bảo trì
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {court.description}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-emerald-400 font-extrabold text-sm sm:text-base">
                        {formatVND(court.hourlyRate)}
                      </span>
                      <span className="text-slate-500 text-xs"> / giờ</span>
                    </div>
                  </div>

                  {/* Slot buttons grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1">
                    {standardSlots.map(slot => {
                      // Check overlap with existing confirmed bookings
                      const isBooked = courtBookings.some(b =>
                        isTimeOverlapping(slot.start, slot.end, b.startTime, b.endTime)
                      );

                      const isSelected =
                        selectedSlot?.court.id === court.id &&
                        selectedSlot?.startTime === slot.start &&
                        selectedSlot?.endTime === slot.end;

                      if (isBooked) {
                        return (
                          <div
                            key={slot.start}
                            className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/50 text-center opacity-40 cursor-not-allowed select-none"
                            title="Khung giờ này đã có người đặt"
                          >
                            <span className="text-[10px] text-slate-500 block">{slot.period}</span>
                            <span className="text-xs font-semibold text-slate-500 line-through">
                              {slot.start} - {slot.end}
                            </span>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={slot.start}
                          onClick={() => handleSelectSlot(court, slot.start, slot.end)}
                          className={`p-2 rounded-xl text-center border transition-all ${
                            isSelected
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 scale-[1.03]'
                              : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-emerald-500/60 hover:text-white'
                          }`}
                        >
                          <span
                            className={`text-[10px] block ${
                              isSelected ? 'text-slate-950/80' : 'text-slate-500'
                            }`}
                          >
                            {slot.period}
                          </span>
                          <span className="text-xs font-semibold">
                            {slot.start} - {slot.end}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dynamic Sticky/Bottom Confirmation Drawer */}
        {selectedSlot && (
          <div className="sticky bottom-0 z-30 bg-emerald-950/95 backdrop-blur-md border-t border-emerald-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 fade-in shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
                <CheckCircle2 className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <p className="text-xs text-emerald-300 font-medium">Khung giờ đang chọn (Bấm lại để bỏ chọn):</p>
                <p className="text-sm font-bold text-white">
                  {selectedSlot.court.name} • <span className="font-mono">{selectedSlot.startTime} - {selectedSlot.endTime}</span> ({selectedSlot.durationMinutes} phút) —{' '}
                  <span className="text-emerald-300 font-mono">{formatVND(selectedSlot.totalPrice)}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedSlot(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Bỏ chọn
              </button>
              <button
                onClick={handleOpenConfirmModal}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
              >
                Xác nhận đặt sân ngay
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feedbacks and Reviews Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white">Đánh Giá & Phản Hồi Từ Khách Hàng</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Đánh giá thực tế từ người dùng đã từng đặt và thi đấu tại sân
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              4.8 / 5.0
            </div>
            <span className="text-slate-400">({venueFeedbacks.length} lượt đánh giá)</span>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-3">
          {venueFeedbacks.length === 0 ? (
            <p className="text-xs text-slate-500">Chưa có đánh giá nào cho cụm sân này.</p>
          ) : (
            venueFeedbacks.map(fb => (
              <div key={fb.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{fb.userName}</span>
                  <div className="flex items-center gap-0.5 text-amber-400 font-bold">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= fb.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed">{fb.comment}</p>
                <p className="text-[10px] text-slate-500">{formatDateVN(fb.createdAt)}</p>
              </div>
            ))
          )}
        </div>

        {/* Submit Review Form */}
        <form onSubmit={handleSubmitFeedback} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
          <h4 className="font-bold text-xs text-white">Gửi Đánh Giá Của Bạn</h4>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">Chọn số sao:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-0.5 transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <textarea
            rows={2}
            value={feedbackComment}
            onChange={e => setFeedbackComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm về chất lượng cỏ, hệ thống chiếu sáng, dịch vụ..."
            className="w-full text-xs p-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
            >
              Gửi đánh giá
            </button>
          </div>
        </form>
      </div>

      {/* Booking Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        title="Xác nhận Đặt Sân Bóng Đá"
      >
        {selectedSlot && (
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Cụm sân:</span>
                <strong className="text-white">{venue.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sân con:</span>
                <strong className="text-emerald-400">{selectedSlot.court.name} ({selectedSlot.court.courtTypeLabel})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ngày đặt:</span>
                <strong className="text-white">{formatDateVN(bookingDate)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Khung giờ:</span>
                <strong className="text-white">{selectedSlot.startTime} - {selectedSlot.endTime} ({selectedSlot.durationMinutes} phút)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Người đặt:</span>
                <strong className="text-white">
                  {currentUser ? `${currentUser.name} (${currentUser.phone})` : 'Khách vãng lai'}
                </strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 text-sm">
                <span className="text-slate-300 font-semibold">Tổng tiền thanh toán:</span>
                <strong className="text-emerald-400 font-bold">{formatVND(selectedSlot.totalPrice)}</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              * Hệ thống tự động xác nhận tức thì (CONFIRMED). Bạn có thể tự hủy miễn phí trong phần &quot;Booking cá nhân&quot; trước giờ đá ít nhất 30 phút.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleCloseConfirmModal}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmBooking}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20"
              >
                Xác nhận đặt ngay
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Manager Recruitment Application Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Ứng Tuyển Vị Trí Quản Lý Sân (Manager)"
      >
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
            <p className="text-slate-400">Cụm sân ứng tuyển: <strong className="text-white">{venue.name}</strong></p>
            <p className="text-slate-400">Thông điệp từ Chủ sân: <span className="text-amber-300 italic">&quot;{venue.recruitmentMessage}&quot;</span></p>
            <div className="pt-2 border-t border-slate-800 text-slate-300 space-y-1">
              <p>Họ tên: <strong className="text-white">{currentUser?.name}</strong></p>
              <p>Email: <strong className="text-white">{currentUser?.email}</strong></p>
              <p>Số điện thoại: <strong className="text-white">{currentUser?.phone}</strong></p>
            </div>
          </div>

          <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <input
              type="checkbox"
              checked={hasConsented}
              onChange={e => setHasConsented(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-0"
            />
            <span className="leading-tight text-[11px]">
              Tôi đồng ý cho phép Chủ sân xem số điện thoại và email cá nhân (ghi nhận <code className="text-emerald-400">consented_at</code> theo chuẩn PRD) để liên hệ phỏng vấn bổ nhiệm.
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsApplyModalOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Đóng
            </button>
            <button
              disabled={!hasConsented}
              onClick={handleSubmitApplication}
              className={`px-5 py-2 rounded-xl font-bold text-xs transition-colors ${
                hasConsented
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Nộp hồ sơ ứng tuyển
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
