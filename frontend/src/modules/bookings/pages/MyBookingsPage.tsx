import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../app/AppContext';
import { formatDateVN, formatVND } from '../../../lib/utils';
import { Modal } from '../../../components/Modal';
import { Calendar, Clock } from 'lucide-react';

export const MyBookingsPage: React.FC = () => {
  const { bookings, currentUser, cancelMyBooking } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'ALL' | 'CONFIRMED' | 'CANCELLED'>('ALL');
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);

  const myBookings = bookings.filter(b => b.userId === currentUser?.id);

  const filteredBookings = myBookings.filter(b => {
    if (filter === 'CONFIRMED') return b.status === 'CONFIRMED';
    if (filter === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  const handleExecuteCancel = () => {
    if (cancellingBookingId) {
      cancelMyBooking(cancellingBookingId);
      setCancellingBookingId(null);
    }
  };

  return (
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Lịch Đặt Sân Của Bạn</h1>
          <p className="text-xs text-slate-400 mt-1">
            Theo dõi danh sách các trận đấu đã đặt và quản lý hủy sân linh hoạt
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              filter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất cả ({myBookings.length})
          </button>
          <button
            onClick={() => setFilter('CONFIRMED')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              filter === 'CONFIRMED' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sắp đá ({myBookings.filter(b => b.status === 'CONFIRMED').length})
          </button>
          <button
            onClick={() => setFilter('CANCELLED')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              filter === 'CANCELLED' ? 'bg-slate-800 text-rose-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Đã hủy
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-3.5">
        {filteredBookings.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
            <p className="text-xs text-slate-400">Bạn chưa có lượt đặt sân nào trong mục này.</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20"
            >
              Tìm sân & Đặt ngay →
            </button>
          </div>
        ) : (
          filteredBookings.map(b => (
            <div
              key={b.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700/80 transition-all shadow-md"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base">{b.venueName}</span>
                  <span className="text-emerald-400 font-semibold text-xs bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {b.courtName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.status === 'CONFIRMED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Ngày: <strong className="text-white">{formatDateVN(b.bookingDate)}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Khung giờ: <strong className="text-white">{b.startTime} - {b.endTime}</strong> ({b.durationMinutes} phút)
                  </span>
                  <span>
                    Tổng tiền: <strong className="text-emerald-400 font-mono">{formatVND(b.totalPrice)}</strong>
                  </span>
                </div>

                {b.cancellationReason && (
                  <p className="text-[11px] text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-900/40">
                    Lý do hủy: &quot;{b.cancellationReason}&quot; (Hủy bởi {b.cancelledBy || 'Quản lý'})
                  </p>
                )}
              </div>

              {b.status === 'CONFIRMED' && (
                <button
                  onClick={() => setCancellingBookingId(b.id)}
                  className="px-3.5 py-1.5 rounded-xl border border-rose-800/80 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-semibold text-xs transition-colors shrink-0"
                >
                  Hủy đặt sân
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancellingBookingId}
        onClose={() => setCancellingBookingId(null)}
        title="Xác nhận Hủy Đặt Sân"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Bạn có chắc chắn muốn hủy lượt đặt sân này không? Hành động này sẽ giải phóng khung giờ cho các khách hàng khác và gửi thông báo xác nhận vào hộp thư của bạn.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setCancellingBookingId(null)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Không, giữ lại
            </button>
            <button
              onClick={handleExecuteCancel}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20"
            >
              Đồng ý hủy sân
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
