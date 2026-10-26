import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-300">PitchSync MVP</span>
          <span>•</span>
          <span>Hệ thống Đặt & Quản lý Cụm sân Bóng đá</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
          <span>Kiến trúc: Modular Monolith</span>
          <span>•</span>
          <span>PostgreSQL (UTC & timestamptz)</span>
          <span>•</span>
          <span>Dynamic RBAC</span>
          <span>•</span>
          <span>React 18 + Tailwind</span>
        </div>
      </div>
    </footer>
  );
};
