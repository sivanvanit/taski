import { useRef, useEffect, useState } from 'react';

const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
const ITEM_H  = 40;

function Drum({ items, value, onChange }) {
  const ref        = useRef(null);
  const isDragging = useRef(false);
  const dragStart  = useRef({ y: 0, scrollTop: 0 });

  useEffect(() => {
    const idx = items.indexOf(value);
    if (ref.current && idx >= 0) {
      ref.current.scrollTop = idx * ITEM_H;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function onScroll() {
    if (isDragging.current || !ref.current) return;
    const idx = Math.round(ref.current.scrollTop / ITEM_H);
    onChange(items[Math.min(Math.max(idx, 0), items.length - 1)]);
  }

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    dragStart.current  = { y: e.clientY, scrollTop: ref.current.scrollTop };
    ref.current.style.scrollSnapType = 'none'; // disable snap while dragging
  }

  function onPointerMove(e) {
    if (!isDragging.current || !ref.current) return;
    const delta = dragStart.current.y - e.clientY;
    ref.current.scrollTop = dragStart.current.scrollTop + delta;
  }

  function onPointerUp() {
    if (!isDragging.current || !ref.current) return;
    isDragging.current = false;
    ref.current.style.scrollSnapType = 'y mandatory';
    const idx     = Math.round(ref.current.scrollTop / ITEM_H);
    const clamped = Math.min(Math.max(idx, 0), items.length - 1);
    ref.current.scrollTop = clamped * ITEM_H;
    onChange(items[clamped]);
  }

  return (
    <div className="relative flex-1 h-[120px]">
      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-purple-100/60 border-y border-purple-200 pointer-events-none" />
      <div
        ref={ref}
        className="no-scrollbar h-full overflow-y-scroll"
        style={{ scrollSnapType: 'y mandatory', cursor: 'grab', touchAction: 'none' }}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div style={{ height: ITEM_H }} />
        {items.map(item => (
          <div
            key={item}
            style={{ height: ITEM_H, scrollSnapAlign: 'center' }}
            className={`flex items-center justify-center text-base select-none transition-colors ${
              item === value ? 'text-purple-800 font-bold' : 'text-slate-300 font-medium'
            }`}
          >
            {item}
          </div>
        ))}
        <div style={{ height: ITEM_H }} />
      </div>
    </div>
  );
}

export default function TimePicker({ value, onChange }) {
  const [allDay, setAllDay] = useState(!value);
  const [hour,   setHour]   = useState(value ? value.split(':')[0] : '09');
  const [minute, setMinute] = useState(() => {
    if (!value) return '00';
    const m = parseInt(value.split(':')[1] || '0');
    return String(Math.round(m / 5) * 5 % 60).padStart(2, '0');
  });

  function toggleAllDay(next) {
    setAllDay(next);
    onChange(next ? null : `${hour}:${minute}`);
  }

  function handleHour(h) {
    setHour(h);
    if (!allDay) onChange(`${h}:${minute}`);
  }

  function handleMinute(m) {
    setMinute(m);
    if (!allDay) onChange(`${hour}:${m}`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-600 font-medium">שעה</p>
        <button
          type="button"
          onClick={() => toggleAllDay(!allDay)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            allDay
              ? 'bg-purple-100 text-purple-700'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {allDay && <span>✓</span>}
          כל היום
        </button>
      </div>

      {!allDay && (
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-2xl overflow-hidden px-2" dir="ltr">
          <Drum items={HOURS}   value={hour}   onChange={handleHour} />
          <span className="text-xl font-bold text-slate-300 flex-shrink-0 select-none">:</span>
          <Drum items={MINUTES} value={minute} onChange={handleMinute} />
        </div>
      )}
    </div>
  );
}
