import { Trash2, X } from 'lucide-react';
import { useApp } from '../../context';
import Backdrop from './Backdrop';

export default function DeleteConfirmModal() {
  const { deleteProjConfirm, setDeleteProjConfirm, deleteProject, projects } = useApp();
  const proj = projects.find(p => p.id === deleteProjConfirm);
  if (!proj) return null;

  function handleDelete() {
    deleteProject(deleteProjConfirm);
    setDeleteProjConfirm(null);
  }

  return (
    <Backdrop onClose={() => setDeleteProjConfirm(null)} zIndex={60}>
      <div className="p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
              <Trash2 size={15} className="text-rose-400" />
            </div>
            <h2 className="font-semibold text-slate-700">מחיקת פרויקט</h2>
          </div>
          <button onClick={() => setDeleteProjConfirm(null)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
            <X size={16} />
          </button>
        </div>

        <div className="bg-rose-50 rounded-2xl px-4 py-3 border border-rose-100">
          <p className="text-sm text-slate-700 font-medium mb-1">
            האם למחוק את הפרויקט <strong>"{proj.name}"</strong>?
          </p>
          <p className="text-xs text-slate-500">כל המשימות הקשורות לפרויקט זה יימחקו לצמיתות.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setDeleteProjConfirm(null)}
            className="flex-1 py-2.5 rounded-2xl text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 py-2.5 rounded-2xl text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 size={14} /> מחק לצמיתות
          </button>
        </div>
      </div>
    </Backdrop>
  );
}
