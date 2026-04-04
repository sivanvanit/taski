import { useState } from 'react';
import { Pencil, X, Check, Star, Clock, Calendar } from 'lucide-react';
import { useApp } from '../../context';
import { ps, STATUS, STATUS_KEYS, friendlyDate } from '../../utils';
import Backdrop from './Backdrop';
import TimePicker from '../TimePicker';

function EditMode() {
  const { projects, taskDetailId, editDraft, setEditDraft, setEditMode, saveEdit } = useApp();

  return (
    <div className="p-6 flex flex-col gap-4 overflow-y-auto flex-1 min-h-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pencil size={15} className="text-purple-400" />
          <h2 className="font-semibold text-slate-700">ערוך משימה</h2>
        </div>
        <button onClick={() => setEditMode(false)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
          <X size={16} />
        </button>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <p className="text-xs text-slate-600 font-medium mb-1.5">כותרת</p>
          <input autoFocus className="input-field" placeholder="כותרת המשימה" value={editDraft.title || ''}
            onChange={e => setEditDraft(d => ({ ...d, title: e.target.value }))} />
        </div>
        <div className="relative group">
          <button
            type="button"
            onClick={() => setEditDraft(d => ({ ...d, priority: !d.priority }))}
            className={`p-2 rounded-xl flex-shrink-0 mb-0.5 transition-colors ${
              editDraft.priority ? 'bg-rose-50 text-rose-400' : 'bg-slate-50 text-slate-300 hover:text-rose-300'
            }`}
          >
            <Star size={18} className={editDraft.priority ? 'fill-rose-400' : ''} />
          </button>
          <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
            לסמן כחשובה
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs text-slate-600 font-medium mb-1.5">הערה</p>
        <textarea rows={2} className="input-field resize-none" placeholder="הוסף הערה (אופציונלי)"
          value={editDraft.note || ''}
          onChange={e => setEditDraft(d => ({ ...d, note: e.target.value }))} />
      </div>

      <div>
        <p className="text-xs text-slate-600 font-medium mb-1.5">תאריך</p>
        <input type="date" className="input-field" value={editDraft.date || ''}
          onChange={e => setEditDraft(d => ({ ...d, date: e.target.value }))} />
      </div>

      <TimePicker
        value={editDraft.time ?? null}
        onChange={time => setEditDraft(d => ({ ...d, time }))}
      />

      <div>
        <p className="text-xs text-slate-600 font-medium mb-2">פרויקט</p>
        <div className="flex flex-wrap gap-2">
          {projects.map(p => {
            const sel = editDraft.projectId === p.id;
            return (
              <button key={p.id} className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={sel
                  ? { background: p.color, color: '#fff', border: '2px solid transparent', boxShadow: `0 0 0 3px ${p.color}55` }
                  : { background: '#f1f5f9', color: '#64748b', border: '2px solid transparent' }}
                onClick={() => setEditDraft(d => ({ ...d, projectId: p.id }))}>
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={() => setEditMode(false)}
          className="flex-1 py-2.5 rounded-2xl text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
          ביטול
        </button>
        <button onClick={() => saveEdit(taskDetailId)}
          className="flex-1 py-2.5 rounded-2xl text-sm font-medium bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center gap-1.5 shadow-sm transition-colors">
          <Check size={15} /> שמור
        </button>
      </div>
    </div>
  );
}

function ViewMode() {
  const { tasks, taskDetailId, setTaskDetailId, setEditMode, setEditDraft, setTaskStatus, deleteTask, googleToken, addToGoogleCalendar } = useApp();
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const task = tasks.find(t => t.id === taskDetailId);
  if (!task) return null;

  const { getProject } = useApp();
  const proj = getProject(task.projectId);
  const p2   = ps(proj.color);

  function enterEdit() {
    setEditDraft({
      title:     task.title,
      note:      task.note,
      date:      task.date,
      projectId: task.projectId,
      time:      task.time ?? null,
      priority:  task.priority ?? false,
    });
    setEditMode(true);
  }

  async function handleSync() {
    setSyncing(true);
    setSyncMsg('');
    const result = await addToGoogleCalendar(task);
    setSyncing(false);
    setSyncMsg(result.error ? `שגיאה: ${result.error}` : 'נוסף ביומן Google ✓');
  }

  const statusBtns = STATUS_KEYS.map(k => {
    const c      = STATUS[k];
    const active = task.status === k;
    return (
      <button key={k}
        className={`flex-1 py-2 rounded-2xl text-xs font-medium transition-all ${active ? `${c.bg} ${c.text}` : 'bg-slate-50 text-slate-500'}`}
        style={{ border: active ? '2px solid currentColor' : '2px solid transparent' }}
        onClick={() => setTaskStatus(task.id, k)}>
        {k}
      </button>
    );
  });

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium inline-block mb-1" style={p2.pill}>{proj.name}</span>
          <div className="flex items-center gap-1.5">
            {task.priority && <Star size={14} className="text-rose-400 fill-rose-400 flex-shrink-0" />}
            <h2 className="font-semibold text-slate-700 text-base leading-tight">{task.title}</h2>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <p className="text-xs text-slate-500">{friendlyDate(task.date)}</p>
            {task.time && (
              <span className="flex items-center gap-0.5 text-xs text-slate-500">
                <Clock size={11} /> {task.time}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={enterEdit} className="p-1.5 rounded-xl hover:bg-purple-50 text-purple-400 transition-colors">
            <Pencil size={15} />
          </button>
          <button onClick={() => setTaskDetailId(null)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
            <X size={16} />
          </button>
        </div>
      </div>

      {task.note && (
        <p className="text-sm text-slate-600 bg-slate-50 rounded-2xl px-4 py-3">{task.note}</p>
      )}

      <div>
        <p className="text-xs text-slate-600 font-medium mb-2">סטטוס</p>
        <div className="flex gap-2">{statusBtns}</div>
      </div>

      {task.status === 'הושלם' && (
        <div className="bg-green-50 rounded-2xl px-4 py-3 flex items-center gap-2 border border-green-100">
          <Check size={14} className="text-green-500" />
          <span className="text-sm text-green-600 font-medium">כל הכבוד! המשימה הושלמה 🎉</span>
        </div>
      )}
      {task.status === 'בתהליך' && (
        <div className="bg-orange-50 rounded-2xl px-4 py-3 flex items-center gap-2 border border-orange-100">
          <span className="w-3 h-3 rounded-full bg-orange-400 inline-block" />
          <span className="text-sm text-orange-600 font-medium">המשך כך, אתה יכול! 🔥</span>
        </div>
      )}

      {task.date && (
        <div>
          {googleToken ? (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-2xl text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors disabled:opacity-60"
            >
              <Calendar size={14} />
              {syncing ? 'מסנכרן...' : 'הוסף ל-Google Calendar'}
            </button>
          ) : (
            <p className="text-center text-xs text-slate-400">
              להוספה ל-Google Calendar, התחבר עם חשבון Google
            </p>
          )}
          {syncMsg && (
            <p className={`text-center text-xs mt-1 ${syncMsg.startsWith('שגיאה') ? 'text-rose-500' : 'text-green-600'}`}>
              {syncMsg}
            </p>
          )}
        </div>
      )}

      <button onClick={() => deleteTask(task.id)}
        className="w-full text-rose-400 hover:bg-rose-50 rounded-2xl py-2 text-sm flex items-center justify-center gap-1 transition-colors">
        <X size={14} /> מחק משימה
      </button>
    </div>
  );
}

export default function TaskDetailModal() {
  const { setTaskDetailId, setEditMode, editMode } = useApp();

  return (
    <Backdrop onClose={() => { setTaskDetailId(null); setEditMode(false); }} zIndex={50}>
      <div className="h-1.5 w-full flex-shrink-0" style={{ background: 'var(--header-gradient)' }} />
      {editMode ? <EditMode /> : <ViewMode />}
    </Backdrop>
  );
}
