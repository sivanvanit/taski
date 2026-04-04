import { Plus, X, Star } from 'lucide-react';
import { useApp } from '../../context';
import { friendlyDate } from '../../utils';
import Backdrop from './Backdrop';
import TimePicker from '../TimePicker';

export default function AddTaskModal() {
  const { projects, newTask, setNewTask, setAddTaskModal, submitTask, googleToken } = useApp();

  return (
    <Backdrop onClose={() => setAddTaskModal(null)} zIndex={50}>
      <div className="p-6 flex flex-col gap-4 overflow-y-auto flex-1 min-h-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-700">משימה חדשה ✨</h2>
            <p className="text-xs text-slate-500">{newTask.date ? friendlyDate(newTask.date) : 'בחר תאריך למטה'}</p>
          </div>
          <button onClick={() => setAddTaskModal(null)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            autoFocus
            className="input-field flex-1"
            placeholder="מה צריך לעשות?"
            value={newTask.title}
            onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && submitTask()}
          />
          <div className="relative group flex-shrink-0">
            <button
              type="button"
              onClick={() => setNewTask(t => ({ ...t, priority: !t.priority }))}
              className={`p-2 rounded-xl transition-colors ${
                newTask.priority ? 'bg-rose-50 text-rose-400' : 'bg-slate-50 text-slate-300 hover:text-rose-300'
              }`}
            >
              <Star size={18} className={newTask.priority ? 'fill-rose-400' : ''} />
            </button>
            <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              לסמן כחשובה
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-600 font-medium mb-1.5">תאריך</p>
          <input
            type="date"
            className="input-field"
            value={newTask.date}
            onChange={e => setNewTask(t => ({ ...t, date: e.target.value }))}
          />
        </div>

        <TimePicker
          value={newTask.time}
          onChange={time => setNewTask(t => ({ ...t, time }))}
        />

        <textarea
          rows={2}
          className="input-field resize-none"
          placeholder="הוסף הערה (אופציונלי)"
          value={newTask.note}
          onChange={e => setNewTask(t => ({ ...t, note: e.target.value }))}
        />

        <div>
          <p className="text-xs text-slate-600 font-medium mb-2">פרויקט</p>
          <div className="flex flex-wrap gap-2">
            {projects.map(p => {
              const sel = newTask.projectId === p.id;
              return (
                <button
                  key={p.id}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={sel
                    ? { background: p.color, color: '#fff', border: '2px solid transparent', boxShadow: `0 0 0 3px ${p.color}55` }
                    : { background: '#f1f5f9', color: '#64748b', border: '2px solid transparent' }}
                  onClick={() => setNewTask(t => ({ ...t, projectId: p.id }))}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {googleToken && (
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-medium text-slate-600">סנכרן ליומן גוגל</span>
            <button
              type="button"
              dir="ltr"
              onClick={() => setNewTask(t => ({ ...t, syncGoogle: !t.syncGoogle }))}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${newTask.syncGoogle ? 'bg-blue-500' : 'bg-slate-200'}`}
              aria-label="סנכרן ליומן גוגל"
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${newTask.syncGoogle ? 'translate-x-[22px]' : 'translate-x-1'}`} />
            </button>
          </div>
        )}

        <button
          onClick={submitTask}
          className="w-full text-white rounded-2xl py-2.5 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-opacity"
          style={{ background: 'var(--btn-gradient)' }}
        >
          <Plus size={16} /> הוסף משימה
        </button>
      </div>
    </Backdrop>
  );
}
