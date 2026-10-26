import React from 'react';
import { useApp } from '../app/AppContext';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const bgBorder =
          toast.type === 'success'
            ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-400'
            : toast.type === 'error'
            ? 'bg-slate-900/95 border-rose-500/50 text-rose-400'
            : toast.type === 'warning'
            ? 'bg-slate-900/95 border-amber-500/50 text-amber-400'
            : 'bg-slate-900/95 border-sky-500/50 text-sky-400';

        const renderIcon = () => {
          if (toast.type === 'success') {
            return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
          }
          if (toast.type === 'error') {
            return <XCircle className="w-4 h-4 text-rose-400" />;
          }
          if (toast.type === 'warning') {
            return <AlertCircle className="w-4 h-4 text-amber-400" />;
          }
          return <AlertCircle className="w-4 h-4 text-sky-400" />;
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto border rounded-xl p-3.5 shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all fade-in ${bgBorder}`}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-slate-800 shrink-0 mt-0.5">
              {renderIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs text-white leading-tight">{toast.title}</h4>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-white p-0.5 rounded transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
