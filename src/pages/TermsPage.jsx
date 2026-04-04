export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <a href="/" className="text-sm text-purple-500 hover:text-purple-700 mb-8 inline-block">← חזרה לטאסקי</a>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">תנאי שימוש</h1>
        <p className="text-sm text-slate-400 mb-8">עודכן לאחרונה: ינואר 2025</p>

        <div className="space-y-8 text-slate-600 text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-2">1. קבלת התנאים</h2>
            <p>
              על ידי גישה לשירות Taski ושימוש בו, אתם מסכימים לתנאי שימוש אלה. אם אינכם מסכימים, אנא הפסיקו את
              השימוש באפליקציה.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-2">2. תיאור השירות</h2>
            <p>
              Taski היא אפליקציית ניהול משימות ויומן אישי המאפשרת יצירה, עריכה ומעקב אחר משימות, וסנכרון אופציונלי
              עם Google Calendar.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-2">3. חשבון משתמש</h2>
            <ul className="list-disc list-inside space-y-1 mr-2">
              <li>עליכם לספק מידע מדויק בעת ההרשמה.</li>
              <li>אתם אחראים לשמירת סיסמתכם בסודיות.</li>
              <li>יש ליידע אותנו מיידית על כל שימוש לא מורשה בחשבונכם.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-2">4. שימוש מותר</h2>
            <p className="mb-2">אתם מסכימים שלא:</p>
            <ul className="list-disc list-inside space-y-1 mr-2">
              <li>להשתמש בשירות לכל מטרה בלתי חוקית.</li>
              <li>לנסות לגשת לנתוני משתמשים אחרים.</li>
              <li>לנסות לשבש או להעמיס על תשתיות השירות.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-2">5. סנכרון Google Calendar</h2>
            <p>
              פונקציית הסנכרון עם Google Calendar היא אופציונלית לחלוטין. בעת הפעלתה, אנו שולחים אירועים ליומן שלכם
              בלבד, ואינו ניגשים לאירועים קיימים. אתם אחראים לניהול הרשאות Google מצד חשבונכם.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-2">6. זמינות השירות</h2>
            <p>
              אנו שואפים לזמינות מרבית, אך לא מתחייבים לזמינות בלתי מופסקת. השירות עשוי להיות מושבת לתחזוקה או
              שיפורים ללא הודעה מוקדמת.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-2">7. הגבלת אחריות</h2>
            <p>
              השירות מסופק "כפי שהוא" (AS IS). איננו אחראים לכל אובדן נתונים, הפרעה לשירות, או נזק אחר הנובע
              משימוש באפליקציה. מומלץ לגבות מידע חשוב באמצעים עצמאיים.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-2">8. שינויים בתנאים</h2>
            <p>
              אנו שומרים לעצמנו את הזכות לעדכן תנאים אלה בכל עת. המשך השימוש לאחר עדכון מהווה הסכמה לתנאים החדשים.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-2">9. יצירת קשר</h2>
            <p>לשאלות בנוגע לתנאי השימוש ניתן לפנות אלינו בדוא"ל:{' '}
              <a href="mailto:contact@web-goal.com" className="text-purple-600 hover:underline">contact@web-goal.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
