import { useState } from 'react';
import { Plus, X, Filter, ClipboardList, CheckSquare } from 'lucide-react';
import { useApp } from '../../context';
import { ps, STATUS, STATUS_KEYS } from '../../utils';
import Backdrop from './Backdrop';
import TaskRow from '../TaskRow';
import BatchEditBar from './BatchEditBar';

export default function ProjectModal() {
  const { projects, tasks, projectViewId, setProjectViewId, projectFilter, setProjectFilter, openAddTask, todayStr } = useApp();
  const proj = projects.find(p => p.id === projectViewId);

  const [selectMode, setSelectMode] = useState(false);
  const [selected,   setSelected]   = useState(new Set());

  if (!proj) return null;

  const p2       = ps(proj.color);
  const allTasks = tasks.filter(t => t.projectId === projectViewId).sort((a,b) => a.date.localeCompare(b.date));
  const shown    = projectFilter ? allTasks.filter(t => t.status === projectFilter) : allTasks;

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

  const statBtns = STATUS_KEYS.map(k => {
    const c      = STATUS[k];
    const cnt    = allTasks.filter(t => t.status === k).length;
    const active = projectFilter === k;
    return (
      <button key={k}
        className={`flex-1 rounded-2xl px-3 py-2.5 text-center transition-all border-2 ${c.bg} ${active ? 'border-current shadow-sm scale-105' : 'border-transparent'}`}
        onClick={() => setProjectFilter(projectFilter === k ? null : k)}>
        <p className={`text-xl font-bold ${c.text}`}>{cnt}</p>
        <p className={`text-xs font-medium ${c.text} opacity-80`}>{k}</p>
      </button>
    );
  });

  function close() { setProjectViewId(null); setProjectFilter(null); exitSelect(); }

  return (
    <Backdrop onClose={close} zIndex={40} wide>
      <div className="h-1.5 w-full rounded-t-3xl flex-shrink-0" style={p2.strip} />
      <div className="p-6 flex flex-col gap-4 overflow-y-auto flex-1 min-h-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={p2.iconBg}>
              <span className="w-3.5 h-3.5 rounded-full" style={p2.dot} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">פרויקט</p>
              <h2 className="font-semibold text-base" style={p2.text}>{proj.name}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {shown.length > 0 && (
              <button
                onClick={() => { setSelectMode(s => !s); setSelected(new Set()); }}
                className={`p-1.5 rounded-xl transition-colors ${selectMode ? 'bg-purple-100 text-purple-600' : 'hover:bg-slate-100 text-slate-400'}`}
                title="בחירה מרובה"
              >
                <CheckSquare size={15} />
              </button>
            )}
            <button
              onClick={() => openAddTask({ date: todayStr, projectId: projectViewId })}
              className="flex items-center gap-1.5 px-3 py-1.5 text-white rounded-2xl text-xs font-semibold shadow-sm"
              style={p2.strip}>
              <Plus size={13} /> משימה חדשה
            </button>
            <button onClick={close} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex gap-2">{statBtns}</div>

        {projectFilter && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter size={11} /> <span>מציג <strong>{projectFilter}</strong></span>
            </div>
            <button onClick={() => setProjectFilter(null)} className="text-xs text-purple-500 font-medium">נקה</button>
          </div>
        )}

        {selectMode && <BatchEditBar selected={selected} onClear={exitSelect} />}

        {shown.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2">
            <ClipboardList size={28} className="text-slate-200" />
            <p className="text-sm text-slate-400">{projectFilter ? `אין משימות "${projectFilter}"` : 'אין משימות עדיין.'}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {shown.map(t => (
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
