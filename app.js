import * as L from './logic.js';
import { createStore, DEMO } from './store.js';
import { DEFAULT_CATEGORIES } from './seed.js';

export const VERSION = '1.04';
const store = createStore();
const S = { me: null, jobs: [], history: [], projects: [], events: [], cal: null, edProj: null, edEv: null, settings: { categories: DEFAULT_CATEGORIES, defaultTime: '18:00' }, filter: 'all', search: null, loaded: false, sheet: null, pending: null, editing: null };
const $app = document.getElementById('app');

// ---------- icons ----------
const sv = (p, w = 2.2) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const I = {
  house: sv('<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>'),
  car: sv('<path d="M5 16V11l2-5h10l2 5v5"/><path d="M3 16h18v3H3z"/>'),
  paw: sv('<circle cx="6" cy="10" r="2"/><circle cx="10" cy="5.5" r="2"/><circle cx="15" cy="5.5" r="2"/><circle cx="19" cy="10" r="2"/><path d="M7.5 18c0-3.5 2-6 5-6s5 2.5 5 6c0 1.8-2 2.6-5 2.6s-5-.8-5-2.6z"/>'),
  mask: sv('<path d="M4 12c0-4 3-7 8-7s8 3 8 7-3 7-8 7"/><circle cx="12" cy="12" r="2.5"/>'),
  battery: sv('<rect x="3" y="7" width="16" height="10" rx="2"/><path d="M21 10v4M7 10l-1 4M11 10l-1 4"/>'),
  tag: sv('<path d="M20 12l-8 8-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1.5"/>'),
  tick: sv('<path d="M5 12l5 5L20 7"/>', 3),
  plus: sv('<path d="M12 5v14M5 12h14"/>', 2.4),
  back: sv('<path d="M15 18l-6-6 6-6"/>', 2.4),
  home: sv('<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>'),
  jobs: sv('<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>'),
  items: sv('<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/>'),
  clock: sv('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  search: sv('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),
  edit: sv('<path d="M4 20h4L19 9l-4-4L4 16z"/>'),
  starO: sv('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>', 2),
  starF: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>`,
  sun: sv('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>', 2),
  bell: sv('<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>', 2),
  cal: sv('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>', 2),
  repeat: sv('<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>', 2),
  user: sv('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>', 2),
  camera: sv('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>', 2),
  trash: sv('<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 11v6M14 11v6"/>', 2),
  skip: sv('<path d="M5 5l7 7-7 7M13 5l7 7-7 7"/>', 2.4),
  ext: sv('<path d="M12 5v14M5 12h14"/>', 2.6),
  miss: sv('<circle cx="12" cy="12" r="8"/><path d="M9 9l6 6M15 9l-6 6"/>', 2.4),
  proj: sv('<path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M9 21v-6h6v6"/>'),
  tool: sv('<path d="M14 7l3-3 3 3-3 3"/><path d="M17 7L5 19"/>'),
  film: sv('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 9h4M17 9h4M3 15h4M17 15h4"/>'),
  plane: sv('<path d="M2 16l20-8-6 12-3-5z"/><path d="M13 15l-3 5"/>'),
  event: sv('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M8 15h3"/>', 2),
  dollar: sv('<path d="M12 3v18M17 7H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H7"/>', 2),
  timer: sv('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>', 2),
  left: sv('<path d="M15 18l-6-6 6-6"/>', 2.4), right: sv('<path d="M9 6l6 6-6 6"/>', 2.4),
  gear: sv('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>', 2)
};
const COLORS = ['terra', 'slate', 'wattle', 'gum', 'ochre', 'ink'];
const COLOR_NAMES = { terra: 'Terracotta', slate: 'Slate', wattle: 'Wattle', gum: 'Gum leaf', ochre: 'Ochre', ink: 'Navy' };
const ICONS = ['house', 'car', 'paw', 'mask', 'battery', 'tag', 'tool', 'film', 'plane'];

export function shieldSvg(size = 40) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="24" fill="#FBF6EC"/><clipPath id="sh${size}"><path d="M50 12l34 12v28c0 20-16 32-34 38c-18-6-34-18-34-38V24z"/></clipPath><g clip-path="url(#sh${size})"><rect x="10" y="8" width="40" height="44" fill="#C8553D"/><rect x="50" y="8" width="40" height="44" fill="#6B8F47"/><rect x="10" y="52" width="40" height="44" fill="#E9C46A"/><rect x="50" y="52" width="40" height="44" fill="#3D5A6C"/></g><circle cx="50" cy="50" r="17" fill="#FBF6EC"/><path d="M42 51l6 6 11-12" fill="none" stroke="#2D2A26" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

// ---------- helpers ----------
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const T = () => L.today();
const nowIso = () => new Date().toISOString();
const clone = o => JSON.parse(JSON.stringify(o));
const cats = () => (S.settings.categories && S.settings.categories.length ? S.settings.categories : DEFAULT_CATEGORIES);
const cat = id => cats().find(c => c.id === id) || { id, name: id || 'Other', color: 'ink', icon: 'tag' };
const person = k => (k === 'either' || !k) ? { key: 'either', name: 'Either' } : (store.people.find(p => p.key === k) || { key: k, name: k });
const isItem = j => j.type === 'item';
const intervalDays = j => ({ days: 1, weeks: 7, months: 30.44, years: 365.25 }[j.unit] || 1) * (Number(j.every) || 1);
const mine = j => !j.assignee || j.assignee === 'either' || j.assignee === S.me?.key;
const inMyDay = j => j.myDay && j.myDay[S.me?.key] === T();
const byDue = (a, b) => (a.nextDue || '9999').localeCompare(b.nextDue || '9999') || a.name.localeCompare(b.name);
const findJob = id => S.jobs.find(j => j.id === id);

function badge(j, sm) {
  const c = cat(j.category);
  return `<span class="badge ${sm ? 'sm' : ''} c-${c.color}">${I[c.icon] || I.tag}</span>`;
}
function pill(j, t) {
  const n = L.daysUntil(j, t);
  const cls = n === null ? 'p-ok' : n < 0 ? 'p-late' : n <= 7 ? 'p-soon' : 'p-ok';
  return `<span class="pill ${cls}">${esc(L.relDue(j, t))}</span>`;
}
function subLine(j, t) {
  const bits = [];
  if (isItem(j)) bits.push(j.lastDone ? `Replace · ${L.daysBetween(j.lastDone, t)} days in` : 'Replace');
  else bits.push(L.repeatText(j));
  if (j.steps?.length) bits.push(`${j.steps.filter(s => s.done).length}/${j.steps.length} steps`);
  if (inMyDay(j)) bits.push('My Day');
  if (j.assignee && j.assignee !== 'either' && j.assignee !== S.me?.key) bits.push(person(j.assignee).name);
  return bits.join(' · ');
}
function jobCard(j, t) {
  return `<div class="card" data-act="open" data-id="${j.id}" role="button" tabindex="0">
    <button class="tick" data-act="quick" data-id="${j.id}" aria-label="${isItem(j) ? 'Mark replaced' : 'Mark done'}: ${esc(j.name)}">${I.tick}</button>
    ${badge(j)}
    <div class="ct"><div class="t">${esc(j.name)}${j.important ? ` <span class="star" aria-label="Important">★</span>` : ''}</div><div class="s">${esc(subLine(j, t))}</div></div>
    ${pill(j, t)}</div>`;
}
function ring(pct, size, color, track, label, sub) {
  const r = size * 0.4, c = 2 * Math.PI * r, d = Math.max(0, Math.min(1, pct)) * c;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(label)} ${esc(sub || '')}" style="flex:none">
  <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${track}" stroke-width="${size * 0.11}"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${size * 0.11}" stroke-linecap="round" stroke-dasharray="${d} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
  <text x="50%" y="${sub ? '50%' : '55%'}" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="${size * 0.24}" fill="currentColor">${esc(label)}</text>
  ${sub ? `<text x="50%" y="${size * 0.68}" text-anchor="middle" font-family="DM Sans,sans-serif" font-weight="700" font-size="${size * 0.1}" fill="currentColor" opacity=".8">${esc(sub)}</text>` : ''}</svg>`;
}
const NAV = [['home', 'home', 'Home', ['home', 'settings']], ['jobs', 'jobs', 'Jobs', ['jobs', 'items', 'history', 'job', 'edit', 'new']], ['projects', 'proj', 'Projects', ['projects', 'project', 'pedit', 'pnew']], ['calendar', 'cal', 'Calendar', ['calendar', 'event']]];
const nav = () => { const v = route().parts[0] || 'home'; return `<nav class="nav" aria-label="Main">${NAV.map(([r, icon, label, owns]) => `<button class="${owns.includes(v) ? 'on' : ''}" data-act="go" data-to="#/${r}">${I[icon]}${label}</button>`).join('')}</nav>`; };
const jobsSeg = cur => `<div class="seg" style="margin:0 0 10px" role="tablist">${[['jobs', 'Jobs', S.jobs.length], ['items', 'Items', S.jobs.filter(isItem).length], ['history', 'History', '']].map(([k, l, n]) => `<button class="${cur === k ? 'on' : ''}" role="tab" aria-selected="${cur === k}" data-act="go" data-to="#/${k}">${l}${n !== '' ? ' ' + n : ''}</button>`).join('')}</div>`;
const avatars = () => `<button class="avs" data-act="go" data-to="#/settings" aria-label="Settings" style="border:0;background:none;padding:0">${store.people.map(p => `<span class="av ${p.key}">${esc(p.name[0])}</span>`).join('')}</button>`;
function greeting() {
  const h = L.nowIn().hour;
  return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
}

// ---------- views ----------
function viewHome() {
  const t = T(), jobs = S.jobs, s = L.summary(jobs, t), nd = L.nudge(s);
  const overdue = jobs.filter(j => L.isOverdue(j, t)).sort((a, b) => intervalDays(a) - intervalDays(b) || a.nextDue.localeCompare(b.nextDue));
  const coming = jobs.filter(j => !L.isOverdue(j, t)).sort(byDue).slice(0, 8);
  const itemCats = [...new Set(jobs.filter(isItem).map(j => j.category))];
  const dateTxt = new Intl.DateTimeFormat('en-AU', { weekday: 'long', day: 'numeric', month: 'long', timeZone: L.TZ }).format(new Date());
  return `<div class="wrap">
  <div class="brand">${shieldSvg(34)}<span class="hd">TaskForce</span></div>
  <div class="top" style="padding-top:6px"><div><div class="sub">${esc(dateTxt)}</div><h1>${greeting()}, ${esc(S.me.name)}</h1></div>${avatars()}</div>
  ${DEMO ? `<div class="banner">Demo mode: data stays on this phone until Firebase is set up.</div>` : ''}
  <div class="hero" style="margin-top:10px">
    <svg class="deco" width="160" height="160" viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="70" fill="none" stroke="#C8553D" stroke-width="22"/></svg>
    <span style="color:#fff">${ring(s.score / 100, 96, '#C8553D', '#343B63', s.score + '%')}</span>
    <div><div class="t1">Home score</div><div class="t2">${s.onTrack} of ${s.total} jobs on track</div>
    ${nd ? `<span class="chipn">Knock off ${nd.n} to hit ${nd.score}%</span>` : `<span class="chipn">All on track. Nice!</span>`}</div>
  </div>
  <div class="stats">
    <button class="stat s-late" data-act="filter" data-f="overdue"><b>${s.overdue}</b><span>Overdue</span></button>
    <button class="stat s-week" data-act="filter" data-f="week"><b>${s.week}</b><span>7 days</span></button>
    <button class="stat s-month" data-act="filter" data-f="month"><b>${s.month}</b><span>30 days</span></button>
    <button class="stat s-later" data-act="filter" data-f="later"><b>${s.later}</b><span>Later</span></button>
  </div>
  ${overdue.length ? `<div class="lab">Quick wins <button data-act="filter" data-f="overdue">All overdue</button></div>
  <div class="list">${overdue.slice(0, 3).map(j => jobCard(j, t)).join('')}</div>` : ''}
  ${homeWeek(t)}
  ${homeProjects(t)}
  ${itemCats.map(c => {
    const its = jobs.filter(j => isItem(j) && j.category === c);
    const o = its.filter(j => L.isOverdue(j, t)).length, sn = its.filter(j => !L.isOverdue(j, t) && L.daysUntil(j, t) <= 7).length, f = its.length - o - sn;
    return `<div class="lab">${esc(cat(c).name)} parts</div><button class="health" data-act="go" data-to="#/items" style="border:0;width:100%;text-align:left">
      <div style="display:flex;justify-content:space-between;font-size:14px;width:100%"><b>${its.length} items</b><span class="hint">Tap to see</span></div>
      <div class="hbar" style="width:100%" role="img" aria-label="${o} overdue, ${sn} due soon, ${f} fine">${o ? `<span style="flex:${o};background:#C8553D"></span>` : ''}${sn ? `<span style="flex:${sn};background:#E9C46A"></span>` : ''}${f ? `<span style="flex:${f};background:#6B8F47"></span>` : ''}</div>
      <div class="legend"><span>${o} overdue</span><span>${sn} due soon</span><span>${f} fine</span></div></button>`;
  }).join('')}
  </div>${nav()}<button class="fab" data-act="go" data-to="#/new" aria-label="Add job">${I.plus}</button>`;
}

