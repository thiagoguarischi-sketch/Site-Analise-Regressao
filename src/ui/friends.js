// Módulo de amigos: busca, pedidos, lista de amizades e mensagens.
// Acesso a dados via BFF (/api/social/*) — a autorização é feita no servidor.
// O cliente Supabase (db) é usado EXCLUSIVAMENTE para autenticação (db.auth):
// nenhuma tabela é lida diretamente do navegador. A entrega ao vivo do chat
// usa polling do BFF (não Realtime), de modo que a segurança não depende de
// RLS estar configurada — a fronteira de autorização é 100% o servidor.

import { db } from '../services/supabaseService.js';
import { showToast } from './notifications.js';
import { esc, initials as _initials } from '../core/utils.js';
import {
  searchProfiles, fetchFriends, fetchRequests,
  sendRequest, acceptRequest, rejectRequest, unfriend,
  fetchChat, postMessage,
} from '../services/socialService.js';

// ── Estado do chat ──
let _chatFriendId   = null;
let _chatFriendName = null;
let _chatUid        = null;
let _chatPoll       = null;        // timer do polling de novas mensagens
let _seenMsgIds     = new Set();   // ids já renderizados (evita duplicar no poll)
let _profileCache   = {}; // friendId → { id, full_name, email }

// Intervalo do polling do chat (ms). O GET de histórico do BFF já marca as
// mensagens recebidas como lidas, então cada poll mantém o estado atualizado.
const CHAT_POLL_MS = 4000;

// ── Cache para re-render ao trocar idioma ──
let _pendingCache = null; // { received, sent }
let _friendsCache = null; // [{ friendshipId, since, unread, friend }]

// ── Helpers ──

const _locale = () => document.documentElement.lang === 'en' ? 'en-US' : 'pt-BR';

async function _uid() {
  const { data: { user } } = await db.auth.getUser();
  return user?.id;
}

function _showSetup() {
  const el = document.getElementById('friends-setup-msg');
  if (el) el.style.display = 'block';
}

function _updateSidebarBadge(count) {
  const badge = document.getElementById('friends-badge');
  if (!badge) return;
  badge.textContent = count;
  badge.style.display = count ? 'inline' : 'none';
}

// ── Entrada principal ──

export async function loadFriendsPanel() {
  await Promise.all([
    _loadFriendsList(),
    _loadPendingRequests(),
  ]);
}

// ── Busca de usuários ──

export async function searchFriends() {
  const raw = document.getElementById('friends-search-input').value.trim();
  // Allowlist de caracteres (defesa adicional; o servidor também sanitiza).
  const q = raw.replace(/[^\p{L}\p{N}@._\- ]/gu, '').slice(0, 60);
  if (q.length < 2) { showToast(window.t('frnd-toast-min2'), 'err'); return; }

  const btn = document.getElementById('friends-search-btn');
  btn.disabled = true;
  btn.textContent = '...';

  try {
    const users = await searchProfiles(q);
    const container = document.getElementById('friends-search-results');
    if (!users.length) {
      container.innerHTML = `<p style="color:var(--txt3);font-size:13px;padding:8px 0">${window.t('frnd-not-found')}</p>`;
      return;
    }

    container.innerHTML = users.map(u => {
      const rel = u.rel;
      let action = `<button class="share-btn" onclick="sendFriendRequest('${u.id}')">${window.t('frnd-btn-add')}</button>`;
      if (rel?.status === 'accepted')
        action = `<span style="font-size:12px;color:var(--y);font-weight:600">${window.t('frnd-st-friends')}</span>`;
      else if (rel?.status === 'pending' && rel.isMine)
        action = `<span style="font-size:12px;color:var(--txt3)">${window.t('frnd-st-waiting')}</span>`;
      else if (rel?.status === 'pending' && !rel.isMine)
        action = `<button class="share-btn" style="color:var(--y);border-color:rgba(0,212,160,.4)" onclick="acceptFriendRequest('${rel.id}')">${window.t('frnd-btn-accept')}</button>`;

      return `
        <div class="friend-card">
          <div class="friend-avatar">${_initials(u.full_name, u.email)}</div>
          <div style="flex:1;min-width:0">
            <div class="friend-name">${esc(u.full_name || window.t('frnd-default-user'))}</div>
            <div class="friend-email">${esc(u.email || '')}</div>
          </div>
          ${action}
        </div>`;
    }).join('');

  } catch (e) {
    _showSetup();
  } finally {
    btn.disabled = false;
    btn.textContent = window.t('frnd-search-btn');
  }
}

