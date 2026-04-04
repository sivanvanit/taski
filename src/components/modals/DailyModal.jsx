import { useState } from 'react';
import { Plus, X, Sparkles, CheckSquare } from 'lucide-react';
import { useApp } from '../../context';
import { friendlyDate } from '../../utils';
import Backdrop from './Backdrop';
import TaskRow from '../TaskRow';
import BatchEditBar from './BatchEditBar';

export default function DailyModal() {
  const { dailyView, setDailyView, tasks, openAddTask } = useApp();
  const dayTasks = tasks.filter(t => t.date === dailyView);

  const [selectMode, setSelectMode] = useState(false);
  const [selected,   setSelected]   = useState(new Set());

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function exitSelect() {
    setSelectMode(false);
    setSelected(new Set());
  }

  function close() { setDailyView(null); exitSelect(); }

  return (
    <Backdrop onClose={close} zIndex={40} wide>
      <div className="h-1.5 w-full flex-shrink-0" style={{ background: 'var(--header-gradient)' }} />
      <div className="p-6 flex flex-col gap-4 overflow-y-auto flex-1 min-h-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-0.5">תצוגה יומית</p>
            <h2 className="font-semibold text-slate-700 text-lg">{friendlyDate(dailyView)}</h2>
          </div>
          <div className="flex items-center gap-2">
            {dayTasks.length > 0 && (
              <button
                onClick={() => { setSelectMode(s => !s); setSelected(new Set()); }}
                className={`p-1.5 rounded-xl transition-colors ${selectMode ? 'bg-purple-100 text-purple-600' : 'hover:bg-slate-100 text-slate-400'}`}
                title="בחירה מרובה"
              >
                <CheckSquare size={15} />
              </button>
            )}
            <button
              onClick={() => openAddTask({ date: dailyView })}
              className="flex items-center gap-1.5 px-3 py-1.5 text-white rounded-2xl text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity"
              style={{ background: 'var(--btn-gradient)' }}
            >
              <Plus size={13} /> משימה חדשה
            </button>
            <button onClick={close} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
              <X size={16} />
            </button>
          </div>
        </div>

        {selectMode && (
          <BatchEditBar
            selected={selected}
            onClear={exitSelect}
            onSelectAll={() => setSelected(new Set(dayTasks.map(t => t.id)))}
            totalCount={dayTasks.length}
          />
        )}

        {dayTasks.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-3 text-slate-300">
            <Sparkles size={32} />
            <p className="text-base text-slate-400 text-center">אין כלום כאן עדיין — תהנה מיום חופשי! 🌤️</p>
            <button
              onClick={() => openAddTask({ date: dailyView })}
              className="text-sm text-purple-500 hover:text-purple-700 font-medium underline underline-offset-2"
            >
              הוסף את המשימה הראשונה שלך
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {dayTasks.map(t => (
              <TaskRow
                key={t.id}
                task={t}
                selectable={selectMode}
                selected={selected.has(t.id)}
                onToggle={toggleSelect}
              />
            ))}
          </div>
        )}
      </div>
    </Backdrop>
  );
}
