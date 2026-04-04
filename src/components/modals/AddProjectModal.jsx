import { Plus, X } from 'lucide-react';
import { useApp } from '../../context';
import Backdrop from './Backdrop';

const SWATCHES = ['#a78bfa','#38bdf8','#34d399','#fb923c','#f472b6','#facc15','#f87171','#818cf8','#2dd4bf'];

export default function AddProjectModal() {
  const { newProject, setNewProject, setAddProjModal, submitProject } = useApp();

  return (
    <Backdrop onClose={() => setAddProjModal(false)} zIndex={50}>
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">פרויקט חדש</h2>
          <button onClick={() => setAddProjModal(false)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
            <X size={16} />
          </button>
        </div>

        <input
          autoFocus
          className="input-field"
          placeholder="שם הפרויקט"
          value={newProject.name}
          onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && submitProject()}
        />

        <div>
          <p className="text-xs text-slate-400 mb-3">בחר צבע</p>
          <div className="flex items-center gap-3">
            <label className="relative cursor-pointer">
              <div className="w-12 h-12 rounded-2xl shadow-inner border-4 border-white ring-2 ring-slate-200 overflow-hidden"
                style={{ background: newProject.color }}>
                <input
                  type="color"
                  value={newProject.color}
                  onChange={e => setNewProject(p => ({ ...p, color: e.target.value }))}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
              </div>
            </label>
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium mb-1">נבחר</p>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: newProject.color }} />
                <span className="text-xs font-mono text-slate-500">{newProject.color.toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {SWATCHES.map(h => (
              <button
                key={h}
                className={`w-7 h-7 rounded-full transition-all ${newProject.color === h ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : ''}`}
                style={{ background: h }}
                onClick={() => setNewProject(p => ({ ...p, color: h }))}
              />
            ))}
          </div>
        </div>

        <button
          onClick={submitProject}
          className="w-full text-white rounded-2xl py-2.5 font-medium text-sm flex items-center justify-center gap-2 shadow-sm"
          style={{ background: newProject.color }}
        >
          <Plus size={16} /> צור פרויקט
        </button>
      </div>
    </Backdrop>
  );
}
