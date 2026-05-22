'use strict';

// Camada de dados de amigos / mensagens / compartilhamentos.
// Toda autorização é feita AQUI, explicitamente, a partir do userId
// autenticado (vindo do JWT) — nunca de campos do corpo da requisição.
// Usa a service-role key: a RLS é irrelevante, a fronteira de segurança
// é este código (revisável), e não policies fora do repositório.

const { supabase } = require('../middleware/auth');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = v => typeof v === 'string' && UUID_RE.test(v);

function _err(msg, status) {
  const e = new Error(msg);
  e.status = status;
  return e;
}

// ── Helpers ────────────────────────────────────────────────────────────────

// Verifica se dois usuários são amigos aceitos. u1/u2 devem ser UUIDs.
async function _areFriends(u1, u2) {
  const { data, error } = await supabase
    .from('friendships')
    .select('id')
    .eq('status', 'accepted')
    .or(`and(requester_id.eq.${u1},addressee_id.eq.${u2}),and(requester_id.eq.${u2},addressee_id.eq.${u1})`)
    .limit(1);
  if (error) throw error;
  return (data || []).length > 0;
}

// Busca perfis por id, devolve um mapa id → { id, full_name, email }.
async function _profiles(ids) {
  const uniq = [...new Set(ids)].filter(isUuid);
  if (!uniq.length) return {};
  const { data, error } = await supabase
    .from('profiles').select('id, full_name, email').in('id', uniq);
  if (error) throw error;
  return Object.fromEntries((data || []).map(p => [p.id, p]));
}

// ── Busca de usuários ───────────────────────────────────────────────────────

async function searchProfiles(userId, rawQ) {
  // Sanitiza no servidor também — allowlist de caracteres impede injeção de
  // metacaracteres no filtro PostgREST .or() abaixo.
  const q = String(rawQ || '').replace(/[^\p{L}\p{N}@._\- ]/gu, '').slice(0, 60);
  if (q.length < 2) return [];

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
    .neq('id', userId)
    .limit(8);
  if (error) throw error;
  if (!users || !users.length) return [];

  const { data: rels } = await supabase
    .from('friendships')
    .select('id, requester_id, addressee_id, status')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  const relMap = {};
  (rels || []).forEach(f => {
    const other = f.requester_id === userId ? f.addressee_id : f.requester_id;
    relMap[other] = { id: f.id, status: f.status, isMine: f.requester_id === userId };
  });

  return users.map(u => ({
    id: u.id, full_name: u.full_name, email: u.email, rel: relMap[u.id] || null,
  }));
}

// ── Amigos ──────────────────────────────────────────────────────────────────

async function listFriends(userId) {
  const { data: rows, error } = await supabase
    .from('friendships')
    .select('id, requester_id, addressee_id, created_at')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const friends = rows || [];

  const { data: unreadRows } = await supabase
    .from('messages').select('sender_id').eq('receiver_id', userId).eq('read', false);
  const unread = {};
  (unreadRows || []).forEach(m => { unread[m.sender_id] = (unread[m.sender_id] || 0) + 1; });

  const otherIds = friends.map(f => f.requester_id === userId ? f.addressee_id : f.requester_id);
  const profiles = await _profiles(otherIds);

  return friends.map(f => {
    const otherId = f.requester_id === userId ? f.addressee_id : f.requester_id;
    const p = profiles[otherId] || {};
    return {
      friendshipId: f.id,
      since: f.created_at,
      unread: unread[otherId] || 0,
      friend: { id: otherId, full_name: p.full_name || null, email: p.email || null },
    };
  });
}

