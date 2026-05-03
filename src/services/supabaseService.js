// Cliente Supabase, BFF (apiRequest com Bearer) e storage com fallback localStorage.

import { SUPABASE_URL, SUPABASE_ANON_KEY, API_BASE, USERS_KEY, SESSION_KEY, STORAGE_KEY } from '../config/constants.js';

const { createClient } = window.supabase;
export const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const hasCloudStorage =
  typeof window !== 'undefined' &&
  window.storage &&
  typeof window.storage.get === 'function';

export async function apiRequest(path, method = 'GET', body = null) {
  const { data: { session } } = await db.auth.getSession();
  if (!session) throw new Error('Sessão expirada. Faça login novamente.');

  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, opts);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

export async function cloudGet(key, shared = false) {
  try {
    if (hasCloudStorage) {
      const result = await window.storage.get(key, shared);
      return result?.value ? JSON.parse(result.value) : null;
    }
    const local = localStorage.getItem(key);
    return local ? JSON.parse(local) : null;
  } catch (error) {
    console.error('Erro ao ler storage:', error);
    return null;
  }
}

export async function cloudSet(key, value, shared = false) {
  try {
    if (hasCloudStorage) {
      await window.storage.set(key, JSON.stringify(value), shared);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
    return true;
  } catch (error) {
    console.error('Erro ao salvar storage:', error);
    return false;
  }
}

export async function cloudDel(key, shared = false) {
  try {
    if (hasCloudStorage) {
      await window.storage.delete(key, shared);
    } else {
      localStorage.removeItem(key);
    }
    return true;
  } catch (error) {
    console.error('Erro ao remover storage:', error);
    return false;
  }
}

export async function getUsers()                  { return (await cloudGet(USERS_KEY, true)) || {}; }
export async function setUsers(users)             { return await cloudSet(USERS_KEY, users, true); }
export async function getSession()                { return await cloudGet(SESSION_KEY, false); }
export async function setSession(user)            { await cloudSet(SESSION_KEY, user, false); }
export async function clearSession()              { await cloudDel(SESSION_KEY, false); }
export async function getUserAnalyses(uid)        { return (await cloudGet(STORAGE_KEY(uid), false)) || []; }
export async function setUserAnalyses(uid, list)  { return await cloudSet(STORAGE_KEY(uid), list, false); }
