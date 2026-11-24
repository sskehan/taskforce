// TaskForce reminder bot. Runs every hour on GitHub Actions and sends push reminders
// for jobs that are due, using the same rules as the app (logic.js).
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { shouldNotify, nowIn, daysUntil, niceDate, TZ } from '../logic.js';

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

const jobs = (await db.collection('jobs').get()).docs.map(d => ({ ...d.data(), id: d.id }));
const due = jobs.filter(j => shouldNotify(j, now));
console.log(`${jobs.length} jobs, ${due.length} reminder(s) due now`);

// Group by person so a busy day is one tidy notification, not a flood.
const perPerson = {};
for (const j of due) {
  const keys = !j.assignee || j.assignee === 'either' ? Object.keys(users) : [j.assignee];
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
for (const j of due) await db.collection('jobs').doc(j.id).update({ notify: { due: j.nextDue, last: now.date } });
await db.collection('settings').doc('bot').set({ lastRun: new Date().toISOString(), lastSent: due.length }, { merge: true });
console.log('Done.');
