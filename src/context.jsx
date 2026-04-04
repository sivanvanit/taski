import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { STATUS_KEYS } from './utils';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const _today = new Date();
const pad    = n => String(n).padStart(2, '0');

// ─── Sync cache helpers (stale-while-revalidate) ──────────────────────────────
function getCachedUser() {
  try {
    const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
    if (!key) return null;
    const raw = JSON.parse(localStorage.getItem(key) || 'null');
    if (!raw) return null;
    if (raw.expires_at && raw.expires_at * 1000 < Date.now()) return null;
    return raw.user ?? null;
  } catch { return null; }
}
function getCachedJSON(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? []; } catch { return []; }
}

// Map Supabase snake_case → app camelCase
const mapProject = p => ({ id: p.id, name: p.name, color: p.color });
const mapTask    = t => ({
  id:        t.id,
  title:     t.title,
  date:      t.date,
  projectId: t.project_id,
  status:    t.status === 'בביצוע' ? 'בתהליך' : t.status,
  note:      t.note || '',
  time:      t.time || null,
  priority:  t.priority || false,
});

const DEFAULT_PROJECT_SEEDS = [
  { name: 'אישי',   color: '#a78bfa' },
  { name: 'עבודה',  color: '#38bdf8' },
  { name: 'בריאות', color: '#34d399' },
];

