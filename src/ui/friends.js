// Módulo de amigos: busca, pedidos, lista de amizades e mensagens via Supabase.

import { db } from '../services/supabaseService.js';
import { showToast } from './notifications.js';
import { esc } from '../core/utils.js';

// ── Estado do chat ──
let _chatFriendId   = null;
let _chatFriendName = null;
let _chatUid        = null;
let _chatSub        = null;
let _profileCache   = {}; // friendId → { full_name, email }

// ── Cache para re-render ao trocar idioma ──
let _pendingCache = null; // { received, sent, profileMap, uid }
let _friendsCache = null; // { friends, profileMap, unreadMap, uid }

// ── Helpers ──

const _locale = () => document.documentElement.lang === 'en' ? 'en-US' : 'pt-BR';

async function _uid() {
  const { data: { user } } = await db.auth.getUser();
  return user?.id;
}

function _initials(name, email) {
  // Mantém apenas letras/dígitos — evita injeção via inicial '<' em innerHTML.
  const ini = (name || email || '?').split(' ').map(n => n[0]).filter(Boolean)
    .slice(0, 2).join('').toUpperCase().replace(/[^0-9A-ZÀ-Ý]/g, '');
  return ini || '?';
}

function _showSetup() {
  document.getElementById('friends-setup-msg').style.display = 'block';
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
  // Allowlist: remove metacaracteres do PostgREST ( , ( ) % * . etc ) que
  // permitiriam injetar condições extras no filtro .or() abaixo.
  const q = raw.replace(/[^\p{L}\p{N}@._\- ]/gu, '').slice(0, 60);
  if (q.length < 2) { showToast(window.t('frnd-toast-min2'), 'err'); return; }

  const uid = await _uid();
  const btn = document.getElementById('friends-search-btn');
  btn.disabled = true;
  btn.textContent = '...';

  try {
    const { data: users, error } = await db
      .from('profiles')
      .select('id, full_name, email')
      .or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
      .neq('id', uid)
      .limit(8);

    if (error) { _showSetup(); return; }

    const { data: existing } = await db
      .from('friendships')
      .select('id, requester_id, addressee_id, status')
      .or(`requester_id.eq.${uid},addressee_id.eq.${uid}`);

    const relMap = {};
    (existing || []).forEach(f => {
      const other = f.requester_id === uid ? f.addressee_id : f.requester_id;
      relMap[other] = { id: f.id, status: f.status, isMine: f.requester_id === uid };
    });

    const container = document.getElementById('friends-search-results');
    if (!users?.length) {
      container.innerHTML = `<p style="color:var(--txt3);font-size:13px;padding:8px 0">${window.t('frnd-not-found')}</p>`;
      return;
    }

    container.innerHTML = users.map(u => {
      const rel = relMap[u.id];
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

  } finally {
    btn.disabled = false;
    btn.textContent = window.t('frnd-search-btn');
  }
}

// ── Ações de amizade ──

export async function sendFriendRequest(addresseeId) {
  const uid = await _uid();
  const { error } = await db.from('friendships').insert({
    requester_id: uid,
    addressee_id: addresseeId,
    status: 'pending',
  });
  if (error) {
    showToast(error.code === '23505' ? window.t('frnd-toast-dup') : window.t('frnd-toast-req-err'), 'err');
    return;
  }
  showToast(window.t('frnd-toast-sent'), 'ok');
  await searchFriends();
  await _loadPendingRequests();
}

export async function acceptFriendRequest(friendshipId) {
  const { error } = await db.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
  if (error) { showToast(window.t('frnd-toast-acc-err'), 'err'); return; }
  showToast(window.t('frnd-toast-accepted'), 'ok');
  await loadFriendsPanel();
}

export async function rejectFriendRequest(friendshipId) {
  if (!confirm(window.t('frnd-confirm-reject'))) return;
  const { error } = await db.from('friendships').delete().eq('id', friendshipId);
  if (error) { showToast(window.t('frnd-toast-rej-err'), 'err'); return; }
  showToast(window.t('frnd-toast-rejected'), 'info');
  await _loadPendingRequests();
}

export async function removeFriend(friendshipId) {
  // O nome é resolvido pelo cache (não trafega via onclick) para evitar
  // XSS por nome de perfil malicioso interpolado dentro do atributo.
  let name = window.t('frnd-default-user');
  if (_friendsCache) {
    const fr = _friendsCache.friends.find(x => x.id === friendshipId);
    if (fr) {
      const otherId = fr.requester_id === _friendsCache.uid ? fr.addressee_id : fr.requester_id;
      const u = _friendsCache.profileMap[otherId];
      if (u) name = u.full_name || u.email || name;
    }
  }
  if (!confirm(window.t('frnd-confirm-remove').replace('%s', name))) return;
  const { error } = await db.from('friendships').delete().eq('id', friendshipId);
  if (error) { showToast(window.t('frnd-toast-rem-err'), 'err'); return; }
  showToast(window.t('frnd-toast-removed'), 'info');
  await _loadFriendsList();
}

// ── Carregamento ──

async function _loadPendingRequests() {
  const uid = await _uid();
  const { data, error } = await db
    .from('friendships')
    .select('id, requester_id, addressee_id, created_at')
    .eq('status', 'pending')
    .or(`requester_id.eq.${uid},addressee_id.eq.${uid}`);

  if (error) { _showSetup(); return; }

  const pending = data || [];
  const userIds = [...new Set(pending.flatMap(f => [f.requester_id, f.addressee_id]).filter(id => id !== uid))];
  let profileMap = {};
  if (userIds.length) {
    const { data: profiles } = await db.from('profiles').select('id, full_name, email').in('id', userIds);
    profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));
  }

  const received = pending.filter(f => f.addressee_id === uid);
  const sent     = pending.filter(f => f.requester_id === uid);

  const { count: unreadCount } = await db
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', uid)
    .eq('read', false);

  _updateSidebarBadge(received.length + (unreadCount || 0));

  _pendingCache = { received, sent, profileMap, uid };
  _renderPending(_pendingCache);
}

