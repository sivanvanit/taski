import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, FolderOpen, LogOut } from 'lucide-react';
import { useApp } from '../context';
import { supabase } from '../supabase';
import { MONTHS } from '../utils';

// ─── Month/Year picker popup ──────────────────────────────────────────────────
function MonthPicker({ curYear, curMonth, onSelect, onClose }) {
  const [year, setYear] = useState(curYear);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 10);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="modal-card absolute top-full mt-2 bg-white rounded-2xl shadow-xl border border-purple-100 p-4 z-50 w-64"
      style={{ left: 0, maxWidth: 'calc(100vw - 32px)' }}
    >
      {/* Year navigation — dir=ltr so < is prev (left) and > is next (right) */}
      <div className="flex items-center justify-between mb-3" dir="ltr">
        <button
          onClick={() => setYear(y => y - 1)}
          className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-400 transition-colors"
          aria-label="שנה קודמת"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="font-semibold text-slate-700 text-sm">{year}</span>
        <button
          onClick={() => setYear(y => y + 1)}
          className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-400 transition-colors"
          aria-label="שנה הבאה"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {MONTHS.map((m, i) => {
          const active = year === curYear && i === curMonth;
          return (
            <button
              key={i}
              onClick={() => onSelect(year, i)}
              className={`py-2 rounded-xl text-xs font-medium transition-all ${
                active
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'hover:bg-purple-50 text-slate-600'
              }`}
            >
              {m}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
export default function Header() {
  const { user, curMonth, curYear, prevMonth, nextMonth, jumpToMonth, setSidebarOpen } = useApp();
  const [showPicker, setShowPicker] = useState(false);

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name[0].toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <header className="bg-white/80 backdrop-blur border-b border-purple-100 sticky top-0 z-20 px-4 py-3 flex items-center justify-between">

      {/* Right side: logo + user */}
      <div className="flex items-center gap-2">
        <button
          className="md:hidden p-1.5 rounded-xl bg-purple-50 text-purple-500 sidebar-toggle-btn"
          onClick={() => setSidebarOpen(o => !o)}
        >
          <FolderOpen size={18} />
        </button>
        <Calendar size={20} className="text-purple-400" />
        <h1 className="text-lg font-semibold text-purple-700">Taski</h1>

        {user && (
          <>
            <div className="flex items-center gap-1.5 mr-1 pr-1 border-r border-slate-200">
              <div className="relative group">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 cursor-default"
                  style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)' }}
                >
                  {initials}
                </div>
                <div className="absolute top-full right-0 mt-1.5 px-2 py-1 bg-slate-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {user.email}
                </div>
              </div>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-500 hover:text-rose-500 transition-colors"
              title="התנתק"
            >
              <LogOut size={16} strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>

      {/* Left side: month navigation + date picker — dir=ltr so < is left/prev, > is right/next */}
      <div className="flex items-center gap-1 relative" dir="ltr">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-xl hover:bg-purple-50 text-purple-400 transition-colors"
          aria-label="חודש קודם"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={() => setShowPicker(p => !p)}
          className="font-medium text-slate-700 text-sm px-2 py-1 rounded-xl hover:bg-purple-50 transition-colors min-w-[100px] sm:min-w-[140px] text-center"
        >
          {MONTHS[curMonth]} {curYear}
        </button>

        <button
          onClick={nextMonth}
          className="p-1.5 rounded-xl hover:bg-purple-50 text-purple-400 transition-colors"
          aria-label="חודש הבא"
        >
          <ChevronRight size={18} />
        </button>

        {showPicker && (
          <MonthPicker
            curYear={curYear}
            curMonth={curMonth}
            onSelect={(y, m) => { jumpToMonth(y, m); setShowPicker(false); }}
            onClose={() => setShowPicker(false)}
          />
        )}
      </div>
    </header>
  );
}
