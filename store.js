// Data layer. Uses Firebase when configured, otherwise a demo store on this phone.
import { firebaseConfig, vapidKey, people } from './firebase-config.js';
import { STARTER, DEFAULT_CATEGORIES } from './seed.js';

const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
export const DEMO = String(firebaseConfig.apiKey).startsWith('PASTE');

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const clean = o => JSON.parse(JSON.stringify(o, (k, v) => (v === undefined ? null : v)));

// ---------- Demo store (localStorage) ----------
class DemoStore {
  constructor() {
    this.mode = 'demo';
    this.people = [{ key: 'shaun', name: 'Shaun' }, { key: 'lyndsey', name: 'Lyndsey' }];
    this.subs = { jobs: [], history: [], settings: [], projects: [], events: [], goals: [], packs: [], packlists: [] };
    this.load();
  }
  load() {
    try { this.db = JSON.parse(localStorage.getItem('tf-demo') || 'null'); } catch { this.db = null; }
    if (!this.db) {
      const jobs = {};
      const now = new Date().toISOString();
      for (const j of STARTER) { const id = uid(); jobs[id] = { ...j, id, createdBy: 'shaun', createdAt: now }; }
      this.db = { jobs, history: {}, settings: { categories: DEFAULT_CATEGORIES, defaultTime: '18:00' }, me: null };
      this.persist();
    }
  }
  ensure() { for (const c of ['projects', 'events', 'goals', 'packs', 'packlists']) this.db[c] = this.db[c] || {}; }
  persist() { try { localStorage.setItem('tf-demo', JSON.stringify(this.db)); } catch (e) { console.warn(e); } }
  emit() {
    this.ensure();
    this.subs.projects.forEach(cb => cb(Object.values(this.db.projects)));
    this.subs.events.forEach(cb => cb(Object.values(this.db.events)));
    for (const c of ['goals', 'packs', 'packlists']) (this.subs[c] || []).forEach(cb => cb(Object.values(this.db[c])));
    const jobs = Object.values(this.db.jobs);
    const hist = Object.values(this.db.history).sort((a, b) => (b.at || '').localeCompare(a.at || ''));
    this.subs.jobs.forEach(cb => cb(jobs));
    this.subs.history.forEach(cb => cb(hist));
    this.subs.settings.forEach(cb => cb(this.db.settings));
  }
  async start(onAuth) {
    this.onAuth = onAuth;
    const key = this.db.me || 'shaun';
    this.me = this.people.find(p => p.key === key);
    onAuth(this.me);
  }
  switchUser(key) { this.db.me = key; this.persist(); this.me = this.people.find(p => p.key === key); this.onAuth(this.me); }
  onJobs(cb) { this.subs.jobs.push(cb); setTimeout(() => this.emit()); }
  onHistory(cb) { this.subs.history.push(cb); setTimeout(() => this.emit()); }
  onSettings(cb) { this.subs.settings.push(cb); setTimeout(() => this.emit()); }
  async saveJob(id, data) {
    id = id || uid();
    this.db.jobs[id] = { ...(this.db.jobs[id] || {}), ...clean(data), id };
    this.persist(); this.emit(); return id;
  }
  async replaceJob(id, data) { this.db.jobs[id] = { ...clean(data), id }; this.persist(); this.emit(); }
  async deleteJob(id) {
    delete this.db.jobs[id];
    for (const [hid, h] of Object.entries(this.db.history)) if (h.jobId === id) delete this.db.history[hid];
    this.persist(); this.emit();
  }
  async addHistory(e) { const id = uid(); this.db.history[id] = { ...clean(e), id }; this.persist(); this.emit(); return id; }
  async deleteHistory(id) { delete this.db.history[id]; this.persist(); this.emit(); }
  onCol(col, cb) { (this.subs[col] = this.subs[col] || []).push(cb); setTimeout(() => this.emit()); }
  async saveDoc(col, id, data) { this.ensure(); id = id || uid(); this.db[col][id] = { ...(this.db[col][id] || {}), ...clean(data), id }; this.persist(); this.emit(); return id; }
  async replaceDoc(col, id, data) { this.ensure(); this.db[col][id] = { ...clean(data), id }; this.persist(); this.emit(); }
  async deleteDoc(col, id) { this.ensure(); delete this.db[col][id]; this.persist(); this.emit(); }
  async saveSettings(s) { this.db.settings = { ...this.db.settings, ...clean(s) }; this.persist(); this.emit(); }
  async importAll(data, replace) {
    if (replace) { this.db.jobs = {}; this.db.history = {}; }
    for (const j of data.jobs || []) { const id = j.id || uid(); this.db.jobs[id] = { ...j, id }; }
    for (const h of data.history || []) { const id = h.id || uid(); this.db.history[id] = { ...h, id }; }
    this.ensure();
    const more = ['projects', 'events', 'goals', 'packs', 'packlists'];
    if (replace) for (const c of more) this.db[c] = {};
    for (const c of more) for (const x of data[c] || []) { const id = x.id || uid(); this.db[c][id] = { ...x, id }; }
    if (data.settings) this.db.settings = { ...this.db.settings, ...data.settings };
    this.persist(); this.emit();
  }
  async loadStarter() { const now = new Date().toISOString(); for (const j of STARTER) await this.saveJob(null, { ...j, createdBy: this.me.key, createdAt: now }); }
  async resetDemo() { localStorage.removeItem('tf-demo'); this.db = null; this.load(); this.emit(); }
  async enablePush() { return { ok: false, msg: 'Push reminders work once Firebase is set up. This is demo mode.' }; }
  pushStatus() { return 'demo'; }
  async signOut() {}
}

