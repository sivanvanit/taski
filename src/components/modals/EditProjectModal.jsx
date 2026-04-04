import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useApp } from '../../context';
import Backdrop from './Backdrop';

const SWATCHES = ['#a78bfa','#38bdf8','#34d399','#fb923c','#f472b6','#facc15','#f87171','#818cf8','#2dd4bf'];

export default function EditProjectModal() {
  const { editProjModal, setEditProjModal, updateProject } = useApp();
  const [draft, setDraft] = useState({ name: editProjModal.name, color: editProjModal.color });

  function handleSave() {
    if (!draft.name.trim()) return;
    updateProject(editProjModal.id, draft);
  }

  return (
    <Backdrop onClose={() => setEditProjModal(null)} zIndex={60}>
      <div className="h-1.5 w-full" style={{ background: 'var(--header-gradient)' }} />
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">ערוך פרויקט</h2>
          <button onClick={() => setEditProjModal(null)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
            <X size={16} />
          </button>
        </div>

        <input
          autoFocus
          className="input-field"
          placeholder="שם הפרויקט"
          value={draft.name}
          onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />

        <div>
          <p className="text-xs text-slate-500 font-medium mb-3">בחר צבע</p>
          <div className="flex items-center gap-3 mb-3">
            <label className="relative cursor-pointer">
              <div className="w-12 h-12 rounded-2xl shadow-inner border-4 border-white ring-2 ring-slate-200 overflow-hidden"
                style={{ background: draft.color }}>
                <input
                  type="color"
                  value={draft.color}
                  onChange={e => setDraft(d => ({ ...d, color: e.target.value }))}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
              </div>
            </label>
            <div className="flex-1">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: draft.color }} />
                <span className="text-xs font-mono text-slate-500">{draft.color.toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {SWATCHES.map(h => (
              <button
                key={h}
                className={`w-7 h-7 rounded-full transition-all ${draft.color === h ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : ''}`}
                style={{ background: h }}
                onClick={() => setDraft(d => ({ ...d, color: h }))}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setEditProjModal(null)}
            className="flex-1 py-2.5 rounded-2xl text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-1.5 shadow-sm transition-opacity hover:opacity-90"
            style={{ background: 'var(--btn-gradient)' }}
          >
            <Check size={15} /> שמור שינויים
          </button>
        </div>
      </div>
    </Backdrop>
  );
}
