// TaskForce schedule logic. Pure functions, shared by the app and the reminder bot.
// Dates are plain 'YYYY-MM-DD' strings so time zones never shift a due date.

export const TZ = 'Australia/Sydney';
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function parse(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
export function fmt(d) {
  return d.toISOString().slice(0, 10);
}
export function addDays(s, n) {
  const d = parse(s);
  d.setUTCDate(d.getUTCDate() + n);
  return fmt(d);
}
export function addMonths(s, n) {
  const d = parse(s);
  const day = d.getUTCDate();
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, last));
  return fmt(target);
}
export function addInterval(s, n, unit) {
  n = Number(n) || 1;
  switch (unit) {
    case 'days': return addDays(s, n);
    case 'weeks': return addDays(s, n * 7);
    case 'months': return addMonths(s, n);
    case 'years': return addMonths(s, n * 12);
    default: return addDays(s, n);
  }
}
export function daysBetween(a, b) {
  return Math.round((parse(b) - parse(a)) / 86400000);
}
export function weekday(s) {
  return parse(s).getUTCDay();
}
export function snapToWeekday(s, dow) {
  if (dow === null || dow === undefined || dow === '') return s;
  const diff = (Number(dow) - weekday(s) + 7) % 7;
  return addDays(s, diff);
}