async function listRequests(userId) {
  const { data: rows, error } = await supabase
    .from('friendships')
    .select('id, requester_id, addressee_id, created_at')
    .eq('status', 'pending')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
  if (error) throw error;
  const pending = rows || [];

  const ids = pending.flatMap(f => [f.requester_id, f.addressee_id]).filter(id => id !== userId);
  const profiles = await _profiles(ids);
  const shape = (f, otherId) => {
    const p = profiles[otherId] || {};
    return {
      id: f.id, created_at: f.created_at,
      user: { id: otherId, full_name: p.full_name || null, email: p.email || null },
    };
  };

  const received = pending.filter(f => f.addressee_id === userId).map(f => shape(f, f.requester_id));
  const sent     = pending.filter(f => f.requester_id === userId).map(f => shape(f, f.addressee_id));

  const { count } = await supabase
    .from('messages').select('id', { count: 'exact', head: true })
    .eq('receiver_id', userId).eq('read', false);

  return { received, sent, unreadCount: count || 0 };
}

async function sendRequest(userId, addresseeId) {
  if (!isUuid(addresseeId)) throw _err('Destinatário inválido.', 400);
  if (addresseeId === userId) throw _err('Não é possível adicionar a si mesmo.', 400);
  const { error } = await supabase.from('friendships').insert({
    requester_id: userId, addressee_id: addresseeId, status: 'pending',
  });
  if (error) {
    if (error.code === '23505') throw _err('Pedido de amizade já existe.', 409);
    throw error;
  }
}

async function acceptRequest(userId, friendshipId) {
  if (!isUuid(friendshipId)) throw _err('ID inválido.', 400);
  const { data: f, error: fe } = await supabase
    .from('friendships').select('id, addressee_id, status').eq('id', friendshipId).single();
  if (fe || !f) throw _err('Pedido não encontrado.', 404);
  // Apenas o DESTINATÁRIO do pedido pode aceitá-lo.
  if (f.addressee_id !== userId || f.status !== 'pending') throw _err('Sem permissão.', 403);
  const { error } = await supabase
    .from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
  if (error) throw error;
}

// Remove uma amizade/pedido. expectedStatus garante que "rejeitar" só apague
// pendentes e "remover amigo" só apague aceitos.
async function deleteFriendship(userId, friendshipId, expectedStatus) {
  if (!isUuid(friendshipId)) throw _err('ID inválido.', 400);
  const { data: f, error: fe } = await supabase
    .from('friendships').select('id, requester_id, addressee_id, status').eq('id', friendshipId).single();
  if (fe || !f) throw _err('Não encontrado.', 404);
  // Apenas quem participa da relação pode removê-la.
  if (f.requester_id !== userId && f.addressee_id !== userId) throw _err('Sem permissão.', 403);
  if (expectedStatus && f.status !== expectedStatus) throw _err('Operação inválida.', 400);
  const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
  if (error) throw error;
}

// ── Mensagens ───────────────────────────────────────────────────────────────

async function getMessages(userId, friendId) {
  if (!isUuid(friendId)) throw _err('ID inválido.', 400);
  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, content, created_at')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true })
    .limit(200);
  if (error) throw error;
  // Marca como lidas as mensagens recebidas deste amigo.
  await supabase.from('messages').update({ read: true })
    .eq('sender_id', friendId).eq('receiver_id', userId).eq('read', false);
  return (data || []).map(m => ({
    id: m.id, content: m.content, created_at: m.created_at, mine: m.sender_id === userId,
  }));
}

async function sendMessage(userId, receiverId, content) {
  if (!isUuid(receiverId)) throw _err('Destinatário inválido.', 400);
  const text = String(content == null ? '' : content).trim();
  if (!text) throw _err('Mensagem vazia.', 400);
  if (text.length > 2000) throw _err('Mensagem muito longa.', 400);
  // Só é possível enviar mensagem para um amigo aceito.
  if (!(await _areFriends(userId, receiverId))) throw _err('Vocês não são amigos.', 403);
  const { data, error } = await supabase.from('messages').insert({
    sender_id: userId, receiver_id: receiverId, content: text,
  }).select('id, content, created_at').single();
  if (error) throw error;
  return { id: data.id, content: data.content, created_at: data.created_at, mine: true };
}

