import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-800/80 mx-auto flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/40">
          <HelpCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Lỗi 404 - Not Found
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Trang Không Tồn Tại
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Đường dẫn bạn yêu cầu không tồn tại hoặc đã được di chuyển sang địa chỉ khác.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center justify-center gap-1.5 transition-colors shadow-md"
          >
            <Home className="w-4 h-4" />
            Về Trang Chủ Khám Phá Sân
          </Link>
        </div>
      </div>
    </div>
  );
};