// ── Ações de amizade ──

export async function sendFriendRequest(addresseeId) {
  try {
    await sendRequest(addresseeId);
  } catch (e) {
    const dup = /existe/i.test(e.message || '');
    showToast(dup ? window.t('frnd-toast-dup') : window.t('frnd-toast-req-err'), 'err');
    return;
  }
  showToast(window.t('frnd-toast-sent'), 'ok');
  await searchFriends();
  await _loadPendingRequests();
}

export async function acceptFriendRequest(friendshipId) {
  try {
    await acceptRequest(friendshipId);
  } catch (e) {
    showToast(window.t('frnd-toast-acc-err'), 'err');
    return;
  }
  showToast(window.t('frnd-toast-accepted'), 'ok');
  await loadFriendsPanel();
}

export async function rejectFriendRequest(friendshipId) {
  if (!confirm(window.t('frnd-confirm-reject'))) return;
  try {
    await rejectRequest(friendshipId);
  } catch (e) {
    showToast(window.t('frnd-toast-rej-err'), 'err');
    return;
  }
  showToast(window.t('frnd-toast-rejected'), 'info');
  await _loadPendingRequests();
}

export async function removeFriend(friendshipId) {
  // O nome é resolvido pelo cache (não trafega via onclick) para evitar
  // XSS por nome de perfil malicioso interpolado dentro do atributo.
  let name = window.t('frnd-default-user');
  const fr = (_friendsCache || []).find(x => x.friendshipId === friendshipId);
  if (fr) name = fr.friend.full_name || fr.friend.email || name;
  if (!confirm(window.t('frnd-confirm-remove').replace('%s', name))) return;
  try {
    await unfriend(friendshipId);
  } catch (e) {
    showToast(window.t('frnd-toast-rem-err'), 'err');
    return;
  }
  showToast(window.t('frnd-toast-removed'), 'info');
  await _loadFriendsList();
}

// ── Carregamento ──

async function _loadPendingRequests() {
  let data;
  try {
    data = await fetchRequests();
  } catch (e) { _showSetup(); return; }

  const received = data.received || [];
  const sent     = data.sent || [];
  _updateSidebarBadge(received.length + (data.unreadCount || 0));

  _pendingCache = { received, sent };
  _renderPending(_pendingCache);
}

function _renderPending({ received, sent }) {
  const container = document.getElementById('friends-pending');
  if (!container) return;

  if (!received.length && !sent.length) {
    container.innerHTML = `<p style="color:var(--txt3);font-size:13px;text-align:center;padding:8px 0">${window.t('frnd-no-pending')}</p>`;
    return;
  }

  let html = '';

  if (received.length) {
    html += `<div class="import-section-label" style="margin-top:0">${window.t('frnd-received')} (${received.length})</div>`;
    html += received.map(f => {
      const u = f.user || {};
      return `
        <div class="friend-card">
          <div class="friend-avatar" style="background:linear-gradient(135deg,var(--acc),var(--acc2))">${_initials(u.full_name, u.email)}</div>
          <div style="flex:1;min-width:0">
            <div class="friend-name">${esc(u.full_name || window.t('frnd-default-user'))}</div>
            <div class="friend-email">${esc(u.email || '')}</div>
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0">
            <button class="share-btn" style="color:var(--y);border-color:rgba(0,212,160,.4)" onclick="acceptFriendRequest('${f.id}')">${window.t('frnd-btn-accept')}</button>
            <button class="share-btn" style="color:var(--acc);border-color:rgba(255,107,107,.3)" onclick="rejectFriendRequest('${f.id}')">✕</button>
          </div>
        </div>`;
    }).join('');
  }

  if (sent.length) {
    html += `<div class="import-section-label" style="margin-top:${received.length ? '16px' : '0'}">${window.t('frnd-sent')} (${sent.length})</div>`;
    html += sent.map(f => {
      const u = f.user || {};
      return `
        <div class="friend-card">
          <div class="friend-avatar" style="background:var(--bg4);border:1px solid var(--brd2)">${_initials(u.full_name, u.email)}</div>
          <div style="flex:1;min-width:0">
            <div class="friend-name">${esc(u.full_name || window.t('frnd-default-user'))}</div>
            <div class="friend-email">${esc(u.email || '')}</div>
          </div>
          <span style="font-size:11px;color:var(--txt3);white-space:nowrap">${window.t('frnd-st-waiting')}</span>
        </div>`;
    }).join('');
  }

  container.innerHTML = html;
}

