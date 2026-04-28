import { Check } from 'lucide-react';
import { useApp } from '../context';
import { DAYS, MONTHS, ps, firstDay, daysInMonth } from '../utils';

export default function Calendar() {
  const { 
    curYear, curMonth, tasksFor, isToday, dateStr, getProject, 
    setDailyView, setTaskDetailId, setEditMode, setAddTaskModal, 
    tasks, setTasks, updateTask 
  } = useApp();

  const fd  = firstDay(curYear, curMonth);
  const dim = daysInMonth(curYear, curMonth);

  const handleTaskDrop = async (taskId, newDay) => {
    // דיבאג: בדיקה אם בכלל הגענו לכאן
    console.log("=== Drop Initiated ===");
    console.log("Task ID received:", taskId);
    console.log("New Day:", newDay);

    if (!taskId) {
      console.error("⛔ Error: No Task ID provided to handleTaskDrop!");
      return; 
    }
    
    const newDate = dateStr(newDay);
    console.log("Target Date formatted:", newDate);
    
    // 1. עדכון אופטימי ב-UI
    console.log("Applying optimistic update to UI...");
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, date: newDate } : t);
    setTasks(updatedTasks);

    // 2. עדכון ב-Supabase
    try {
      console.log(`Sending update request to Supabase for task ${taskId}...`);
      await updateTask(taskId, { date: newDate });
      console.log("✅ Supabase updated successfully!");
    } catch (error) {
      console.error("❌ Failed to update task in Supabase:", error);
      // הערה: אם זה נכשל, המשימה תחזור למקומה רק ברענון הבא.
    }
    console.log("=== Drop Completed ===");
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
          draggable
          onDragStart={(e) => {
            // דיבאג: בדיקה מתי הגרירה מתחילה
            console.log(`🔷 Drag START: Task ${t.id} (${t.title})`);
            
            // שומרים את ה-ID. ניסיון נוסף להשתמש בפורמט ייחודי
            e.dataTransfer.setData("application/task-id", t.id.toString());
            
            // תמיכה ב-fallback לדפדפנים ישנים
            e.dataTransfer.setData("text/plain", t.id.toString());
            
            e.currentTarget.style.opacity = '0.5';
            e.stopPropagation();
          }}
          onDragEnd={(e) => {
            console.log(`🔶 Drag END: Task ${t.id}`);
            e.currentTarget.style.opacity = '1';
          }}
          className="text-xs px-1.5 py-0.5 rounded-lg font-medium truncate flex items-center gap-1 cursor-grab active:cursor-grabbing transition-opacity" 
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
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add('bg-purple-50');
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove('bg-purple-50');
        }}
        onDrop={(e) => {
          e.preventDefault();
          console.log(`🟢 Drop Event on Day ${day}`);
          e.currentTarget.classList.remove('bg-purple-50');
          
          // ניסיון לקרוא את ה-ID משני הפורמטים
          let taskIdRaw = e.dataTransfer.getData("application/task-id");
          if (!taskIdRaw) {
            console.log("Fallback: application/task-id failed, trying text/plain");
            taskIdRaw = e.dataTransfer.getData("text/plain");
          }
          
          console.log("Raw data found in Drop:", taskIdRaw);

          if (taskIdRaw) {
            handleTaskDrop(taskIdRaw, day);
          } else {
            console.error("⛔ Error: No task ID found in dataTransfer on drop!");
          }
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
