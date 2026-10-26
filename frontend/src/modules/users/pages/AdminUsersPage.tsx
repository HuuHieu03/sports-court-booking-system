import React, { useState } from 'react';
import { useApp } from '../../../app/AppContext';
import { Modal } from '../../../components/Modal';
import { Account } from '../../../types';
import { Search, Shield } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { accounts, toggleAccountStatus, softDeleteAccount, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);

  const filteredAccounts = accounts.filter(acc => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      acc.name.toLowerCase().includes(q) ||
      acc.email.toLowerCase().includes(q) ||
      acc.phone.includes(q) ||
      acc.role.toLowerCase().includes(q)
    );
  });

  const handleConfirmSoftDelete = () => {
    if (deletingAccount) {
      softDeleteAccount(deletingAccount.id);
      setDeletingAccount(null);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Top Banner & Search */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Quản Trị Tài Khoản Hệ Thống (Admin Console)
            </h1>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
              Admin Quyền Lực Cao Nhất
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Khóa, mở khóa và xóa mềm tài khoản người dùng (Tuân thủ nguyên tắc bảo toàn toàn vẹn dữ liệu lịch sử đặt sân).
          </p>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs w-full sm:w-72 focus-within:border-emerald-500 transition-colors">
          <Search className="w-4 h-4 text-emerald-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, email, sđt, vai trò..."
            className="bg-transparent focus:outline-none w-full text-slate-200 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <h2 className="text-xs sm:text-sm font-bold text-white">
            Danh Sách Tài Khoản Trong CSDL ({filteredAccounts.length})
          </h2>
          <span className="text-[11px] text-slate-400">
            Quy chuẩn: E.164 Phone format & Soft Delete
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold">
              <tr>
                <th className="p-4">Họ tên & Email</th>
                <th className="p-4">Số điện thoại (E.164)</th>
                <th className="p-4">Vai trò hệ thống</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Không tìm thấy tài khoản nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map(acc => (
                  <tr key={acc.id} className="hover:bg-slate-800/40 transition-colors align-middle">
                    <td className="p-4">
                      <p className="font-bold text-white text-xs">{acc.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{acc.email}</p>
                    </td>
                    <td className="p-4 font-mono text-slate-300">{acc.phone}</td>
                    <td className="p-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          acc.role === 'ADMIN'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                            : acc.role === 'OWNER'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        }`}
                      >
                        {acc.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          acc.status === 'ACTIVE'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : acc.status === 'LOCKED'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                            : 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                        }`}
                      >
                        {acc.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      {acc.status !== 'DELETED' ? (
                        acc.id === currentUser?.id ? (
                          <span className="text-[11px] text-purple-400 font-semibold px-2.5 py-1 bg-purple-950/60 border border-purple-800/60 rounded-lg inline-block">
                            Tài khoản hiện tại
                          </span>
                        ) : (
                          <>
                            {acc.status === 'ACTIVE' ? (
                              <button
                                onClick={() => toggleAccountStatus(acc.id, 'LOCKED')}
                                className="px-2.5 py-1 rounded-lg border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition-colors"
                              >
                                Khóa
                              </button>
                            ) : (
                              <button
                                onClick={() => toggleAccountStatus(acc.id, 'ACTIVE')}
                                className="px-2.5 py-1 rounded-lg border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
                              >
                                Mở khóa
                              </button>
                            )}
                            <button
                              onClick={() => setDeletingAccount(acc)}
                              className="px-2.5 py-1 rounded-lg border border-slate-700 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-colors"
                            >
                              Xóa mềm
                            </button>
                          </>
                        )
                      ) : (
                        <div className="text-right">
                          <span className="text-[11px] text-slate-500 italic block">Đã xóa logic (deleted_at)</span>
                          {acc.deletedAt && (
                            <span className="text-[10px] text-slate-600 font-mono block">
                              {new Date(acc.deletedAt).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Soft Delete Modal */}
      <Modal
        isOpen={!!deletingAccount}
        onClose={() => setDeletingAccount(null)}
        title="Xác nhận Xóa Mềm Tài Khoản"
      >
        {deletingAccount && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa mềm tài khoản <strong className="text-white">{deletingAccount.name}</strong> ({deletingAccount.email})?
            </p>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p>• Trạng thái tài khoản sẽ chuyển thành: <code className="text-rose-400">DELETED</code></p>
              <p>• Thời gian xóa logic ghi nhận vào: <code className="text-emerald-400">deleted_at</code></p>
              <p>• Lịch sử các đơn đặt sân trong quá khứ được <strong>bảo toàn 100%</strong> theo yêu cầu môn Kiến trúc phần mềm.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingAccount(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmSoftDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20"
              >
                Xác nhận xóa mềm
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
