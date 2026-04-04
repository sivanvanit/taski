import { useState } from 'react';
import { Trash2, FolderOpen, Calendar, CheckSquare } from 'lucide-react';
import { useApp } from '../../context';

export default function BatchEditBar({ selected, onClear, onSelectAll, totalCount }) {
  const { projects, batchSetProject, batchSetDate, batchDeleteTasks } = useApp();
  const [action, setAction] = useState(null); // 'project' | 'date' | 'delete'
  const [projId, setProjId] = useState('');
  const [date,   setDate]   = useState('');
  const count = selected.size;

  if (count < 1) return null;

  async function handleProject() {
    if (!projId) return;
    await batchSetProject([...selected], projId);
    onClear();
    setAction(null);
  }

  async function handleDate() {
    if (!date) return;
    await batchSetDate([...selected], date);
    onClear();
    setAction(null);
  }

  async function handleDelete() {
    await batchDeleteTasks([...selected]);
    onClear();
    setAction(null);
  }

  const allSelected = totalCount != null && count === totalCount && totalCount > 0;

  return (
    <div className="rounded-2xl border border-purple-200 bg-purple-50 p-3 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-purple-700">
          עריכה קבוצתית · {count} {count === 1 ? 'משימה נבחרה' : 'משימות נבחרו'}
        </span>
        <div className="flex items-center gap-2">
          {onSelectAll && totalCount > 0 && (
            <button
              onClick={allSelected ? onClear : onSelectAll}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 transition-colors"
            >
              <CheckSquare size={12} />
              {allSelected ? 'בטל הכל' : 'בחר הכל'}
            </button>
          )}
          <button onClick={onClear} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            ביטול
          </button>
        </div>
      </div>

      {/* Primary action buttons */}
      {!action && (
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setAction('project')}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl bg-white border border-purple-200 text-purple-600 hover:bg-purple-100 transition-colors"
          >
            <FolderOpen size={12} /> שנה פרויקט
          </button>
          <button
            onClick={() => setAction('date')}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl bg-white border border-purple-200 text-purple-600 hover:bg-purple-100 transition-colors"
          >
            <Calendar size={12} /> שנה תאריך
          </button>
          <button
            onClick={() => setAction('delete')}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <Trash2 size={12} /> מחיקה
          </button>
        </div>
      )}

      {/* Change project */}
      {action === 'project' && (
        <div className="flex gap-2 items-center">
          <select
            value={projId}
            onChange={e => setProjId(e.target.value)}
            className="flex-1 input-field py-1.5 text-sm"
          >
            <option value="">בחר פרויקט</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button
            onClick={handleProject}
            disabled={!projId}
            className="px-3 py-1.5 rounded-xl bg-purple-500 text-white text-xs font-semibold disabled:opacity-40 transition-opacity"
          >
            אישור
          </button>
          <button
            onClick={() => setAction(null)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs hover:bg-slate-200 transition-colors"
          >
            ביטול
          </button>
        </div>
      )}

      {/* Change date */}
      {action === 'date' && (
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="flex-1 input-field py-1.5 text-sm"
            dir="ltr"
          />
          <button
            onClick={handleDate}
            disabled={!date}
            className="px-3 py-1.5 rounded-xl bg-purple-500 text-white text-xs font-semibold disabled:opacity-40 transition-opacity"
          >
            אישור
          </button>
          <button
            onClick={() => setAction(null)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs hover:bg-slate-200 transition-colors"
          >
            ביטול
          </button>
        </div>
      )}

      {/* Delete confirm */}
      {action === 'delete' && (
        <div className="flex gap-2 items-center">
          <p className="text-xs text-rose-600 flex-1">
            למחוק {count === 1 ? 'משימה זו' : `${count} משימות`} לצמיתות?
          </p>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-colors"
          >
            מחק
          </button>
          <button
            onClick={() => setAction(null)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs hover:bg-slate-200 transition-colors"
          >
            ביטול
          </button>
        </div>
      )}
    </div>
  );
}
