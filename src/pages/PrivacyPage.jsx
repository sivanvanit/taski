export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <a href="/" className="text-sm text-purple-500 hover:text-purple-700 mb-8 inline-block">← חזרה לטאסקי</a>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">מדיניות פרטיות</h1>
        <p className="text-sm text-slate-400 mb-8">עודכן לאחרונה: ינואר 2025</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-2">1. מבוא</h2>
            <p>
              Taski ("האפליקציה", "השירות") מחויבת להגן על פרטיותכם. מדיניות פרטיות זו מסבירה אילו מידע אנו אוספים, כיצד
              אנו משתמשים בו, ומהן זכויותיכם בנוגע למידע זה. על ידי שימוש באפליקציה, אתם מסכימים לתנאים המפורטים
              במדיניות זו.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-2">2. מידע שאנו אוספים</h2>
            <p className="mb-2">אנו אוספים רק את המידע הנדרש לפעילות השירות:</p>
            <ul className="list-disc list-inside space-y-1 mr-2">
              <li><strong>פרטי חשבון:</strong> כתובת דואר אלקטרוני ושם (בהתחברות עם Google).</li>
              <li><strong>נתוני משימות ופרויקטים:</strong> משימות, תאריכים, פרויקטים והערות שאתם יוצרים באפליקציה.</li>
              <li><strong>אסימון Google (Provider Token):</strong> אסימון גישה זמני ל-Google Calendar, המשמש אך ורק לסנכרון משימות שאתם מבקשים במפורש להוסיף ליומן. אסימון זה <strong>אינו</strong> נשמר בשרתינו.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-2">3. כיצד אנו משתמשים במידע</h2>
            <ul className="list-disc list-inside space-y-1 mr-2">
              <li>להפעלת שירות ניהול המשימות.</li>
              <li>לסנכרון משימות ל-Google Calendar — <strong>רק</strong> כאשר אתם לוחצים על כפתור הסנכרון.</li>
              <li>לזיהוי ואימות המשתמש על מנת לשמור נתונים בצורה מאובטחת.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-2">4. גישה ל-Google Calendar</h2>
            <p>
              אנו מבקשים גישה ל-<strong>Google Calendar</strong> אך ורק לצורך הוספת אירועים ביומן שלכם, לפי בחירתכם.
              אנחנו <strong>לא</strong> קוראים, עורכים, מוחקים, מאחסנים, משתפים או מוכרים אף נתון מה-Google Calendar שלכם.
              הגישה מוגבלת לפעולת כתיבת אירוע בלבד — היקף (<em>scope</em>):
              <code className="bg-slate-100 px-1 rounded text-xs mx-1">https://www.googleapis.com/auth/calendar.events</code>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-2">5. שיתוף מידע עם צדדים שלישיים</h2>
            <p>
              אנו <strong>לא</strong> מוכרים, משכירים, מסחרים או משתפים את המידע האישי שלכם עם צדדים שלישיים, למעט:
            </p>
            <ul className="list-disc list-inside space-y-1 mr-2 mt-2">
              <li><strong>Supabase:</strong> פלטפורמת בסיס הנתונים המאחסנת את נתוני החשבון והמשימות שלכם באופן מוצפן ומאובטח.</li>
              <li><strong>Google:</strong> בעת סנכרון יומן, בקשה נשלחת ישירות ל-API של Google עם האסימון שסיפקתם.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-2">6. אבטחת מידע</h2>
            <p>
              כל הנתונים מאוחסנים ב-Supabase עם הצפנה ב-TLS. הגישה לנתוני משתמש מוגנת על ידי מדיניות Row-Level Security (RLS),
              כך שכל משתמש ניגש אך ורק לנתוניו שלו.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-2">7. זכויות המשתמש</h2>
            <p>בכל עת תוכלו:</p>
            <ul className="list-disc list-inside space-y-1 mr-2 mt-2">
              <li>לבקש עותק של המידע שנאסף עליכם.</li>
              <li>לבקש מחיקה של חשבונכם וכל הנתונים הקשורים אליו.</li>
              <li>לבטל את הרשאות ה-Google Calendar דרך הגדרות חשבון Google שלכם.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-2">8. יצירת קשר</h2>
            <p>לשאלות בנוגע למדיניות הפרטיות ניתן לפנות אלינו בדוא"ל:{' '}
              <a href="mailto:contact@web-goal.com" className="text-purple-600 hover:underline">contact@web-goal.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