function filtered() {
  const t = T(); let list = S.jobs;
  const f = S.filter;
  if (f === 'myday') list = list.filter(inMyDay);
  else if (f === 'important') list = list.filter(j => j.important);
  else if (f === 'mine') list = list.filter(j => j.assignee === S.me.key);
  else if (['overdue', 'week', 'month', 'later'].includes(f)) list = list.filter(j => L.bucket(j, t) === f);
  else if (f.startsWith('cat:')) list = list.filter(j => j.category === f.slice(4));
  if (S.search) { const q = S.search.toLowerCase(); list = list.filter(j => j.name.toLowerCase().includes(q) || (j.notes || '').toLowerCase().includes(q)); }
  return list;
}
function viewJobs() {
  const t = T(), list = filtered().sort(byDue);
  const groups = [['overdue', 'Overdue'], ['week', 'Next 7 days'], ['month', 'Next 30 days'], ['later', 'Later']];
  const chip = (f, label, n) => `<button class="chip ${S.filter === f ? 'on' : ''}" data-act="filter" data-f="${f}">${esc(label)}${n !== undefined ? ' ' + n : ''}</button>`;
  const doneToday = S.history.filter(h => h.date === t && (h.kind === 'done' || h.kind === 'replaced'));
  const bucketChip = ['overdue', 'week', 'month', 'later'].includes(S.filter) ? chip(S.filter, { overdue: 'Overdue', week: 'Next 7 days', month: 'Next 30 days', later: 'Later' }[S.filter]) : '';
  return `<div class="wrap">
  <div class="top"><h1>Jobs</h1><button class="iconbtn" data-act="search" aria-label="Search">${I.search}</button></div>
  ${jobsSeg('jobs')}
  ${S.search !== null ? `<div style="margin-bottom:8px"><input class="field" id="q" placeholder="Search jobs" value="${esc(S.search)}" aria-label="Search jobs" autofocus></div>` : ''}
  <div class="chips">${bucketChip}${chip('all', 'All', S.jobs.length)}${chip('myday', 'My Day', S.jobs.filter(inMyDay).length)}${chip('important', '★ Important', S.jobs.filter(j => j.important).length)}${chip('mine', 'Mine', S.jobs.filter(j => j.assignee === S.me.key).length)}
  ${cats().map(c => chip('cat:' + c.id, c.name, S.jobs.filter(j => j.category === c.id).length)).join('')}</div>
  ${list.length ? groups.map(([b, label]) => {
    const g = list.filter(j => L.bucket(j, t) === b);
    return g.length ? `<div class="lab">${label} · ${g.length}</div><div class="list">${g.map(j => jobCard(j, t)).join('')}</div>` : '';
  }).join('') : `<div class="empty">${S.filter === 'myday' ? 'Nothing in My Day yet. Open a job and tap “Add to My Day”.' : 'No jobs here.'}</div>`}
  ${doneToday.length && S.filter === 'all' && !S.search ? `<div class="lab">Done today · ${doneToday.length}</div><div class="list">${doneToday.map(h => `<div class="card done" data-act="open" data-id="${h.jobId}" role="button" tabindex="0"><span class="tick on">${I.tick}</span><div class="ct"><div class="t" style="text-decoration:line-through;color:var(--gum-d)">${esc(h.jobName)}</div><div class="s" style="color:var(--gum-d)">${esc(person(h.by).name)}${h.nextDue ? ' · next ' + esc(L.niceDate(h.nextDue, t)) : ''}</div></div></div>`).join('')}</div>` : ''}
  </div>${nav()}<button class="fab" data-act="go" data-to="#/new" aria-label="Add job">${I.plus}</button>`;
}

function viewItems() {
  const t = T(), items = S.jobs.filter(isItem).sort(byDue);
  const cs = [...new Set(items.map(j => j.category))];
  return `<div class="wrap">
  <div class="top"><div><div class="sub">Things that wear out</div><h1>Jobs</h1></div></div>
  ${jobsSeg('items')}
  ${cs.map(c => `<div class="lab">${esc(cat(c).name)} · ${items.filter(j => j.category === c).length}</div><div class="list">${items.filter(j => j.category === c).map(j => {
    const used = j.lastDone ? L.daysBetween(j.lastDone, t) : 0, life = j.lastDone && j.nextDue ? Math.max(1, L.daysBetween(j.lastDone, j.nextDue)) : intervalDays(j);
    const pct = Math.min(1, used / life), n = L.daysUntil(j, t);
    const col = n < 0 ? '#C8553D' : n <= 7 ? '#E9C46A' : '#6B8F47';
    return `<button class="card" data-act="open" data-id="${j.id}" style="flex-direction:column;align-items:stretch;gap:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><span class="t" style="font-weight:700">${esc(j.name)}</span>${pill(j, t)}</div>
      <div class="hbar"><span style="width:${Math.round(pct * 100)}%;background:${col}"></span></div>
      <div class="s" style="font-size:12px;color:var(--muted)">${j.lastDone ? 'Fitted ' + esc(L.shortDate(j.lastDone, t)) + ' · ' : ''}life ${esc(L.intervalText(j.every, j.unit))}</div></button>`;
  }).join('')}</div>`).join('') || `<div class="empty">No items yet. Add one with + and choose “Item to replace”.</div>`}
  <div class="lab"></div><button class="card" data-act="go" data-to="#/new?type=item" style="justify-content:center;color:var(--terra-d);font-weight:700;border:1.5px dashed #CFC6B4;box-shadow:none;background:transparent">+ Add an item</button>
  </div>${nav()}`;
}

const KIND = {
  done: { icon: 'tick', cls: 'c-gum', verb: 'ticked off' },
  replaced: { icon: 'tick', cls: 'c-gum', verb: 'replaced' },
  skipped: { icon: 'skip', cls: 'c-ink', verb: 'skipped' },
  extended: { icon: 'ext', cls: 'c-wattle', verb: 'extended' },
  created: { icon: 'plus', cls: 'c-slate', verb: 'added' }
};
function histRow(h, withJob) {
  const k = KIND[h.kind] || KIND.done, t = T();
  const who = person(h.by).name;
  let title = withJob ? `${who} ${k.verb} ${h.jobName}` : ({ done: 'Done', replaced: 'Replaced', skipped: 'Skipped', extended: `Extended +${h.amount || ''}`, created: 'Added' }[h.kind] || h.kind);
  const bits = [L.niceDate(h.date, t)];
  if (!withJob) bits.push(who);
  if (h.steps) bits.push(h.steps + ' steps');
  if (h.lasted) bits.push('old one lasted ' + L.spanText(h.lasted));
  if (h.late > 0) bits.push(h.late + ' d late');
  if (withJob && h.kind === 'extended' && h.amount) title += ` (+${h.amount})`;
  return `<div class="ev"><span class="dot ${k.cls}">${I[k.icon]}</span><div><div class="et">${esc(title)}</div><div class="es">${esc(bits.join(' · '))}${h.note ? ' · “' + esc(h.note) + '”' : ''}</div></div></div>`;
}
function viewHistory() {
  const groups = {};
  for (const h of S.history) (groups[h.date] = groups[h.date] || []).push(h);
  const t = T();
  return `<div class="wrap"><div class="top"><div><div class="sub">Who did what</div><h1>Jobs</h1></div></div>
  ${jobsSeg('history')}
  ${Object.keys(groups).sort().reverse().slice(0, 60).map(d => `<div class="lab">${d === t ? 'Today' : esc(L.niceDate(d, t))}</div><div class="box">${groups[d].map(h => histRow(h, true)).join('')}</div>`).join('') || '<div class="empty">Nothing yet. Ticks, skips and extensions show up here.</div>'}
  </div>${nav()}`;
}

function viewDetail(id) {
  const j = findJob(id), t = T();
  if (!j) return `<div class="wrap"><div class="top"><button class="iconbtn" data-act="back" aria-label="Back">${I.back}</button></div><div class="empty">That job has been deleted.</div></div>${nav()}`;
  const c = cat(j.category), n = L.daysUntil(j, t), late = L.isOverdue(j, t), missed = L.missedDates(j, t);
  const hist = S.history.filter(h => h.jobId === j.id);
  const next = L.nextDueAfter(j, t);
  const lasted = hist.filter(h => h.lasted).map(h => h.lasted);
  const avg = lasted.length ? Math.round(lasted.reduce((a, b) => a + b, 0) / lasted.length) : null;
  let head;
  if (isItem(j)) {
    const used = j.lastDone ? L.daysBetween(j.lastDone, t) : 0, life = j.lastDone && j.nextDue ? Math.max(1, L.daysBetween(j.lastDone, j.nextDue)) : intervalDays(j);
    const pct = n === null ? 0 : n <= 0 ? 1 : used / life;
    const label = n === null ? '–' : n < 0 ? `${-n}` : n === 0 ? 'Due' : `${n}`;
    const sub = n === null ? '' : n < 0 ? 'DAYS OVER' : n === 0 ? 'TODAY' : 'DAYS LEFT';
    head = `<div style="display:flex;align-items:center;gap:16px"><span style="color:var(--ink);background:#fff;border-radius:50%">${ring(pct, 104, n !== null && n <= 0 ? '#B5462F' : '#4A6B2E', '#fff', label, sub)}</span>
      <div><div class="sub" style="font-weight:700">${esc(c.name)}</div><h1 class="hd" style="margin:0;font-size:30px;line-height:1.05">${esc(j.name)}</h1>
      <div style="font-size:13px;margin-top:6px">${j.lastDone ? `Fitted <b>${esc(L.niceDate(j.lastDone, t))}</b><br>` : ''}Next swap <b>${esc(L.niceDate(j.nextDue, t))}</b></div></div></div>
      <div class="btns"><button class="btn" data-act="complete" data-id="${j.id}" data-kind="replaced">Replaced</button><button class="btn alt" style="box-shadow:none" data-act="extend" data-id="${j.id}">Still good…</button></div>`;
  } else {
    head = `<div class="dtitle"><button class="tick" style="width:34px;height:34px;margin-top:2px" data-act="complete" data-id="${j.id}" data-kind="done" aria-label="Mark done">${I.tick}</button><div><h1>${esc(j.name)}</h1><div class="sub" style="margin-top:4px">${esc(c.name)} · ${esc(L.repeatText(j))}</div></div></div>
      ${late ? `<div class="late"><div><div class="t">${-n} days late${missed.length > 1 ? ` · missed ${missed.slice(-3).map(d => L.shortDate(d, t)).join(', ')}` : ''}</div><div class="s">One job, not a pile of copies. Pick what happens next:</div></div>
      <div class="btns"><button class="btn" data-act="complete" data-id="${j.id}" data-kind="done">Done today<small>next ${esc(L.niceDate(next, t))}</small></button><button class="btn alt" style="box-shadow:inset 0 0 0 2px var(--late-d);color:#7A2406" data-act="complete" data-id="${j.id}" data-kind="skipped">Skip it<small>logged as skipped</small></button></div></div>`
      : `<div class="btns"><button class="btn" data-act="complete" data-id="${j.id}" data-kind="done">Mark done<small>next ${esc(L.niceDate(next, t))}</small></button><button class="btn alt" style="box-shadow:none" data-act="doneon" data-id="${j.id}">Done another day</button></div>`}`;
  }
  const remindTxt = { due: 'On the due day', '1d': '1 day before', '3d': '3 days before', '1w': '1 week before', none: 'No reminder' }[j.remindWhen || 'due'];
  const againTxt = { never: 'once', daily: 'then daily until done', '2d': 'then every 2 days until done', '3d': 'then every 3 days until done', weekly: 'then weekly until done' }[j.remindAgain || '2d'];
  return `<div class="wrap">
  <div class="dhead c-${c.color}" style="color:var(--ink)">
    <div class="dtop"><button class="iconbtn" data-act="back" aria-label="Back">${I.back}</button>
    <div style="display:flex;gap:8px"><button class="iconbtn" data-act="star" data-id="${j.id}" aria-label="${j.important ? 'Remove from important' : 'Mark important'}" style="color:${j.important ? '#B9832A' : 'var(--ink)'}">${j.important ? I.starF : I.starO}</button>
    <button class="iconbtn" data-act="go" data-to="#/edit/${j.id}" aria-label="Edit">${I.edit}</button></div></div>
    ${head}
  </div>
  ${isItem(j) ? `<div class="minis" style="margin-top:14px"><div class="mini"><b>${esc(L.intervalText(j.every, j.unit).replace(' months', ' m').replace(' month', ' m'))}</b><span>Normal life</span></div><div class="mini"><b style="color:var(--gum-d)">${avg ? esc(L.spanText(avg)) : '–'}</b><span>Your average</span></div><div class="mini"><b>${hist.filter(h => h.kind === 'replaced').length + (j.lastDone ? 1 : 0)}</b><span>Logged</span></div></div>` : ''}
  ${isItem(j) && !late ? `<div style="margin-top:8px"><button class="btn ghost" style="min-height:40px;font-size:13px" data-act="doneon" data-id="${j.id}">Replaced on another day…</button></div>` : ''}
  ${!isItem(j) || (j.steps && j.steps.length) ? `<div class="lab">Steps${j.steps?.length ? ` · ${j.steps.filter(s => s.done).length}/${j.steps.length}` : ''}</div>
  <div class="box">${(j.steps || []).map((s, i) => `<div class="step ${s.done ? 'on' : ''}"><button class="cb ${s.done ? 'on' : ''}" data-act="step" data-id="${j.id}" data-i="${i}" aria-label="Tick step">${I.tick}</button><span>${esc(s.text)}</span><button class="x" data-act="delstep" data-id="${j.id}" data-i="${i}" aria-label="Remove step">×</button></div>`).join('')}
  <form class="addstep" data-form="step" data-id="${j.id}"><input name="text" placeholder="Add step" aria-label="Add step" maxlength="120"><button class="iconbtn" aria-label="Add step" style="box-shadow:none;background:var(--soft)">${I.plus}</button></form></div>` : ''}
  <div class="lab"></div>
  <div class="box">
    <button class="row" data-act="myday" data-id="${j.id}">${I.sun.replace('<svg', '<svg class="ri"')}<span class="rt" style="${inMyDay(j) ? 'color:var(--gum-d);font-weight:700' : ''}">${inMyDay(j) ? 'Added to My Day' : 'Add to My Day'}</span>${inMyDay(j) ? '<span class="end">×</span>' : ''}</button>
  </div>
  <div class="lab"></div>
  <div class="box">
    <button class="row" data-act="go" data-to="#/edit/${j.id}">${I.bell.replace('<svg', '<svg class="ri"')}<div><div class="rt">${esc(remindTxt)}${j.remindWhen !== 'none' ? ', ' + esc(j.remindTime || '18:00') : ''}</div>${j.remindWhen !== 'none' ? `<div class="rs">${esc(againTxt)}</div>` : ''}</div></button>
    <label class="row">${I.cal.replace('<svg', '<svg class="ri" style="color:' + (late ? 'var(--late-d)' : 'var(--muted)') + '"')}<div style="flex:1"><div class="rt" style="${late ? 'color:var(--late-d)' : ''}">Due ${esc(L.niceDate(j.nextDue, t))}</div><div class="rs">Tap to change</div></div><input type="date" value="${esc(j.nextDue || '')}" data-change="due" data-id="${j.id}" aria-label="Change due date" style="opacity:0;width:1px;height:1px;position:absolute"></label>
    <button class="row" data-act="go" data-to="#/edit/${j.id}">${I.repeat.replace('<svg', '<svg class="ri"')}<div><div class="rt">${esc(L.repeatText(j))}</div><div class="rs">${j.countFrom === 'fixed' ? 'Fixed schedule' : 'Counted from when it’s done'}</div></div></button>
    <button class="row" data-act="go" data-to="#/edit/${j.id}">${I.user.replace('<svg', '<svg class="ri"')}<span class="rt">${j.assignee && j.assignee !== 'either' ? 'Assigned to ' + esc(person(j.assignee).name) : 'Shaun or Lyndsey'}</span></button>
  </div>
  <div class="lab"></div>
  <div class="box">
    ${j.photo ? `<div style="padding:10px"><img class="photo" src="${j.photo}" alt="Photo for ${esc(j.name)}"></div><button class="row" data-act="delphoto" data-id="${j.id}">${I.trash.replace('<svg', '<svg class="ri"')}<span class="rt">Remove photo</span></button>`
      : `<label class="row">${I.camera.replace('<svg', '<svg class="ri"')}<span class="rt" style="color:var(--muted)">Add photo</span><input type="file" accept="image/*" data-change="photo" data-id="${j.id}" style="display:none"></label>`}
    <textarea class="notes" placeholder="Add note" data-change="notes" data-id="${j.id}" aria-label="Notes">${esc(j.notes || '')}</textarea>
  </div>
  <div class="lab">History</div>
  <div class="box">${hist.map(h => histRow(h, false)).join('') || '<div class="empty" style="padding:16px">Each tick will log who, when and how many steps were done.</div>'}
  ${isItem(j) && j.lastDone && !hist.some(h => h.kind === 'replaced' && h.date === j.lastDone) ? `<div class="ev"><span class="dot c-gum">${I.tick}</span><div><div class="et">Replaced</div><div class="es">${esc(L.niceDate(j.lastDone, t))} · first entry</div></div></div>` : ''}</div>
  <div class="meta"><span>Added by ${esc(person(j.createdBy).name)}${j.createdAt ? ' on ' + esc(L.niceDate(j.createdAt.slice(0, 10), t)) : ''}</span><button class="iconbtn" style="box-shadow:none;background:none" data-act="delete" data-id="${j.id}" aria-label="Delete job">${I.trash}</button></div>
  </div>${nav()}`;
}

