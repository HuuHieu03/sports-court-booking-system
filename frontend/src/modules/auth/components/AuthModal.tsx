import React, { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { useApp } from '../../../app/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { showToast } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'USER' | 'OWNER'>('USER');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      showToast('success', 'Đăng nhập thành công', `Chào mừng trở lại, ${email}!`);
    } else {
      showToast('success', 'Đăng ký thành công', `Tài khoản ${name} (${role}) đã được tạo.`);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Tài Khoản Mới'}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === 'register' && (
          <>
            <div>
              <label className="block text-slate-400 font-semibold mb-1 text-xs">
                Họ và tên:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Ngọc Lan"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1 text-xs">
                Số điện thoại (định dạng E.164):
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Ví dụ: +84901234567"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1 text-xs">
                Vai trò đăng ký:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('USER')}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                    role === 'USER'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Người đặt sân (USER)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('OWNER')}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                    role === 'OWNER'
                      ? 'bg-amber-950 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Chủ sân bóng (OWNER)
                </button>
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-slate-400 font-semibold mb-1 text-xs">
            Địa chỉ Email:
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-semibold mb-1 text-xs">
            Mật khẩu:
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
          >
            {mode === 'login' ? 'Đăng nhập ngay' : 'Tạo tài khoản'}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-xs text-slate-400 hover:text-white text-center py-1"
          >
            {mode === 'login'
              ? 'Chưa có tài khoản? Đăng ký ngay'
              : 'Đã có tài khoản? Quay lại đăng nhập'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
