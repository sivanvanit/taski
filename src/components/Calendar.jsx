import { Check } from 'lucide-react';
import { useApp } from '../context';
import { DAYS, MONTHS, ps, firstDay, daysInMonth } from '../utils';
// ייבוא ישיר של הקליינט כדי שלא נהיה תלויים ב-Context
import { supabase } from '../supabaseClient'; 

export default function Calendar() {
  const { 
    curYear, curMonth, tasksFor, isToday, dateStr, getProject, 
    setDailyView, setTaskDetailId, setEditMode, setAddTaskModal, 
    tasks, setTasks 
  } = useApp();

  const fd  = firstDay(curYear, curMonth);
  const dim = daysInMonth(curYear, curMonth);

  const handleTaskDrop = async (taskId, newDay) => {
    if (!taskId) return;
    const newDate = dateStr(newDay);
    
    // 1. עדכון אופטימי - קורה מיד ב-UI
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, date: newDate } : t);
    setTasks(updatedTasks);

    // 2. עדכון ישיר מול Supabase
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ date: newDate })
        .eq('id', taskId);

      if (error) throw error;
      console.log("Successfully updated Supabase!");
    } catch (error) {
      console.error("Supabase Error:", error);
      // אם נכשל, פשוט נרענן את הדף והמשימה תחזור למקום
    }
  };

  const dayCells = Array.from({ length: dim }, (_, i) => {
    const day = i + 1;
    const dayTasks = tasksFor(day);
    const today   = isToday(day);

    return (
      <div
        key={day}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const taskId = e.dataTransfer.getData("text/plain");
          if (taskId) handleTaskDrop(taskId, day);
        }}
        className={`rounded-2xl p-1.5 md:p-2 min-h-[70px] md:min-h-[90px] cursor-pointer transition-all border group
          ${today ? 'bg-purple-100 border-purple-300 shadow-sm' : 'hover:border-purple-200'}`}
        onClick={() => {
            setDailyView(dateStr(day));
            setTaskDetailId(null);
            setEditMode(false);
            setAddTaskModal(null);
        }}
      >
        <div className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full
          ${today ? 'bg-purple-500 text-white' : 'text-slate-500 group-hover:bg-purple-50'}`}>
          {day}
        </div>
        <div className="flex flex-col gap-0.5">
          {dayTasks.slice(0, 2).map(t => {
            const proj = getProject(t.projectId);
            const p2 = ps(proj.color);
            return (
              <div 
                key={t.id} 
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", t.id.toString());
                  e.stopPropagation();
                }}
                className="text-xs px-1.5 py-0.5 rounded-lg font-medium truncate flex items-center gap-1 cursor-grab active:cursor-grabbing" 
                style={t.status === 'הושלם' ? { background: '#dcfce7', color: '#15803d' } : p2.pill}
              >
                {t.status === 'הושלם' && <Check size={9} />}
                <span className="truncate">{t.title}</span>
              </div>
            );
          })}
          {dayTasks.length > 2 && <span className="text-xs text-slate-400">+{dayTasks.length - 2}</span>}
        </div>
      </div>
    );
  });

  return (
    <main className="flex-1 p-3 md:p-5">
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: fd }).map((_, i) => <div key={`e${i}`} className="min-h-[70px] md:min-h-[90px]" />)}
        {dayCells}
      </div>
    </main>
  );
}
