// Autenticação Supabase + chamada à Edge Function de IA (proxy seguro).

import { db } from './supabaseService.js';
import { AI_EDGE_URL, SUPABASE_ANON_KEY } from '../config/constants.js';

export function hashPw(pw) {
  let h = 5381;
  for (let i = 0; i < pw.length; i++) h = (h * 33) ^ pw.charCodeAt(i);
  return (h >>> 0).toString(36) + pw.length.toString(36) + 'rl2024';
}

export async function signUp(email, password, name) {
  const { data, error } = await db.auth.signUp({
    email, password,
    options: { data: { full_name: name } },
  });
  if (error) throw error;
  return data.user;
}

export async function signIn(email, password) {
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  await db.auth.signOut();
}

export async function getCurrentUser() {
  const { data: { session } } = await db.auth.getSession();
  return session?.user || null;
}

export async function callAI(prompt) {
  const { data: { session } } = await db.auth.getSession();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const resp = await fetch(AI_EDGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${resp.status}`);
    }
    const data = await resp.json();
    if (!data.text) throw new Error('Resposta vazia da IA.');
    return data.text;
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

export function aiLoadingHTML() {
  return `<div class="ai-insight">
    <div class="ai-insight-title">✦ INTERPRETAÇÃO COM IA</div>
    <div class="ai-thinking">
      <div class="ai-thinking-dot"></div>
      <div class="ai-thinking-dot"></div>
      <div class="ai-thinking-dot"></div>
      <span style="margin-left:4px">Analisando resultados...</span>
    </div>
  </div>`;
}

export function aiResultHTML(text) {
  return `<div class="ai-insight">
    <div class="ai-insight-title">✦ INTERPRETAÇÃO COM IA</div>
    <div class="ai-insight-text">${text.replace(/\n\n/g, '</p><p style="margin-top:8px">').replace(/\n/g, '<br>')}</div>
  </div>`;
}

export function aiFallbackHTML(fallback) {
  return `<div class="ai-insight">
    <div class="ai-insight-title">✦ INTERPRETAÇÃO COM IA</div>
    <div class="ai-insight-text" style="color:var(--txt3)">${fallback}</div>
  </div>`;
}
