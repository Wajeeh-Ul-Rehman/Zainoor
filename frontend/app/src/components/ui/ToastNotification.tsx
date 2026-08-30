import { useUIStore } from '@/stores/uiStore';

export default function ToastNotification() {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`bg-black text-white px-6 py-4 shadow-lg transform transition-all duration-300 min-w-[280px] ${
            toast.type === 'success' ? 'border-l-2 border-green-500' :
            toast.type === 'error' ? 'border-l-2 border-[#FF0000]' :
            ''
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <p className="font-body text-sm">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