async function _loadFriendsList() {
  let friends;
  try {
    friends = await fetchFriends();
  } catch (e) { _showSetup(); return; }

  _profileCache = {};
  friends.forEach(f => { if (f.friend?.id) _profileCache[f.friend.id] = f.friend; });

  _friendsCache = friends;
  _renderFriendsList(friends);
}

function _renderFriendsList(friends) {
  const container = document.getElementById('friends-list');
  const countEl   = document.getElementById('friends-count');
  if (!container) return;

  if (countEl) {
    countEl.textContent = friends.length
      ? `${friends.length} ${window.t(friends.length !== 1 ? 'frnd-friends' : 'frnd-friend')}`
      : '';
  }

  if (!friends.length) {
    container.innerHTML = `
      <div style="text-align:center;padding:32px 16px;color:var(--txt3)">
        <div style="font-size:36px;margin-bottom:10px">👥</div>
        <div style="font-size:13px;font-weight:600;margin-bottom:4px">${window.t('frnd-empty-title')}</div>
        <div style="font-size:12px">${window.t('frnd-empty-desc')}</div>
      </div>`;
    return;
  }

  container.innerHTML = friends.map(f => {
    const u = f.friend || {};
    const since = new Date(f.since).toLocaleDateString(_locale(), { day: '2-digit', month: 'short', year: '2-digit' });
    const unread = f.unread || 0;
    const unreadBadge = unread
      ? `<span style="background:var(--acc);color:#fff;border-radius:999px;font-size:10px;font-weight:700;padding:2px 6px;margin-left:4px">${unread}</span>`
      : '';

    return `
      <div class="friend-card">
        <div class="friend-avatar">${_initials(u.full_name, u.email)}</div>
        <div style="flex:1;min-width:0">
          <div class="friend-name">${esc(u.full_name || window.t('frnd-default-user'))} ${unreadBadge}</div>
          <div class="friend-email">${esc(u.email || '')} &nbsp;·&nbsp; ${window.t('frnd-since')} ${since}</div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0">
          <button class="share-btn" style="color:var(--x);border-color:rgba(123,111,255,.3);white-space:nowrap"
            onclick="openChat('${u.id}')">${window.t('frnd-btn-msg')}</button>
          <button class="share-btn" style="color:var(--acc);border-color:rgba(255,107,107,.3);font-size:11px;white-space:nowrap"
            onclick="removeFriend('${f.friendshipId}')">✕</button>
        </div>
      </div>`;
  }).join('');
}

// ── Re-renderiza ao trocar idioma ──

export function friendsRerender() {
  if (_pendingCache) _renderPending(_pendingCache);
  if (_friendsCache) _renderFriendsList(_friendsCache);
}

// ── Chat ──

export async function openChat(friendId) {
  _chatFriendId   = friendId;
  _chatUid        = await _uid();
  const friend    = _profileCache[friendId] || {};
  _chatFriendName = friend.full_name || friend.email || window.t('frnd-default-friend');

  const overlay = document.getElementById('chat-overlay');
  document.getElementById('chat-friend-name').textContent   = _chatFriendName;
  document.getElementById('chat-friend-avatar').textContent = _initials(friend.full_name, friend.email);
  overlay.classList.add('open');
  document.getElementById('chat-input').focus();

  await _loadChatHistory();   // o GET de histórico já marca as recebidas como lidas
  _loadPendingRequests();     // atualiza o badge da sidebar

  // Entrega ao vivo via polling do BFF (não Realtime): nenhuma leitura de
  // tabela ocorre no navegador, então a segurança não depende de RLS.
  _startChatPolling();
}