function viewEdit(id, params) {
  const t = T();
  if (!S.editing || S.editing._for !== (id || 'new')) {
    const src = id ? findJob(id) : null;
    S.editing = src ? clone(src) : { name: '', type: params.get('type') === 'item' ? 'item' : 'job', category: params.get('type') === 'item' ? 'cpap' : 'house', every: 1, unit: params.get('type') === 'item' ? 'months' : 'weeks', countFrom: params.get('type') === 'item' ? 'done' : 'fixed', onDay: null, nextDue: t, lastDone: params.get('type') === 'item' ? t : null, remindWhen: 'due', remindAgain: '2d', remindTime: S.settings.defaultTime || '18:00', assignee: 'either', important: false, steps: [], notes: '' };
    S.editing._for = id || 'new';
  }
  const e = S.editing;
  const opt = (v, label, cur) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(label)}</option>`;
  const segB = (field, v, label) => `<button type="button" class="${e[field] === v ? 'on' : ''}" data-act="seg" data-field="${field}" data-v="${v}">${esc(label)}</button>`;
  return `<div class="wrap"><form data-form="edit" data-id="${id || ''}" class="form" novalidate>
  <div class="fbar"><button type="button" data-act="back">Cancel</button><span class="hd" style="font-size:17px">${id ? 'Edit' : 'New'} ${e.type === 'item' ? 'item' : 'job'}</span><button class="save" type="submit">Save</button></div>
  <div class="grp"><label for="f-name">Name</label><input id="f-name" class="field" name="name" value="${esc(e.name)}" required maxlength="80" placeholder="${e.type === 'item' ? 'e.g. CPAP hose' : 'e.g. Clean bathroom'}"><div class="err" id="name-err" hidden>Give it a name first</div></div>
  <div class="grp"><span class="l">Type</span><div class="seg">${segB('type', 'job', 'Job')}${segB('type', 'item', 'Item to replace')}</div></div>
  <div class="grp"><label for="f-cat">Category</label><select id="f-cat" class="field" name="category">${cats().map(c => opt(c.id, c.name, e.category)).join('')}</select></div>
  <div class="grp"><span class="l">${e.type === 'item' ? 'Suggested life' : 'Repeat every'}</span><div class="inline"><input class="field" style="width:80px;text-align:center;font-weight:700" type="number" min="1" max="99" name="every" value="${esc(e.every)}" aria-label="Number" data-recalc><select class="field" name="unit" aria-label="Unit" data-recalc>${['days', 'weeks', 'months', 'years'].map(u => opt(u, u, e.unit)).join('')}</select></div></div>
  <div class="grp box" style="padding:8px 12px;gap:0"><span class="l" style="padding-top:4px">Next due is counted from</span>
    <label class="radio"><input type="radio" name="countFrom" value="done" data-recalc ${e.countFrom !== 'fixed' ? 'checked' : ''}><span>When it’s done<br><span class="hint">Done late? The next date moves with you.</span></span></label>
    <label class="radio"><input type="radio" name="countFrom" value="fixed" data-recalc ${e.countFrom === 'fixed' ? 'checked' : ''}><span>Fixed schedule<br><span class="hint">Stays on its set dates, however late it’s done.</span></span></label></div>
  <div class="grp"><label for="f-day">On day</label><select id="f-day" class="field" name="onDay" data-recalc>${opt('', 'Any day', e.onDay ?? '')}${L.DAY_NAMES.map((d, i) => opt(i, d, e.onDay ?? '')).join('')}</select></div>
  <div class="inline"><div class="grp" style="flex:1"><label for="f-due">Next due</label><input id="f-due" class="field" type="date" name="nextDue" value="${esc(e.nextDue || '')}"></div>
  <div class="grp" style="flex:1"><label for="f-last">${e.type === 'item' ? 'Last replaced' : 'Last done'}</label><input id="f-last" class="field" type="date" name="lastDone" value="${esc(e.lastDone || '')}" data-recalc></div></div>
  <div class="hint" id="due-hint" aria-live="polite" style="margin-top:-6px"></div>
  <div class="grp"><label for="f-rw">Remind me</label><select id="f-rw" class="field" name="remindWhen">${opt('due', 'On the due day', e.remindWhen)}${opt('1d', '1 day before', e.remindWhen)}${opt('3d', '3 days before', e.remindWhen)}${opt('1w', '1 week before', e.remindWhen)}${opt('none', 'No reminder', e.remindWhen)}</select></div>
  <div class="inline"><div class="grp" style="flex:1"><label for="f-ra">If not done, remind again</label><select id="f-ra" class="field" name="remindAgain">${opt('never', 'Never', e.remindAgain)}${opt('daily', 'Daily', e.remindAgain)}${opt('2d', 'Every 2 days', e.remindAgain)}${opt('3d', 'Every 3 days', e.remindAgain)}${opt('weekly', 'Weekly', e.remindAgain)}</select></div>
  <div class="grp" style="width:120px"><label for="f-rt">At</label><input id="f-rt" class="field" type="time" step="3600" name="remindTime" value="${esc(e.remindTime || '18:00')}"></div></div>
  <div class="grp"><span class="l">Whose job</span><div class="seg">${store.people.map(p => segB('assignee', p.key, p.name)).join('')}${segB('assignee', 'either', 'Either')}</div><span class="hint">Reminders go to that person. “Either” reminds you both.</span></div>
  <label class="check"><input type="checkbox" name="important" ${e.important ? 'checked' : ''}> Important (star)</label>
  <div class="grp"><label for="f-notes">Notes</label><textarea id="f-notes" class="field" name="notes">${esc(e.notes || '')}</textarea></div>
  <button class="btn terra" type="submit">Save</button>
  </form></div>`;
}

function viewSettings() {
  const ps = store.pushStatus();
  const pushTxt = { granted: 'On for this phone', denied: 'Blocked in phone settings', default: 'Not turned on yet', demo: 'Available once Firebase is set up', unsupported: 'Not supported in this browser' }[ps] || ps;
  return `<div class="wrap"><div class="top"><button class="iconbtn" data-act="back" aria-label="Back">${I.back}</button><h1 style="flex:1;margin-left:8px">Settings</h1></div>
  <div class="lab">You</div><div class="box">
    <div class="row"><span class="av ${S.me.key}" style="border:0">${esc(S.me.name[0])}</span><div><div class="rt">${esc(S.me.name)}</div><div class="rs">${DEMO ? 'Demo mode' : esc(S.me.email || '')}</div></div></div>
    ${DEMO ? `<div class="row"><span class="rt" style="flex:1">Try as</span><div class="seg" style="flex:1">${store.people.map(p => `<button class="${S.me.key === p.key ? 'on' : ''}" data-act="as" data-k="${p.key}">${esc(p.name)}</button>`).join('')}</div></div>`
      : `<button class="row" data-act="signout"><span class="rt" style="color:var(--late-d)">Sign out</span></button>`}
  </div>
  <div class="lab">Reminders</div><div class="box">
    <div class="row">${I.bell.replace('<svg', '<svg class="ri"')}<div style="flex:1"><div class="rt">Push reminders</div><div class="rs" id="pushst">${esc(pushTxt)}</div></div><button class="btn" style="flex:none;min-height:40px;font-size:13px" data-act="push">${ps === 'granted' ? 'Refresh' : 'Turn on'}</button></div>
    <label class="row"><span class="rt" style="flex:1">Project day (hours)</span><input class="field" style="width:80px;text-align:center" type="number" min="1" max="24" step="0.5" value="${perDay()}" data-change="perday"></label>
    <label class="row"><span class="rt" style="flex:1">Project week (days)</span><input class="field" style="width:80px;text-align:center" type="number" min="1" max="7" value="${perWeek()}" data-change="perweek"></label>
    <label class="row"><span class="rt" style="flex:1">Default reminder time</span><input class="field" style="width:120px" type="time" step="3600" value="${esc(S.settings.defaultTime || '18:00')}" data-change="deftime"></label>
  </div>
  <div class="lab">Categories</div><div class="box">
    ${cats().map((c, i) => `<div class="row"><span class="badge sm c-${c.color}">${I[c.icon] || I.tag}</span><span class="rt" style="flex:1">${esc(c.name)}</span><span class="end">${S.jobs.filter(j => j.category === c.id).length}</span>${S.jobs.some(j => j.category === c.id) ? '' : `<button class="x iconbtn" style="box-shadow:none;background:none;width:36px;height:36px" data-act="delcat" data-i="${i}" aria-label="Remove ${esc(c.name)}">×</button>`}</div>`).join('')}
    <form class="addstep" data-form="cat" style="flex-wrap:wrap"><input name="name" placeholder="New category" maxlength="20" aria-label="New category name" style="flex-basis:100%"><select name="color" class="field" style="width:auto;min-height:42px" aria-label="Colour">${COLORS.map(c => `<option value="${c}">${COLOR_NAMES[c]}</option>`).join('')}</select><select name="icon" class="field" style="width:auto;min-height:42px" aria-label="Icon">${ICONS.map(c => `<option value="${c}">${c}</option>`).join('')}</select><button class="iconbtn" aria-label="Add category" style="box-shadow:none;background:var(--soft)">${I.plus}</button></form>
  </div>
  <div class="lab">Your data</div><div class="box">
    <button class="row" data-act="export"><span class="rt">Back up to a file</span><span class="end">.json</span></button>
    <label class="row"><span class="rt">Restore from a backup file</span><input type="file" accept=".json,application/json" data-change="import" style="display:none"></label>
    ${!S.jobs.length ? `<button class="row" data-act="starter"><span class="rt" style="color:var(--terra-d);font-weight:700">Load my starter list (22 jobs)</span></button>` : ''}
    ${DEMO ? `<button class="row" data-act="resetdemo"><span class="rt" style="color:var(--late-d)">Reset demo data</span></button>` : ''}
  </div>
  <div style="display:flex;align-items:center;gap:12px;justify-content:center;padding:24px 0;color:var(--muted);font-size:13px">${shieldSvg(36)}<div><b class="hd" style="color:var(--ink);font-size:16px">TaskForce</b><br>Version ${VERSION}</div></div>
  </div>`;
}

function viewLogin(err) {
  return `<div class="login">${shieldSvg(88)}<div style="text-align:center"><div class="hd" style="font-size:30px">TaskForce</div><div class="sub">Home jobs, sorted.</div></div>
  <form class="box" data-form="login"><div class="grp"><label for="l-e">Email</label><input id="l-e" class="field" type="email" name="email" autocomplete="username" required></div>
  <div class="grp"><label for="l-p">Password</label><input id="l-p" class="field" type="password" name="pw" autocomplete="current-password" required></div>
  ${err ? `<div class="err">${esc(err)}</div>` : ''}<button class="btn terra">Sign in</button></form></div>`;
}

// ---------- projects & calendar (v1.04) ----------
const PSTATUS = { idea: 'Idea', planned: 'Planned', active: 'In progress', hold: 'On hold', done: 'Done' };
const perDay = () => Number(S.settings.hoursPerDay) || 6;
const perWeek = () => Number(S.settings.daysPerWeek) || 5;
const hrs = (h, p) => L.hoursText(h, (p && p.unitPref) || 'hours', perDay(), perWeek());
const hrsBoth = (h, p) => { const u = (p && p.unitPref) || 'hours'; return u === 'hours' ? `${L.hoursText(h)}` : `${L.hoursText(h)} · ${hrs(h, p)}`; };
const findProj = id => S.projects.find(p => p.id === id);
const findEv = id => S.events.find(e => e.id === id);
const pLogged = p => (p.timeLog || []).reduce((a, x) => a + (Number(x.hours) || 0), 0);
const pBooked = p => (p.sessions || []).reduce((a, x) => a + (Number(x.hours) || 0), 0);
const pSpent = p => (p.materials || []).reduce((a, x) => a + (Number(x.cost) || 0), 0);
const pStepsEst = p => (p.steps || []).reduce((a, x) => a + (Number(x.hours) || 0), 0);
const pNext = p => (p.sessions || []).filter(x => x.date >= T()).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))[0];
const money = n => n || n === 0 ? '$' + Number(n).toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : '';
const time12 = t => { if (!t) return ''; let [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return `${h}:${String(m).padStart(2, '0')} ${ap}`; };
const visibleEvents = () => S.events.filter(e => e.visibility !== 'private' || e.owner === S.me?.key);
const evTypes = () => S.settings.eventTypes && S.settings.eventTypes.length ? S.settings.eventTypes : ['Holiday', 'Leave', 'Hobby', 'Appointment'];
const evIcon = e => ({ Holiday: 'plane', Leave: 'plane', Hobby: 'film', Appointment: 'event' }[e.type] || 'event');
const pBadge = (p, sm) => { const c = cat(p.category); return `<span class="badge ${sm ? 'sm' : ''} c-${c.color}">${I[c.icon] || I.tool}</span>`; };

// Everything that lands on each day between from and to.
function calEntries(from, to) {
  const t = T(), out = [];
  for (const j of S.jobs) {
    const base = { kind: isItem(j) ? 'item' : 'job', title: j.name, color: isItem(j) ? '#6B8F47' : '#C8553D', icon: cat(j.category).icon, cls: 'c-' + cat(j.category).color, go: '#/job/' + j.id, sort: '99' };
    const late = j.nextDue && j.nextDue < t;
    // Overdue: show it on today. Fixed schedules keep their future dates; "from when done" ones can't be known until it's done.
    if (late && t >= from && t <= to) out.push({ ...base, date: t, sub: `Overdue · was due ${L.shortDate(j.nextDue, t)}`, late: true });
    if (late && j.countFrom !== 'fixed') continue;
    for (const d of L.jobDatesBetween(j, late ? L.addDays(t, 1) > from ? L.addDays(t, 1) : from : from, to)) out.push({ ...base, date: d, sub: isItem(j) ? 'Item · replace or still good' : 'Job · ' + L.repeatText(j) });
  }
  for (const e of visibleEvents()) for (const o of L.eventOccurrences(e, from, to)) {
    for (let d = o.date < from ? from : o.date; d <= o.end && d <= to; d = L.addDays(d, 1)) {
      const multi = o.end > o.date;
      out.push({ date: d, kind: 'event', title: e.title, sub: `${e.type || 'Event'} · ${multi ? L.shortDate(o.date, t) + ' – ' + L.shortDate(o.end, t) : (e.allDay === false && e.start ? time12(e.start) + (e.end ? ' – ' + time12(e.end) : '') : 'All day')}${e.visibility === 'private' ? ' · just me' : ''}${e.away ? ' · away' : ''}`, color: '#3D5A6C', icon: evIcon(e), cls: 'c-slate', go: '#/event/' + e.id, sort: e.allDay === false && e.start ? e.start : '00', away: !!e.away });
    }
  }
  for (const p of S.projects) {
    for (const x of p.sessions || []) if (x.date >= from && x.date <= to) out.push({ date: x.date, kind: 'session', title: p.name, sub: `Project session · ${time12(x.start)} – ${time12(x.end)} (${L.hoursText(x.hours)})${x.note ? ' · ' + x.note : ''}`, color: '#E9C46A', icon: cat(p.category).icon || 'tool', cls: 'c-wattle', go: '#/project/' + p.id, sort: x.start || '00' });
    for (const x of p.prep || []) if (!x.done && x.date >= from && x.date <= to) out.push({ date: x.date, kind: 'prep', title: x.text, sub: 'Get ready · ' + p.name, color: '#A0703C', icon: 'bell', cls: 'c-ochre', go: '#/project/' + p.id, sort: '98' });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.sort.localeCompare(b.sort));
}
const entryRow = e => `<button class="row" data-act="go" data-to="${e.go}"><span class="badge sm ${e.cls}">${I[e.icon] || I.event}</span><div style="flex:1;min-width:0"><div class="rt" style="font-weight:700;font-size:14px">${esc(e.title)}</div><div class="rs">${esc(e.sub)}</div></div></button>`;

function homeWeek(t) {
  const end = L.addDays(t, 6), all = calEntries(t, end);
  const rows = all.filter(e => e.kind !== 'job' && e.kind !== 'item');
  const chores = L.summary(S.jobs, t).week; // same count as the "7 days" tile
  return `<div class="lab">This week <button data-act="go" data-to="#/calendar">Calendar</button></div>
  <div class="box">${rows.slice(0, 6).map(e => entryRow({ ...e, sub: (e.date === t ? 'Today' : L.niceDate(e.date, t)) + ' · ' + e.sub })).join('')}
  ${rows.length ? '' : '<div class="row"><span class="rs" style="flex:1">No events or project sessions booked this week.</span></div>'}
  ${chores ? `<button class="row" data-act="filter" data-f="week">${I.jobs.replace('<svg', '<svg class="ri"')}<span class="rt" style="flex:1">${chores} job${chores > 1 ? 's' : ''} due in the next 7 days</span><span class="end">${I.right.replace('<svg', '<svg width="16" height="16"')}</span></button>` : ''}</div>`;
}
function homeProjects(t) {
  const act = S.projects.filter(p => p.status === 'active'), planned = S.projects.filter(p => p.status === 'planned');
  if (!act.length && !planned.length) return '';
  const p = act[0] || planned[0], nx = pNext(p), est = Number(p.estHours) || 0, lg = pLogged(p);
  const others = act.length + planned.length - 1;
  return `<div class="lab">Projects <button data-act="go" data-to="#/projects">All</button></div>
  <button class="card" data-act="go" data-to="#/project/${p.id}" style="flex-direction:column;align-items:stretch;gap:10px">
    <div style="display:flex;gap:12px;align-items:center">${pBadge(p)}<div class="ct"><div class="t">${esc(p.name)}</div><div class="s">${esc(PSTATUS[p.status])} · ${hrs(lg, p)} of ${hrs(est, p)}${p.steps?.length ? ` · ${p.steps.filter(x => x.done).length}/${p.steps.length} steps` : ''}</div></div></div>
    <div class="hbar"><span style="width:${est ? Math.min(100, Math.round(lg / est * 100)) : 0}%;background:var(--wattle-d)"></span></div>
    ${nx ? `<div class="banner" style="margin:0;display:flex;gap:8px;align-items:center">${I.timer.replace('<svg', '<svg width="16" height="16"')}Next session: ${esc(L.niceDate(nx.date, t))}, ${esc(time12(nx.start))} – ${esc(time12(nx.end))}</div>` : `<div class="hint">No sessions booked yet</div>`}
    ${others > 0 ? `<div class="hint">${others} more project${others > 1 ? 's' : ''} on the go or planned</div>` : ''}
  </button>`;
}

function viewProjects() {
  const t = T(), f = S.pfilter || 'active';
  const sets = { active: S.projects.filter(p => p.status === 'active' || p.status === 'planned'), idea: S.projects.filter(p => p.status === 'idea'), hold: S.projects.filter(p => p.status === 'hold'), done: S.projects.filter(p => p.status === 'done') };
  const chip = (k, l) => `<button class="chip ${f === k ? 'on' : ''}" data-act="pfilter" data-f="${k}">${l} ${sets[k].length}</button>`;
  const card = p => {
    const est = Number(p.estHours) || 0, lg = pLogged(p), nx = pNext(p);
    const sub = p.status === 'done' ? `Finished ${p.finishedAt ? L.niceDate(p.finishedAt, t) : ''} · took ${hrs(lg, p)} (est ${hrs(est, p)})` : `${nx ? 'Next session ' + L.niceDate(nx.date, t) : (p.sessions?.length ? 'No upcoming sessions' : 'No sessions booked')}${p.steps?.length ? ` · ${p.steps.filter(x => x.done).length}/${p.steps.length} steps` : ''}`;
    return `<button class="card" data-act="go" data-to="#/project/${p.id}" style="flex-direction:column;align-items:stretch;gap:8px">
      <div style="display:flex;gap:12px;align-items:center">${pBadge(p)}<div class="ct"><div class="t">${esc(p.name)}</div><div class="s">${esc(sub)}</div></div><span class="pill ${p.status === 'active' ? 'p-ok' : 'p-soon'}" style="${p.status === 'planned' || p.status === 'idea' ? 'background:#E3E5EE;color:var(--ink)' : ''}">${PSTATUS[p.status]}</span></div>
      <div style="display:flex;align-items:center;gap:10px"><div class="hbar" style="flex:1"><span style="width:${est ? Math.min(100, Math.round(lg / est * 100)) : 0}%;background:var(--${cat(p.category).color === 'ink' ? 'ink' : cat(p.category).color + '-d'})"></span></div><span class="hint" style="font-weight:700;color:var(--ink)">${p.status === 'active' ? hrs(lg, p) + ' / ' : ''}${hrsBoth(est, p)}</span></div></button>`;
  };
  let body;
  if (f === 'active') {
    const a = sets.active.filter(p => p.status === 'active'), pl = sets.active.filter(p => p.status === 'planned');
    body = (a.length ? `<div class="lab">In progress · ${a.length}</div><div class="list">${a.map(card).join('')}</div>` : '') +
      (pl.length ? `<div class="lab">Planned · ${pl.length} <span>${hrs(pl.reduce((s, p) => s + (Number(p.estHours) || 0), 0))}</span></div><div class="list">${pl.map(card).join('')}</div>` : '');
  } else body = sets[f].length ? `<div class="list" style="margin-top:8px">${sets[f].map(card).join('')}</div>` : '';
  return `<div class="wrap"><div class="top"><div><div class="sub">Bigger one-off jobs</div><h1>Projects</h1></div></div>
  <div class="chips">${chip('active', 'Active')}${chip('idea', 'Ideas')}${chip('hold', 'On hold')}${chip('done', 'Done')}</div>
  ${body || `<div class="empty">${f === 'active' ? 'No projects yet. Tap + to add one, like “Pave behind the shed”.' : 'Nothing here.'}</div>`}
  </div>${nav()}<button class="fab" data-act="go" data-to="#/pnew" aria-label="Add project">${I.plus}</button>`;
}

function viewProject(id) {
  const p = findProj(id), t = T();
  if (!p) return `<div class="wrap"><div class="top"><button class="iconbtn" data-act="back" aria-label="Back">${I.back}</button></div><div class="empty">That project has been deleted.</div></div>${nav()}`;
  const c = cat(p.category), est = Number(p.estHours) || 0, lg = pLogged(p), bk = pBooked(p), spent = pSpent(p), stepsEst = pStepsEst(p);
  const sess = [...(p.sessions || [])].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const unit = p.unitPref || 'hours';
  const btns = p.status === 'done'
    ? `<button class="btn alt" style="box-shadow:none" data-act="pstatus" data-id="${p.id}" data-s="active">Reopen</button><button class="btn" data-act="logtime" data-id="${p.id}">+ Log time</button>`
    : p.status === 'active'
      ? `<button class="btn" data-act="logtime" data-id="${p.id}">+ Log time</button><button class="btn alt" style="box-shadow:none" data-act="pstatus" data-id="${p.id}" data-s="done">Mark finished</button>`
      : `<button class="btn" data-act="pstatus" data-id="${p.id}" data-s="active">Start project</button><button class="btn alt" style="box-shadow:none" data-act="logtime" data-id="${p.id}">+ Log time</button>`;
  const delBtn = (kind, i) => `<button class="x" data-act="pdel" data-id="${p.id}" data-k="${kind}" data-i="${i}" aria-label="Remove">×</button>`;
  return `<div class="wrap">
  <div class="dhead c-${c.color}" style="color:var(--ink)">
    <div class="dtop"><button class="iconbtn" data-act="back" aria-label="Back">${I.back}</button><button class="iconbtn" data-act="go" data-to="#/pedit/${p.id}" aria-label="Edit project">${I.edit}</button></div>
    <div><div class="sub" style="font-weight:700">${esc(c.name)}</div><h1 class="hd" style="margin:2px 0 0;font-size:28px;line-height:1.08">${esc(p.name)}</h1></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><span class="pill" style="background:#fff;color:var(--ink)">${PSTATUS[p.status]}</span><span class="pill" style="background:#fff;color:var(--ink)">${p.assignee && p.assignee !== 'either' ? esc(person(p.assignee).name) : 'Shaun or Lyndsey'}</span>${p.budget ? `<span class="pill" style="background:#fff;color:var(--ink)">Budget ${money(p.budget)}</span>` : ''}</div>
    <div class="btns">${btns}</div>
  </div>
  <div class="minis" style="margin-top:14px"><div class="mini"><b>${hrs(est, p)}</b><span>Estimate</span></div><div class="mini"><b style="color:var(--gum-d)">${hrs(lg, p)}</b><span>Logged</span></div><div class="mini"><b>${spent ? money(spent) : '–'}</b><span>${p.budget ? 'of ' + money(p.budget) : 'Spent'}</span></div></div>
  ${p.status === 'done' && est ? `<div class="banner" style="background:var(--gum-l);color:var(--gum-d)">Estimate ${hrs(est, p)}, actual ${hrs(lg, p)}${lg > est ? ` (${hrs(lg - est, p)} over)` : lg < est ? ` (${hrs(est - lg, p)} under)` : ' (spot on)'}.</div>` : ''}
  <div class="box" style="margin-top:10px;padding:8px 12px;display:flex;align-items:center;gap:10px"><span class="hint" style="flex:1">Show times in</span><div class="seg" style="flex:1.4">${['hours', 'days', 'weeks'].map(u => `<button class="${unit === u ? 'on' : ''}" data-act="punit" data-id="${p.id}" data-u="${u}">${u[0].toUpperCase() + u.slice(1)}</button>`).join('')}</div></div>

  <div class="lab">Steps${p.steps?.length ? ` · ${p.steps.filter(x => x.done).length}/${p.steps.length}` : ''} ${stepsEst ? `<span>${hrs(stepsEst, p)}${est && Math.abs(stepsEst - est) > 0.05 ? ` (estimate ${hrs(est, p)})` : ''}</span>` : ''}</div>
  <div class="box">${(p.steps || []).map((x, i) => `<div class="step ${x.done ? 'on' : ''}"><button class="cb ${x.done ? 'on' : ''}" data-act="ptoggle" data-id="${p.id}" data-k="steps" data-i="${i}" aria-label="Tick step">${I.tick}</button><span style="flex:1">${esc(x.text)}</span>${x.hours ? `<span class="hint" style="font-weight:700">${hrs(x.hours, p)}</span>` : ''}${delBtn('steps', i)}</div>`).join('')}
  <form class="addstep" data-form="pstep" data-id="${p.id}"><input name="text" placeholder="Add step" aria-label="Step" maxlength="100"><input name="hours" type="number" min="0" step="0.5" placeholder="hrs" aria-label="Estimated hours" style="flex:0 0 64px"><button class="iconbtn" aria-label="Add step" style="box-shadow:none;background:var(--soft)">${I.plus}</button></form></div>

  <div class="lab">Work sessions <span>shows on Calendar</span></div>
  <div class="box">${sess.map((x, i) => `<div class="row" style="${x.date < t ? 'opacity:.6' : ''}">${I.cal.replace('<svg', '<svg class="ri"')}<div style="flex:1"><div class="rt">${esc(L.niceDate(x.date, t))} · ${esc(time12(x.start))} – ${esc(time12(x.end))}</div><div class="rs">${L.hoursText(x.hours)} booked${x.note ? ' · ' + esc(x.note) : ''}</div></div>${delBtn('sessions', (p.sessions || []).indexOf(x))}</div>`).join('')}
  <button class="row" data-act="session" data-id="${p.id}" style="color:var(--terra-d);font-weight:700">+ Book a session</button></div>
  ${est ? `<div class="hint" style="margin:6px 4px">${hrs(bk, p)} booked of ${hrs(est, p)} estimate${est > bk ? ` · ${hrs(est - bk, p)} still to book` : ''}</div>` : ''}

  <div class="lab">Materials &amp; costs ${spent ? `<span>${money(spent)}</span>` : ''}</div>
  <div class="box">${(p.materials || []).map((x, i) => `<div class="step ${x.done ? 'on' : ''}"><button class="cb ${x.done ? 'on' : ''}" data-act="ptoggle" data-id="${p.id}" data-k="materials" data-i="${i}" aria-label="Tick bought">${I.tick}</button><div style="flex:1"><span>${esc(x.text)}</span>${x.qty ? `<div class="rs">${esc(x.qty)}</div>` : ''}</div>${x.cost ? `<span class="hint" style="font-weight:700;color:var(--ink)">${money(x.cost)}</span>` : ''}${delBtn('materials', i)}</div>`).join('')}
  <form class="addstep" data-form="pmat" data-id="${p.id}" style="flex-wrap:wrap"><input name="text" placeholder="Add material" aria-label="Material" maxlength="80" style="flex-basis:100%"><input name="qty" placeholder="Qty (e.g. 20 m²)" aria-label="Quantity" maxlength="30"><input name="cost" type="number" min="0" step="0.01" placeholder="$" aria-label="Cost" style="flex:0 0 80px"><button class="iconbtn" aria-label="Add material" style="box-shadow:none;background:var(--soft)">${I.plus}</button></form></div>

  <div class="lab">Get ready <span>reminds you on the day</span></div>
  <div class="box">${(p.prep || []).map((x, i) => `<div class="step ${x.done ? 'on' : ''}"><button class="cb ${x.done ? 'on' : ''}" data-act="ptoggle" data-id="${p.id}" data-k="prep" data-i="${i}" aria-label="Tick done">${I.tick}</button><div style="flex:1"><span>${esc(x.text)}</span><div class="rs">${esc(L.niceDate(x.date, t))}</div></div>${delBtn('prep', i)}</div>`).join('')}
  <form class="addstep" data-form="pprep" data-id="${p.id}" style="flex-wrap:wrap"><input name="text" placeholder="e.g. Order pavers" aria-label="Prep task" maxlength="80" style="flex-basis:100%"><input name="date" type="date" aria-label="Remind on" required><button class="iconbtn" aria-label="Add prep reminder" style="box-shadow:none;background:var(--soft)">${I.plus}</button></form></div>

  <div class="lab">Time log ${lg ? `<span>${hrs(lg, p)}</span>` : ''}</div>
  <div class="box">${[...(p.timeLog || [])].map((x, i) => ({ ...x, i })).sort((a, b) => b.date.localeCompare(a.date)).map(x => `<div class="row">${I.timer.replace('<svg', '<svg class="ri"')}<div style="flex:1"><div class="rt">${L.hoursText(x.hours)} · ${esc(L.niceDate(x.date, t))}</div><div class="rs">${esc(person(x.by).name)}${x.note ? ' · ' + esc(x.note) : ''}</div></div>${delBtn('timeLog', x.i)}</div>`).join('') || `<div class="empty" style="padding:14px">Tap “+ Log time” after each session. When it's finished you'll see estimate vs actual.</div>`}</div>

  <div class="lab">Notes</div>
  <div class="box"><textarea class="notes" placeholder="Add note" data-change="pnotes" data-id="${p.id}" aria-label="Project notes">${esc(p.notes || '')}</textarea></div>
  <div class="meta"><span>Added by ${esc(person(p.createdBy).name)}${p.createdAt ? ' on ' + esc(L.niceDate(p.createdAt.slice(0, 10), t)) : ''}</span><button class="iconbtn" style="box-shadow:none;background:none" data-act="pdelete" data-id="${p.id}" aria-label="Delete project">${I.trash}</button></div>
  </div>${nav()}`;
}

function viewProjectEdit(id) {
  if (!S.edProj || S.edProj._for !== (id || 'new')) {
    const src = id ? findProj(id) : null;
    const unit = src?.unitPref || 'hours';
    S.edProj = src ? { ...clone(src), estN: src.estHours ? Math.round((unit === 'days' ? src.estHours / perDay() : unit === 'weeks' ? src.estHours / (perDay() * perWeek()) : src.estHours) * 10) / 10 : '', estU: unit }
      : { name: '', category: 'house', status: 'planned', estN: '', estU: 'hours', budget: '', assignee: S.me.key, notes: '' };
    S.edProj._for = id || 'new';
  }
  const e = S.edProj;
  const opt = (v, l, cur) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(l)}</option>`;
  const segB = (v, l) => `<button type="button" class="${e.assignee === v ? 'on' : ''}" data-act="pseg" data-v="${v}">${esc(l)}</button>`;
  return `<div class="wrap"><form data-form="project" data-id="${id || ''}" class="form" novalidate>
  <div class="fbar"><button type="button" data-act="back">Cancel</button><span class="hd" style="font-size:17px">${id ? 'Edit' : 'New'} project</span><button class="save" type="submit">Save</button></div>
  <div class="grp"><label for="p-name">Name</label><input id="p-name" class="field" name="name" value="${esc(e.name)}" maxlength="80" placeholder="e.g. Pave behind the shed"><div class="err" id="pname-err" hidden>Give it a name first</div></div>
  <div class="inline"><div class="grp" style="flex:1"><label for="p-cat">Category</label><select id="p-cat" class="field" name="category">${cats().map(c => opt(c.id, c.name, e.category)).join('')}</select></div>
  <div class="grp" style="flex:1"><label for="p-st">Status</label><select id="p-st" class="field" name="status">${Object.entries(PSTATUS).map(([k, l]) => opt(k, l, e.status)).join('')}</select></div></div>
  <div class="grp"><span class="l">Estimated time</span><div class="inline"><input class="field" style="width:90px;text-align:center;font-weight:700" type="number" min="0" step="0.5" name="estN" value="${esc(e.estN)}" aria-label="Estimate"><select class="field" name="estU" aria-label="Unit">${opt('hours', 'hours', e.estU)}${opt('days', 'days', e.estU)}${opt('weeks', 'weeks', e.estU)}</select></div><span class="hint">A day = ${perDay()} hours, a week = ${perWeek()} days (change in Settings).</span></div>
  <div class="grp"><label for="p-bud">Budget (optional)</label><input id="p-bud" class="field" type="number" min="0" step="0.01" name="budget" value="${esc(e.budget ?? '')}" placeholder="$"></div>
  <div class="grp"><span class="l">Whose project</span><div class="seg">${store.people.map(x => segB(x.key, x.name)).join('')}${segB('either', 'Both')}</div></div>
  <div class="grp"><label for="p-notes">Notes</label><textarea id="p-notes" class="field" name="notes">${esc(e.notes || '')}</textarea></div>
  <button class="btn terra" type="submit">Save</button></form></div>`;
}

