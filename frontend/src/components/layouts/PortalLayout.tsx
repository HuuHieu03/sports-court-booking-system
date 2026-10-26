import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { NotificationsPopover } from '../NotificationsPopover';
import { ToastContainer } from '../ToastContainer';
import { Footer } from '../Footer';
import {
  Building2,
  ClipboardList,
  Layers,
  Users,
  LogOut,
  ArrowLeft,
  ChevronDown,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';

export const PortalLayout: React.FC = () => {
  const { currentUser, isOwner, logout } = useApp();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getAvatarLetter = (name?: string) => {
    return name ? name.trim().charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Portal Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Left branding & return button */}
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div className="flex items-center space-x-2 shrink-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                </div>
                <div>
                  <span className="font-extrabold text-white text-sm sm:text-base tracking-tight">
                    PITCH<span className="text-amber-400">PORTAL</span>
                  </span>
                  <span className="text-[9px] text-amber-400 font-semibold ml-1.5 px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 hidden sm:inline">
                    {isOwner ? 'CỔNG CHỦ SÂN' : 'CỔNG QUẢN LÝ'}
                  </span>
                </div>
              </div>

              {/* Quick Switch back to customer booking page */}
              <Link
                to="/"
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-950/50 hover:bg-emerald-900/40 border border-emerald-800/50 transition-colors"
                title="Quay lại trang khám phá để tự đặt sân đi đá bóng"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Về Trang Đặt Sân Cá Nhân</span>
              </Link>
            </div>

            {/* Middle navigation tabs (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1 min-w-0">
              {isOwner && (
                <NavLink
                  to="/owner/venues"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-amber-900/60 text-amber-300 border border-amber-700/60 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Cụm Sân Sở Hữu
                </NavLink>
              )}

              <NavLink
                to="/manage/schedule"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <ClipboardList className="w-3.5 h-3.5" />
                Lịch Sân Khách Hôm Nay
              </NavLink>

              <NavLink
                to="/manage/courts"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Layers className="w-3.5 h-3.5" />
                Quản Lý Sân Con
              </NavLink>

              {isOwner && (
                <NavLink
                  to="/owner/staffing"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-amber-900/60 text-amber-300 border border-amber-700/60 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Users className="w-3.5 h-3.5" />
                  Tuyển Dụng & Bổ Nhiệm
                </NavLink>
              )}
            </nav>

            {/* Right profile & actions */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              <NotificationsPopover />

              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center">
                    {getAvatarLetter(currentUser?.name)}
                  </div>
                  <div className="hidden sm:block text-left text-xs leading-tight">
                    <p className="font-bold text-white truncate max-w-[120px]">{currentUser?.name}</p>
                    <p className="text-[10px] text-amber-400 font-medium">
                      {isOwner ? 'Chủ Sân (Owner)' : 'Quản Lý Sân (Manager)'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 text-xs">
                    <div className="px-3.5 py-2 border-b border-slate-800/80">
                      <p className="font-bold text-white">{currentUser?.name}</p>
                      <p className="text-slate-400 text-[11px] truncate">{currentUser?.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/60">
                        {isOwner ? 'Owner Account' : 'Appointed Manager'}
                      </span>
                    </div>

                    <Link
                      to="/"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                    >
                      ⚽ Về Trang Đặt Sân Khách
                    </Link>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-3.5 py-2 text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 transition-colors border-t border-slate-800/80 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-900/95 px-4 py-3 space-y-2">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/50"
            >
              <ArrowLeft className="w-4 h-4" />
              ← Về Trang Đặt Sân Cá Nhân
            </Link>

            {isOwner && (
              <NavLink
                to="/owner/venues"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <Building2 className="w-4 h-4 text-amber-400" />
                Cụm Sân Sở Hữu
              </NavLink>
            )}

            <NavLink
              to="/manage/schedule"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <ClipboardList className="w-4 h-4 text-emerald-400" />
              Lịch Sân Khách Hôm Nay
            </NavLink>

            <NavLink
              to="/manage/courts"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              Quản Lý Sân Con
            </NavLink>

            {isOwner && (
              <NavLink
                to="/owner/staffing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <Users className="w-4 h-4 text-amber-400" />
                Tuyển Dụng & Bổ Nhiệm
              </NavLink>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <Footer />
      <ToastContainer />
    </div>
  );
};