export function AppProvider({ children }) {
  // ─── Auth — initialized from localStorage cache for instant UI ───────────────
  const [user,        setUser]        = useState(getCachedUser);
  const [authLoading, setAuthLoading] = useState(() => !getCachedUser());

  // ─── Data — pre-populated from cache; refresh in background ──────────────────
  const [projects,    setProjects]    = useState(() => getCachedUser() ? getCachedJSON('taski-projects') : []);
  const [tasks,       setTasks]       = useState(() => getCachedUser() ? getCachedJSON('taski-tasks') : []);
  const [dataLoading, setDataLoading] = useState(() => {
    const u = getCachedUser();
    if (!u) return false;
    // Show loader only if we have a user but no cached data
    const p = getCachedJSON('taski-projects');
    const t = getCachedJSON('taski-tasks');
    return p.length === 0 && t.length === 0;
  });

  // ─── UI state ────────────────────────────────────────────────────────────────
  const [curYear,       setCurYear]       = useState(_today.getFullYear());
  const [curMonth,      setCurMonth]      = useState(_today.getMonth());
  const [dailyView,     setDailyView]     = useState(null);
  const [addTaskModal,  setAddTaskModal]  = useState(null);
  const [taskDetailId,  setTaskDetailId]  = useState(null);
  const [projectViewId, setProjectViewId] = useState(null);
  const [projectFilter, setProjectFilter] = useState(null);
  const [statusFilter,  setStatusFilter]  = useState(null);
  const [addProjModal,      setAddProjModal]      = useState(false);
  const [editProjModal,     setEditProjModal]     = useState(null); // { id, name, color }
  const [deleteProjConfirm, setDeleteProjConfirm] = useState(null); // project id
  const [sidebarOpen,       setSidebarOpen]       = useState(false);
  const [todayMobileOpen,   setTodayMobileOpen]   = useState(false);
  const [editMode,      setEditMode]      = useState(false);
  const [editDraft,     setEditDraft]     = useState({});
  const [newTask,       setNewTask]       = useState({ title: '', projectId: null, date: '', note: '', time: null, priority: false, syncGoogle: false });
  const [googleToken,   setGoogleToken]   = useState(null);
  const [newProject,    setNewProject]    = useState({ name: '', color: '#a78bfa' });
  const [theme,         setTheme]         = useState(() => localStorage.getItem('taski-theme') || 'soft');

  // ─── Auth init (stale-while-revalidate) ─────────────────────────────────────
  useEffect(() => {
    let authResolved = false;
    const resolveAuth = () => { if (!authResolved) { authResolved = true; setAuthLoading(false); } };
    // Hard fallback: if nothing resolves within 2s, stop showing spinner
    const timeout = setTimeout(resolveAuth, 2000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        resolveAuth(); clearTimeout(timeout);
        setUser(session?.user ?? null);
        if (!session?.user) setDataLoading(false);
        if (session?.provider_token) setGoogleToken(session.provider_token);
      })
      .catch(() => { resolveAuth(); clearTimeout(timeout); setDataLoading(false); });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        // Fires quickly (<50ms) from localStorage — resolve auth immediately
        resolveAuth(); clearTimeout(timeout);
        setUser(session?.user ?? null);
        if (!session?.user) setDataLoading(false);
        if (session?.provider_token) setGoogleToken(session.provider_token);
      } else if (event === 'SIGNED_IN') {
        // Only trigger data reload if a different user signed in
        setUser(prev => {
          if (prev?.id !== session?.user?.id) setTimeout(() => setDataLoading(true), 0);
          return session?.user ?? null;
        });
        if (session?.provider_token) setGoogleToken(session.provider_token);
      } else if (event === 'SIGNED_OUT') {
        setDataLoading(false); setProjects([]); setTasks([]); setUser(null);
        try { localStorage.removeItem('taski-projects'); localStorage.removeItem('taski-tasks'); localStorage.removeItem('taski-uid'); } catch { /* noop */ }
      } else {
        setUser(session?.user ?? null);
      }
    });

    return () => { subscription.unsubscribe(); clearTimeout(timeout); };
  }, []);

  // ─── Theme persistence ───────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'soft' ? '' : theme);
    localStorage.setItem('taski-theme', theme);
  }, [theme]);

  // Re-validate session when returning from background (PWA freeze fix)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session) { setUser(null); setDataLoading(false); }
          else if (session.provider_token) setGoogleToken(session.provider_token);
        });
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  // ─── Load data when user is available ────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    // Silent if we already have cached data (stale-while-revalidate)
    const hasCached = projects.length > 0 || tasks.length > 0;
    // Also clear stale cache if a different user logged in
    const cachedUid = localStorage.getItem('taski-uid');
    if (cachedUid && cachedUid !== user.id) {
      setProjects([]); setTasks([]);
      loadUserData(false);
    } else {
      loadUserData(!hasCached);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Safety timeout: prevent infinite loading spinner
  useEffect(() => {
    if (!dataLoading) return;
    const t = setTimeout(() => setDataLoading(false), 8000);
    return () => clearTimeout(t);
  }, [dataLoading]);

  async function loadUserData(silent = false) {
    if (!silent) setDataLoading(true);

    const [{ data: projs }, { data: tks }] = await Promise.all([
      supabase.from('projects').select('*').order('created_at'),
      supabase.from('tasks').select('*').order('created_at'),
    ]);

    let mappedProjects = projs ? projs.map(mapProject) : [];

    // Seed default projects for brand-new users
    if (mappedProjects.length === 0) {
      mappedProjects = await seedDefaultProjects();
    }

    const mappedTasks = tks ? tks.map(mapTask) : [];
    setProjects(mappedProjects);
    setTasks(mappedTasks);

    // Persist to localStorage for next stale-while-revalidate load
    try {
      localStorage.setItem('taski-uid', user?.id ?? '');
      localStorage.setItem('taski-projects', JSON.stringify(mappedProjects));
      localStorage.setItem('taski-tasks', JSON.stringify(mappedTasks));
    } catch { /* storage full — ignore */ }

    setDataLoading(false);
  }

  async function seedDefaultProjects() {
    const rows = DEFAULT_PROJECT_SEEDS.map(p => ({ ...p, user_id: user.id }));
    const { data } = await supabase.from('projects').insert(rows).select();
    return data ? data.map(mapProject) : [];
  }

  // ─── Derived helpers ─────────────────────────────────────────────────────────
  const todayStr  = `${_today.getFullYear()}-${pad(_today.getMonth()+1)}-${pad(_today.getDate())}`;
  const dateStr   = day => `${curYear}-${pad(curMonth+1)}-${pad(day)}`;
  const isToday   = day => _today.getFullYear()===curYear && _today.getMonth()===curMonth && _today.getDate()===day;
  const tasksFor  = day => tasks.filter(t => t.date === dateStr(day));
  const getProject = id => projects.find(p => p.id === id) || projects[0] || { id: null, name: 'כללי', color: '#94a3b8' };

  // ─── Task operations (optimistic updates) ────────────────────────────────────
  async function cycleStatus(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const next = STATUS_KEYS[(STATUS_KEYS.indexOf(task.status)+1) % STATUS_KEYS.length];
    setTasks(ts => ts.map(t => t.id===id ? { ...t, status: next } : t));
    await supabase.from('tasks').update({ status: next }).eq('id', id);
  }

  async function setTaskStatus(id, status) {
    setTasks(ts => ts.map(t => t.id===id ? { ...t, status } : t));
    await supabase.from('tasks').update({ status }).eq('id', id);
  }

  async function deleteTask(id) {
    setTasks(ts => ts.filter(t => t.id !== id));
    setTaskDetailId(null); setEditMode(false);
    await supabase.from('tasks').delete().eq('id', id);
  }

  async function saveEdit(id) {
    if (!editDraft.title?.trim() || !editDraft.date) return;
    setTasks(ts => {
      const updated = ts.map(t => t.id!==id ? t : {
        ...t, title: editDraft.title, note: editDraft.note, date: editDraft.date,
        projectId: editDraft.projectId, time: editDraft.time ?? null, priority: editDraft.priority ?? false,
      });
      try { localStorage.setItem('taski-tasks', JSON.stringify(updated)); } catch { /* noop */ }
      return updated;
    });
    setEditMode(false);
    const { error } = await supabase.from('tasks').update({
      title:      editDraft.title,
      note:       editDraft.note,
      date:       editDraft.date,
      project_id: editDraft.projectId,
      time:       editDraft.time ?? null,
      priority:   editDraft.priority ?? false,
    }).eq('id', id);
    // Fallback if time/priority columns haven't been migrated yet (same as submitTask)
    if (error) {
      await supabase.from('tasks').update({
        title:      editDraft.title,
        note:       editDraft.note,
        date:       editDraft.date,
        project_id: editDraft.projectId,
      }).eq('id', id);
    }
  }

  function openAddTask({ date, projectId = null }) {
    setNewTask({ title: '', projectId: projectId ?? projects[0]?.id ?? null, date, note: '', time: null, priority: false, syncGoogle: false });
    setAddTaskModal({ date, projectId });
  }

  async function submitTask() {
    if (!newTask.title.trim() || !newTask.date) return;

    let result = await supabase.from('tasks').insert({
      title:      newTask.title,
      date:       newTask.date,
      project_id: newTask.projectId,
      status:     'ממתין',
      note:       newTask.note,
      time:       newTask.time,
      priority:   newTask.priority,
      user_id:    user.id,
    }).select().single();

    // Fallback if time/priority columns haven't been migrated yet
    if (result.error) {
      result = await supabase.from('tasks').insert({
        title:      newTask.title,
        date:       newTask.date,
        project_id: newTask.projectId,
        status:     'ממתין',
        note:       newTask.note,
        user_id:    user.id,
      }).select().single();
    }

    if (result.data) {
      const created = mapTask(result.data);
      setTasks(ts => [...ts, created]);
      if (newTask.syncGoogle && googleToken) {
        addToGoogleCalendar(created); // fire and forget
      }
      setAddTaskModal(null);
    }
  }

  // ─── Project operations ───────────────────────────────────────────────────────
  async function submitProject() {
    if (!newProject.name.trim()) return;
    const { data } = await supabase.from('projects').insert({
      name:    newProject.name,
      color:   newProject.color,
      user_id: user.id,
    }).select().single();

    if (data) {
      setProjects(ps => [...ps, mapProject(data)]);
      setNewProject({ name: '', color: '#a78bfa' });
      setAddProjModal(false);
    }
  }

  async function deleteProject(id) {
    setProjects(ps => {
      const updated = ps.filter(p => p.id !== id);
      try { localStorage.setItem('taski-projects', JSON.stringify(updated)); } catch { /* noop */ }
      return updated;
    });
    setTasks(ts => ts.filter(t => t.projectId !== id));
    // DB cascade handles related tasks
    await supabase.from('projects').delete().eq('id', id);
  }

  async function updateProject(id, { name, color }) {
    setProjects(ps => {
      const updated = ps.map(p => p.id === id ? { ...p, name, color } : p);
      try { localStorage.setItem('taski-projects', JSON.stringify(updated)); } catch { /* noop */ }
      return updated;
    });
    setEditProjModal(null);
    await supabase.from('projects').update({ name, color }).eq('id', id);
  }

  // ─── Batch task operations ────────────────────────────────────────────────────
  async function batchSetProject(ids, projectId) {
    setTasks(ts => {
      const updated = ts.map(t => ids.includes(t.id) ? { ...t, projectId } : t);
      try { localStorage.setItem('taski-tasks', JSON.stringify(updated)); } catch { /* noop */ }
      return updated;
    });
    await supabase.from('tasks').update({ project_id: projectId }).in('id', ids);
  }

  async function batchSetDate(ids, date) {
    setTasks(ts => {
      const updated = ts.map(t => ids.includes(t.id) ? { ...t, date } : t);
      try { localStorage.setItem('taski-tasks', JSON.stringify(updated)); } catch { /* noop */ }
      return updated;
    });
    await supabase.from('tasks').update({ date }).in('id', ids);
  }

  async function batchDeleteTasks(ids) {
    setTasks(ts => {
      const updated = ts.filter(t => !ids.includes(t.id));
      try { localStorage.setItem('taski-tasks', JSON.stringify(updated)); } catch { /* noop */ }
      return updated;
    });
    await supabase.from('tasks').delete().in('id', ids);
  }

  async function addToGoogleCalendar(task) {
    if (!googleToken) return { error: 'no_token' };
    const { createCalendarEvent } = await import('./googleCalendar.js');
    return createCalendarEvent(task, googleToken);
  }

  // ─── Navigation ──────────────────────────────────────────────────────────────
  const prevMonth   = () => { const dt=new Date(curYear,curMonth-1); setCurYear(dt.getFullYear()); setCurMonth(dt.getMonth()); };
  const nextMonth   = () => { const dt=new Date(curYear,curMonth+1); setCurYear(dt.getFullYear()); setCurMonth(dt.getMonth()); };
  const jumpToMonth = (year, month) => { setCurYear(year); setCurMonth(month); };

  // ─── Context value ────────────────────────────────────────────────────────────
  const value = {
    user, authLoading, dataLoading,
    projects, tasks, getProject,
    curYear, curMonth, prevMonth, nextMonth, jumpToMonth,
    dailyView, setDailyView,
    addTaskModal, setAddTaskModal,
    taskDetailId, setTaskDetailId,
    projectViewId, setProjectViewId,
    projectFilter, setProjectFilter,
    statusFilter, setStatusFilter,
    addProjModal, setAddProjModal,
    editProjModal, setEditProjModal,
    deleteProjConfirm, setDeleteProjConfirm,
    sidebarOpen, setSidebarOpen,
    todayMobileOpen, setTodayMobileOpen,
    editMode, setEditMode, editDraft, setEditDraft,
    newTask, setNewTask, newProject, setNewProject,
    googleToken, addToGoogleCalendar,
    theme, setTheme,
    cycleStatus, setTaskStatus, deleteTask, saveEdit,
    batchSetProject, batchSetDate, batchDeleteTasks,
    openAddTask, submitTask, submitProject, deleteProject, updateProject,
    dateStr, isToday, tasksFor, todayStr,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
