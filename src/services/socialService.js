// Cliente HTTP-fino para os endpoints sociais do BFF (amigos, mensagens,
// compartilhamentos). Substitui o acesso direto do navegador ao Supabase —
// toda a autorização agora é feita no servidor a partir do JWT.

import { apiRequest } from './supabaseService.js';

// ── Amigos ──
export const searchProfiles = (q) =>
  apiRequest(`/social/search?q=${encodeURIComponent(q)}`).then(r => r.users || []);
export const fetchFriends   = () => apiRequest('/social/friends').then(r => r.friends || []);
export const fetchRequests  = () => apiRequest('/social/requests');
export const sendRequest    = (addresseeId)  => apiRequest('/social/friends/request', 'POST', { addresseeId });
export const acceptRequest  = (friendshipId) => apiRequest('/social/friends/accept', 'POST', { friendshipId });
export const rejectRequest  = (id) => apiRequest(`/social/friends/request/${id}`, 'DELETE');
export const unfriend       = (id) => apiRequest(`/social/friends/${id}`, 'DELETE');

// ── Mensagens ──
export const fetchChat   = (friendId) => apiRequest(`/social/messages/${friendId}`).then(r => r.messages || []);
export const postMessage = (receiverId, content) =>
  apiRequest('/social/messages', 'POST', { receiverId, content }).then(r => r.message);
export const markRead    = (friendId) => apiRequest('/social/messages/read', 'POST', { friendId });

// ── Compartilhamentos ──
export const fetchShares = () => apiRequest('/social/shares').then(r => r.shares || []);
export const postShare   = (receiverId, analysis) => apiRequest('/social/shares', 'POST', { receiverId, analysis });
export const fetchShare  = (id) => apiRequest(`/social/shares/${id}`);
export const removeShare = (id) => apiRequest(`/social/shares/${id}`, 'DELETE');
