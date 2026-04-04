import { Star, ChevronLeft, Clock, Check } from 'lucide-react';
import { useApp } from '../context';
import { ps, STATUS, friendlyDate } from '../utils';

const STATUS_ACTIONS = {
  'ממתין':  [
    { label: 'בתהליך', to: 'בתהליך', cls: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
    { label: 'הושלם',  to: 'הושלם',  cls: 'bg-green-100  text-green-700  hover:bg-green-200'  },
  ],
  'בתהליך': [
    { label: 'לממתין', to: 'ממתין',  cls: 'bg-slate-100  text-slate-600  hover:bg-slate-200'  },
    { label: 'הושלם',  to: 'הושלם',  cls: 'bg-green-100  text-green-700  hover:bg-green-200'  },
  ],
  'הושלם':  [
    { label: 'לממתין', to: 'ממתין',  cls: 'bg-slate-100  text-slate-600  hover:bg-slate-200'  },
    { label: 'בתהליך', to: 'בתהליך', cls: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
  ],
};

export default function TaskRow({ task, showDate = false, selectable = false, selected = false, onToggle }) {
  const { getProject, setTaskStatus, setTaskDetailId, setEditMode, theme } = useApp();
  const proj    = getProject(task.projectId);
  const p2      = ps(proj.color);
  const scfg    = STATUS[task.status] || STATUS['ממתין'];
  const done    = task.status === 'הושלם';
  const actions = STATUS_ACTIONS[task.status] || STATUS_ACTIONS['ממתין'];

  function handleRowClick() {
    if (selectable) { onToggle?.(task.id); return; }
    setTaskDetailId(task.id); setEditMode(false);
  }

  return (
    <div
      className={`task-row ${selected ? 'ring-2 ring-purple-400 ring-inset' : ''}`}
      style={theme === 'night' ? { borderColor: `${proj.color}99` } : undefined}
      onClick={handleRowClick}
    >
      {/* Checkbox (selectable mode only) */}
      {selectable && (
        <div
          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
            selected ? 'bg-purple-500 border-purple-500' : 'border-slate-300 bg-white'
          }`}
          onClick={e => { e.stopPropagation(); onToggle?.(task.id); }}
        >
          {selected && <Check size={9} strokeWidth={3} className="text-white" />}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {task.priority && <Star size={12} className="text-rose-400 fill-rose-400 flex-shrink-0" />}
          <p className={`text-sm font-medium truncate ${done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
            {task.title}
          </p>
        </div>

        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={p2.pill}>{proj.name}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${scfg.bg} ${scfg.text}`}>{task.status}</span>
          {task.time && (
            <span className="flex items-center gap-0.5 text-xs text-slate-500">
              <Clock size={10} /> {task.time}
            </span>
          )}
          {showDate && <span className="text-xs text-slate-400">{friendlyDate(task.date)}</span>}
        </div>

        {!selectable && (
          <div className="flex gap-1.5 mt-2">
            {actions.map(a => (
              <button
                key={a.to}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${a.cls}`}
                onClick={e => { e.stopPropagation(); setTaskStatus(task.id, a.to); }}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {!selectable && <ChevronLeft size={14} className="text-slate-400 flex-shrink-0" />}
    </div>
  );
}
