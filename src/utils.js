// ─── color helpers ────────────────────────────────────────────────────────────
function hexToRgb(h) {
  return { r: parseInt(h.slice(1,3),16), g: parseInt(h.slice(3,5),16), b: parseInt(h.slice(5,7),16) };
}
function lighten(h, a=0.82) {
  const {r,g,b} = hexToRgb(h);
  const l = v => Math.round(v+(255-v)*a);
  return `rgb(${l(r)},${l(g)},${l(b)})`;
}
function darken(h, a=0.35) {
  const {r,g,b} = hexToRgb(h);
  const d = v => Math.round(v*(1-a));
  return `rgb(${d(r)},${d(g)},${d(b)})`;
}
// Returns React style objects — pastel/soft variant
export function ps(c) {
  return {
    bg:     { background: lighten(c, .88) },
    pill:   { background: lighten(c, .82), color: darken(c, .2) },
    dot:    { background: c },
    text:   { color: darken(c, .15) },
    strip:  { background: c },
    iconBg: { background: lighten(c, .82) },
  };
}

// Solid/vibrant gradient variant — white bold text, top-to-bottom gradient
export function psSolid(c) {
  const {r,g,b} = hexToRgb(c);
  const d = v => Math.round(v * 0.70);
  const darker = `rgb(${d(r)},${d(g)},${d(b)})`;
  const grad   = `linear-gradient(to bottom, ${c}, ${darker})`;
  return {
    bg:     { background: grad },
    pill:   { background: grad, color: '#fff', fontWeight: 700 },
    dot:    { background: 'rgba(255,255,255,0.85)' },
    text:   { color: '#fff', fontWeight: 700 },
    strip:  { background: grad },
    iconBg: { background: 'rgba(255,255,255,0.18)' },
  };
}

// Night Mode variant — dark charcoal bg, project-color border, light grey text
export function psNight(c) {
  return {
    bg:     { background: '#1F2937', border: `1px solid ${c}` },
    pill:   { background: '#1F2937', color: '#D1D5DB', border: `1px solid ${c}` },
    dot:    { background: c },
    text:   { color: '#D1D5DB' },
    strip:  { background: c },
    iconBg: { background: 'rgba(255,255,255,0.06)' },
  };
}

// ─── i18n / constants ─────────────────────────────────────────────────────────
export const MONTHS   = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
export const DAYS     = ['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'];
export const STATUS_KEYS = ['ממתין','בתהליך','הושלם'];
export const STATUS = {
  'ממתין':   { bg: 'bg-slate-100',  text: 'text-slate-600',  dot: 'bg-slate-400' },
  'בתהליך':  { bg: 'bg-orange-100', text: 'text-orange-600', dot: 'bg-orange-400' },
  'הושלם':   { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
  'בביצוע':  { bg: 'bg-orange-100', text: 'text-orange-600', dot: 'bg-orange-400' }, // backward compat
};

// ─── date helpers ─────────────────────────────────────────────────────────────
export const friendlyDate = ds => {
  if (!ds) return '';
  const [y,m,d] = ds.split('-').map(Number);
  return `${d} ב${MONTHS[m-1]} ${y}`;
};
export const daysInMonth = (y, m) => new Date(y, m+1, 0).getDate();
export const firstDay    = (y, m) => new Date(y, m, 1).getDay();