// Today's date and hour in Sydney (or another zone).
export function nowIn(tz = TZ, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(now);
  const get = t => parts.find(p => p.type === t).value;
  return { date: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')), minute: Number(get('minute')) };
}
export function today(tz = TZ, now = new Date()) {
  return nowIn(tz, now).date;
}

// ---- Status ----
export function daysUntil(job, t) {
  if (!job.nextDue) return null;
  return daysBetween(t, job.nextDue);
}
export function isOverdue(job, t) {
  return !!job.nextDue && job.nextDue < t;
}
export function bucket(job, t) {
  const n = daysUntil(job, t);
  if (n === null) return 'later';
  if (n < 0) return 'overdue';
  if (n <= 7) return 'week';
  if (n <= 30) return 'month';
  return 'later';
}
export function summary(jobs, t) {
  const s = { overdue: 0, week: 0, month: 0, later: 0, total: jobs.length };
  for (const j of jobs) s[bucket(j, t)]++;
  s.onTrack = s.total - s.overdue;
  s.score = s.total ? Math.round((s.onTrack / s.total) * 100) : 100;
  return s;
}
// How many more ticks to reach the next 10% step, for the "knock off N" nudge.
export function nudge(s) {
  if (!s.overdue) return null;
  const n = Math.min(3, s.overdue);
  const score = Math.round(((s.onTrack + n) / s.total) * 100);
  return { n, score };
}

// Missed scheduled dates for an overdue job (fixed schedules list each one).
export function missedDates(job, t, cap = 12) {
  if (!isOverdue(job, t)) return [];
  if (job.countFrom !== 'fixed') return [job.nextDue];
  const out = [];
  let d = job.nextDue;
  while (d < t && out.length < cap) {
    out.push(d);
    d = addInterval(d, job.every, job.unit);
  }
  return out;
}

// ---- Completing, skipping, extending ----
// Next due date after the job is done (or skipped) on doneDate.
export function nextDueAfter(job, doneDate) {
  if (job.countFrom === 'fixed') {
    let d = job.nextDue || doneDate;
    d = addInterval(d, job.every, job.unit);
    let guard = 0;
    while (d <= doneDate && guard++ < 1000) d = addInterval(d, job.every, job.unit);
    return d;
  }
  return snapToWeekday(addInterval(doneDate, job.every, job.unit), job.onDay);
}

// "Still good": push the due date out from the later of the due date and today.
export function extendDue(job, n, unit, t) {
  const base = job.nextDue && job.nextDue > t ? job.nextDue : t;
  return addInterval(base, n, unit);
}

// Express a span of days as the neatest interval.
export function daysToInterval(days) {
  if (days % 365 === 0) return { every: days / 365, unit: 'years' };
  if (days >= 28 && days % 30 <= 1 && days < 365) return { every: Math.round(days / 30.4) || 1, unit: 'months' };
  if (days % 7 === 0) return { every: days / 7, unit: 'weeks' };
  return { every: days, unit: 'days' };
}

// ---- Reminders ----
export const REMIND_OFFSET = { due: 0, '1d': 1, '3d': 3, '1w': 7, none: null };
export const REMIND_GAP = { never: null, daily: 1, '2d': 2, '3d': 3, weekly: 7 };

// Should a reminder go out now? now = {date, hour}. job.notify = {due, last} from the last send.
export function shouldNotify(job, now) {
  if (!job.nextDue) return false;
  const offset = REMIND_OFFSET[job.remindWhen ?? 'due'];
  if (offset === null || offset === undefined) return false;
  const start = addDays(job.nextDue, -offset);
  if (now.date < start) return false;
  const hour = Number(String(job.remindTime || '18:00').split(':')[0]);
  if (now.hour < hour) return false;
  const st = job.notify || {};
  if (st.due !== job.nextDue || !st.last) return true;
  if (st.last >= now.date) return false;
  const gap = REMIND_GAP[job.remindAgain ?? '2d'];
  if (gap === null || gap === undefined) return false;
  return daysBetween(st.last, now.date) >= gap;
}

// ---- Wording ----
export function niceDate(s, t) {
  if (!s) return '';
  const d = parse(s);
  const base = `${DAY_NAMES[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
  if (t && s.slice(0, 4) !== t.slice(0, 4)) return `${base} ${s.slice(0, 4)}`;
  return base;
}
export function shortDate(s, t) {
  if (!s) return '';
  const d = parse(s);
  const base = `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
  if (t && s.slice(0, 4) !== t.slice(0, 4)) return `${base} ${s.slice(2, 4)}`;
  return base;
}
export function relDue(job, t) {
  const n = daysUntil(job, t);
  if (n === null) return 'No date';
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return '1 d late';
  if (n < 0) return `${-n} d late`;
  if (n < 7) return DAY_NAMES[weekday(job.nextDue)];
  return shortDate(job.nextDue, t);
}
const UNIT_ONE = { days: 'day', weeks: 'week', months: 'month', years: 'year' };
const UNIT_LY = { days: 'Daily', weeks: 'Weekly', months: 'Monthly', years: 'Yearly' };
export function intervalText(every, unit) {
  every = Number(every) || 1;
  if (every === 1) return `1 ${UNIT_ONE[unit] || unit}`;
  return `${every} ${unit}`;
}
export function repeatText(job) {
  const every = Number(job.every) || 1;
  let s = every === 1 ? UNIT_LY[job.unit] : `Every ${every} ${job.unit}`;
  if (job.onDay !== null && job.onDay !== undefined && job.onDay !== '') s += `, ${DAY_NAMES[job.onDay]}`;
  return s;
}
export function spanText(days) {
  if (days < 14) return `${days} d`;
  const m = Math.floor(days / 30.44);
  const w = Math.round((days - m * 30.44) / 7);
  if (m === 0) return `${Math.round(days / 7)} wks`;
  return w ? `${m} m ${w} w` : `${m} m`;
}

// ---- Events (v1.04) ----
// Occurrences of an event whose span touches [from, to]. Returns [{date, end}].
export function eventOccurrences(ev, from, to, cap = 400) {
  if (!ev || !ev.date) return [];
  const span = ev.endDate && ev.endDate > ev.date ? daysBetween(ev.date, ev.endDate) : 0;
  const out = [];
  const step = k => {
    switch (ev.repeat) {
      case 'weekly': return addDays(ev.date, 7 * k);
      case 'fortnightly': return addDays(ev.date, 14 * k);
      case 'monthly': return addMonths(ev.date, k);
      case 'yearly': return addMonths(ev.date, 12 * k);
      default: return k === 0 ? ev.date : null;
    }
  };
  for (let k = 0; k < cap; k++) {
    const d = step(k);
    if (!d || d > to) break;
    if (ev.until && d > ev.until) break;
    const end = addDays(d, span);
    if (end >= from) out.push({ date: d, end });
  }
  return out;
}
export function eventOnDate(ev, d) { return eventOccurrences(ev, d, d).length > 0; }

export const EVENT_REMIND = { none: 'No reminder', start: 'When it starts', '1h': '1 hour before', '1d': 'The day before', '1w': 'A week before' };
// Should an event reminder go now? Returns the occurrence date to record, or null.
export function eventReminderDue(ev, now, defHour = 18) {
  const r = ev.remind || 'none';
  if (r === 'none') return null;
  const startHour = ev.allDay !== false || !ev.start ? 7 : Number(String(ev.start).split(':')[0]);
  const occs = eventOccurrences(ev, now.date, addDays(now.date, 8));
  for (const o of occs) {
    if (o.date < now.date) continue; // already started
    let tDate = o.date, tHour = startHour;
    if (r === '1h') tHour = Math.max(0, startHour - 1);
    if (r === '1d') { tDate = addDays(o.date, -1); tHour = defHour; }
    if (r === '1w') { tDate = addDays(o.date, -7); tHour = defHour; }
    const reached = now.date > tDate || (now.date === tDate && now.hour >= tHour);
    if (reached && (!ev.notify || ev.notify.occ !== o.date)) return o.date;
  }
  return null;
}
// People who are "away" today (reminders for jobs are paused for them).
export function awayPeople(events, day, allKeys) {
  const set = new Set();
  for (const ev of events) {
    if (!ev.away || !eventOnDate(ev, day)) continue;
    if (ev.visibility === 'private' && ev.owner) set.add(ev.owner); else allKeys.forEach(k => set.add(k));
  }
  return set;
}
// Project prep reminders due now.
export function prepDue(p, now, defHour = 18) {
  return (p.prep || []).filter(x => !x.done && !x.notified && x.date && (now.date > x.date || (now.date === x.date && now.hour >= defHour)));
}
// Hours shown as hours, days or weeks.
export function hoursText(h, unit = 'hours', perDay = 6, daysPerWeek = 5) {
  h = Math.round((Number(h) || 0) * 10) / 10;
  if (unit === 'days') { const d = Math.round((h / perDay) * 10) / 10; return `${d} d`; }
  if (unit === 'weeks') { const w = Math.round((h / (perDay * daysPerWeek)) * 10) / 10; return `${w} wk${w === 1 ? '' : 's'}`; }
  return `${h} h`;
}
export function toHours(n, unit, perDay = 6, daysPerWeek = 5) {
  n = Number(n) || 0;
  if (unit === 'days') return n * perDay;
  if (unit === 'weeks') return n * perDay * daysPerWeek;
  return n;
}
export function spanHours(start, end) {
  if (!start || !end) return 0;
  const [a, b] = [start, end].map(t => { const [h, m] = t.split(':').map(Number); return h + (m || 0) / 60; });
  return Math.max(0, Math.round((b - a) * 10) / 10);
}
// Future dates a repeating job lands on, for the calendar (fixed: exact; done-based: expected).
export function jobDatesBetween(job, from, to, cap = 60) {
  if (!job.nextDue) return [];
  const out = []; let d = job.nextDue, k = 0;
  while (d <= to && k++ < cap) { if (d >= from) out.push(d); d = addInterval(d, job.every, job.unit); }
  return out;
}
// Project tasks with a due date that haven't been ticked off (v1.05).
export function tasksDue(p, now, defHour = 18) {
  return (p.steps || []).filter(x => !x.done && !x.notified && x.due && (now.date > x.due || (now.date === x.due && now.hour >= defHour)));
}
