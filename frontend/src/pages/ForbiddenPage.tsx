import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../app/AppContext';
import { ShieldAlert, LogIn, Home } from 'lucide-react';

export const ForbiddenPage: React.FC = () => {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  const handleSwitchAccount = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/80 mx-auto flex items-center justify-center text-rose-400 shadow-lg shadow-rose-950/40">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-400">
            Lỗi 403 - Forbidden
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Không Có Quyền Truy Cập
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tài khoản hiện tại của bạn{' '}
            {currentUser ? (
              <span className="font-semibold text-slate-200">
                ({currentUser.name} • {currentUser.role})
              </span>
            ) : (
              'chưa đăng nhập'
            )}{' '}
            không có quyền hạn để truy cập vào phân hệ này.
          </p>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-left text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">Gợi ý phân quyền:</p>
          <ul className="list-disc list-inside text-[11px] space-y-0.5">
            <li>Khu vực <strong>/admin/*</strong>: Chỉ dành riêng cho Quản trị viên (ADMIN).</li>
            <li>Khu vực <strong>/owner/*</strong>: Dành cho Chủ cụm sân bóng (OWNER).</li>
            <li>Khu vực <strong>/manage/*</strong>: Dành cho Quản lý sân (MANAGER) hoặc Chủ sân.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <Link
            to="/"
            className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
          >
            <Home className="w-4 h-4" />
            Về Trang Chủ
          </Link>
          <button
            onClick={handleSwitchAccount}
            className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Đổi Tài Khoản
          </button>
        </div>
      </div>
    </div>
  );
};
