import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../../../app/AppContext';
import { LogIn, ShieldAlert, Sparkles, User, Shield, Building2, ClipboardList, ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickLogin } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
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

  const redirectAfterLogin = (userRole?: string, appointedVenues?: string[]) => {
    const safeUrl = getSafeRedirectUrl(redirectUrl);
    if (safeUrl) {
      navigate(safeUrl, { replace: true });
      return;
    }
    if (userRole === 'ADMIN') {
      navigate('/admin/users', { replace: true });
    } else if (userRole === 'OWNER') {
      navigate('/owner/venues', { replace: true });
    } else if (appointedVenues && appointedVenues.length > 0) {
      navigate('/manage/schedule', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const res = await login(identifier, password);
    setIsLoading(false);

    if (res.success && res.account) {
      redirectAfterLogin(res.account.role, res.account.appointedVenues);
    } else {
      setErrorMessage(res.error || 'Đăng nhập không thành công.');
    }
  };

  const handleQuickLogin = async (emailOrId: string) => {
    setErrorMessage('');
    setIsLoading(true);
    const res = await quickLogin(emailOrId);
    setIsLoading(false);
    if (res.success && res.account) {
      redirectAfterLogin(res.account.role, res.account.appointedVenues);
    } else {
      setErrorMessage(res.error || 'Không thể đăng nhập tài khoản này.');
    }
  };

  const demoAccounts = [
    {
      id: 'ACC-99',
      label: 'Admin Tổng',
      sub: 'Quản trị hệ thống',
      email: 'admin@example.com',
      role: 'ADMIN',
      icon: Shield,
      color: 'border-purple-800/60 bg-purple-950/40 text-purple-300 hover:border-purple-600',
    },
    {
      id: 'ACC-04',
      label: 'Chủ Sân An Phú',
      sub: 'Lê Chủ Sân (Owner)',
      email: 'owner.anphu@example.com',
      role: 'OWNER',
      icon: Building2,
      color: 'border-amber-800/60 bg-amber-950/40 text-amber-300 hover:border-amber-600',
    },
    {
      id: 'ACC-03',
      label: 'Quản Lý Minh',
      sub: 'Vũ Đình Minh (Manager)',
      email: 'manager.minh@example.com',
      role: 'MANAGER',
      icon: ClipboardList,
      color: 'border-blue-800/60 bg-blue-950/40 text-blue-300 hover:border-blue-600',
    },
    {
      id: 'ACC-01',
      label: 'Khách Đặt Sân',
      sub: 'Nguyễn Văn Lan (User)',
      email: 'user.lan@example.com',
      role: 'USER',
      icon: User,
      color: 'border-emerald-800/60 bg-emerald-950/40 text-emerald-300 hover:border-emerald-600',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        
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
              Đăng Nhập Tài Khoản
            </h1>
            <p className="text-xs text-slate-400">
              {redirectUrl
                ? 'Đăng nhập để tiếp tục hoàn tất thao tác của bạn'
                : 'Chào mừng trở lại với nền tảng đặt sân bóng đá PitchSync'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-950/70 border border-rose-800/80 rounded-xl text-rose-200 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
                Email hoặc Số điện thoại:
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="Ví dụ: lan@example.com hoặc +84901234567"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 text-xs flex justify-between">
                <span>Mật khẩu:</span>
                <span className="text-[10px] text-slate-500">(Bất kỳ cho môi trường demo)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-transform active:scale-[0.99] shadow-lg shadow-emerald-500/20"
            >
              <LogIn className="w-4 h-4" />
              {isLoading ? 'Đang xác thực...' : 'Đăng Nhập'}
            </button>
          </form>

          {/* Quick Login Section */}
          <div className="pt-2 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Tài khoản dùng thử (Quick Login demo)
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">1-Click</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(acc => {
                const IconComponent = acc.icon;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleQuickLogin(acc.email)}
                    className={`p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] flex flex-col gap-1 ${acc.color}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <IconComponent className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-bold text-xs truncate">{acc.label}</span>
                    </div>
                    <span className="text-[10px] opacity-80 truncate">{acc.sub}</span>
                  </button>
                );
              })}
            </div>

            {/* Test Locked Account Button */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => handleQuickLogin('locked.user@example.com')}
                className="text-[10px] text-slate-500 hover:text-rose-400 underline transition-colors"
              >
                Thử đăng nhập tài khoản vi phạm (LOCKED demo)
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="pt-2 text-center text-xs text-slate-400">
            Chưa có tài khoản?{' '}
            <Link
              to={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : '/register'}
              className="font-bold text-emerald-400 hover:text-emerald-300 underline transition-colors"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
