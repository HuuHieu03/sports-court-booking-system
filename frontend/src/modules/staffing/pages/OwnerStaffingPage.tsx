import React, { useState, useEffect } from 'react';
import { useApp } from '../../../app/AppContext';
import { Modal } from '../../../components/Modal';
import { ManagerApplication } from '../../../types';
import { formatDateVN } from '../../../lib/utils';
import { Users, UserCheck, UserX, AlertCircle, CheckCircle2, Building2, Edit2 } from 'lucide-react';

export const OwnerStaffingPage: React.FC = () => {
  const {
    venues,
    applications,
    appointManager,
    revokeManager,
    toggleRecruitment,
    updateRecruitmentMessage,
    currentUser,
    selectedVenueId,
    setSelectedVenueId,
  } = useApp();

  const [isEditRecruitmentOpen, setIsEditRecruitmentOpen] = useState(false);
  const [recruitmentMessage, setRecruitmentMessage] = useState('');
  const [appointingApp, setAppointingApp] = useState<ManagerApplication | null>(null);
  const [appointError, setAppointError] = useState('');

  // Owner strictly manages staffing for their own venues
  const ownerVenues = venues.filter(v => v.ownerId === currentUser?.id);

  useEffect(() => {
    if (ownerVenues.length > 0 && !ownerVenues.some(v => v.id === selectedVenueId)) {
      setSelectedVenueId(ownerVenues[0].id);
    }
  }, [ownerVenues, selectedVenueId, setSelectedVenueId]);

  const venue = ownerVenues.find(v => v.id === selectedVenueId) || ownerVenues[0] || null;
  const venueApplications = venue ? applications.filter(a => a.venueId === venue.id) : [];

  const handleOpenEditRecruitment = () => {
    setRecruitmentMessage(venue?.recruitmentMessage || '');
    setIsEditRecruitmentOpen(true);
  };

  const handleSaveRecruitment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue) return;
    await updateRecruitmentMessage(venue.id, recruitmentMessage);
    setIsEditRecruitmentOpen(false);
  };

  const handleExecuteAppoint = async () => {
    if (!appointingApp || !venue) return;
    const res = await appointManager(venue.id, appointingApp);
    if (res.success) {
      setAppointingApp(null);
      setAppointError('');
    } else if (res.error) {
      setAppointError(res.error);
    }
  };

  const handleRevoke = async () => {
    if (!venue) return;
    if (
      window.confirm(
        'Quy tắc PRD & Database:\nThu hồi Manager có hiệu lực ngay lập tức tại CSDL (revoked_at ghi nhận) và chặn toàn bộ quyền quản trị sân con/lịch khách dù token của người này còn hạn.\n\nBạn có chắc chắn muốn thu hồi?'
      )
    ) {
      await revokeManager(venue.id, venue.activeManager?.userId);
    }
  };

  if (!venue) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
        <Building2 className="w-10 h-10 mx-auto text-slate-500" />
        <h3 className="text-sm font-bold text-white">Bạn chưa sở hữu cụm sân nào</h3>
        <p className="text-xs text-slate-400">Vui lòng tạo cụm sân tại mục &quot;Cụm sân của tôi&quot; trước khi quản trị tuyển dụng.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Top Banner and Venue Selector */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Quản Trị Tuyển Dụng & Bổ Nhiệm Manager
            </h1>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
              {venue.name}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Mỗi cụm sân theo thiết kế CSDL chỉ có tối đa 01 Manager đương nhiệm (<code className="text-emerald-400 font-mono">revoked_at IS NULL</code>).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Chọn cụm sân:</span>
          <select
            value={venue.id}
            onChange={e => setSelectedVenueId(e.target.value)}
            disabled={ownerVenues.length === 0}
            className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none cursor-pointer disabled:opacity-50"
          >
            {ownerVenues.length === 0 ? (
              <option value="">Không có cụm sân sở hữu</option>
            ) : (
              ownerVenues.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Recruitment Status Card */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">Trạng Thái Đăng Tuyển Manager</h2>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded flex items-center gap-1.5 ${
                venue.isRecruiting
                  ? 'text-emerald-400 bg-emerald-950 border border-emerald-800/60'
                  : 'text-slate-400 bg-slate-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${venue.isRecruiting ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              {venue.isRecruiting ? 'Đang mở tuyển' : 'Đang đóng tuyển'}
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {venue.recruitmentMessage || 'Chưa thiết lập nội dung mô tả công việc tuyển dụng.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenEditRecruitment}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Chỉnh sửa mô tả
          </button>
          <button
            onClick={() => toggleRecruitment(venue.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              venue.isRecruiting
                ? 'bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            {venue.isRecruiting ? 'Đóng đăng tuyển' : 'Mở lại đăng tuyển'}
          </button>
        </div>
      </div>

      {/* Active Manager Card (1 Venue max 1 Active Manager according to PRD/DB) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Manager Đương Nhiệm (Tối đa 1 Manager theo Database Constraint)
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            UNIQUE (venue_id) WHERE revoked_at IS NULL
          </span>
        </div>

        {venue.activeManager ? (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <p className="font-bold text-white text-sm flex items-center gap-2">
                {venue.activeManager.name}
                <span className="text-emerald-400 font-normal text-xs bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/50">
                  ● Đang hiệu lực
                </span>
              </p>
              <p className="text-slate-400">
                Email: <strong className="text-slate-200">{venue.activeManager.email}</strong> • SĐT: <strong className="text-slate-200 font-mono">{venue.activeManager.phone}</strong>
              </p>
              <p className="text-slate-500 text-[11px]">
                Ngày bổ nhiệm: {venue.activeManager.appointedAt} (Mã bổ nhiệm: {venue.activeManager.appointmentId})
              </p>
            </div>

            <button
              onClick={handleRevoke}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/20 font-bold text-xs transition-all shrink-0"
            >
              <UserX className="w-4 h-4" />
              Thu hồi quyền Manager tức thì
            </button>
          </div>
        ) : (
          <div className="p-6 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-500 text-center">
            Cụm sân này hiện chưa có Manager nào được bổ nhiệm. Bạn có thể duyệt các ứng viên từ danh sách dưới đây.
          </div>
        )}
      </div>

      {/* Candidate Applications List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <h3 className="font-bold text-white text-sm">
            Hồ Sơ Ứng Tuyển Chờ Duyệt ({venueApplications.length})
          </h3>
          <span className="text-[11px] text-slate-400">
            Yêu cầu chia sẻ thông tin cá nhân (<code className="text-emerald-400 font-mono">consented_at</code>)
          </span>
        </div>

        <div className="divide-y divide-slate-800/60 text-xs">
          {venueApplications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Hiện tại không có hồ sơ ứng tuyển nào cho cụm sân này.
            </div>
          ) : (
            venueApplications.map(app => (
              <div
                key={app.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-850/40 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{app.applicantName}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        app.status === 'APPOINTED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : app.status === 'REVOKED'
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                          : 'bg-slate-800 text-amber-300'
                      }`}
                    >
                      {app.status === 'REVOKED'
                        ? 'ĐÃ THU HỒI (REVOKED)'
                        : app.status === 'APPOINTED'
                        ? 'ĐÃ BỔ NHIỆM (APPOINTED)'
                        : 'CHỜ DUYỆT (SUBMITTED)'}
                    </span>
                  </div>

                  <p className="text-slate-400">
                    SĐT: <strong className="text-slate-200 font-mono">{app.applicantPhone}</strong> • Email: <strong className="text-slate-200">{app.applicantEmail}</strong>
                  </p>

                  <div className="flex items-center gap-3 pt-0.5">
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Đã đồng ý chia sẻ thông tin (consented_at ghi nhận)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Nộp ngày: {formatDateVN(app.appliedAt)}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {app.status === 'APPOINTED' ? (
                    <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Đang đảm nhiệm
                    </span>
                  ) : app.status === 'REVOKED' ? (
                    <span className="text-[11px] text-slate-500 italic bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      Đã thu hồi (Cần nộp hồ sơ mới để xét duyệt)
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setAppointingApp(app);
                        setAppointError('');
                      }}
                      disabled={!!venue.activeManager}
                      title={venue.activeManager ? 'Cần thu hồi Manager đương nhiệm trước khi bổ nhiệm người mới' : undefined}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
                        venue.activeManager
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 hover:scale-105'
                      }`}
                    >
                      {venue.activeManager ? 'Đã có Manager đương nhiệm' : 'Phê duyệt bổ nhiệm Manager'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Appointment Confirmation Modal */}
      <Modal
        isOpen={!!appointingApp}
        onClose={() => setAppointingApp(null)}
        title="Xác nhận Phê Duyệt Bổ Nhiệm Manager"
      >
        {appointingApp && (
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
              <p className="text-slate-400">Cụm sân: <strong className="text-white">{venue.name}</strong></p>
              <p className="text-slate-400">Ứng viên: <strong className="text-amber-300">{appointingApp.applicantName}</strong></p>
              <p className="text-slate-400">Thông tin liên lạc: <strong className="text-white">{appointingApp.applicantPhone}</strong> ({appointingApp.applicantEmail})</p>
            </div>

            {appointError && (
              <div className="flex items-start gap-1.5 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-[11px] text-rose-300 font-medium leading-relaxed">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{appointError}</span>
              </div>
            )}

            <p className="text-[11px] text-slate-400 leading-relaxed">
              * Sau khi bổ nhiệm, ứng viên sẽ nhận được quyền Manager tại cụm sân này (có thể theo dõi, quản lý lịch đặt sân của khách và quản lý sân con) và hệ thống sẽ gửi thông báo Outbox tới ứng viên.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAppointingApp(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleExecuteAppoint}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20"
              >
                Xác nhận bổ nhiệm
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Recruitment Modal */}
      <Modal
        isOpen={isEditRecruitmentOpen}
        onClose={() => setIsEditRecruitmentOpen(false)}
        title="Chỉnh Sửa Mô Tả Tuyển Dụng Manager"
      >
        <form onSubmit={handleSaveRecruitment} className="space-y-3.5">
          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-xs">
              Mô tả yêu cầu và quyền lợi:
            </label>
            <textarea
              rows={4}
              required
              value={recruitmentMessage}
              onChange={e => setRecruitmentMessage(e.target.value)}
              placeholder="Nhập chi tiết yêu cầu ca làm, nhiệm vụ đón tiếp khách..."
              className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditRecruitmentOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
