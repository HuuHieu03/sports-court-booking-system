import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { NotificationsPopover } from '../NotificationsPopover';
import { ToastContainer } from '../ToastContainer';
import {
  Shield,
  Users,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Server,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Enterprise Left Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-50 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-white text-sm tracking-tight">
                PITCH<span className="text-purple-400">ADMIN</span>
              </span>
              <p className="text-[10px] text-purple-400 font-semibold tracking-wider uppercase">
                Enterprise Console
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Quản Trị Hệ Thống
            </p>
            <NavLink
              to="/admin/users"
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-purple-950/70 text-purple-300 border border-purple-800/80 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Users className="w-4 h-4" />
              <span>Quản Trị Người Dùng</span>
            </NavLink>
          </div>

          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Hạ Tầng & Giám Sát
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Mô hình
                </span>
                <span className="text-[11px] font-bold text-slate-200">Modular Monolith</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-purple-400" />
                  Database Time
                </span>
                <span className="text-[11px] font-bold text-emerald-400">UTC Mode</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  RBAC
                </span>
                <span className="text-[11px] font-bold text-amber-400">Dynamic RBAC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer with Current Admin & Logout */}
        <div className="p-4 border-t border-slate-800 shrink-0 space-y-3 bg-slate-950/40">
          <Link
            to="/"
            className="flex items-center justify-between p-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Xem Cổng Khách Hàng
            </span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Public</span>
          </Link>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-purple-900/60 border border-purple-700/60 text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                A
              </div>
              <div className="text-left text-xs leading-tight min-w-0">
                <p className="font-bold text-white truncate">{currentUser?.name || 'Admin Tổng'}</p>
                <p className="text-[10px] text-purple-400 font-medium">SUPER_ADMIN</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Đăng xuất khỏi Admin Console"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Right Main Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Admin Top Navbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Không Gian Quản Trị /</span>
              <span className="text-xs font-bold text-white">Quản Lý Người Dùng & Phân Quyền</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationsPopover />
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 text-[11px] font-medium">Phiên làm việc Quản trị an toàn</span>
            </div>
          </div>
        </header>

        {/* Admin Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
