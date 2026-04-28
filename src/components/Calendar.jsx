import { Check } from 'lucide-react';
import { useApp } from '../context';
import { DAYS, MONTHS, ps, firstDay, daysInMonth } from '../utils';
import { supabase } from '../supabaseClient'; // ודאי שהנתיב הזה נכון אצלך

export default function Calendar() {
  const { 
    curYear, curMonth, tasksFor, isToday, dateStr, getProject, 
    setDailyView, setTaskDetailId, setEditMode, setAddTaskModal, tasks, setTasks 
  } = useApp();

  const fd  = firstDay(curYear, curMonth);
  const dim = daysInMonth(curYear, curMonth);

  // פונקציה לעדכון התאריך ב-Supabase ובסטייט המקומי
  const handleTaskDrop = async (taskId, newDay) => {
    const newDate = dateStr(newDay);
    
    // 1. עדכון אופטימי (שינוי מיידי ב-UI)
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, date: newDate } : t);
    setTasks(updatedTasks);

    // 2. עדכון ב-Supabase
    const { error } = await supabase
      .from('tasks')
      .update({ date: newDate })
      .eq('id', taskId);

    if (error) {
      console.error("Error updating task date:", error);
      // כאן אפשר להוסיף רענון של המשימות מהשרת במקרה של שגיאה
    }
  };

  function openDay(day) {
    setDailyView(dateStr(day));
    setTaskDetailId(null);
    setEditMode(false);
    setAddTaskModal(null);
  }

  const emptyCells = Array.from({ length: fd }, (_, i) => (
    <div key={`e${i}`} className="rounded-2xl min-h-[70px] md:min-h-[90px]" />
  ));

  const dayCells = Array.from({ length: dim }, (_, i) => {
    const day = i + 1;
    const dayTasks = tasksFor(day);
    const today   = isToday(day);

    const pips = dayTasks.slice(0, 2).map(t => {
      const proj  = getProject(t.projectId);
      const p2    = ps(proj.color);
      const done  = t.status === 'הושלם';
      const ip    = t.status === 'בתהליך';
      const style = done
        ? { background: '#dcfce7', color: '#15803d' }
        : ip
        ? { background: '#ffedd5', color: '#c2410c' }
        : p2.pill;

      return (
        <div 
          key={t.id} 
          draggable // מאפשר גרירה
          onDragStart={(e) => {
            e.dataTransfer.setData("taskId", t.id);
            e.stopPropagation();
          }}
          className="text-xs px-1.5 py-0.5 rounded-lg font-medium truncate flex items-center gap-1 cursor-grab active:cursor-grabbing" 
          style={style}
        >
          {done && <Check size={9} className="flex-shrink-0" />}
          {ip   && <span className="w-2 h-2 rounded-full bg-orange-400 inline-block flex-shrink-0" />}
          {t.priority && <span className="text-rose-400 flex-shrink-0 text-[9px]">★</span>}
          <span className="truncate">{t.title}</span>
        </div>
      );
    });

    return (
      <div
        key={day}
        className={`rounded-2xl p-1.5 md:p-2 min-h-[70px] md:min-h-[90px] cursor-pointer transition-all border group cal-cell
          ${today
            ? 'bg-purple-100 border-purple-300 shadow-sm cal-cell-today'
            : 'hover:border-purple-200'
          }`}
        onClick={() => openDay(day)}
        // מאפשר שחרור על התא
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const taskId = e.dataTransfer.getData("taskId");
          if (taskId) handleTaskDrop(taskId, day);
        }}
      >
        <div className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full
          ${today ? 'bg-purple-500 text-white' : 'text-slate-500 group-hover:bg-purple-50 group-hover:text-purple-600'}`}>
          {day}
        </div>
        <div className="flex flex-col gap-0.5">
          {pips}
          {dayTasks.length > 2 && (
            <span className="text-xs text-slate-400 pr-1">+{dayTasks.length - 2}</span>
          )}
        </div>
      </div>
    );
  });

  return (
    <main className="flex-1 p-3 md:p-5">
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {emptyCells}
        {dayCells}
      </div>
    </main>
  );
}
