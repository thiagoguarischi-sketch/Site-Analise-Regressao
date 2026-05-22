'use strict';

// Rotas de amigos / mensagens / compartilhamentos.
// Antes essas operações eram feitas direto do navegador no Supabase (anon
// key + RLS). Agora passam pelo BFF: requireAuth valida o JWT e o
// socialService faz a autorização explícita a partir de req.userId.

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const S = require('../services/socialService');

// Executa o handler, devolve JSON e padroniza o tratamento de erro.
// Erros 4xx expõem a mensagem (esperados); 5xx retornam texto genérico.
function h(fn) {
  return async (req, res) => {
    try {
      res.json(await fn(req));
    } catch (err) {
      const status = err.status || 500;
      if (status >= 500) console.error('[social]', err.message);
      res.status(status).json({ error: status >= 500 ? 'Erro no servidor.' : err.message });
    }
  };
}

// ── Amigos ──────────────────────────────────────────────────────────────────

router.get('/social/search', requireAuth, h(async req =>
  ({ users: await S.searchProfiles(req.userId, req.query.q) })));

router.get('/social/friends', requireAuth, h(async req =>
  ({ friends: await S.listFriends(req.userId) })));

router.get('/social/requests', requireAuth, h(async req =>
  S.listRequests(req.userId)));

router.post('/social/friends/request', requireAuth, h(async req => {
  await S.sendRequest(req.userId, req.body && req.body.addresseeId);
  return { ok: true };
}));

router.post('/social/friends/accept', requireAuth, h(async req => {
  await S.acceptRequest(req.userId, req.body && req.body.friendshipId);
  return { ok: true };
}));

// Rejeitar pedido (registrada antes de /social/friends/:id por especificidade).
router.delete('/social/friends/request/:id', requireAuth, h(async req => {
  await S.deleteFriendship(req.userId, req.params.id, 'pending');
  return { ok: true };
}));

router.delete('/social/friends/:id', requireAuth, h(async req => {
  await S.deleteFriendship(req.userId, req.params.id, 'accepted');
  return { ok: true };
}));

// ── Mensagens ───────────────────────────────────────────────────────────────

router.get('/social/messages/:friendId', requireAuth, h(async req =>
  ({ messages: await S.getMessages(req.userId, req.params.friendId) })));

router.post('/social/messages', requireAuth, h(async req =>
  ({ message: await S.sendMessage(req.userId, req.body && req.body.receiverId, req.body && req.body.content) })));

router.post('/social/messages/read', requireAuth, h(async req => {
  await S.markRead(req.userId, req.body && req.body.friendId);
  return { ok: true };
}));

// ── Compartilhamentos ───────────────────────────────────────────────────────

router.get('/social/shares', requireAuth, h(async req =>
  ({ shares: await S.listShares(req.userId) })));

router.post('/social/shares', requireAuth, h(async req => {
  await S.sendShare(req.userId, req.body && req.body.receiverId, req.body && req.body.analysis);
  return { ok: true };
}));

router.get('/social/shares/:id', requireAuth, h(async req =>
  S.getShare(req.userId, req.params.id)));

router.delete('/social/shares/:id', requireAuth, h(async req => {
  await S.deleteShare(req.userId, req.params.id);
  return { ok: true };
}));

module.exports = router;
