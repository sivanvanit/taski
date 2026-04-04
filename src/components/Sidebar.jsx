import { useState } from 'react';
import { Plus, X, LogOut, Star, Pencil, Trash2, CalendarDays } from 'lucide-react';
import { useApp } from '../context';
import { supabase } from '../supabase';
import { ps, psSolid, psNight, STATUS, STATUS_KEYS } from '../utils';

export default function Sidebar() {
  const { user, projects, tasks, sidebarOpen, setProjectViewId, setAddProjModal, setStatusFilter, theme, setTheme, setEditProjModal, setDeleteProjConfirm, setTodayMobileOpen } = useApp();
  const [showContact, setShowContact] = useState(false);

  // Always render; use translateX for animation instead of hidden/show
  // Mobile: slides in from the right. Desktop: always visible (no transform).
  const pos = [
    'fixed right-0 top-0 h-full z-40 transition-all duration-300 ease-in-out',
    sidebarOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
    'md:relative md:top-auto md:h-auto md:z-auto md:translate-x-0 md:opacity-100',
  ].join(' ');

  const overviewRows = STATUS_KEYS.map(k => {
    const c = STATUS[k];
    return (
      <button
        key={k}
        className="flex items-center justify-between py-1 w-full rounded-lg px-1 hover:bg-slate-50 transition-colors cursor-pointer"
        onClick={() => setStatusFilter(k)}
      >
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${c.dot}`} />
          <span className="text-xs text-slate-500">{k}</span>
        </div>
        <span className="text-xs font-semibold text-slate-600">
          {tasks.filter(t => t.status === k).length}
        </span>
      </button>
    );
  });

  return (
    <aside className={pos}>
      <div className="sidebar-inner w-64 h-full border-l p-4 flex flex-col gap-4" style={{ minHeight: '100dvh' }}>
        {/* Today button — visible on smaller screens where TodayPanel is hidden */}
        <button
          onClick={() => setTodayMobileOpen(true)}
          className="lg:hidden w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all shadow-sm"
          style={{ background: 'linear-gradient(to bottom, #a78bfa, #7c3aed)' }}
        >
          <CalendarDays size={15} />
          המשימות שלי להיום
        </button>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">פרויקטים</span>
          <div className="relative group">
            <button
              onClick={() => setAddProjModal(true)}
              className="p-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-500"
            >
              <Plus size={14} />
            </button>
            <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              פרויקט חדש
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {projects.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-2">אין פרויקטים עדיין</p>
          )}
          {projects.map(p => {
            const p2  = theme === 'happy' ? psSolid(p.color) : theme === 'night' ? psNight(p.color) : ps(p.color);
            const cnt = tasks.filter(t => t.projectId === p.id).length;
            return (
              <div
                key={p.id}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl cursor-pointer hover:shadow-md transition-all"
                style={p2.bg}
                onClick={() => setProjectViewId(p.id)}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={p2.dot} />
                <span className="text-sm font-semibold flex-1 truncate" style={p2.text}>{p.name}</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-white/25" style={p2.text}>{cnt}</span>
                <button
                  className="opacity-60 hover:opacity-100 transition-opacity"
                  style={p2.text}
                  onClick={e => { e.stopPropagation(); setEditProjModal({ id: p.id, name: p.name, color: p.color }); }}
                  title="ערוך פרויקט"
                >
                  <Pencil size={11} />
                </button>
                <button
                  className="opacity-60 hover:opacity-100 transition-opacity"
                  style={p2.text}
                  onClick={e => { e.stopPropagation(); setDeleteProjConfirm(p.id); }}
                  title="מחק פרויקט"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-2 border-t border-slate-100 pt-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-3">סקירה</span>
          {overviewRows}
          <button
            className="flex items-center justify-between py-1 w-full rounded-lg px-1 hover:bg-slate-50 transition-colors"
            onClick={() => setStatusFilter('priority')}
          >
            <div className="flex items-center gap-2">
              <Star size={12} className="text-rose-400 fill-rose-400" />
              <span className="text-xs text-slate-500">חשובות</span>
            </div>
            <span className="text-xs font-semibold text-slate-600">
              {tasks.filter(t => t.priority).length}
            </span>
          </button>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-3">עיצוב</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setTheme('soft')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${theme === 'soft' ? 'bg-purple-100 text-purple-700' : 'bg-slate-50 text-slate-500'}`}
            >Soft</button>
            <button
              onClick={() => setTheme('happy')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${theme === 'happy' ? 'bg-purple-100 text-purple-700' : 'bg-slate-50 text-slate-500'}`}
            >Happy</button>
            <button
              onClick={() => setTheme('night')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${theme === 'night' ? 'bg-slate-700 text-amber-400' : 'bg-slate-50 text-slate-500'}`}
            >🌙</button>
          </div>
        </div>

        {/* User + Log out — pushed to bottom */}
        <div className="mt-auto pt-4 border-t border-slate-100" style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}>
          {user && (
            <div className="flex items-center gap-2 mb-2 px-1">
              <div
                className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)' }}
              >
                {(user.user_metadata?.full_name?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
              </div>
              <span className="text-xs text-slate-500 truncate flex-1">{user.email}</span>
            </div>
          )}
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-medium text-rose-400 hover:bg-rose-50 border border-rose-100 hover:border-rose-200 transition-all"
          >
            <LogOut size={15} />
            התנתק
          </button>
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <a href="/privacy" className="text-xs text-slate-400 hover:text-purple-500 transition-colors">מדיניות פרטיות</a>
            <span className="text-slate-300 text-xs">|</span>
            <a href="/terms" className="text-xs text-slate-400 hover:text-purple-500 transition-colors">תנאי שימוש</a>
            <span className="text-slate-300 text-xs">|</span>
            <button
              className="text-xs text-slate-400 hover:text-purple-500 transition-colors"
              onClick={() => setShowContact(c => !c)}
            >צור קשר</button>
          </div>
          {showContact && (
            <div className="text-center mt-1.5">
              <a href="mailto:contact@web-goal.com" className="text-xs text-purple-500 hover:underline">
                contact@web-goal.com
              </a>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
