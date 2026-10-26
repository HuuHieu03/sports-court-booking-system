import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../app/AppContext';
import { Search, X, MapPin, ArrowRight } from 'lucide-react';
import { getTomorrowDateString } from '../../../lib/utils';
import { DatePicker } from '../../../components/DatePicker';

export const ExplorePage: React.FC = () => {
  const { venues, courts, setSelectedVenueId, setActiveTab } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => getTomorrowDateString());

  const filteredVenues = venues.filter(v => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      v.name.toLowerCase().includes(q) ||
      v.address.toLowerCase().includes(q)
    );
  });

  const handleOpenVenue = (venueId: string) => {
    setSelectedVenueId(venueId);
    setActiveTab('venue-detail');
    navigate(selectedDate ? `/venues/${venueId}?date=${encodeURIComponent(selectedDate)}` : `/venues/${venueId}`);
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Athletic Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-800/40 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            ● Hệ thống đặt sân trực tuyến chuẩn MVP
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Tìm và Đặt Sân Bóng Đá Nhanh Chóng
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Tra cứu cụm sân cỏ nhân tạo uy tín, chọn khung giờ theo thời gian thực và nhận xác nhận tự động tức thì.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-md">
        <div className="flex-1 flex items-center gap-2.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs w-full focus-within:border-emerald-500 transition-colors">
          <Search className="w-4 h-4 text-emerald-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên cụm sân hoặc khu vực (An Phú, Thảo Điền, Thủ Đức)..."
            className="bg-transparent focus:outline-none w-full text-slate-200 placeholder-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-500 hover:text-slate-300 text-xs px-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="w-full sm:w-auto">
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            label="Ngày đá:"
            minDate={new Date().toISOString().split('T')[0]}
            allowClear={true}
          />
        </div>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVenues.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            Không tìm thấy cụm sân nào phù hợp với từ khóa &quot;{searchQuery}&quot;.
          </div>
        ) : (
          filteredVenues.map(venue => {
            const venueCourts = courts.filter(c => c.venueId === venue.id);
            const courtCount = venueCourts.length || venue.courtsCount || 0;

            return (
              <div
                key={venue.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-600/60 transition-all flex flex-col justify-between space-y-4 group shadow-lg min-h-[240px]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
                      Đang mở cửa
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {courtCount} sân con
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors">
                      {venue.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      {venue.address}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="bg-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded">
                      Chủ sân: {venue.ownerName}
                    </span>
                    {venue.isRecruiting && (
                      <span className="bg-amber-950/60 text-amber-300 border border-amber-800/50 text-[11px] px-2 py-0.5 rounded font-medium">
                        Đang tuyển Manager
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenVenue(venue.id)}
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-600/20"
                >
                  Xem Lịch & Chọn Giờ Đặt
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
