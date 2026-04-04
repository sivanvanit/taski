import { useRef } from 'react';
import { Check, ClipboardList, Pencil } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context';
import { ps, psSolid, psNight } from '../utils';

// ─── Complete button (pale circle → solid green + confetti on click) ─────────
function CompleteButton({ task }) {
  const { setTaskStatus } = useApp();
  const btnRef = useRef(null);
  const isDone = task.status === 'הושלם';

  function handleClick(e) {
    e.stopPropagation();
    if (isDone) return;
    setTaskStatus(task.id, 'הושלם');
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ['#a78bfa', '#34d399', '#f9a8d4', '#7dd3fc', '#fbbf24'],
        ticks: 220,
        zIndex: 9999,
      });
    }
  }

  return (
    <div className="relative group/cb flex-shrink-0">
      <button
        ref={btnRef}
        onClick={handleClick}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          isDone
            ? 'bg-green-500 border-green-500 text-white'
            : 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-400'
        }`}
      >
        {/* Always show a checkmark — faint when incomplete, solid when done */}
        <Check
          size={11}
          strokeWidth={3}
          className={isDone ? 'text-white' : 'text-green-200'}
        />
      </button>
      {!isDone && (
        <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover/cb:opacity-100 pointer-events-none transition-opacity z-50">
          לסמן כהושלם
        </div>
      )}
    </div>
  );
}

// ─── Single task item (skin-aware) ───────────────────────────────────────────
function TodayTaskItem({ task }) {
  const { getProject, theme, setTaskDetailId, setEditMode, setEditDraft } = useApp();
  const proj = getProject(task.projectId);
  const p2 =
    theme === 'happy' ? psSolid(proj.color) :
    theme === 'night' ? psNight(proj.color) :
    ps(proj.color);

  function openEdit(e) {
    e.stopPropagation();
    setEditDraft({
      title:     task.title,
      note:      task.note,
      date:      task.date,
      projectId: task.projectId,
      time:      task.time ?? null,
      priority:  task.priority ?? false,
    });
    setTaskDetailId(task.id);
    setEditMode(true);
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5 rounded-2xl cursor-pointer hover:shadow-md transition-all"
      style={p2.bg}
      onClick={() => { setTaskDetailId(task.id); setEditMode(false); }}
    >
      <CompleteButton task={task} />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold truncate ${task.status === 'הושלם' ? 'line-through opacity-50' : ''}`}
          style={p2.text}
        >
          {task.title}
        </p>
        {task.time && (
          <p className="text-xs opacity-60 truncate" style={p2.text}>{task.time}</p>
        )}
      </div>
      {/* Edit shortcut icon */}
      <button
        onClick={openEdit}
        className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-slate-300 hover:text-purple-400 hover:bg-white/60 transition-colors"
        title="ערוך משימה"
      >
        <Pencil size={10} />
      </button>
    </div>
  );
}

// ─── Exported list (shared with mobile modal) ─────────────────────────────────
export function TodayTaskList() {
  const { tasks, todayStr, getProject } = useApp();

  const todayTasks = tasks.filter(t => t.date === todayStr);
  const completedCount = todayTasks.filter(t => t.status === 'הושלם').length;

  const activeTasks = todayTasks
    .filter(t => t.status !== 'הושלם')
    .sort((a, b) => {
      const nameA = getProject(a.projectId)?.name || '';
      const nameB = getProject(b.projectId)?.name || '';
      const cmp = nameA.localeCompare(nameB, 'he');
      if (cmp !== 0) return cmp;
      return (a.time || '99:99').localeCompare(b.time || '99:99');
    });

  if (todayTasks.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 gap-2">
        <ClipboardList size={26} className="text-slate-300" />
        <p className="text-xs text-slate-400">אין משימות להיום</p>
      </div>
    );
  }

  // All tasks completed — show celebration message
  if (activeTasks.length === 0 && completedCount > 0) {
    const msg = completedCount >= 5
      ? 'אליפות! איזה יום פרודוקטיבי זה היה! נתראה מחר :)'
      : 'עבודה יפה! השולחן נקי! אני מחכה כבר למחר :)';
    return (
      <div className="flex flex-col items-center py-8 gap-3 text-center px-2">
        <Check size={28} className="text-purple-400" />
        <p className="text-sm font-bold text-purple-600 leading-relaxed">{msg}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {activeTasks.map(t => <TodayTaskItem key={t.id} task={t} />)}
    </div>
  );
}

// ─── Desktop panel (large screens only) ──────────────────────────────────────
export default function TodayPanel() {
  return (
    <aside
      className="today-panel hidden lg:flex flex-col w-64 flex-shrink-0 gap-3 p-4 border-r border-slate-100 overflow-y-auto no-scrollbar"
      style={{
        position: 'sticky',
        top: '57px',
        maxHeight: 'calc(100dvh - 57px)',
        alignSelf: 'flex-start',
      }}
    >
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        המשימות שלי להיום
      </span>
      <TodayTaskList />
    </aside>
  );
}
