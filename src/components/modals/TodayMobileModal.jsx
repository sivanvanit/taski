import { X } from 'lucide-react';
import { useApp } from '../../context';
import { TodayTaskList } from '../TodayPanel';

export default function TodayMobileModal() {
  const { setTodayMobileOpen } = useApp();

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex flex-col justify-end"
      style={{ overscrollBehavior: 'contain' }}
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => setTodayMobileOpen(false)}
        style={{ touchAction: 'none' }}
      />
      <div
        className="modal-card relative z-10 bg-white rounded-t-3xl shadow-2xl flex flex-col w-full"
        style={{ maxHeight: '85dvh' }}
      >
        <div className="h-1.5 w-full flex-shrink-0 rounded-t-3xl" style={{ background: 'var(--header-gradient)' }} />
        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0 border-b border-slate-100">
          <span className="text-base font-semibold text-slate-700">המשימות שלי להיום</span>
          <button
            onClick={() => setTodayMobileOpen(false)}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 pb-8 pt-4 overflow-y-auto flex-1 min-h-0">
          <TodayTaskList />
        </div>
      </div>
    </div>
  );
}
