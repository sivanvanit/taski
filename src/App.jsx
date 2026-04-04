import { AppProvider, useApp } from './context';
import { useEffect } from 'react';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import AuthScreen from './components/AuthScreen';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Calendar from './components/Calendar';
import TodayPanel from './components/TodayPanel';
import DailyModal from './components/modals/DailyModal';
import AddTaskModal from './components/modals/AddTaskModal';
import TaskDetailModal from './components/modals/TaskDetailModal';
import ProjectModal from './components/modals/ProjectModal';
import AddProjectModal from './components/modals/AddProjectModal';
import StatusTasksModal from './components/modals/StatusTasksModal';
import EditProjectModal from './components/modals/EditProjectModal';
import DeleteConfirmModal from './components/modals/DeleteConfirmModal';
import TodayMobileModal from './components/modals/TodayMobileModal';

function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--app-bg)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" />
        <p className="text-slate-400 text-sm">טוען...</p>
      </div>
    </div>
  );
}

function AppInner() {
  const {
    user, authLoading, dataLoading,
    dailyView, addTaskModal, taskDetailId, projectViewId, addProjModal,
    statusFilter, editProjModal, deleteProjConfirm,
    sidebarOpen, setSidebarOpen,
    todayMobileOpen,
  } = useApp();

  const anyModalOpen = !!(dailyView || addTaskModal || taskDetailId || projectViewId || addProjModal || statusFilter || editProjModal || deleteProjConfirm || todayMobileOpen);
  useEffect(() => {
    document.body.classList.toggle('modal-open', anyModalOpen);
    return () => document.body.classList.remove('modal-open');
  }, [anyModalOpen]);

  // GOOGLE VERIFICATION: Toggle this to bypass LandingPage if needed.
  // To skip the landing page, replace <LandingPage /> with <AuthScreen /> on the line below.
  if (authLoading)              return <LoadingScreen />;
  if (!user)                    return <LandingPage />;
  if (dataLoading)              return <LoadingScreen />;

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden pb-8">
      <Header />
      <div className="flex max-w-6xl mx-auto">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <Sidebar />
        <Calendar />
        <TodayPanel />
      </div>

      {dailyView    && !addTaskModal && !taskDetailId && <DailyModal />}
      {addTaskModal                                   && <AddTaskModal />}
      {taskDetailId && !addTaskModal                  && <TaskDetailModal />}
      {projectViewId && !addTaskModal && !taskDetailId && <ProjectModal />}
      {addProjModal                                   && <AddProjectModal />}
      {statusFilter && !addTaskModal && !taskDetailId  && <StatusTasksModal />}
      {editProjModal                                   && <EditProjectModal />}
      {deleteProjConfirm                               && <DeleteConfirmModal />}
      {todayMobileOpen                                 && <TodayMobileModal />}

      <footer
        className="fixed bottom-0 left-0 right-0 text-center py-2 text-xs text-slate-400 border-t border-slate-100 z-10 backdrop-blur-sm"
        style={{ background: 'var(--footer-bg)' }}
      >
        אפליקציה זו פותחה ע&quot;י{' '}
        <a
          href="https://web-goal.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-slate-500 hover:text-purple-500 transition-colors"
        >
          Web-Goal
        </a>
      </footer>
    </div>
  );
}

export default function App() {
  const path = window.location.pathname;
  if (path === '/privacy') return <PrivacyPage />;
  if (path === '/terms')   return <TermsPage />;

  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