// ---------- Firebase store ----------
class FireStore {
  constructor() { this.mode = 'firebase'; this.people = people.map(p => ({ key: p.key, name: p.name })); }
  async start(onAuth) {
    const [{ initializeApp }, auth, fs] = await Promise.all([
      import(FB + 'firebase-app.js'), import(FB + 'firebase-auth.js'), import(FB + 'firebase-firestore.js')
    ]);
    this.fs = fs; this.authMod = auth;
    this.app = initializeApp(firebaseConfig);
    try {
      this.db = fs.initializeFirestore(this.app, { localCache: fs.persistentLocalCache({ tabManager: fs.persistentSingleTabManager() }) });
    } catch { this.db = fs.getFirestore(this.app); }
    this.auth = auth.getAuth(this.app);
    await auth.setPersistence(this.auth, auth.browserLocalPersistence).catch(() => {});
    auth.onAuthStateChanged(this.auth, user => {
      if (!user) { this.me = null; onAuth(null); return; }
      const p = people.find(x => x.email.toLowerCase() === String(user.email).toLowerCase());
      this.me = p ? { key: p.key, name: p.name, email: user.email } : { key: 'unknown', name: user.email, email: user.email };
      onAuth(this.me);
    });
  }
  async signIn(email, pw) { await this.authMod.signInWithEmailAndPassword(this.auth, email.trim(), pw); }
  async signOut() { await this.authMod.signOut(this.auth); }
  onJobs(cb) {
    const { collection, onSnapshot } = this.fs;
    return onSnapshot(collection(this.db, 'jobs'), snap => cb(snap.docs.map(d => ({ ...d.data(), id: d.id }))), e => console.error(e));
  }
  onHistory(cb) {
    const { collection, onSnapshot, query, orderBy, limit } = this.fs;
    return onSnapshot(query(collection(this.db, 'history'), orderBy('at', 'desc'), limit(400)), snap => cb(snap.docs.map(d => ({ ...d.data(), id: d.id }))), e => console.error(e));
  }
  onSettings(cb) {
    const { doc, onSnapshot } = this.fs;
    return onSnapshot(doc(this.db, 'settings', 'app'), d => cb(d.exists() ? d.data() : { categories: DEFAULT_CATEGORIES, defaultTime: '18:00' }), e => console.error(e));
  }
  async saveJob(id, data) {
    const { doc, collection, setDoc } = this.fs;
    const ref = id ? doc(this.db, 'jobs', id) : doc(collection(this.db, 'jobs'));
    const d = clean(data); delete d.id; delete d.notify;
    await setDoc(ref, d, { merge: true });
    return ref.id;
  }
  async replaceJob(id, data) {
    const { doc, setDoc } = this.fs;
    const d = clean(data); delete d.id;
    await setDoc(doc(this.db, 'jobs', id), d);
  }
  async deleteJob(id) {
    const { doc, deleteDoc, collection, query, where, getDocs } = this.fs;
    await deleteDoc(doc(this.db, 'jobs', id));
    const hs = await getDocs(query(collection(this.db, 'history'), where('jobId', '==', id)));
    await Promise.all(hs.docs.map(h => deleteDoc(h.ref)));
  }
  onCol(col, cb) {
    const { collection, onSnapshot } = this.fs;
    return onSnapshot(collection(this.db, col), snap => cb(snap.docs.map(d => ({ ...d.data(), id: d.id }))), e => console.error(e));
  }
  async saveDoc(col, id, data) {
    const { doc, collection, setDoc } = this.fs;
    const ref = id ? doc(this.db, col, id) : doc(collection(this.db, col));
    const d = clean(data); delete d.id; delete d.notify;
    await setDoc(ref, d, { merge: true });
    return ref.id;
  }
  async replaceDoc(col, id, data) { const { doc, setDoc } = this.fs; const d = clean(data); delete d.id; await setDoc(doc(this.db, col, id), d); }
  async deleteDoc(col, id) { const { doc, deleteDoc } = this.fs; await deleteDoc(doc(this.db, col, id)); }
  async addHistory(e) {
    const { collection, addDoc } = this.fs;
    const r = await addDoc(collection(this.db, 'history'), clean(e));
    return r.id;
  }
  async deleteHistory(id) { const { doc, deleteDoc } = this.fs; await deleteDoc(doc(this.db, 'history', id)); }
  async saveSettings(s) { const { doc, setDoc } = this.fs; await setDoc(doc(this.db, 'settings', 'app'), clean(s), { merge: true }); }
  async importAll(data, replace) {
    const { doc, setDoc, collection, writeBatch, getDocs } = this.fs;
    if (replace) {
      for (const c of ['jobs', 'history', 'projects', 'events', 'goals', 'packs', 'packlists']) {
        const snap = await getDocs(collection(this.db, c));
        for (let i = 0; i < snap.docs.length; i += 400) {
          const b = writeBatch(this.db); snap.docs.slice(i, i + 400).forEach(d => b.delete(d.ref)); await b.commit();
        }
      }
    }
    const put = async (c, list) => {
      for (let i = 0; i < list.length; i += 400) {
        const b = writeBatch(this.db);
        list.slice(i, i + 400).forEach(x => { const d = clean(x); const id = d.id; delete d.id; b.set(id ? doc(this.db, c, id) : doc(collection(this.db, c)), d); });
        await b.commit();
      }
    };
    await put('jobs', data.jobs || []);
    await put('history', data.history || []);
    await put('projects', data.projects || []);
    await put('events', data.events || []);
    await put('goals', data.goals || []);
    await put('packs', data.packs || []);
    await put('packlists', data.packlists || []);
    if (data.settings) await setDoc(doc(this.db, 'settings', 'app'), clean(data.settings), { merge: true });
  }
  async loadStarter() {
    const now = new Date().toISOString();
    await this.importAll({ jobs: STARTER.map(j => ({ ...j, createdBy: this.me.key, createdAt: now })) }, false);
  }
  pushStatus() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }
  async enablePush() {
    try {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) return { ok: false, msg: 'This browser can’t do push reminders. Install TaskForce from Chrome.' };
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return { ok: false, msg: 'Notifications are blocked. Allow them for TaskForce in your phone settings.' };
      const { getMessaging, getToken, isSupported } = await import(FB + 'firebase-messaging.js');
      if (!(await isSupported())) return { ok: false, msg: 'Push isn’t supported in this browser. Use Chrome.' };
      const reg = await navigator.serviceWorker.ready;
      const token = await getToken(getMessaging(this.app), { vapidKey, serviceWorkerRegistration: reg });
      if (!token) return { ok: false, msg: 'Couldn’t get a push token. Try again.' };
      const { doc, setDoc, arrayUnion } = this.fs;
      await setDoc(doc(this.db, 'users', this.me.key), { name: this.me.name, tokens: arrayUnion(token), updatedAt: new Date().toISOString() }, { merge: true });
      localStorage.setItem('tf-push-token', token);
      return { ok: true, msg: 'Push reminders are on for this phone.' };
    } catch (e) {
      console.error(e);
      return { ok: false, msg: 'Couldn’t turn on reminders: ' + (e.message || e) };
    }
  }
}

export function createStore() { return DEMO ? new DemoStore() : new FireStore(); }
export { uid };
