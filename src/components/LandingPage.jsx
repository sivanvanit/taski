import { useState } from 'react';
import { Calendar, CheckSquare, Zap, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../supabase';

/* ── Google brand icon (official 4-colour SVG) ── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

/* ── Same error translations as AuthScreen ── */
function translateError(msg) {
  if (msg.includes('Invalid login credentials'))   return 'אימייל או סיסמה שגויים';
  if (msg.includes('Email not confirmed'))          return 'יש לאשר את האימייל תחילה';
  if (msg.includes('User already registered'))      return 'המשתמש כבר קיים — נסה להתחבר';
  if (msg.includes('Password should be at least'))  return 'הסיסמה חייבת להכיל לפחות 6 תווים';
  if (msg.includes('invalid format'))               return 'כתובת האימייל אינה תקינה';
  if (msg.includes('signup is disabled'))           return 'ההרשמה מושבתת כרגע';
  if (msg.includes('Email rate limit exceeded'))    return 'נשלחו יותר מדי בקשות, נסה שוב מאוחר יותר';
  return msg;
}

/* ── Email-sent confirmation screen ── */
function EmailSentScreen({ email, onBack }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--app-bg)' }}>
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-purple-100 p-8 text-center">
        <div className="text-5xl mb-4">✉️</div>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">בדוק את האימייל שלך</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          שלחנו לך קישור אישור לכתובת<br />
          <strong className="text-slate-700">{email}</strong>
        </p>
        <button
          onClick={onBack}
          className="mt-6 text-sm text-purple-500 hover:text-purple-700 font-medium transition-colors"
        >
          ← חזרה לכניסה
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main Landing Page
   ═══════════════════════════════════════════════ */
export default function LandingPage() {
  const [mode,      setMode]      = useState('signin');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [emailSent, setEmailSent] = useState(false);

  /* ── Google OAuth ── */
  async function handleGoogle() {
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        scopes: 'https://www.googleapis.com/auth/calendar.events',
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (err) { setError(translateError(err.message)); setLoading(false); }
  }

  /* ── Email / password ── */
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: err } = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });

    if (err) {
      setError(translateError(err.message));
    } else if (mode === 'signup' && !data.session) {
      setEmailSent(true);
    }
    setLoading(false);
  }

  function switchMode() {
    setMode(m => m === 'signin' ? 'signup' : 'signin');
    setError('');
  }

  if (emailSent) {
    return <EmailSentScreen email={email} onBack={() => { setEmailSent(false); setMode('signin'); }} />;
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl" style={{ background: 'var(--app-bg)' }}>

      {/* Decorative blobs */}
      <div className="fixed top-[-120px] right-[-120px] w-80 h-80 rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, var(--blob1), transparent 70%)' }} />
      <div className="fixed bottom-[-120px] left-[-120px] w-80 h-80 rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, var(--blob2), transparent 70%)' }} />
      <div className="fixed top-1/2 left-1/4 w-56 h-56 rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, var(--blob3), transparent 70%)' }} />

      {/* ── Hero ── */}
      <header className="relative z-10 flex flex-col items-center text-center px-6 pt-14 pb-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-lg border border-purple-100 mb-5">
          <Calendar size={38} className="text-purple-500" />
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-purple-700 mb-2 tracking-tight">
          Taski
        </h1>

        <p className="text-xl sm:text-2xl font-semibold text-purple-600 mb-4">
          מנהלים את היום בכיף!
        </p>

        <p className="text-base sm:text-lg text-slate-500 max-w-lg leading-relaxed">
          הדרך הפשוטה ביותר לארגן את המשימות שלך
          ולראות אותן ישירות ביומן Google.
        </p>
      </header>

      {/* ── Auth card ── */}
      <main className="relative z-10 flex justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="modal-card bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-purple-100 p-7">
            {/* Gradient strip */}
            <div className="h-1 w-16 rounded-full mx-auto mb-6"
                 style={{ background: 'var(--header-gradient)' }} />

            <h2 className="text-xl font-semibold text-slate-700 mb-6 text-center">
              {mode === 'signin' ? 'ברוך הבא! 👋' : 'הצטרפות לטאסקי ✨'}
            </h2>

            {/* Google button */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border-2 border-slate-200 hover:border-purple-200 hover:bg-purple-50/50 text-slate-600 font-medium transition-all disabled:opacity-60 mb-5"
            >
              <GoogleIcon />
              התחברות באמצעות Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400 font-medium">או</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Email / password form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="כתובת אימייל"
                className="input-field"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  placeholder={mode === 'signin' ? 'סיסמה' : 'סיסמה (לפחות 6 תווים)'}
                  className="input-field"
                  style={{ paddingLeft: '2.75rem' }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPass ? 'הסתר סיסמה' : 'הצג סיסמה'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-2.5 text-sm text-rose-600 text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white rounded-2xl py-3 font-semibold transition-all disabled:opacity-60 mt-1 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                style={{ background: loading ? 'var(--btn-loading-color)' : 'var(--btn-gradient)' }}
              >
                {loading ? 'מתחבר...' : mode === 'signin' ? 'כניסה' : 'יצירת חשבון'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-400 mt-5">
              {mode === 'signin' ? 'אין לך חשבון? ' : 'כבר יש לך חשבון? '}
              <button
                onClick={switchMode}
                className="text-purple-500 hover:text-purple-700 font-semibold transition-colors"
              >
                {mode === 'signin' ? 'הרשמה בחינם' : 'כניסה'}
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* ── Feature cards ── */}
      <section className="relative z-10 flex justify-center px-4 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
          <div className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-purple-100 shadow-sm text-center">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 flex items-center justify-center">
              <CheckSquare size={22} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-700">ארגון חכם</h3>
            <p className="text-xs text-slate-400">מיון פשוט לפי קטגוריות.</p>
          </div>

          <div className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-purple-100 shadow-sm text-center">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 flex items-center justify-center">
              <Calendar size={22} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-700">סנכרון יומן</h3>
            <p className="text-xs text-slate-400">כל המשימות שלך מופיעות ביומן האישי.</p>
          </div>

          <div className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-purple-100 shadow-sm text-center">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 flex items-center justify-center">
              <Zap size={22} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-700">מוטיבציה יומית</h3>
            <p className="text-xs text-slate-400">הודעות עידוד ומעקב אחרי רצף ההצלחות שלך.</p>
          </div>
        </div>
      </section>

      {/* ── Footer — CRITICAL: visible to all guests for Google verification ── */}
      <footer className="relative z-10 mt-auto py-5 px-6 border-t border-slate-100 text-center"
              style={{ background: 'var(--footer-bg, rgba(255,255,255,0.8))' }}>
        <p className="text-sm text-slate-400 mb-1 space-x-1">
          <a href="/privacy" className="hover:text-purple-500 transition-colors">מדיניות פרטיות</a>
          <span className="mx-1 text-slate-300">·</span>
          <a href="/terms" className="hover:text-purple-500 transition-colors">תנאי שימוש</a>
        </p>
        <p className="text-xs text-slate-400">
          <a href="mailto:contact@web-goal.com" className="hover:text-purple-500 transition-colors">
            contact@web-goal.com
          </a>
        </p>
      </footer>
    </div>
  );
}
