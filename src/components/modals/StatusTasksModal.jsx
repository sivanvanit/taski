import { useState } from 'react';
import { X, Star, CheckSquare } from 'lucide-react';
import { useApp } from '../../context';
import { STATUS } from '../../utils';
import Backdrop from './Backdrop';
import TaskRow from '../TaskRow';
import BatchEditBar from './BatchEditBar';

export default function StatusTasksModal() {
  const { statusFilter, setStatusFilter, tasks } = useApp();

  const [selectMode, setSelectMode] = useState(false);
  const [selected,   setSelected]   = useState(new Set());

  const isPriority = statusFilter === 'priority';
  const filtered   = isPriority
    ? tasks.filter(t => t.priority)
    : tasks.filter(t => t.status === statusFilter);

  const title = isPriority ? 'משימות חשובות' : statusFilter;
  const dot   = isPriority ? null : STATUS[statusFilter];

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

  function close() { setStatusFilter(null); exitSelect(); }

  return (
    <Backdrop onClose={close} zIndex={40} wide>
      <div className="h-1.5 w-full flex-shrink-0" style={{ background: 'var(--header-gradient)' }} />
      <div className="p-6 flex flex-col gap-4 overflow-y-auto flex-1 min-h-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPriority
              ? <Star size={14} className="text-rose-400 fill-rose-400" />
              : <span className={`w-2.5 h-2.5 rounded-full ${dot?.dot}`} />
            }
            <h2 className="font-semibold text-slate-700 text-lg">{title}</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
              {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {filtered.length > 0 && (
              <button
                onClick={() => { setSelectMode(s => !s); setSelected(new Set()); }}
                className={`p-1.5 rounded-xl transition-colors ${selectMode ? 'bg-purple-100 text-purple-600' : 'hover:bg-slate-100 text-slate-400'}`}
                title="בחירה מרובה"
              >
                <CheckSquare size={15} />
              </button>
            )}
            <button onClick={close} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
              <X size={16} />
            </button>
          </div>
        </div>

        {selectMode && (
          <BatchEditBar
            selected={selected}
            onClear={exitSelect}
            onSelectAll={() => setSelected(new Set(filtered.map(t => t.id)))}
            totalCount={filtered.length}
          />
        )}

        {filtered.length === 0 ? (
          <p className="text-base text-slate-400 text-center py-8">אין משימות בקטגוריה זו</p>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(t => (
              <TaskRow
                key={t.id}
                task={t}
                showDate
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
