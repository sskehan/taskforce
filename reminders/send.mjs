// TaskForce reminder bot. Runs every hour on GitHub Actions and sends push reminders
// for jobs, calendar events and project prep, using the same rules as the app (logic.js).
// Job reminders pause for anyone marked away on the calendar.
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { shouldNotify, nowIn, daysUntil, niceDate, TZ, eventReminderDue, awayPeople, prepDue, tasksDue, addDays } from '../logic.js';

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
if (!sa.project_id) { console.error('FIREBASE_SERVICE_ACCOUNT secret is missing.'); process.exit(1); }
initializeApp({ credential: cert(sa) });
const db = getFirestore();
const fcm = getMessaging();
const APP_URL = process.env.APP_URL || '';
const TEST = process.env.TEST === 'true';

const now = nowIn(TZ);
console.log(`Sydney time ${now.date} ${now.hour}:${String(now.minute).padStart(2, '0')}`);

const users = {};
for (const d of (await db.collection('users').get()).docs) users[d.id] = { ...d.data(), id: d.id };

async function sendTo(keys, data) {
  let sent = 0;
  for (const k of keys) {
    const u = users[k]; const tokens = [...new Set(u?.tokens || [])];
    if (!tokens.length) { console.log(`  no phone registered for ${k}`); continue; }
    const res = await fcm.sendEachForMulticast({
      tokens, data: Object.fromEntries(Object.entries(data).map(([a, b]) => [a, String(b ?? '')])),
      webpush: { headers: { Urgency: 'high', TTL: '86400' } }
    });
    const dead = [];
    res.responses.forEach((r, i) => {
      if (r.success) sent++;
      else { console.log(`  failed for ${k}: ${r.error?.code}`); if (['messaging/registration-token-not-registered', 'messaging/invalid-argument', 'messaging/invalid-registration-token'].includes(r.error?.code)) dead.push(tokens[i]); }
    });
    if (dead.length) await db.collection('users').doc(k).update({ tokens: FieldValue.arrayRemove(...dead) });
  }
  return sent;
}

if (TEST) {
  const n = await sendTo(Object.keys(users), { title: 'TaskForce test', body: 'Reminders are working on this phone.', hash: '#/home', tag: 'test' });
  console.log(`Test sent to ${n} phone(s).`);
  process.exit(0);
}

const all = async c => (await db.collection(c).get()).docs.map(d => ({ ...d.data(), id: d.id }));
const [jobs, events, projects] = await Promise.all([all('jobs'), all('events'), all('projects')]);
const appSet = (await db.collection('settings').doc('app').get()).data() || {};
const defHour = Number(String(appSet.defaultTime || '18:00').split(':')[0]) || 18;
const everyone = Object.keys(users);
const away = awayPeople(events, now.date, everyone);
if (away.size) console.log(`Away today: ${[...away].join(', ')} (job reminders paused)`);
const due = jobs.filter(j => shouldNotify(j, now));
console.log(`${jobs.length} jobs, ${due.length} reminder(s) due now`);

// Group by person so a busy day is one tidy notification, not a flood.
const perPerson = {};
for (const j of due) {
  const keys = (!j.assignee || j.assignee === 'either' ? everyone : [j.assignee]).filter(k => !away.has(k));
  j._sent = keys.length > 0;
  for (const k of keys) (perPerson[k] = perPerson[k] || []).push(j);
}
const line = j => {
  const n = daysUntil(j, now.date);
  if (n < 0) return `${-n} d late`;
  if (n === 0) return 'due today';
  if (n === 1) return 'due tomorrow';
  return `due ${niceDate(j.nextDue, now.date)}`;
};
for (const [k, list] of Object.entries(perPerson)) {
  if (list.length <= 3) {
    for (const j of list) {
      const title = j.type === 'item' ? `${j.name}: time to replace?` : j.name;
      const body = j.type === 'item' ? `${line(j)} · Replaced or still good?` : `${line(j)} · tap Done when it’s sorted`;
      await sendTo([k], { title, body, jobId: j.id, kind: j.type || 'job', tag: j.id });
    }
  } else {
    const names = list.slice(0, 3).map(j => j.name).join(', ');
    await sendTo([k], { title: `${list.length} jobs need you`, body: `${names} +${list.length - 3} more`, hash: '#/jobs', tag: 'summary' });
  }
}
for (const j of due.filter(j => j._sent)) await db.collection('jobs').doc(j.id).update({ notify: { due: j.nextDue, last: now.date } });

// Calendar events
let evSent = 0;
for (const ev of events) {
  const occ = eventReminderDue(ev, now, defHour); if (!occ) continue;
  const keys = ev.visibility === 'private' && ev.owner ? [ev.owner] : everyone;
  const when = occ === now.date ? (ev.allDay === false && ev.start ? `today at ${ev.start}` : 'today') : occ === addDays(now.date, 1) ? 'tomorrow' : niceDate(occ, now.date);
  await sendTo(keys, { title: ev.title, body: `${ev.type || 'Event'} · ${when}`, hash: '#/calendar', tag: 'ev-' + ev.id });
  await db.collection('events').doc(ev.id).update({ notify: { occ, last: now.date } }); evSent++;
}
// Project "get ready" reminders
let prepSent = 0;
let taskSent = 0;
for (const p of projects) {
  // A "just me" project only ever reminds its owner.
  const priv = p.visibility === 'private' && p.owner;
  const projKeys = priv ? [p.owner] : !p.assignee || p.assignee === 'either' ? everyone : [p.assignee];
  const upd = {};
  const list = prepDue(p, now, defHour);
  if (list.length) {
    for (const x of list) await sendTo(projKeys, { title: `Get ready: ${x.text}`, body: `For ${p.name}`, hash: '#/project/' + p.id, tag: 'prep-' + p.id });
    upd.prep = (p.prep || []).map(x => list.some(y => y.text === x.text && y.date === x.date) ? { ...x, notified: true } : x);
    prepSent += list.length;
  }
  const tl = tasksDue(p, now, defHour);
  if (tl.length) {
    for (const x of tl) {
      const keys = priv ? [p.owner] : x.who && x.who !== 'either' ? [x.who] : projKeys;
      const late = x.due < now.date;
      await sendTo(keys, { title: x.text, body: `${p.name} · ${late ? 'was due ' + niceDate(x.due, now.date) : 'due today'}`, hash: '#/project/' + p.id, tag: 'task-' + p.id });
    }
    upd.steps = (p.steps || []).map(x => tl.includes(x) ? { ...x, notified: true } : x);
    taskSent += tl.length;
  }
  if (Object.keys(upd).length) await db.collection('projects').doc(p.id).update(upd);
}
console.log(`${evSent} event reminder(s), ${prepSent} prep reminder(s), ${taskSent} task reminder(s)`);
await db.collection('settings').doc('bot').set({ lastRun: new Date().toISOString(), lastSent: due.length + evSent + prepSent + taskSent }, { merge: true });
console.log('Done.');