function viewCalendar() {
  const t = T();
  if (!S.cal) S.cal = { month: t.slice(0, 7), sel: t, view: 'month' };
  const c = S.cal;
  const first = c.month + '-01', last = L.addDays(L.addMonths(first, 1), -1);
  const lead = (L.weekday(first) + 6) % 7;
  const ents = calEntries(first, last);
  const byDay = {}; for (const e of ents) (byDay[e.date] = byDay[e.date] || []).push(e);
  const title = new Intl.DateTimeFormat('en-AU', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(L.parse(first));
  let grid = '';
  for (let i = 0; i < lead; i++) grid += '<div></div>';
  for (let d = first; d <= last; d = L.addDays(d, 1)) {
    const es = byDay[d] || [], away = es.some(e => e.away), sel = d === c.sel, today = d === t;
    const dots = [...new Set(es.map(e => e.color))].slice(0, 4).map(col => `<i style="background:${col}"></i>`).join('');
    grid += `<button class="cday${sel ? ' sel' : ''}${away ? ' away' : ''}${today ? ' today' : ''}" data-act="cday" data-d="${d}" aria-label="${L.niceDate(d, t)}${es.length ? ', ' + es.length + ' things' : ''}"><span>${Number(d.slice(8))}</span><span class="dots">${dots}</span></button>`;
  }
  let lower;
  if (c.view === 'agenda') {
    const ag = calEntries(t, L.addDays(t, 60)); const g = {};
    for (const e of ag) (g[e.date] = g[e.date] || []).push(e);
    lower = Object.keys(g).map(d => `<div class="lab">${d === t ? 'Today' : esc(L.niceDate(d, t))}</div><div class="box">${g[d].map(entryRow).join('')}</div>`).join('') || '<div class="empty">Nothing in the next 60 days.</div>';
  } else {
    const es = calEntries(c.sel, c.sel);
    lower = `<div class="lab">${c.sel === t ? 'Today' : esc(L.niceDate(c.sel, t))} <button data-act="go" data-to="#/event/new?date=${c.sel}">+ Event this day</button></div>${es.length ? `<div class="box">${es.map(entryRow).join('')}</div>` : '<div class="empty" style="padding:14px">Nothing on this day.</div>'}`;
  }
  return `<div class="wrap">
  <div class="top"><h1>${esc(title)}</h1><div style="display:flex;gap:6px"><button class="iconbtn" data-act="cmonth" data-n="-1" aria-label="Previous month">${I.left}</button><button class="chip" data-act="ctoday">Today</button><button class="iconbtn" data-act="cmonth" data-n="1" aria-label="Next month">${I.right}</button></div></div>
  <div class="seg" style="margin-bottom:10px"><button class="${c.view !== 'agenda' ? 'on' : ''}" data-act="cview" data-v="month">Month</button><button class="${c.view === 'agenda' ? 'on' : ''}" data-act="cview" data-v="agenda">Agenda</button></div>
  ${c.view !== 'agenda' ? `<div class="cal">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => `<div class="cdow">${d}</div>`).join('')}${grid}</div>
  <div class="legend" style="margin:8px 4px;flex-wrap:wrap"><span><i class="lg" style="background:#C8553D"></i>Jobs</span><span><i class="lg" style="background:#6B8F47"></i>Items</span><span><i class="lg" style="background:#3D5A6C"></i>Events</span><span><i class="lg" style="background:#E9C46A"></i>Projects</span><span><i class="lg" style="background:#A0703C"></i>Get ready</span><span><i class="lg" style="background:var(--slate-l);width:14px;border-radius:3px"></i>Away</span></div>` : ''}
  ${lower}
  </div>${nav()}<button class="fab" data-act="go" data-to="#/event/new?date=${c.sel}" aria-label="Add event" style="width:auto;padding:0 18px;gap:6px;font-weight:700">${I.plus}Event</button>`;
}

