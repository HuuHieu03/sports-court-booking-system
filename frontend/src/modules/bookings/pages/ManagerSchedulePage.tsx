import React, { useState, useEffect } from 'react';
import { useApp } from '../../../app/AppContext';
import { formatDateVN, formatVND } from '../../../lib/utils';
import { Modal } from '../../../components/Modal';
import { DatePicker } from '../../../components/DatePicker';
import { Booking } from '../../../types';
import { ClipboardList, AlertCircle } from 'lucide-react';

export const ManagerSchedulePage: React.FC = () => {
  const {
    bookings,
    cancelCustomerBooking,
    venues,
    currentUser,
    currentRole,
    selectedVenueId,
    setSelectedVenueId,
    isManager,
  } = useApp();
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState('');

  const getTodayDateString = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [filterDate, setFilterDate] = useState<string>(() => getTodayDateString());

  // Filter venues based on actual user permissions (Dynamic RBAC)
  const managedVenues = venues.filter(v => {
    if (!currentUser) return false;
    if (currentUser.role === 'OWNER') {
      return v.ownerId === currentUser.id;
    }
    return isManager(v.id) || v.activeManager?.userId === currentUser.id;
  });

  useEffect(() => {
    if (managedVenues.length > 0 && !managedVenues.some(v => v.id === selectedVenueId)) {
      setSelectedVenueId(managedVenues[0].id);
    }
  }, [managedVenues, selectedVenueId, setSelectedVenueId]);

  const venue = managedVenues.find(v => v.id === selectedVenueId) || managedVenues[0] || null;
  const venueBookings = venue
    ? bookings.filter(b => {
        if (b.venueId !== venue.id) return false;
        if (filterDate && b.bookingDate !== filterDate) return false;
        return true;
      })
    : [];

  const handleOpenCancelModal = (booking: Booking) => {
    setCancellingBooking(booking);
    setReason('');
    setValidationError('');
  };

  const handleExecuteCancel = async () => {
    if (!reason.trim()) {
      setValidationError('Ràng buộc CSDL (CHECK constraint): Lý do hủy sân không được để trống khi Quản lý/Chủ sân hủy lịch của khách!');
      return;
    }
    if (cancellingBooking) {
      const res = await cancelCustomerBooking(cancellingBooking.id, reason.trim());
      if (res.success) {
        setCancellingBooking(null);
      } else if (res.error) {
        setValidationError(res.error);
      }
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Top Banner and Venue Selector */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-emerald-400" />
              Lịch Sân Khách Hôm Nay
            </h1>
            {venue && (
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                {venue.name}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {currentRole === 'OWNER' ? 'Chủ sân (Owner)' : 'Quản lý (Manager)'} theo dõi lịch đặt sân của khách, kiểm tra danh sách và hủy lịch kèm lý do bắt buộc theo chuẩn CSDL.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Cụm sân:</span>
            <select
              value={venue?.id || selectedVenueId}
              onChange={e => setSelectedVenueId(e.target.value)}
              disabled={managedVenues.length === 0}
              className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none cursor-pointer disabled:opacity-50"
            >
              {managedVenues.length === 0 ? (
                <option value="">Không có quyền cụm sân nào</option>
              ) : (
                managedVenues.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <DatePicker
            value={filterDate}
            onChange={setFilterDate}
            label="Ngày:"
            allowClear={true}
          />
        </div>
      </div>

      {/* Schedule Table */}
      {managedVenues.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Bạn chưa có quyền quản trị cụm sân nào</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {currentRole === 'OWNER'
              ? 'Vui lòng tạo cụm sân tại "Cụm sân của tôi" trước khi theo dõi lịch đặt.'
              : 'Bạn chưa được bổ nhiệm làm Manager tại cụm sân nào, hoặc quyền bổ nhiệm đã bị thu hồi.'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>Danh Sách Đặt Sân Của Khách ({venueBookings.length})</span>
              {filterDate ? (
                <span className="text-xs text-emerald-400 font-normal">
                  (Ngày {formatDateVN(filterDate)})
                </span>
              ) : (
                <span className="text-xs text-slate-400 font-normal">(Tất cả các ngày)</span>
              )}
            </h2>
            <span className="text-[11px] text-slate-400">
              Thời gian kết nối CSDL: <strong className="text-emerald-400 font-mono">UTC (timestamptz)</strong>
            </span>
          </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold">
              <tr>
                <th className="p-4">Khách đặt sân (Customer Profile)</th>
                <th className="p-4">Sân con</th>
                <th className="p-4">Ngày đá</th>
                <th className="p-4">Khung giờ & Thời lượng</th>
                <th className="p-4">Giá tiền</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {venueBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Cụm sân chưa ghi nhận lượt đặt nào.
                  </td>
                </tr>
              ) : (
                venueBookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors align-middle">
                    <td className="p-4">
                      <p className="font-bold text-white text-xs">{b.userName}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {b.userEmail} • <span className="font-mono text-slate-300">{b.userPhone}</span>
                      </p>
                    </td>
                    <td className="p-4 font-bold text-emerald-400">{b.courtName}</td>
                    <td className="p-4 font-medium">{formatDateVN(b.bookingDate)}</td>
                    <td className="p-4 font-mono">
                      <span className="font-bold text-slate-100">{b.startTime} - {b.endTime}</span>{' '}
                      <span className="text-[11px] text-slate-400">({b.durationMinutes} phút)</span>
                    </td>
                    <td className="p-4 font-bold text-slate-300">{formatVND(b.totalPrice)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {b.status === 'CONFIRMED' ? (
                        <button
                          onClick={() => handleOpenCancelModal(b)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-semibold transition-all shadow-sm"
                        >
                          Hủy sân & Báo khách
                        </button>
                      ) : (
                        <div className="text-[11px] space-y-0.5">
                          <span className="text-rose-400 font-semibold block">
                            {b.cancelledBy === 'USER' ? 'Khách tự hủy' : 'Quản lý sân hủy'}
                          </span>
                          {b.cancellationReason && (
                            <span className="text-slate-400 italic block">
                              Lý do: {b.cancellationReason}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Cancellation Modal with Mandatory Reason */}
      <Modal
        isOpen={!!cancellingBooking}
        onClose={() => setCancellingBooking(null)}
        title="Hủy Lượt Đặt Của Khách Hàng"
      >
        {cancellingBooking && (
          <div className="space-y-4">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
              <p className="text-slate-400">Khách hàng: <strong className="text-white">{cancellingBooking.userName}</strong> ({cancellingBooking.userPhone})</p>
              <p className="text-slate-400">Sân: <strong className="text-emerald-400">{cancellingBooking.courtName}</strong> • Giờ: <strong className="text-white">{cancellingBooking.startTime} - {cancellingBooking.endTime}</strong></p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Lý do hủy sân <span className="text-rose-400">* (Bắt buộc theo ràng buộc CSDL CHECK constraint)</span>:
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={e => {
                  setReason(e.target.value);
                  setValidationError('');
                }}
                placeholder="Ví dụ: Sự cố hệ thống chiếu sáng cột 3, mưa bão ngập mặt sân đột xuất..."
                className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
              {validationError && (
                <div className="flex items-start gap-1.5 p-2.5 bg-rose-950/60 border border-rose-800/80 rounded-xl mt-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-rose-300 font-medium leading-relaxed">
                    {validationError}
                  </p>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              * Sau khi xác nhận, hệ thống sẽ tự động phát sinh thông báo Outbox gửi tới khách hàng và giải phóng khung giờ.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancellingBooking(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Đóng
              </button>
              <button
                onClick={handleExecuteCancel}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all"
              >
                Xác nhận hủy & Gửi thông báo
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