// Faz polling do histórico no BFF e renderiza apenas as mensagens novas.
function _startChatPolling() {
  _stopChatPolling();
  _chatPoll = setInterval(async () => {
    const friendId = _chatFriendId;
    if (!friendId) return;
    let data;
    try {
      data = await fetchChat(friendId);   // BFF: autoriza + marca como lidas
    } catch (e) { return; }
    if (friendId !== _chatFriendId) return; // chat trocado durante a requisição
    data.forEach(m => {
      if (_seenMsgIds.has(m.id)) return;
      _seenMsgIds.add(m.id);
      // Mensagens próprias já foram renderizadas no envio; só anexa as recebidas.
      if (!m.mine) _appendBubble(m, false);
    });
  }, CHAT_POLL_MS);
}

function _stopChatPolling() {
  if (_chatPoll) { clearInterval(_chatPoll); _chatPoll = null; }
}

export function closeChat() {
  document.getElementById('chat-overlay')?.classList.remove('open');
  _stopChatPolling();
  _chatFriendId = null;
}

export async function sendMessage() {
  const input = document.getElementById('chat-input');
  const content = input.value.trim();
  if (!content) return;

  input.value = '';
  input.style.height = 'auto';

  let msg;
  try {
    msg = await postMessage(_chatFriendId, content);
  } catch (e) {
    showToast(window.t('frnd-msg-err'), 'err');
    input.value = content;
    return;
  }
  if (msg && msg.id != null) _seenMsgIds.add(msg.id); // evita duplicar no poll
  _appendBubble(msg, true);
}

async function _loadChatHistory() {
  const container = document.getElementById('chat-messages');
  container.innerHTML = `<p style="text-align:center;color:var(--txt3);font-size:13px;padding:20px">${window.t('frnd-chat-loading')}</p>`;
  _seenMsgIds = new Set(); // reinicia o controle de deduplicação a cada chat

  let data;
  try {
    data = await fetchChat(_chatFriendId);
  } catch (e) {
    container.innerHTML = `<p style="text-align:center;color:var(--acc);font-size:13px;padding:20px">${window.t('frnd-chat-err')}</p>`;
    return;
  }

  if (!data.length) {
    container.innerHTML = `<p style="text-align:center;color:var(--txt3);font-size:13px;padding:40px 20px">${window.t('frnd-chat-empty')}</p>`;
    return;
  }

  container.innerHTML = '';
  let lastDay = '';
  data.forEach(m => {
    if (m.id != null) _seenMsgIds.add(m.id); // já renderizada — poll não duplica
    const day = new Date(m.created_at).toLocaleDateString(_locale(), { day: '2-digit', month: 'short' });
    if (day !== lastDay) {
      lastDay = day;
      container.insertAdjacentHTML('beforeend', `<div class="chat-day-sep">${day}</div>`);
    }
    container.insertAdjacentHTML('beforeend', _buildBubble(m, m.mine));
  });
  container.scrollTop = container.scrollHeight;
}

function _buildBubble(m, isMine) {
  const time = new Date(m.created_at).toLocaleTimeString(_locale(), { hour: '2-digit', minute: '2-digit' });
  return `
    <div class="chat-row ${isMine ? 'chat-row-mine' : 'chat-row-theirs'}">
      <div class="chat-bubble ${isMine ? 'chat-bubble-mine' : 'chat-bubble-theirs'}">
        <span class="chat-text">${esc(m.content)}</span>
        <span class="chat-time">${time}</span>
      </div>
    </div>`;
}

function _appendBubble(m, isMine) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const empty = container.querySelector('p');
  if (empty) empty.remove();

  const today = new Date().toLocaleDateString(_locale(), { day: '2-digit', month: 'short' });
  const lastSep = container.querySelector('.chat-day-sep:last-of-type');
  if (!lastSep || lastSep.textContent !== today) {
    container.insertAdjacentHTML('beforeend', `<div class="chat-day-sep">${today}</div>`);
  }

  container.insertAdjacentHTML('beforeend', _buildBubble(m, isMine));
  container.scrollTop = container.scrollHeight;
}