function viewEventEdit(id, params) {
  const t = T();
  if (!S.edEv || S.edEv._for !== (id || 'new')) {
    const src = id ? findEv(id) : null;
    S.edEv = src ? clone(src) : { title: '', type: 'Hobby', date: params.get('date') || t, endDate: '', allDay: true, start: '09:00', end: '12:00', repeat: 'none', until: '', visibility: 'shared', away: false, remind: 'none', notes: '' };
    S.edEv.range = !!S.edEv.endDate && S.edEv.endDate !== S.edEv.date;
    S.edEv._for = id || 'new';
  }
  const e = S.edEv;
  const opt = (v, l, cur) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(l)}</option>`;
  return `<div class="wrap"><form data-form="event" data-id="${id || ''}" class="form" novalidate>
  <div class="fbar"><button type="button" data-act="back">Cancel</button><span class="hd" style="font-size:17px">${id ? 'Edit' : 'Add'} event</span><button class="save" type="submit">Save</button></div>
  <div class="grp"><label for="e-title">What</label><input id="e-title" class="field" name="title" value="${esc(e.title)}" maxlength="80" placeholder="e.g. Philippines video edit"><div class="err" id="etitle-err" hidden>Give it a name first</div></div>
  <div class="chips" style="flex-wrap:wrap">${evTypes().map(x => `<button type="button" class="chip ${e.type === x ? 'on' : ''}" data-act="evtype" data-v="${esc(x)}">${esc(x)}</button>`).join('')}<button type="button" class="chip" data-act="evnewtype">+ New type</button></div>
  <div class="seg"><button type="button" class="${!e.range ? 'on' : ''}" data-act="evrange" data-v="0">One day</button><button type="button" class="${e.range ? 'on' : ''}" data-act="evrange" data-v="1">Date range</button></div>
  <div class="inline"><div class="grp" style="flex:1"><label for="e-date">${e.range ? 'From' : 'Date'}</label><input id="e-date" class="field" type="date" name="date" value="${esc(e.date)}"></div>
  ${e.range ? `<div class="grp" style="flex:1"><label for="e-end">To</label><input id="e-end" class="field" type="date" name="endDate" value="${esc(e.endDate || e.date)}"></div>` : ''}</div>
  <label class="check"><input type="checkbox" name="allDay" data-change="allday" ${e.allDay !== false ? 'checked' : ''}> All day</label>
  ${e.allDay === false ? `<div class="inline"><div class="grp" style="flex:1"><label for="e-s">Starts</label><input id="e-s" class="field" type="time" name="start" value="${esc(e.start || '09:00')}"></div><div class="grp" style="flex:1"><label for="e-e">Ends</label><input id="e-e" class="field" type="time" name="end" value="${esc(e.end || '12:00')}"></div></div>` : ''}
  <div class="hint" style="font-weight:700;color:var(--ink);margin-bottom:-8px">Optional</div>
  <div class="inline"><div class="grp" style="flex:1"><label for="e-rep">Repeat</label><select id="e-rep" class="field" name="repeat" data-change="evrepeat">${opt('none', 'Does not repeat', e.repeat)}${opt('weekly', 'Weekly', e.repeat)}${opt('fortnightly', 'Fortnightly', e.repeat)}${opt('monthly', 'Monthly', e.repeat)}${opt('yearly', 'Yearly', e.repeat)}</select></div>
  ${e.repeat && e.repeat !== 'none' ? `<div class="grp" style="flex:1"><label for="e-until">Until (optional)</label><input id="e-until" class="field" type="date" name="until" value="${esc(e.until || '')}"></div>` : ''}</div>
  <div class="grp"><label for="e-rem">Remind me</label><select id="e-rem" class="field" name="remind">${Object.entries(L.EVENT_REMIND).map(([k, l]) => opt(k, l, e.remind)).join('')}</select></div>
  <div class="grp"><span class="l">Who can see it</span><div class="seg"><button type="button" class="${e.visibility !== 'private' ? 'on' : ''}" data-act="evvis" data-v="shared">Both of us</button><button type="button" class="${e.visibility === 'private' ? 'on' : ''}" data-act="evvis" data-v="private">Just me</button></div></div>
  <label class="check"><input type="checkbox" name="away" ${e.away ? 'checked' : ''}> Away: pause chore reminders on these days</label>
  <div class="grp"><label for="e-notes">Notes</label><textarea id="e-notes" class="field" name="notes">${esc(e.notes || '')}</textarea></div>
  <button class="btn terra" type="submit">Save</button>
  ${id ? `<button type="button" class="btn ghost" style="color:var(--late-d)" data-act="evdelete" data-id="${id}">Delete event</button>` : ''}
  </form></div>`;
}
function syncEvForm() {
  const f = document.querySelector('[data-form=event]'); if (!f || !S.edEv) return;
  const fd = new FormData(f);
  for (const k of ['title', 'date', 'endDate', 'start', 'end', 'repeat', 'until', 'remind', 'notes']) if (fd.has(k)) S.edEv[k] = fd.get(k);
  S.edEv.allDay = fd.has('allDay'); S.edEv.away = fd.has('away');
}
function syncProjForm() {
  const f = document.querySelector('[data-form=project]'); if (!f || !S.edProj) return;
  const fd = new FormData(f);
  for (const k of ['name', 'category', 'status', 'estN', 'estU', 'budget', 'notes']) if (fd.has(k)) S.edProj[k] = fd.get(k);
}

// ---------- sheets ----------
function sheetHtml() {
  const sh = S.sheet; if (!sh) return '';
  const t = T();
  if (sh.type === 'logtime' || sh.type === 'session') {
    const p = findProj(sh.id); if (!p) return '';
    if (sh.type === 'logtime') return `<div class="scrim" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Log time" data-stop>
    <div class="grab"></div><div><h2>Log time</h2><div class="hint" style="margin-top:4px;font-size:13px">${esc(p.name)} · ${hrs(pLogged(p), p)} logged so far</div></div>
    <div class="opts">${[1, 2, 3, 4, 6].map(n => `<button class="opt ${Number(sh.hours) === n ? 'on' : ''}" data-act="lthours" data-n="${n}">${n}h</button>`).join('')}</div>
    <div class="inline"><div class="grp" style="flex:1"><label for="lt-h">Hours</label><input id="lt-h" class="field" type="number" min="0.25" step="0.25" value="${esc(sh.hours)}" data-change="lth"></div><div class="grp" style="flex:1.4"><label for="lt-d">Date</label><input id="lt-d" class="field" type="date" max="${t}" value="${esc(sh.date)}" data-change="ltd"></div></div>
    <div class="grp"><label for="lt-n">What got done (optional)</label><input id="lt-n" class="field" value="${esc(sh.note || '')}" data-change="ltn" maxlength="100" placeholder="e.g. Dug out and levelled base"></div>
    <div class="btns"><button class="btn alt" data-act="closesheet">Cancel</button><button class="btn terra" style="flex:2" data-act="dologtime">Log ${esc(L.hoursText(Number(sh.hours) || 0))}</button></div></div></div>`;
    const h = L.spanHours(sh.start, sh.end);
    const free = sh.date ? [...L.awayPeople(visibleEvents(), sh.date, store.people.map(x => x.key))] : [];
    return `<div class="scrim" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Book a session" data-stop>
    <div class="grab"></div><div><h2>Book a work session</h2><div class="hint" style="margin-top:4px;font-size:13px">${esc(p.name)} · any day, weekends included</div></div>
    <div class="grp"><label for="ss-d">Day</label><input id="ss-d" class="field" type="date" min="${t}" value="${esc(sh.date)}" data-change="ssd"></div>
    <div class="inline"><div class="grp" style="flex:1"><label for="ss-s">From</label><input id="ss-s" class="field" type="time" value="${esc(sh.start)}" data-change="sss"></div><div class="grp" style="flex:1"><label for="ss-e">To</label><input id="ss-e" class="field" type="time" value="${esc(sh.end)}" data-change="sse"></div></div>
    <div class="grp"><label for="ss-n">Plan (optional)</label><input id="ss-n" class="field" value="${esc(sh.note || '')}" data-change="ssn" maxlength="80" placeholder="e.g. Lay first 10 m²"></div>
    <div class="preview">${h > 0 ? `<b>${esc(L.hoursText(h))}</b> on ${esc(L.niceDate(sh.date, t))}. Shows on the Calendar for both of you.` : 'End time needs to be after the start.'}${free.length ? ` Heads up: ${esc(free.map(k => person(k).name).join(' & '))} marked away that day.` : ''}</div>
    <div class="btns"><button class="btn alt" data-act="closesheet">Cancel</button><button class="btn terra" style="flex:2" data-act="dosession" ${h > 0 ? '' : 'disabled'}>Book it</button></div></div></div>`;
  }
  if (sh.type === 'pconfirm') {
    const p = findProj(sh.id);
    return `<div class="scrim" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Confirm" data-stop>
    <div class="grab"></div><h2>Delete “${esc(p?.name || '')}”?</h2><div class="hint" style="font-size:14px">This removes the project, its sessions and time log for both of you.</div>
    <div class="btns"><button class="btn alt" data-act="closesheet">Keep it</button><button class="btn" style="background:var(--late-d)" data-act="dopdelete">Delete</button></div></div></div>`;
  }
  const j = findJob(sh.id);
  if (!j && sh.type !== 'confirm') return '';
  if (sh.type === 'extend') {
    const amt = sh.amt || { n: 2, unit: 'weeks' };
    const nd = L.extendDue(j, amt.n, amt.unit, t);
    const life = j.lastDone ? L.daysBetween(j.lastDone, nd) : null;
    const o = (n, unit, label) => `<button class="opt ${amt.n === n && amt.unit === unit && !sh.custom ? 'on' : ''}" data-act="amt" data-n="${n}" data-unit="${unit}">${label}</button>`;
    return `<div class="scrim" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Still good" data-stop>
    <div class="grab"></div><div><h2>Still good?</h2><div class="hint" style="margin-top:4px;font-size:13px">${esc(j.name)} is due ${esc(L.niceDate(j.nextDue, t))}. Push it out without logging a replacement.</div></div>
    <div class="opts">${o(1, 'weeks', '+ 1 week')}${o(2, 'weeks', '+ 2 weeks')}${o(1, 'months', '+ 1 month')}<button class="opt ${sh.custom ? 'on' : ''}" data-act="amtcustom">Custom…</button></div>
    ${sh.custom ? `<div class="inline"><input class="field" style="width:80px;text-align:center" type="number" min="1" max="99" value="${amt.n}" data-change="amtn" aria-label="Number"><select class="field" data-change="amtunit" aria-label="Unit">${['days', 'weeks', 'months'].map(u => `<option ${u === amt.unit ? 'selected' : ''}>${u}</option>`).join('')}</select></div>` : ''}
    <div class="grp"><label for="x-note">Note (optional)</label><input id="x-note" class="field" value="${esc(sh.note || '')}" data-change="xnote" placeholder="e.g. Seal still fine"></div>
    ${life ? `<label class="check"><input type="checkbox" ${sh.normal ? 'checked' : ''} data-change="xnormal"> Make ${esc(L.spanText(life))} the new normal life</label>` : ''}
    <div class="preview">New reminder: <b>${esc(L.niceDate(nd, t))}</b>. Logged in history as an extension${j.lastDone ? `; the fitted date stays ${esc(L.shortDate(j.lastDone, t))}` : ''}.</div>
    <div class="btns"><button class="btn alt" data-act="closesheet">Cancel</button><button class="btn terra" style="flex:2" data-act="doextend">Extend to ${esc(L.shortDate(nd, t))}</button></div></div></div>`;
  }
  if (sh.type === 'doneon') {
    const d = sh.date || t;
    const next = L.nextDueAfter(j, d);
    return `<div class="scrim" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Done on another day" data-stop>
    <div class="grab"></div><h2>${isItem(j) ? 'Replaced on…' : 'Done on…'}</h2>
    <input class="field" type="date" value="${d}" max="${t}" data-change="donedate" aria-label="Date">
    <div class="preview">Next due: <b>${esc(L.niceDate(next, t))}</b></div>
    <div class="btns"><button class="btn alt" data-act="closesheet">Cancel</button><button class="btn terra" style="flex:2" data-act="dodoneon">Save</button></div></div></div>`;
  }
  if (sh.type === 'confirm') {
    return `<div class="scrim" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Confirm" data-stop>
    <div class="grab"></div><h2>Delete “${esc(j?.name || '')}”?</h2><div class="hint" style="font-size:14px">This removes the job and its history for both of you.</div>
    <div class="btns"><button class="btn alt" data-act="closesheet">Keep it</button><button class="btn" style="background:var(--late-d)" data-act="dodelete">Delete</button></div></div></div>`;
  }
  return '';
}

// ---------- render ----------
function route() {
  const [path, q] = (location.hash || '#/home').slice(1).split('?');
  return { parts: path.split('/').filter(Boolean), params: new URLSearchParams(q || '') };
}
function render() {
  if (!S.me) return;
  if (!S.loaded) { $app.innerHTML = `<div class="login">${shieldSvg(72)}<div class="sub">Loading…</div></div>`; return; }
  const { parts, params } = route();
  const v = parts[0] || 'home';
  let html;
  if (v !== 'edit' && v !== 'new') S.editing = null;
  if (v !== 'pedit' && v !== 'pnew') S.edProj = null;
  if (v !== 'event') S.edEv = null;
  if (v === 'jobs') html = viewJobs();
  else if (v === 'items') html = viewItems();
  else if (v === 'history') html = viewHistory();
  else if (v === 'job') html = viewDetail(parts[1]);
  else if (v === 'edit') html = viewEdit(parts[1], params);
  else if (v === 'new') html = viewEdit(null, params);
  else if (v === 'settings') html = viewSettings();
  else if (v === 'projects') html = viewProjects();
  else if (v === 'project') html = viewProject(parts[1]);
  else if (v === 'pedit') html = viewProjectEdit(parts[1]);
  else if (v === 'pnew') html = viewProjectEdit(null);
  else if (v === 'calendar') html = viewCalendar();
  else if (v === 'event') html = viewEventEdit(parts[1] && parts[1] !== 'new' ? parts[1] : null, params);
  else html = viewHome();
  const y = S.keepScroll ? window.scrollY : 0;
  $app.innerHTML = html + sheetHtml();
  if (S.keepScroll) window.scrollTo(0, y); S.keepScroll = false;
  if (v === 'job' && params.get('do') && S.loaded) {
    const act = params.get('do'); history.replaceState(null, '', '#/job/' + parts[1]);
    const j = findJob(parts[1]);
    if (j && act === 'done') complete(j, isItem(j) ? 'replaced' : 'done');
    if (j && act === 'extend') { S.sheet = { type: 'extend', id: j.id, amt: { n: 2, unit: 'weeks' } }; rerender(); }
  }
}
const rerender = () => { S.keepScroll = true; render(); };

// ---------- actions ----------
let toastTimer;
function toast(title, sub, undo) {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = 'toast'; el.setAttribute('role', 'status');
  el.innerHTML = `<svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true" style="flex:none"><circle cx="17" cy="17" r="17" fill="#B5462F"/><path d="M10 17.5l5 5 9-10" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg><div class="tt"><b>${esc(title)}</b><span>${esc(sub || '')}</span></div>${undo ? '<button>Undo</button>' : ''}`;
  if (undo) el.querySelector('button').onclick = async () => { el.remove(); await undo(); };
  document.body.appendChild(el);
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.remove(), 6000);
}
function confetti() {
  const box = document.createElement('div'); box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
  const cols = ['#C8553D', '#6B8F47', '#E9C46A', '#3D5A6C', '#FBF6EC'];
  for (let i = 0; i < 28; i++) { const p = document.createElement('i'); p.style.left = Math.random() * 100 + '%'; p.style.background = cols[i % 5]; p.style.animationDelay = Math.random() * 0.3 + 's'; box.appendChild(p); }
  document.body.appendChild(box); setTimeout(() => box.remove(), 1900);
}
async function complete(j, kind, date) {
  const t = T(); date = date || t;
  const prev = clone(j);
  const next = L.nextDueAfter(j, date);
  const upd = { nextDue: next, steps: (j.steps || []).map(s => ({ ...s, done: false })), myDay: {} };
  if (kind !== 'skipped') upd.lastDone = date;
  const entry = { jobId: j.id, jobName: j.name, kind, date, at: nowIso(), by: S.me.key, nextDue: next, late: j.nextDue && j.nextDue < date ? L.daysBetween(j.nextDue, date) : 0 };
  if (j.steps?.length && kind !== 'skipped') entry.steps = `${j.steps.filter(s => s.done).length}/${j.steps.length}`;
  if (kind === 'replaced' && j.lastDone) entry.lasted = L.daysBetween(j.lastDone, date);
  const hid = await store.addHistory(entry);
  await store.saveJob(j.id, upd);
  const after = L.summary(S.jobs.map(x => x.id === j.id ? { ...x, ...upd } : x), t);
  if (kind !== 'skipped') confetti();
  const msg = kind === 'skipped' ? 'Skipped' : ['Nice one!', 'Sorted!', 'Ripper!', 'Done and dusted!'][Math.floor(Math.random() * 4)];
  toast(`${msg} Home score ${after.score}%`, `${j.name} · next ${L.niceDate(next, t)}`, async () => { await store.replaceJob(j.id, prev); await store.deleteHistory(hid); });
}
async function doExtend() {
  const sh = S.sheet, j = findJob(sh.id), t = T(), amt = sh.amt || { n: 2, unit: 'weeks' };
  const prev = clone(j);
  const nd = L.extendDue(j, amt.n, amt.unit, t);
  const upd = { nextDue: nd };
  if (sh.normal && j.lastDone) Object.assign(upd, L.daysToInterval(L.daysBetween(j.lastDone, nd)));
  const hid = await store.addHistory({ jobId: j.id, jobName: j.name, kind: 'extended', date: t, at: nowIso(), by: S.me.key, amount: L.intervalText(amt.n, amt.unit), note: sh.note || '', nextDue: nd });
  await store.saveJob(j.id, upd);
  S.sheet = null; rerender();
  toast('Still good. Extended', `${j.name} · now due ${L.niceDate(nd, t)}`, async () => { await store.replaceJob(j.id, prev); await store.deleteHistory(hid); });
}
async function compressPhoto(file) {
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); });
  const max = 1000, s = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  let q = 0.72, out = c.toDataURL('image/jpeg', q);
  while (out.length > 700000 && q > 0.3) { q -= 0.1; out = c.toDataURL('image/jpeg', q); }
  return out;
}
function download(name, text) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

