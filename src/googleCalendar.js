// Google Calendar API integration
// Setup required:
//   1. Enable Google Calendar API in Google Cloud Console
//   2. In Supabase Dashboard → Auth → Providers → Google, add scope:
//      https://www.googleapis.com/auth/calendar.events
//   3. Users must sign in (or re-sign-in) with Google to grant calendar access

function nextHour(time) {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(2000, 0, 1, h + 1, m);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export async function createCalendarEvent(task, googleToken) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const event = {
    summary: task.title,
    ...(task.note ? { description: task.note } : {}),
    ...(task.time
      ? {
          start: { dateTime: `${task.date}T${task.time}:00`, timeZone: tz },
          end:   { dateTime: `${task.date}T${nextHour(task.time)}:00`, timeZone: tz },
        }
      : {
          start: { date: task.date },
          end:   { date: task.date },
        }),
    ...(task.priority ? { colorId: '11' } : {}),
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${googleToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  const data = await res.json();
  if (!res.ok) return { error: data.error?.message || 'שגיאה ביצירת אירוע' };
  return { data };
}
