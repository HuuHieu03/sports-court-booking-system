import React, { useState, useEffect } from 'react';
import { useApp } from '../../../app/AppContext';
import { formatVND } from '../../../lib/utils';
import { Modal } from '../../../components/Modal';
import { Court, CourtType } from '../../../types';
import { Plus, Edit2, Trash2, AlertCircle, Building2 } from 'lucide-react';

export const ManagerCourtsPage: React.FC = () => {
  const {
    courts,
    venues,
    bookings,
    addCourt,
    updateCourt,
    deleteCourt,
    currentUser,
    currentRole,
    selectedVenueId,
    setSelectedVenueId,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [deletingCourtId, setDeletingCourtId] = useState<string | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

  // Add form state
  const [courtName, setCourtName] = useState('');
  const [courtType, setCourtType] = useState<CourtType>('FIVE_A_SIDE');
  const [description, setDescription] = useState('');
  const [hourlyRate, setHourlyRate] = useState(300000);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<CourtType>('FIVE_A_SIDE');
  const [editDescription, setEditDescription] = useState('');
  const [editHourlyRate, setEditHourlyRate] = useState(300000);

  // Filter venues based on actual user permissions (Dynamic RBAC)
  const managedVenues = venues.filter(v => {
    if (!currentUser) return false;
    if (currentUser.role === 'OWNER') {
      return v.ownerId === currentUser.id;
    }
    return v.activeManager?.userId === currentUser.id;
  });

  useEffect(() => {
    if (managedVenues.length > 0 && !managedVenues.some(v => v.id === selectedVenueId)) {
      setSelectedVenueId(managedVenues[0].id);
    }
  }, [managedVenues, selectedVenueId, setSelectedVenueId]);

  const venue = managedVenues.find(v => v.id === selectedVenueId) || managedVenues[0] || null;
  const venueCourts = venue ? courts.filter(c => c.venueId === venue.id) : [];

  const handleOpenAddModal = () => {
    setCourtName('');
    setCourtType('FIVE_A_SIDE');
    setDescription('');
    setHourlyRate(300000);
    setIsAddModalOpen(true);
  };

  const handleSaveCourt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtName.trim() || !venue) return;

    let typeLabel = 'Sân 5 người';
    if (courtType === 'SEVEN_A_SIDE') typeLabel = 'Sân 7 người';
    if (courtType === 'ELEVEN_A_SIDE') typeLabel = 'Sân 11 người';

    addCourt({
      venueId: venue.id,
      name: courtName.trim(),
      courtType,
      courtTypeLabel: typeLabel,
      description: description.trim() || 'Sân cỏ nhân tạo chất lượng cao.',
      hourlyRate: Number(hourlyRate) || 300000,
      status: 'ACTIVE',
    });

    setIsAddModalOpen(false);
  };

  const handleOpenEditModal = (court: Court) => {
    setEditingCourt(court);
    setEditName(court.name);
    setEditType(court.courtType);
    setEditDescription(court.description);
    setEditHourlyRate(court.hourlyRate);
    setIsEditModalOpen(true);
  };

  const handleSaveEditCourt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourt || !editName.trim()) return;

    let typeLabel = 'Sân 5 người';
    if (editType === 'SEVEN_A_SIDE') typeLabel = 'Sân 7 người';
    if (editType === 'ELEVEN_A_SIDE') typeLabel = 'Sân 11 người';

    updateCourt(editingCourt.id, {
      name: editName.trim(),
      courtType: editType,
      courtTypeLabel: typeLabel,
      description: editDescription.trim(),
      hourlyRate: Number(editHourlyRate) || 300000,
    });

    setIsEditModalOpen(false);
    setEditingCourt(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingCourtId) return;
    const res = deleteCourt(deletingCourtId);
    if (res.success) {
      setDeletingCourtId(null);
      setDeleteErrorMessage('');
    } else {
      setDeleteErrorMessage(res.message);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Top Header and Venue Selector */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              Quản Lý Danh Sách Sân Con (Courts)
            </h1>
            {venue && (
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                {venue.name}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {currentRole === 'OWNER' ? 'Owner' : 'Manager'} có thẩm quyền cấu hình sân, giá theo giờ và xóa logic sân (deleted_at).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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

          <button
            onClick={handleOpenAddModal}
            disabled={managedVenues.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Thêm Sân Con Mới
          </button>
        </div>
      </div>

      {/* Courts Cards Grid */}
      {managedVenues.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Bạn chưa có quyền quản trị cụm sân nào</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {currentRole === 'OWNER'
              ? 'Vui lòng tạo cụm sân tại "Cụm sân của tôi" trước khi cấu hình sân con.'
              : 'Bạn chưa được bổ nhiệm làm Manager tại cụm sân nào, hoặc quyền bổ nhiệm đã bị thu hồi.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {venueCourts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-2xl">
              Cụm sân này hiện chưa có sân con nào. Vui lòng bấm &quot;Thêm Sân Con Mới&quot;.
            </div>
          ) : (
          venueCourts.map(court => (
            <div
              key={court.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:border-slate-700/80 transition-all shadow-md"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                    {court.courtTypeLabel}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    ID: {court.id}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{court.name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                  {court.description}
                </p>

                <div className="pt-2 text-xs text-slate-400">
                  Đơn giá: <strong className="text-emerald-400 font-mono text-sm">{formatVND(court.hourlyRate)}</strong>/giờ
                </div>
              </div>

              {(() => {
                const activeCount = bookings.filter(
                  b => b.courtId === court.id && b.status === 'CONFIRMED'
                ).length;
                return (
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-semibold text-[11px]">
                        ● Đang hoạt động
                      </span>
                      {activeCount > 0 ? (
                        <span className="text-[10px] bg-amber-950/80 border border-amber-800/60 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                          {activeCount} lượt đặt
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">
                          0 lượt đặt
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(court)}
                        className="flex items-center gap-1 text-slate-300 hover:text-white font-semibold transition-colors px-2 py-1 rounded hover:bg-slate-800"
                        title="Chỉnh sửa thông tin sân con"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Sửa
                      </button>
                      <button
                        onClick={() => {
                          setDeletingCourtId(court.id);
                          setDeleteErrorMessage('');
                        }}
                        className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-semibold transition-colors px-2 py-1 rounded hover:bg-rose-950/40"
                        title="Xóa logic sân con"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Xóa
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          ))
        )}
      </div>
      )}

      {/* Add Court Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Sân Con Mới Vào Cụm Sân"
      >
        <form onSubmit={handleSaveCourt} className="space-y-3.5">
          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-xs">
              Tên sân con (name):
            </label>
            <input
              type="text"
              required
              value={courtName}
              onChange={e => setCourtName(e.target.value)}
              placeholder="Ví dụ: Sân 5C, Sân Futsal A..."
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-xs">
              Loại sân (courtType):
            </label>
            <select
              value={courtType}
              onChange={e => setCourtType(e.target.value as CourtType)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs cursor-pointer"
            >
              <option value="FIVE_A_SIDE">Sân 5 người (FIVE_A_SIDE)</option>
              <option value="SEVEN_A_SIDE">Sân 7 người (SEVEN_A_SIDE)</option>
              <option value="ELEVEN_A_SIDE">Sân 11 người (ELEVEN_A_SIDE)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-xs">
              Đơn giá theo giờ (VNĐ):
            </label>
            <input
              type="number"
              step="10000"
              required
              value={hourlyRate}
              onChange={e => setHourlyRate(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-xs">
              Mô tả đặc điểm sân:
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ví dụ: Mặt cỏ êm, có hệ thống đèn LED chống chói..."
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
            >
              Lưu sân con
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Court Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCourt(null);
        }}
        title="Chỉnh Sửa Thông Tin Sân Con"
      >
        <form onSubmit={handleSaveEditCourt} className="space-y-3.5">
          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-xs">
              Tên sân con (name):
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="Ví dụ: Sân 5C..."
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-xs">
              Loại sân (courtType):
            </label>
            <select
              value={editType}
              onChange={e => setEditType(e.target.value as CourtType)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs cursor-pointer"
            >
              <option value="FIVE_A_SIDE">Sân 5 người (FIVE_A_SIDE)</option>
              <option value="SEVEN_A_SIDE">Sân 7 người (SEVEN_A_SIDE)</option>
              <option value="ELEVEN_A_SIDE">Sân 11 người (ELEVEN_A_SIDE)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-xs">
              Đơn giá theo giờ (VNĐ):
            </label>
            <input
              type="number"
              step="10000"
              required
              value={editHourlyRate}
              onChange={e => setEditHourlyRate(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-xs">
              Mô tả đặc điểm sân:
            </label>
            <textarea
              rows={2}
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              placeholder="Ví dụ: Mặt cỏ êm, có hệ thống đèn LED chống chói..."
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingCourt(null);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Court Confirmation Modal with PRD Constraint Verification */}
      <Modal
        isOpen={!!deletingCourtId}
        onClose={() => setDeletingCourtId(null)}
        title="Xác nhận Xóa Sân Con"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Quy tắc PRD & Database: Hệ thống sẽ tiến hành xóa logic (<code className="text-emerald-400">deleted_at</code>) và kiểm tra bắt buộc xem sân có bất kỳ lịch đặt CONFIRMED nào sắp tới hay không trước khi thực thi.
          </p>

          {deleteErrorMessage && (
            <div className="flex items-start gap-1.5 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-[11px] text-rose-300 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{deleteErrorMessage}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setDeletingCourtId(null)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20"
            >
              Xác nhận xóa sân
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