document.addEventListener('click', async ev => {
  const dl = ev.target.closest('label.row');
  if (dl) { const di = dl.querySelector('input[type=date]'); if (di && ev.target !== di) { ev.preventDefault(); try { di.showPicker(); } catch { di.focus(); } return; } }
  const stop = ev.target.closest('[data-stop]');
  const el = ev.target.closest('[data-act]');
  if (!el) return;
  if (stop && el.classList.contains('scrim')) return;
  const a = el.dataset.act, id = el.dataset.id;
  if (a !== 'open' && a !== 'go') ev.preventDefault();
  const j = id ? findJob(id) : null;
  switch (a) {
    case 'go': ev.preventDefault(); location.hash = el.dataset.to; break;
    case 'back': history.length > 1 ? history.back() : (location.hash = '#/home'); break;
    case 'open': if (ev.target.closest('[data-act="quick"]')) return; location.hash = '#/job/' + id; break;
    case 'quick': ev.stopPropagation(); if (j) await complete(j, isItem(j) ? 'replaced' : 'done'); break;
    case 'complete': if (j) await complete(j, el.dataset.kind); break;
    case 'filter': S.filter = el.dataset.f === S.filter && S.filter !== 'all' ? 'all' : el.dataset.f; if (!location.hash.startsWith('#/jobs')) location.hash = '#/jobs'; else rerender(); break;
    case 'search': S.search = S.search === null ? '' : null; rerender(); document.getElementById('q')?.focus(); break;
    case 'star': if (j) await store.saveJob(j.id, { important: !j.important }); break;
    case 'myday': if (j) { const md = { ...(j.myDay || {}) }; if (inMyDay(j)) delete md[S.me.key]; else md[S.me.key] = T(); await store.saveJob(j.id, { myDay: md }); } break;
    case 'step': if (j) { const st = clone(j.steps); st[+el.dataset.i].done = !st[+el.dataset.i].done; await store.saveJob(j.id, { steps: st }); } break;
    case 'delstep': if (j) { const st = clone(j.steps); st.splice(+el.dataset.i, 1); await store.saveJob(j.id, { steps: st }); } break;
    case 'delphoto': if (j) await store.saveJob(j.id, { photo: null }); break;
    case 'extend': S.sheet = { type: 'extend', id, amt: { n: 2, unit: 'weeks' } }; rerender(); break;
    case 'doneon': S.sheet = { type: 'doneon', id, date: T() }; rerender(); break;
    case 'amt': S.sheet.amt = { n: +el.dataset.n, unit: el.dataset.unit }; S.sheet.custom = false; rerender(); break;
    case 'amtcustom': S.sheet.custom = true; rerender(); break;
    case 'doextend': await doExtend(); break;
    case 'dodoneon': { const jj = findJob(S.sheet.id), d = S.sheet.date; S.sheet = null; rerender(); await complete(jj, isItem(jj) ? 'replaced' : 'done', d); break; }
    case 'delete': S.sheet = { type: 'confirm', id }; rerender(); break;
    case 'dodelete': { const did = S.sheet.id; S.sheet = null; location.hash = '#/jobs'; await store.deleteJob(did); toast('Deleted', ''); break; }
    case 'closesheet': if (ev.target === el || el.tagName === 'BUTTON') { S.sheet = null; rerender(); } break;
    case 'seg': {
      const f = el.dataset.field; syncForm(); S.editing[f] = el.dataset.v;
      if (f === 'type' && el.dataset.v === 'item' && !document.querySelector('[data-form=edit]').dataset.id) { S.editing.countFrom = 'done'; S.editing.unit = 'months'; S.editing.category = cats().some(c => c.id === 'cpap') ? 'cpap' : S.editing.category; if (!S.editing.lastDone) S.editing.lastDone = T(); }
      rerender(); break;
    }
    case 'as': store.switchUser(el.dataset.k); break;
    case 'signout': await store.signOut(); break;
    case 'push': { const r = await store.enablePush(); toast(r.ok ? 'Reminders on' : 'Reminders', r.msg); rerender(); break; }
    case 'delcat': { const cs = clone(cats()); cs.splice(+el.dataset.i, 1); await store.saveSettings({ categories: cs }); break; }
    case 'export': download(`taskforce-backup-${T()}.json`, JSON.stringify({ app: 'TaskForce', version: VERSION, exported: nowIso(), jobs: S.jobs, history: S.history, projects: S.projects, events: S.events, settings: S.settings }, null, 1)); break;
    // projects
    case 'pfilter': S.pfilter = el.dataset.f; rerender(); break;
    case 'pseg': syncProjForm(); S.edProj.assignee = el.dataset.v; rerender(); break;
    case 'punit': await store.saveDoc('projects', id, { unitPref: el.dataset.u }); break;
    case 'pstatus': { const p = findProj(id); if (!p) break; const upd = { status: el.dataset.s };
      if (el.dataset.s === 'done') upd.finishedAt = T(); if (el.dataset.s === 'active' && !p.startedAt) upd.startedAt = T();
      await store.saveDoc('projects', id, upd); if (el.dataset.s === 'done') { confetti(); toast('Project finished!', `${p.name} · ${hrs(pLogged(p), p)} logged`); } break; }
    case 'ptoggle': { const p = findProj(id); if (!p) break; const k = el.dataset.k, arr = clone(p[k] || []); arr[+el.dataset.i].done = !arr[+el.dataset.i].done; await store.saveDoc('projects', id, { [k]: arr }); break; }
    case 'pdel': { const p = findProj(id); if (!p) break; const k = el.dataset.k, arr = clone(p[k] || []); arr.splice(+el.dataset.i, 1); await store.saveDoc('projects', id, { [k]: arr }); break; }
    case 'logtime': S.sheet = { type: 'logtime', id, hours: 2, date: T(), note: '' }; rerender(); break;
    case 'lthours': S.sheet.hours = +el.dataset.n; rerender(); break;
    case 'dologtime': { const sh = S.sheet, p = findProj(sh.id), h = Number(sh.hours) || 0; if (!p || h <= 0) break;
      const upd = { timeLog: [...(p.timeLog || []), { date: sh.date || T(), hours: h, note: sh.note || '', by: S.me.key }] };
      if (p.status === 'planned' || p.status === 'idea') { upd.status = 'active'; upd.startedAt = upd.startedAt || T(); }
      S.sheet = null; await store.saveDoc('projects', p.id, upd); rerender(); toast('Time logged', `${L.hoursText(h)} on ${p.name}`); break; }
    case 'session': { const p = findProj(id); let d = T(); const wd = L.weekday(d); if (wd !== 6 && wd !== 0) d = L.addDays(d, 6 - wd);
      S.sheet = { type: 'session', id, date: d, start: '08:00', end: '14:00', note: '' }; rerender(); break; }
    case 'dosession': { const sh = S.sheet, p = findProj(sh.id), h = L.spanHours(sh.start, sh.end); if (!p || h <= 0) break;
      S.sheet = null; await store.saveDoc('projects', p.id, { sessions: [...(p.sessions || []), { date: sh.date, start: sh.start, end: sh.end, hours: h, note: sh.note || '', by: S.me.key }] }); rerender(); toast('Session booked', `${L.niceDate(sh.date, T())} · ${L.hoursText(h)}`); break; }
    case 'pdelete': S.sheet = { type: 'pconfirm', id }; rerender(); break;
    case 'dopdelete': { const did = S.sheet.id; S.sheet = null; location.hash = '#/projects'; await store.deleteDoc('projects', did); toast('Project deleted', ''); break; }
    // calendar & events
    case 'cday': S.cal.sel = el.dataset.d; rerender(); break;
    case 'cmonth': { const m = L.addMonths(S.cal.month + '-01', +el.dataset.n).slice(0, 7); S.cal.month = m; S.cal.sel = m === T().slice(0, 7) ? T() : m + '-01'; rerender(); break; }
    case 'ctoday': S.cal.month = T().slice(0, 7); S.cal.sel = T(); rerender(); break;
    case 'cview': S.cal.view = el.dataset.v; rerender(); break;
    case 'evtype': syncEvForm(); S.edEv.type = el.dataset.v; if ((el.dataset.v === 'Holiday' || el.dataset.v === 'Leave') && !S.edEv.range) { S.edEv.range = true; S.edEv.away = true; } rerender(); break;
    case 'evnewtype': { syncEvForm(); const n = (prompt('New event type (e.g. Video editing)') || '').trim().slice(0, 24); if (!n) break;
      if (!evTypes().includes(n)) await store.saveSettings({ eventTypes: [...evTypes(), n] }); S.edEv.type = n; rerender(); break; }
    case 'evrange': syncEvForm(); S.edEv.range = el.dataset.v === '1'; if (S.edEv.range && (!S.edEv.endDate || S.edEv.endDate < S.edEv.date)) S.edEv.endDate = S.edEv.date; rerender(); break;
    case 'evvis': syncEvForm(); S.edEv.visibility = el.dataset.v; rerender(); break;
    case 'evdelete': if (confirm('Delete this event?')) { await store.deleteDoc('events', id); S.edEv = null; location.replace('#/calendar'); toast('Event deleted', ''); } break;
    case 'starter': await store.loadStarter(); toast('Starter list loaded', '22 jobs added'); break;
    case 'resetdemo': await store.resetDemo(); toast('Demo reset', ''); break;
  }
});
function syncForm() {
  const f = document.querySelector('[data-form=edit]'); if (!f || !S.editing) return;
  const fd = new FormData(f);
  for (const k of ['name', 'category', 'every', 'unit', 'countFrom', 'onDay', 'nextDue', 'lastDone', 'remindWhen', 'remindAgain', 'remindTime', 'notes']) if (fd.has(k)) S.editing[k] = fd.get(k);
  S.editing.important = fd.has('important');
}
document.addEventListener('input', ev => {
  if (ev.target.id === 'q') { S.search = ev.target.value; const pos = ev.target.selectionStart; rerender(); const q = document.getElementById('q'); q.focus(); q.setSelectionRange(pos, pos); }
});
// Edit form: when the repeat or last-done date changes, work out the new due date straight away.
function recalcDue() {
  const f = document.querySelector('[data-form=edit]'); if (!f) return;
  const fd = new FormData(f), hint = document.getElementById('due-hint'), due = f.querySelector('[name=nextDue]');
  const job = { every: Math.max(1, Number(fd.get('every')) || 1), unit: fd.get('unit'), countFrom: fd.get('countFrom') === 'fixed' ? 'fixed' : 'done', onDay: fd.get('onDay') === '' ? null : Number(fd.get('onDay')), nextDue: due.value };
  const last = fd.get('lastDone'), t = T();
  if (job.countFrom === 'done' && last) {
    const nd = L.nextDueAfter(job, last);
    due.value = nd;
    hint.textContent = `Next due updated to ${L.niceDate(nd, t)} (${L.intervalText(job.every, job.unit)} after ${L.niceDate(last, t)}).`;
  } else if (job.countFrom === 'fixed' && due.value && job.onDay !== null) {
    const nd = L.snapToWeekday(due.value, job.onDay);
    if (nd !== due.value) { due.value = nd; hint.textContent = `Next due moved to ${L.niceDate(nd, t)} to land on a ${L.DAY_NAMES[job.onDay]}.`; }
    else hint.textContent = 'Fixed schedule: the next due date stays as set; the new repeat applies after that.';
  } else if (job.countFrom === 'fixed') {
    hint.textContent = 'Fixed schedule: the next due date stays as set; the new repeat applies after that.';
  } else hint.textContent = 'Add a last-done date to work out the next due date.';
  if (S.editing) S.editing.nextDue = due.value;
}
document.addEventListener('change', async ev => {
  const el = ev.target;
  if (el.hasAttribute && el.hasAttribute('data-recalc')) { recalcDue(); return; }
  const c = el.dataset.change; if (!c) return;
  const j = el.dataset.id ? findJob(el.dataset.id) : null;
  switch (c) {
    case 'due': if (j && el.value) { await store.saveJob(j.id, { nextDue: el.value }); toast('Due date changed', L.niceDate(el.value, T())); } break;
    case 'notes': if (j) await store.saveJob(j.id, { notes: el.value }); break;
    case 'photo': if (j && el.files[0]) { try { await store.saveJob(j.id, { photo: await compressPhoto(el.files[0]) }); } catch { toast('Couldn’t add that photo', 'Try a different one'); } } break;
    case 'deftime': await store.saveSettings({ defaultTime: el.value }); toast('Default time saved', el.value); break;
    case 'import': {
      const file = el.files[0]; if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (!Array.isArray(data.jobs)) throw new Error('Not a TaskForce backup');
        const replace = confirm(`Restore ${data.jobs.length} jobs?\n\nOK = replace everything now in TaskForce\nCancel = add them to what's there`);
        await store.importAll(data, replace); toast('Backup restored', `${data.jobs.length} jobs`);
      } catch (e) { toast('Couldn’t restore that file', e.message); }
      break;
    }
    case 'amtn': S.sheet.amt = { ...S.sheet.amt, n: Math.max(1, +el.value || 1) }; rerender(); break;
    case 'amtunit': S.sheet.amt = { ...S.sheet.amt, unit: el.value }; rerender(); break;
    case 'xnote': S.sheet.note = el.value; break;
    case 'xnormal': S.sheet.normal = el.checked; break;
    case 'lth': S.sheet.hours = Math.max(0, +el.value || 0); rerender(); break;
    case 'ltd': S.sheet.date = el.value || T(); break;
    case 'ltn': S.sheet.note = el.value; break;
    case 'ssd': S.sheet.date = el.value || T(); rerender(); break;
    case 'sss': S.sheet.start = el.value; rerender(); break;
    case 'sse': S.sheet.end = el.value; rerender(); break;
    case 'ssn': S.sheet.note = el.value; break;
    case 'pnotes': await store.saveDoc('projects', el.dataset.id, { notes: el.value }); break;
    case 'perday': await store.saveSettings({ hoursPerDay: Math.max(1, Math.min(24, +el.value || 6)) }); toast('Saved', `A project day = ${el.value} hours`); break;
    case 'perweek': await store.saveSettings({ daysPerWeek: Math.max(1, Math.min(7, +el.value || 5)) }); toast('Saved', `A project week = ${el.value} days`); break;
    case 'allday': case 'evrepeat': syncEvForm(); rerender(); break;
    case 'donedate': S.sheet.date = el.value || T(); rerender(); break;
  }
});
document.addEventListener('submit', async ev => {
  const f = ev.target; ev.preventDefault();
  const fd = new FormData(f);
  if (f.dataset.form === 'login') {
    try { await store.signIn(fd.get('email'), fd.get('pw')); } catch (e) { $app.innerHTML = viewLogin('That email and password didn’t work. Try again.'); }
  } else if (f.dataset.form === 'step') {
    const j = findJob(f.dataset.id), text = String(fd.get('text') || '').trim();
    if (j && text) await store.saveJob(j.id, { steps: [...(j.steps || []), { text, done: false }] });
  } else if (f.dataset.form === 'pstep' || f.dataset.form === 'pmat' || f.dataset.form === 'pprep') {
    const p = findProj(f.dataset.id), text = String(fd.get('text') || '').trim(); if (!p || !text) return;
    if (f.dataset.form === 'pstep') await store.saveDoc('projects', p.id, { steps: [...(p.steps || []), { text, hours: Number(fd.get('hours')) || 0, done: false }] });
    if (f.dataset.form === 'pmat') await store.saveDoc('projects', p.id, { materials: [...(p.materials || []), { text, qty: String(fd.get('qty') || '').trim(), cost: Number(fd.get('cost')) || 0, done: false }] });
    if (f.dataset.form === 'pprep') { const date = fd.get('date'); if (!date) { toast('Pick a day for the reminder', ''); return; } await store.saveDoc('projects', p.id, { prep: [...(p.prep || []), { text, date, done: false }] }); }
  } else if (f.dataset.form === 'project') {
    syncProjForm(); const e = S.edProj, name = String(e.name || '').trim();
    if (!name) { document.getElementById('pname-err').hidden = false; document.getElementById('p-name').focus(); return; }
    const unit = e.estU || 'hours';
    const data = { name, category: e.category, status: e.status || 'planned', estHours: e.estN === '' || e.estN == null ? 0 : L.toHours(Number(e.estN) || 0, unit, perDay(), perWeek()), unitPref: unit, budget: e.budget === '' || e.budget == null ? null : Number(e.budget), assignee: e.assignee || 'either', notes: e.notes || '' };
    const id = f.dataset.id;
    if (id) { await store.saveDoc('projects', id, data); S.edProj = null; history.back(); toast('Saved', name); }
    else { const nid = await store.saveDoc('projects', null, { ...data, steps: [], materials: [], sessions: [], prep: [], timeLog: [], createdBy: S.me.key, createdAt: nowIso() }); S.edProj = null; location.replace('#/project/' + nid); toast('Project added', name); }
  } else if (f.dataset.form === 'event') {
    syncEvForm(); const e = S.edEv, title = String(e.title || '').trim();
    if (!title) { document.getElementById('etitle-err').hidden = false; document.getElementById('e-title').focus(); return; }
    const data = { title, type: e.type || 'Event', date: e.date || T(), endDate: e.range && e.endDate && e.endDate > e.date ? e.endDate : null, allDay: e.allDay !== false, start: e.allDay === false ? e.start : null, end: e.allDay === false ? e.end : null,
      repeat: e.repeat || 'none', until: e.repeat && e.repeat !== 'none' && e.until ? e.until : null, visibility: e.visibility === 'private' ? 'private' : 'shared', owner: e.owner || S.me.key, away: !!e.away, remind: e.remind || 'none', notes: e.notes || '' };
    const id = f.dataset.id;
    if (id) { const old = findEv(id); if (old && (old.date !== data.date || old.start !== data.start || old.remind !== data.remind)) data.notify = null; await store.replaceDoc('events', id, { ...old, ...data, notify: data.notify === null ? null : old?.notify || null }); }
    else await store.saveDoc('events', null, { ...data, createdBy: S.me.key, createdAt: nowIso() });
    S.edEv = null; if (S.cal) { S.cal.sel = data.date; S.cal.month = data.date.slice(0, 7); } else S.cal = { month: data.date.slice(0, 7), sel: data.date, view: 'month' };
    location.replace('#/calendar'); toast(id ? 'Event saved' : 'Event added', `${title} · ${L.niceDate(data.date, T())}`);
  } else if (f.dataset.form === 'cat') {
    const name = String(fd.get('name') || '').trim(); if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20) || 'cat';
    if (cats().some(c => c.id === id)) { toast('That category already exists', ''); return; }
    await store.saveSettings({ categories: [...cats(), { id, name, color: fd.get('color'), icon: fd.get('icon') }] });
  } else if (f.dataset.form === 'edit') {
    syncForm();
    const e = S.editing, name = String(e.name || '').trim();
    if (!name) { const er = document.getElementById('name-err'); er.hidden = false; document.getElementById('f-name').focus(); return; }
    const t = T();
    const job = {
      name, type: e.type, category: e.category, every: Math.max(1, Number(e.every) || 1), unit: e.unit, countFrom: e.countFrom === 'fixed' ? 'fixed' : 'done',
      onDay: e.onDay === '' || e.onDay === null || e.onDay === undefined ? null : Number(e.onDay), lastDone: e.lastDone || null,
      remindWhen: e.remindWhen, remindAgain: e.remindAgain, remindTime: e.remindTime || '18:00', assignee: e.assignee || 'either', important: !!e.important, notes: e.notes || ''
    };
    job.nextDue = e.nextDue || (job.lastDone ? L.addInterval(job.lastDone, job.every, job.unit) : t);
    const id = f.dataset.id;
    // Safety net: repeat changed but the due date wasn't touched, on a job counted from when it's done.
    const orig = id ? findJob(id) : null;
    if (orig && job.countFrom === 'done' && job.lastDone && job.nextDue === orig.nextDue &&
        (String(orig.every) !== String(job.every) || orig.unit !== job.unit || orig.countFrom !== job.countFrom || String(orig.onDay ?? '') !== String(job.onDay ?? '') || orig.lastDone !== job.lastDone)) {
      job.nextDue = L.nextDueAfter(job, job.lastDone);
    }
    if (id) { await store.saveJob(id, job); S.editing = null; history.back(); toast('Saved', name); }
    else {
      const nid = await store.saveJob(null, { ...job, steps: [], createdBy: S.me.key, createdAt: nowIso() });
      await store.addHistory({ jobId: nid, jobName: name, kind: 'created', date: t, at: nowIso(), by: S.me.key });
      S.editing = null; location.replace('#/job/' + nid); toast('Added', name);
    }
  }
});
document.addEventListener('keydown', ev => {
  if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('.card[role=button]')) { ev.preventDefault(); ev.target.click(); }
  if (ev.key === 'Escape' && S.sheet) { S.sheet = null; rerender(); }
});
window.addEventListener('hashchange', () => { S.sheet = null; render(); window.scrollTo(0, 0); });

