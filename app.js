import * as L from './logic.js';
import { createStore, DEMO } from './store.js';
import { DEFAULT_CATEGORIES } from './seed.js';

export const VERSION = '1.02';
const store = createStore();
const S = { me: null, jobs: [], history: [], settings: { categories: DEFAULT_CATEGORIES, defaultTime: '18:00' }, filter: 'all', search: null, loaded: false, sheet: null, pending: null, editing: null };
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
  gear: sv('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>', 2)
};
const COLORS = ['terra', 'slate', 'wattle', 'gum', 'ochre', 'ink'];
const COLOR_NAMES = { terra: 'Terracotta', slate: 'Slate', wattle: 'Wattle', gum: 'Gum leaf', ochre: 'Ochre', ink: 'Navy' };
const ICONS = ['house', 'car', 'paw', 'mask', 'battery', 'tag'];

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
const navBtn = (r, icon, label) => `<button class="${(location.hash || '#/home').startsWith('#/' + r) ? 'on' : ''}" data-act="go" data-to="#/${r}">${I[icon]}${label}</button>`;
const nav = () => `<nav class="nav" aria-label="Main">${navBtn('home', 'home', 'Home')}${navBtn('jobs', 'jobs', 'Jobs')}${navBtn('items', 'items', 'Items')}${navBtn('history', 'clock', 'History')}</nav>`;
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
  <div class="lab">Coming up</div>
  ${coming.length ? `<div class="ups">${coming.map(j => `<button class="up" data-act="open" data-id="${j.id}">
    <span class="d" style="${L.daysUntil(j, t) === 0 ? 'color:var(--terra-d)' : ''}">${L.daysUntil(j, t) === 0 ? 'Due today' : esc(L.niceDate(j.nextDue, t))}</span>${badge(j, true)}<span class="n">${esc(j.name)}</span></button>`).join('')}</div>` : `<div class="empty">Nothing coming up.</div>`}
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
  <div class="top"><div><div class="sub">Things that wear out</div><h1>Items</h1></div></div>
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
  return `<div class="wrap"><div class="top"><div><div class="sub">Who did what</div><h1>History</h1></div></div>
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
  <div class="grp"><span class="l">${e.type === 'item' ? 'Suggested life' : 'Repeat every'}</span><div class="inline"><input class="field" style="width:80px;text-align:center;font-weight:700" type="number" min="1" max="99" name="every" value="${esc(e.every)}" aria-label="Number"><select class="field" name="unit" aria-label="Unit">${['days', 'weeks', 'months', 'years'].map(u => opt(u, u, e.unit)).join('')}</select></div></div>
  <div class="grp box" style="padding:8px 12px;gap:0"><span class="l" style="padding-top:4px">Next due is counted from</span>
    <label class="radio"><input type="radio" name="countFrom" value="done" ${e.countFrom !== 'fixed' ? 'checked' : ''}><span>When it’s done<br><span class="hint">Done late? The next date moves with you.</span></span></label>
    <label class="radio"><input type="radio" name="countFrom" value="fixed" ${e.countFrom === 'fixed' ? 'checked' : ''}><span>Fixed schedule<br><span class="hint">Stays on its set dates, however late it’s done.</span></span></label></div>
  <div class="grp"><label for="f-day">On day</label><select id="f-day" class="field" name="onDay">${opt('', 'Any day', e.onDay ?? '')}${L.DAY_NAMES.map((d, i) => opt(i, d, e.onDay ?? '')).join('')}</select></div>
  <div class="inline"><div class="grp" style="flex:1"><label for="f-due">Next due</label><input id="f-due" class="field" type="date" name="nextDue" value="${esc(e.nextDue || '')}"></div>
  <div class="grp" style="flex:1"><label for="f-last">${e.type === 'item' ? 'Last replaced' : 'Last done'}</label><input id="f-last" class="field" type="date" name="lastDone" value="${esc(e.lastDone || '')}"></div></div>
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

// ---------- sheets ----------
function sheetHtml() {
  const sh = S.sheet; if (!sh) return '';
  const j = findJob(sh.id), t = T();
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
  if (v === 'jobs') html = viewJobs();
  else if (v === 'items') html = viewItems();
  else if (v === 'history') html = viewHistory();
  else if (v === 'job') html = viewDetail(parts[1]);
  else if (v === 'edit') html = viewEdit(parts[1], params);
  else if (v === 'new') html = viewEdit(null, params);
  else if (v === 'settings') html = viewSettings();
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
    case 'export': download(`taskforce-backup-${T()}.json`, JSON.stringify({ app: 'TaskForce', version: VERSION, exported: nowIso(), jobs: S.jobs, history: S.history, settings: S.settings }, null, 1)); break;
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
document.addEventListener('change', async ev => {
  const el = ev.target, c = el.dataset.change; if (!c) return;
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
  unsubs.push(store.onSettings(s => { S.settings = { categories: DEFAULT_CATEGORIES, defaultTime: '18:00', ...s }; if (S.loaded) rerender(); }));
  render();
}).catch(e => { $app.innerHTML = `<div class="login">${shieldSvg(72)}<div class="err">Couldn’t start TaskForce: ${esc(e.message || e)}</div></div>`; });

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(e => console.warn('SW', e));
  navigator.serviceWorker.addEventListener('message', ev => { if (ev.data?.type === 'open' && ev.data.hash) location.hash = ev.data.hash; });
}
