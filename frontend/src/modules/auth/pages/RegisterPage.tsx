import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../../../app/AppContext';
import { UserPlus, ShieldAlert, User, Building2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'OWNER'>('USER');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getSafeRedirectUrl = (url: string | null): string | null => {
    if (!url) return null;
    const trimmed = url.trim();
    if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('\\')) {
      return trimmed;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 8) {
      setErrorMessage('Mật khẩu phải có tối thiểu 8 ký tự theo quy định hệ thống.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại!');
      return;
    }

    setIsLoading(true);
    const res = await register({
      name,
      email,
      phone,
      role,
      password,
    });
    setIsLoading(false);

    if (res.success && res.account) {
      const safeUrl = getSafeRedirectUrl(redirectUrl);
      if (safeUrl) {
        navigate(safeUrl, { replace: true });
      } else if (res.account.role === 'OWNER') {
        navigate('/owner/venues', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } else {
      setErrorMessage(res.error || 'Đăng ký tài khoản không thành công.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-950 text-slate-100">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Top Back to Home */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Về trang khám phá sân
          </Link>
          <div className="flex items-center space-x-1.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs">
              P
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white">
              PITCH<span className="text-emerald-400">SYNC</span>
            </span>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Đăng Ký Tài Khoản Mới
            </h1>
            <p className="text-xs text-slate-400">
              Chọn vai trò phù hợp để trải nghiệm hệ sinh thái thể thao PitchSync
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-950/70 border border-rose-800/80 rounded-xl text-rose-200 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Selection Cards */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2 text-xs">
                Chọn vai trò ban đầu:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('USER')}
                  className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col gap-1.5 ${
                    role === 'USER'
                      ? 'border-emerald-500 bg-emerald-950/40 text-white shadow-md shadow-emerald-950/40'
                      : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <User className={`w-4 h-4 ${role === 'USER' ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span className="font-bold text-xs">Khách Đặt Sân (User)</span>
                    </div>
                    {role === 'USER' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Tìm kiếm sân cỏ nhân tạo, giữ chỗ trực tuyến và theo dõi lịch cá nhân.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('OWNER')}
                  className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col gap-1.5 ${
                    role === 'OWNER'
                      ? 'border-amber-500 bg-amber-950/40 text-white shadow-md shadow-amber-950/40'
                      : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Building2 className={`w-4 h-4 ${role === 'OWNER' ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span className="font-bold text-xs">Chủ Cụm Sân (Owner)</span>
                    </div>
                    {role === 'OWNER' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Tạo cụm sân, cấu hình sân con, quản lý lịch đặt sân và bổ nhiệm Quản lý.
                  </p>
                </button>
              </div>

              {/* Note on Manager Role */}
              <p className="mt-2 text-[10px] text-slate-500 italic">
                * Lưu ý: Vai trò Quản lý sân (Manager) không chọn khi đăng ký mà sẽ được Chủ sân bổ nhiệm từ tài khoản Khách hàng theo chính sách Dynamic RBAC.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
                Họ và tên:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ví dụ: Hoàng Văn Nam"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
                  Email:
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nam@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
                  Số điện thoại:
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+84912345678"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
                  Mật khẩu:
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
                  Xác nhận mật khẩu:
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-transform active:scale-[0.99] shadow-lg shadow-emerald-500/20 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              {isLoading ? 'Đang khởi tạo...' : 'Tạo Tài Khoản & Tiếp Tục'}
            </button>
          </form>

          {/* Login Link */}
          <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800/80">
            Đã có tài khoản?{' '}
            <Link
              to={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}
              className="font-bold text-emerald-400 hover:text-emerald-300 underline transition-colors"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