// ---------- start ----------
let unsubs = [];
store.start(me => {
  unsubs.forEach(u => typeof u === 'function' && u()); unsubs = [];
  S.me = me;
  if (!me) { $app.innerHTML = viewLogin(); return; }
  if (me.key === 'unknown') { $app.innerHTML = viewLogin(`${me.name} isn’t set up in firebase-config.js yet.`); return; }
  S.loaded = false; let got = 0;
  const ready = () => { if (++got >= 2) { S.loaded = true; } render(); };
  let first = { jobs: true, hist: true };
  unsubs.push(store.onJobs(list => { S.jobs = list; if (first.jobs) { first.jobs = false; ready(); } else rerender(); }));
  unsubs.push(store.onHistory(list => { S.history = list; if (first.hist) { first.hist = false; ready(); } else rerender(); }));
  unsubs.push(store.onCol('projects', list => { S.projects = list; if (S.loaded) rerender(); }));
  unsubs.push(store.onCol('events', list => { S.events = list; if (S.loaded) rerender(); }));
  unsubs.push(store.onSettings(s => { S.settings = { categories: DEFAULT_CATEGORIES, defaultTime: '18:00', ...s }; if (S.loaded) rerender(); }));
  render();
}).catch(e => { $app.innerHTML = `<div class="login">${shieldSvg(72)}<div class="err">Couldn’t start TaskForce: ${esc(e.message || e)}</div></div>`; });

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(e => console.warn('SW', e));
  navigator.serviceWorker.addEventListener('message', ev => { if (ev.data?.type === 'open' && ev.data.hash) location.hash = ev.data.hash; });
}
