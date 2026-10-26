import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../app/AppContext';
import { NotificationsPopover } from './NotificationsPopover';
import {
  Menu,
  X,
  Search,
  Calendar,
  Building2,
  ClipboardList,
  Shield,
  LogOut,
  ChevronDown,
  LogIn,
  UserPlus,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, isAuthenticated, isOwner, isManager, isAdmin, logout, bookings } = useApp();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const isUserLoggedIn = Boolean(currentUser && isAuthenticated);

  // Active bookings count for logged in customer
  const myBookingsCount = isUserLoggedIn && currentUser
    ? bookings.filter(b => b.userId === currentUser.id && b.status === 'CONFIRMED').length
    : 0;

  const handleLogout = () => {
    setIsProfileDropdownOpen(false);
    logout();
    navigate('/');
  };

  const getAvatarLetter = (name?: string) => {
    return name ? name.trim().charAt(0).toUpperCase() : 'U';
  };

  const getRoleBadge = () => {
    if (!currentUser) return null;
    if (isAdmin) return <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800/60 px-1.5 py-0.5 rounded font-semibold">Admin</span>;
    if (isOwner) return <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800/60 px-1.5 py-0.5 rounded font-semibold">Chủ Sân</span>;
    if (isManager()) return <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800/60 px-1.5 py-0.5 rounded font-semibold">Quản Lý Sân</span>;
    return <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-1.5 py-0.5 rounded font-semibold">Khách Hàng</span>;
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Navigation */}
          <div className="flex items-center space-x-3 sm:space-x-6 min-w-0">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Brand Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2 group shrink-0"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m12 7-3.5 2.5 1.5 4h4l1.5-4z" />
                  <path d="M12 7V2" />
                  <path d="m8.5 9.5-4-2" />
                  <path d="m10 13.5-3 3.5" />
                  <path d="m14 13.5 3 3.5" />
                  <path d="m15.5 9.5 4-2" />
                </svg>
              </div>
              <div>
                <span className="font-extrabold text-white text-sm sm:text-base tracking-tight">
                  PITCH<span className="text-emerald-400">SYNC</span>
                </span>
                <span className="text-[9px] text-emerald-400 font-semibold ml-1 px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-800/60 hidden sm:inline">
                  MVP
                </span>
              </div>
            </Link>

            {/* Main Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 min-w-0">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`
                }
              >
                <Search className="w-3.5 h-3.5 text-emerald-400" />
                Khám Phá Sân
              </NavLink>

              {isUserLoggedIn && (
                <NavLink
                  to="/my-bookings"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors relative ${
                      isActive
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  Booking Của Tôi
                  {myBookingsCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-500 text-slate-950">
                      {myBookingsCount}
                    </span>
                  )}
                </NavLink>
              )}
            </nav>
          </div>

          {/* Right Action & Profile Area */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* Quick Portal Jump Buttons (for Owner, Manager, Admin) */}
            {isOwner && (
              <Link
                to="/owner/venues"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-950/70 border border-amber-700/60 hover:bg-amber-900/60 transition-colors shadow-sm"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Vào Cổng Chủ Sân →</span>
              </Link>
            )}

            {isManager() && !isOwner && (
              <Link
                to="/manage/schedule"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-300 bg-blue-950/70 border border-blue-700/60 hover:bg-blue-900/60 transition-colors shadow-sm"
              >
                <ClipboardList className="w-3.5 h-3.5 text-blue-400" />
                <span>Vào Cổng Quản Lý Sân →</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin/users"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-300 bg-purple-950/70 border border-purple-700/60 hover:bg-purple-900/60 transition-colors shadow-sm"
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Vào Admin Console →</span>
              </Link>
            )}

            {/* Notifications Popover */}
            <NotificationsPopover />

            {/* Auth States */}
            {!isUserLoggedIn || !currentUser ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Đăng Nhập
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Đăng Ký
                </Link>
              </div>
            ) : (
              /* User Profile Dropdown Pill */
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center">
                    {getAvatarLetter(currentUser.name)}
                  </div>
                  <div className="hidden sm:block text-left text-xs leading-tight">
                    <p className="font-bold text-slate-200 truncate max-w-[120px]">{currentUser.name}</p>
                    <div className="mt-0.5">{getRoleBadge()}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 text-xs">
                    <div className="px-3.5 py-2.5 border-b border-slate-800/80">
                      <p className="font-bold text-white">{currentUser.name}</p>
                      <p className="text-slate-400 text-[11px] truncate">{currentUser.email}</p>
                      <p className="text-slate-400 text-[11px] truncate">{currentUser.phone}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        {getRoleBadge()}
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-800/60">
                          {currentUser.status}
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/my-bookings"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="block px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                    >
                      📅 Booking của tôi ({myBookingsCount})
                    </Link>

                    {isOwner && (
                      <Link
                        to="/owner/venues"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="block px-3.5 py-2 text-amber-300 hover:text-white hover:bg-amber-950/40 transition-colors"
                      >
                        🏟️ Cổng Quản Lý Chủ Sân
                      </Link>
                    )}

                    {isManager() && (
                      <Link
                        to="/manage/schedule"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="block px-3.5 py-2 text-blue-300 hover:text-white hover:bg-blue-950/40 transition-colors"
                      >
                        📋 Cổng Quản Lý Sân Khách
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin/users"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="block px-3.5 py-2 text-purple-300 hover:text-white hover:bg-purple-950/40 transition-colors"
                      >
                        🛡️ Admin Console
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-2 text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 transition-colors border-t border-slate-800/80 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900/95 px-4 py-3 space-y-2">
            <NavLink
              to="/"
              end
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              Khám Phá Sân
            </NavLink>

            {isUserLoggedIn && (
              <NavLink
                to="/my-bookings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                Booking Của Tôi ({myBookingsCount})
              </NavLink>
            )}

            {isOwner && (
              <Link
                to="/owner/venues"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-amber-300 bg-amber-950/40 border border-amber-800/50"
              >
                <Building2 className="w-4 h-4 text-amber-400" />
                Vào Cổng Chủ Sân →
              </Link>
            )}

            {isManager() && !isOwner && (
              <Link
                to="/manage/schedule"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-blue-300 bg-blue-950/40 border border-blue-800/50"
              >
                <ClipboardList className="w-4 h-4 text-blue-400" />
                Vào Cổng Quản Lý Sân →
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin/users"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-purple-300 bg-purple-950/40 border border-purple-800/50"
              >
                <Shield className="w-4 h-4 text-purple-400" />
                Vào Admin Console →
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