async function markRead(userId, friendId) {
  if (!isUuid(friendId)) throw _err('ID inválido.', 400);
  const { error } = await supabase.from('messages').update({ read: true })
    .eq('sender_id', friendId).eq('receiver_id', userId).eq('read', false);
  if (error) throw error;
}

// ── Compartilhamentos ───────────────────────────────────────────────────────

const VALID_TIPOS = ['simples', 'multipla', 'logistica', 'polinomial', 'serie', 'quantilica', 'regularizada'];

async function listShares(userId) {
  const { data: rows, error } = await supabase
    .from('friend_shares')
    .select('id, sender_id, analysis_nome, analysis_tipo, analysis_dados, label_x, label_y, created_at')
    .eq('receiver_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const shares = rows || [];
  const profiles = await _profiles(shares.map(s => s.sender_id));
  return shares.map(s => {
    const p = profiles[s.sender_id] || {};
    return {
      id: s.id,
      sender: { full_name: p.full_name || null, email: p.email || null },
      analysis_nome: s.analysis_nome,
      analysis_tipo: s.analysis_tipo,
      analysis_dados: s.analysis_dados,
      label_x: s.label_x,
      label_y: s.label_y,
      created_at: s.created_at,
    };
  });
}

async function sendShare(userId, receiverId, analysis) {
  if (!isUuid(receiverId)) throw _err('Destinatário inválido.', 400);
  if (!analysis || typeof analysis !== 'object') throw _err('Análise inválida.', 400);
  if (!VALID_TIPOS.includes(analysis.tipo)) throw _err('Tipo de análise inválido.', 400);
  if (analysis.dados == null || typeof analysis.dados !== 'object') throw _err('Dados inválidos.', 400);
  if (!(await _areFriends(userId, receiverId))) throw _err('Vocês não são amigos.', 403);
  const { error } = await supabase.from('friend_shares').insert({
    sender_id: userId,
    receiver_id: receiverId,
    analysis_nome: String(analysis.nome == null ? 'Análise' : analysis.nome).slice(0, 200),
    analysis_tipo: analysis.tipo,
    analysis_dados: analysis.dados,
    label_x: analysis.label_x != null ? String(analysis.label_x).slice(0, 120) : null,
    label_y: analysis.label_y != null ? String(analysis.label_y).slice(0, 120) : null,
  });
  if (error) throw error;
}

async function getShare(userId, shareId) {
  if (!isUuid(shareId)) throw _err('ID inválido.', 400);
  const { data, error } = await supabase
    .from('friend_shares')
    .select('id, receiver_id, analysis_nome, analysis_tipo, analysis_dados, label_x, label_y, created_at')
    .eq('id', shareId).single();
  if (error || !data) throw _err('Compartilhamento não encontrado.', 404);
  // Apenas o destinatário pode abrir o compartilhamento.
  if (data.receiver_id !== userId) throw _err('Sem permissão.', 403);
  return {
    analysis_nome: data.analysis_nome,
    analysis_tipo: data.analysis_tipo,
    analysis_dados: data.analysis_dados,
    label_x: data.label_x,
    label_y: data.label_y,
    created_at: data.created_at,
  };
}

async function deleteShare(userId, shareId) {
  if (!isUuid(shareId)) throw _err('ID inválido.', 400);
  const { data, error: fe } = await supabase
    .from('friend_shares').select('id, receiver_id').eq('id', shareId).single();
  if (fe || !data) throw _err('Não encontrado.', 404);
  // Apenas o destinatário pode apagar o compartilhamento que recebeu.
  if (data.receiver_id !== userId) throw _err('Sem permissão.', 403);
  const { error } = await supabase.from('friend_shares').delete().eq('id', shareId);
  if (error) throw error;
}

module.exports = {
  searchProfiles, listFriends, listRequests, sendRequest, acceptRequest, deleteFriendship,
  getMessages, sendMessage, markRead, listShares, sendShare, getShare, deleteShare,
};
