// Dropbox backup for TaskForce (v1.08).
// Uses Dropbox's browser sign-in (PKCE), so no secret is stored anywhere. The App key is
// not secret; it's saved in TaskForce settings so it only needs entering once.
// Files go in the Dropbox app folder: Apps/TaskForce/
//   TaskForce-backup.json          latest copy (overwritten each time)
//   daily/taskforce-YYYY-MM-DD.json one per day, last 30 kept

const LS = 'tf-dbx';
const AUTH = 'https://www.dropbox.com/oauth2/authorize';
const TOKEN = 'https://api.dropboxapi.com/oauth2/token';
const API = 'https://api.dropboxapi.com/2/';
const CONTENT = 'https://content.dropboxapi.com/2/';
export const LATEST = '/TaskForce-backup.json';

const load = () => { try { return JSON.parse(localStorage.getItem(LS) || '{}'); } catch { return {}; } };
const save = o => { try { localStorage.setItem(LS, JSON.stringify(o)); } catch { } };
const redirectUri = () => location.origin + location.pathname;
const b64url = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export function status() { const s = load(); return { connected: !!s.refresh, last: s.last || null, account: s.account || '', error: s.error || '' }; }

export function pending() { return !!load().verifier && !load().refresh; }

// Step 1: open Dropbox in a new window. Dropbox shows a code to copy (no redirect needed,
// which is more reliable for an installed phone app).
export async function connect(appKey) {
  appKey = String(appKey || '').trim();
  if (!appKey) throw new Error('Enter the Dropbox App key first');
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(48)));
  const challenge = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  save({ ...load(), appKey, verifier, error: '' });
  const q = new URLSearchParams({ client_id: appKey, response_type: 'code', code_challenge: challenge, code_challenge_method: 'S256', token_access_type: 'offline' });
  const w = window.open(AUTH + '?' + q, '_blank');
  if (!w) location.href = AUTH + '?' + q;
}
export function cancelConnect() { const s = load(); save({ appKey: s.appKey, last: s.last }); }

// Step 2: paste the code Dropbox showed.
export async function finishWithCode(code) {
  const s = load();
  code = String(code || '').trim();
  if (!code) throw new Error('Paste the code from Dropbox');
  if (!s.verifier) throw new Error('Tap Connect first');
  const r = await fetch(TOKEN, { method: 'POST', body: new URLSearchParams({ code, grant_type: 'authorization_code', code_verifier: s.verifier, client_id: s.appKey }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.refresh_token) throw new Error(j.error_description ? (/code/i.test(j.error_description) ? 'That code didn’t work. Tap Connect again for a fresh code.' : j.error_description) : 'Dropbox said no (' + r.status + ')');
  save({ appKey: s.appKey, refresh: j.refresh_token, access: j.access_token, exp: Date.now() + (j.expires_in - 60) * 1000, last: s.last || null });
  try { const a = await api('users/get_current_account', null); save({ ...load(), account: a.email || a.name?.display_name || '' }); } catch { }
  return true;
}

// Call once at start-up: finishes the sign-in when Dropbox sends us back with ?code=
export async function finishConnect() {
  const q = new URLSearchParams(location.search);
  if (!q.get('code') && !q.get('error')) return null;
  const s = load(), back = s.back || '#/settings';
  history.replaceState(null, '', location.pathname + back);
  if (q.get('error')) { save({ ...s, error: q.get('error_description') || q.get('error') }); return { ok: false, msg: 'Dropbox connection was cancelled' }; }
  if (!s.verifier || q.get('state') !== s.state) return { ok: false, msg: 'Dropbox sign-in expired. Try Connect again.' };
  const body = new URLSearchParams({ code: q.get('code'), grant_type: 'authorization_code', code_verifier: s.verifier, client_id: s.appKey, redirect_uri: redirectUri() });
  const r = await fetch(TOKEN, { method: 'POST', body });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.refresh_token) { save({ ...s, verifier: null, error: j.error_description || 'Token exchange failed' }); return { ok: false, msg: 'Couldn’t connect Dropbox: ' + (j.error_description || r.status) }; }
  save({ appKey: s.appKey, refresh: j.refresh_token, access: j.access_token, exp: Date.now() + (j.expires_in - 60) * 1000, last: s.last || null });
  try { const a = await api('users/get_current_account', null); save({ ...load(), account: a.email || a.name?.display_name || '' }); } catch { }
  return { ok: true, msg: 'Dropbox connected' };
}

export function disconnect() { const s = load(); save({ appKey: s.appKey }); }

async function token() {
  const s = load();
  if (!s.refresh) throw new Error('Dropbox isn’t connected on this phone');
  if (s.access && s.exp > Date.now()) return s.access;
  const r = await fetch(TOKEN, { method: 'POST', body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: s.refresh, client_id: s.appKey }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { if (r.status === 400 || r.status === 401) save({ appKey: s.appKey, error: 'Dropbox access was removed. Connect again.' }); throw new Error(j.error_description || 'Dropbox sign-in failed'); }
  save({ ...load(), access: j.access_token, exp: Date.now() + (j.expires_in - 60) * 1000 });
  return j.access_token;
}
async function api(path, args) {
  const r = await fetch(API + path, { method: 'POST', headers: { Authorization: 'Bearer ' + await token(), ...(args === null ? {} : { 'Content-Type': 'application/json' }) }, body: args === null ? null : JSON.stringify(args) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error_summary || 'Dropbox error ' + r.status);
  return j;
}
async function upload(path, text) {
  const r = await fetch(CONTENT + 'files/upload', { method: 'POST', headers: { Authorization: 'Bearer ' + await token(), 'Content-Type': 'application/octet-stream', 'Dropbox-API-Arg': JSON.stringify({ path, mode: 'overwrite', mute: true }) }, body: text });
  if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error_summary || 'Upload failed ' + r.status); }
  return r.json();
}

// Back up now. day = 'YYYY-MM-DD' (Sydney date) for the daily copy.
export async function backup(text, day) {
  await upload(LATEST, text);
  await upload(`/daily/taskforce-${day}.json`, text);
  try { // keep the last 30 daily copies
    const list = await api('files/list_folder', { path: '/daily' });
    const old = list.entries.filter(e => e['.tag'] === 'file').map(e => e.name).sort().reverse().slice(30);
    for (const n of old) await api('files/delete_v2', { path: '/daily/' + n });
  } catch { }
  const at = new Date().toISOString();
  save({ ...load(), last: at, error: '' });
  return at;
}
export async function download(path = LATEST) {
  const r = await fetch(CONTENT + 'files/download', { method: 'POST', headers: { Authorization: 'Bearer ' + await token(), 'Dropbox-API-Arg': JSON.stringify({ path }) } });
  if (!r.ok) throw new Error(r.status === 409 ? 'No backup in Dropbox yet' : 'Download failed ' + r.status);
  return JSON.parse(await r.text());
}
export async function listDaily() {
  try { const l = await api('files/list_folder', { path: '/daily' }); return l.entries.filter(e => e['.tag'] === 'file').map(e => e.name).sort().reverse(); } catch { return []; }
}
