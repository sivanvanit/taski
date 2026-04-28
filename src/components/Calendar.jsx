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
    // מניעת באג שבו מנסים לגרור משהו שהוא לא משימה
    if (!taskId) return; 
    
    const newDate = dateStr(newDay);
    console.log(`Dropping task ${taskId} to date ${newDate}`); // לצורכי דיבאג
    
    // 1. עדכון אופטימי ב-UI - שינוי מיידי
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, date: newDate } : t);
    setTasks(updatedTasks);

    // 2. עדכון ב-Supabase דרך הפונקציה הקיימת ב-App
    try {
      await updateTask(taskId, { date: newDate });
      console.log("Supabase updated successfully");
    } catch (error) {
      console.error("Failed to update task in Supabase:", error);
      // במקרה של שגיאה אמיתית, המשימה תחזור למקומה ברענון הבא.
      // אפשר להוסיף כאן לוגיקה שתחזיר אותה מיד, אבל זה מסבך את הקוד.
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
          draggable // הופך את האלמנט לגריר
          onDragStart={(e) => {
            // שומרים את ה-ID של המשימה כטקסט פשוט
            e.dataTransfer.setData("text/plain", t.id.toString());
            // הוספת אפקט ויזואלי לגרירה (אופציונלי)
            e.currentTarget.style.opacity = '0.5';
            e.stopPropagation();
          }}
          onDragEnd={(e) => {
            // מחזירים את האופסיטי בסיום הגרירה
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
        // מאפשר לדפדפן לדעת שאפשר לשחרר כאן (חובה!)
        onDragOver={(e) => {
          e.preventDefault();
          // הוספת אפקט ויזואלי כשלוררים מעל היום (אופציונלי)
          e.currentTarget.classList.add('bg-purple-50');
        }}
        // מסיר את האפקט הויזואלי כשהגרירה יוצאת מהתא
        onDragLeave={(e) => {
          e.currentTarget.classList.remove('bg-purple-50');
        }}
        onDrop={(e) => {
          e.preventDefault();
          // מסיר את האפקט הויזואלי בשחרור
          e.currentTarget.classList.remove('bg-purple-50');
          
          // קוראים את ה-ID שנשמר כטקסט פשוט
          const taskIdRaw = e.dataTransfer.getData("text/plain");
          // ודאי שה-taskIdRaw הוא מספר (אם ה-IDs שלך הם מספרים ב-Supabase)
          const taskId = taskIdRaw; 

          if (taskId) {
            handleTaskDrop(taskId, day);
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
