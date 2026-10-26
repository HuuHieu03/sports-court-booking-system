import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../app/AppContext';
import { Modal } from '../../../components/Modal';
import { Plus, Building2, Users, ArrowRight, MapPin } from 'lucide-react';

export const OwnerVenuesPage: React.FC = () => {
  const { venues, currentUser, addVenue, setSelectedVenueId, setActiveTab } = useApp();
  const navigate = useNavigate();
  const [isAddVenueModalOpen, setIsAddVenueModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [recruitmentMessage, setRecruitmentMessage] = useState('');

  // Owner venues - strictly filtered by ownerId
  const myVenues = venues.filter(v => v.ownerId === currentUser?.id);

  const handleCreateVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    addVenue({
      name: name.trim(),
      address: address.trim(),
      isRecruiting: false,
      recruitmentMessage: recruitmentMessage.trim() || undefined,
    });

    setName('');
    setAddress('');
    setRecruitmentMessage('');
    setIsAddVenueModalOpen(false);
  };

  const handleNavigateCourts = (venueId: string) => {
    setSelectedVenueId(venueId);
    setActiveTab('manager-courts');
    navigate('/manage/courts');
  };

  const handleNavigateStaffing = (venueId: string) => {
    setSelectedVenueId(venueId);
    setActiveTab('owner-staffing');
    navigate('/owner/staffing');
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              Cụm Sân Sở Hữu Của Bạn (My Venues)
            </h1>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
              Quyền Chủ Sân (Owner)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Owner có thẩm quyền tạo cụm sân, thiết lập chiến dịch tuyển dụng và phê duyệt bổ nhiệm/thu hồi Manager.
          </p>
        </div>

        <button
          onClick={() => setIsAddVenueModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 shrink-0 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Tạo Cụm Sân Mới
        </button>
      </div>

      {/* Venues Grid */}
      {myVenues.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <p className="text-xs text-slate-400">Bạn chưa tạo cụm sân nào. Hãy bắt đầu bằng cách thêm cụm sân đầu tiên!</p>
          <button
            onClick={() => setIsAddVenueModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
          >
            + Thêm cụm sân mới
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {myVenues.map(venue => (
            <div
              key={venue.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                    Mã: {venue.id}
                  </span>
                  <span className="text-xs text-slate-400">
                    {venue.courtsCount || 0} sân con trực thuộc
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base">{venue.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    {venue.address}
                  </p>
                </div>

                {/* Manager status card */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Nhân sự Quản lý điều hành (Manager):
                  </span>
                  {venue.activeManager ? (
                    <div className="flex items-center justify-between text-slate-200">
                      <div>
                        <p className="font-bold text-emerald-300">{venue.activeManager.name}</p>
                        <p className="text-[11px] text-slate-400">{venue.activeManager.phone} • {venue.activeManager.email}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-semibold border border-emerald-800/60">
                        Đang quản lý
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-slate-500 italic">Chưa có Quản lý được bổ nhiệm</p>
                      {venue.isRecruiting ? (
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px] font-semibold border border-amber-800/60">
                          Đang tuyển
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                          Tạm đóng tuyển
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
                <button
                  onClick={() => handleNavigateCourts(venue.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
                >
                  Quản lý sân con
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleNavigateStaffing(venue.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/50 font-medium transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  Tuyển dụng & Bổ nhiệm Manager
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Venue Modal */}
      <Modal
        isOpen={isAddVenueModalOpen}
        onClose={() => setIsAddVenueModalOpen(false)}
        title="Tạo Cụm Sân Bóng Đá Mới"
      >
        <form onSubmit={handleCreateVenue} className="space-y-3.5">
          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-xs">
              Tên cụm sân (name):
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ví dụ: Cụm Sân Thể Thao Sala"
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-xs">
              Địa chỉ chi tiết (address):
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Ví dụ: Đường Mai Chí Thọ, P. An Lợi Đông, TP. Thủ Đức"
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 text-xs">
              Mô tả thông điệp tuyển dụng (tùy chọn):
            </label>
            <textarea
              rows={2}
              value={recruitmentMessage}
              onChange={e => setRecruitmentMessage(e.target.value)}
              placeholder="Ví dụ: Tìm quản lý sân ca tối, hỗ trợ vận hành và CSKH..."
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddVenueModalOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
            >
              Lưu cụm sân
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