function _renderPending({ received, sent, profileMap }) {
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
      const u = profileMap[f.requester_id] || {};
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
      const u = profileMap[f.addressee_id] || {};
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
  const uid = await _uid();

  const [{ data, error }, { data: unreadRows }] = await Promise.all([
    db.from('friendships')
      .select('id, requester_id, addressee_id, created_at')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${uid},addressee_id.eq.${uid}`)
      .order('created_at', { ascending: false }),
    db.from('messages')
      .select('sender_id')
      .eq('receiver_id', uid)
      .eq('read', false),
  ]);

  if (error) { _showSetup(); return; }

  const unreadMap = {};
  (unreadRows || []).forEach(m => {
    unreadMap[m.sender_id] = (unreadMap[m.sender_id] || 0) + 1;
  });

  const friends = data || [];
  const friendIds = friends.map(f => f.requester_id === uid ? f.addressee_id : f.requester_id);

  let profileMap = {};
  if (friendIds.length) {
    const { data: profiles } = await db.from('profiles').select('id, full_name, email').in('id', friendIds);
    profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));
    Object.assign(_profileCache, profileMap);
  }

  _friendsCache = { friends, profileMap, unreadMap, uid };
  _renderFriendsList(_friendsCache);
}

function _renderFriendsList({ friends, profileMap, unreadMap, uid }) {
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
    const otherId = f.requester_id === uid ? f.addressee_id : f.requester_id;
    const u = profileMap[otherId] || {};
    const since = new Date(f.created_at).toLocaleDateString(_locale(), { day: '2-digit', month: 'short', year: '2-digit' });
    const unread = unreadMap[otherId] || 0;
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
            onclick="openChat('${otherId}')">${window.t('frnd-btn-msg')}</button>
          <button class="share-btn" style="color:var(--acc);border-color:rgba(255,107,107,.3);font-size:11px;white-space:nowrap"
            onclick="removeFriend('${f.id}')">✕</button>
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
  document.getElementById('chat-friend-name').textContent    = _chatFriendName;
  document.getElementById('chat-friend-avatar').textContent  = _initials(friend.full_name, friend.email);
  overlay.classList.add('open');
  document.getElementById('chat-input').focus();

  await Promise.all([
    _loadChatHistory(),
    db.from('messages').update({ read: true })
      .eq('sender_id', friendId).eq('receiver_id', _chatUid).eq('read', false),
  ]);

  _loadPendingRequests();

  if (_chatSub) db.removeChannel(_chatSub);
  _chatSub = db.channel(`chat_${[_chatUid, friendId].sort().join('_')}`)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'messages',
      filter: `receiver_id=eq.${_chatUid}`,
    }, async (payload) => {
      if (payload.new.sender_id !== _chatFriendId) return;
      _appendBubble(payload.new, false);
      await db.from('messages').update({ read: true }).eq('id', payload.new.id);
    })
    .subscribe();
}

export function closeChat() {
  document.getElementById('chat-overlay')?.classList.remove('open');
  if (_chatSub) { db.removeChannel(_chatSub); _chatSub = null; }
  _chatFriendId = null;
}

export async function sendMessage() {
  const input = document.getElementById('chat-input');
  const content = input.value.trim();
  if (!content) return;

  input.value = '';
  input.style.height = 'auto';

  const { data, error } = await db.from('messages').insert({
    sender_id: _chatUid,
    receiver_id: _chatFriendId,
    content,
  }).select().single();

  if (error) {
    showToast(window.t('frnd-msg-err'), 'err');
    input.value = content;
    return;
  }
  _appendBubble(data, true);
}

async function _loadChatHistory() {
  const uid = _chatUid, fid = _chatFriendId;
  const container = document.getElementById('chat-messages');
  container.innerHTML = `<p style="text-align:center;color:var(--txt3);font-size:13px;padding:20px">${window.t('frnd-chat-loading')}</p>`;

  const { data, error } = await db
    .from('messages')
    .select('id, sender_id, content, created_at, read')
    .or(`and(sender_id.eq.${uid},receiver_id.eq.${fid}),and(sender_id.eq.${fid},receiver_id.eq.${uid})`)
    .order('created_at', { ascending: true })
    .limit(200);

  if (error) { container.innerHTML = `<p style="text-align:center;color:var(--acc);font-size:13px;padding:20px">${window.t('frnd-chat-err')}</p>`; return; }

  if (!data?.length) {
    container.innerHTML = `<p style="text-align:center;color:var(--txt3);font-size:13px;padding:40px 20px">${window.t('frnd-chat-empty')}</p>`;
    return;
  }

  container.innerHTML = '';
  let lastDay = '';
  data.forEach(m => {
    const day = new Date(m.created_at).toLocaleDateString(_locale(), { day: '2-digit', month: 'short' });
    if (day !== lastDay) {
      lastDay = day;
      container.insertAdjacentHTML('beforeend', `<div class="chat-day-sep">${day}</div>`);
    }
    container.insertAdjacentHTML('beforeend', _buildBubble(m, m.sender_id === uid));
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
