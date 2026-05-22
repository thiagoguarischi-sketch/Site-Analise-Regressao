// Camada de UI do app autenticado: navegação, login/logout, perfil e auth overlay.

import {
  signUp, signIn, signOut, getCurrentUser,
} from '../services/authService.js';
import { deleteAccountRequest } from '../services/analysisService.js';
import { db, setSession, clearSession, isAuthenticated } from '../services/supabaseService.js';
import { showToast } from './notifications.js';
import { loadHistory, updateProfileStats } from './tables.js';
import { loadShareList, checkSharedLink, checkPendingSharedAnalysis } from './share.js';
import { loadFriendsPanel } from './friends.js';
import { initRows } from './forms.js';

let currentUser = null;

export function getCurrentLoggedUser() { return currentUser; }

// ── Auth overlay (particles, tabs, password helpers) ──

export function spawnParticles() {
  const container = document.getElementById('auth-particles');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.setProperty('--drift', (Math.random() - 0.5) * 200);
    p.style.animationDuration = (6 + Math.random() * 8) + 's';
    p.style.animationDelay = Math.random() * 8 + 's';
    p.style.background = Math.random() > 0.5 ? 'var(--x)' : 'var(--y)';
    p.style.width = p.style.height = (2 + Math.random() * 3) + 'px';
    container.appendChild(p);
  }
}

export function showAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((b, i) => {
    b.classList.toggle('active', (tab === 'login' && i === 0) || (tab === 'signup' && i === 1));
  });
  document.getElementById('form-login').classList.toggle('active', tab === 'login');
  document.getElementById('form-signup').classList.toggle('active', tab === 'signup');
  document.getElementById('form-forgot').classList.toggle('active', tab === 'forgot');
  document.getElementById('auth-tabs').style.display = tab === 'forgot' ? 'none' : 'flex';
}

const _svgEye     = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const _svgEyeOff  = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

export function togglePw(id, btn) {
  const inp = document.getElementById(id);
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.innerHTML = inp.type === 'password' ? _svgEye : _svgEyeOff;
}

export function updatePwStrength(pw) {
  const bar = document.getElementById('pw-bar');
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const colors = ['#FF6B6B', '#FFB347', '#FFD700', '#00D4A0'];
  bar.style.width = (score * 25) + '%';
  bar.style.background = colors[score - 1] || 'transparent';
}

function setAuthLoading(formId, loading) {
  const btnMap = { 'form-login': 'btn-login', 'form-signup': 'btn-signup' };
  const btn = document.getElementById(btnMap[formId]);
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-dots"><span></span><span></span><span></span></span>';
  } else {
    btn.disabled = false;
    btn.textContent = formId === 'form-login' ? window.t('btn-login') : window.t('btn-signup');
  }
}

// ── Login / signup / forgot / demo ──

export async function doLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pw = document.getElementById('login-pw').value;
  const errEl = document.getElementById('login-error');
  errEl.classList.remove('show');
  setAuthLoading('form-login', true);

  try {
    const user = await signIn(email, pw);
    await loginUser(user);
  } catch (error) {
    errEl.textContent = error.message || window.t('err-login');
    errEl.classList.add('show');
    document.getElementById('auth-card').classList.add('shake');
    setTimeout(() => document.getElementById('auth-card').classList.remove('shake'), 300);
  }
  setAuthLoading('form-login', false);
}

// Estado usado pelo fluxo OTP (reservado para uso futuro)
let _pendingSignup = null;
let _countdownTimer = null;

export async function doSignup(e) {
  e.preventDefault();
  const name  = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim().toLowerCase();
  const pw    = document.getElementById('signup-pw').value;
  const pw2   = document.getElementById('signup-pw2').value;
  const errEl = document.getElementById('signup-error');
  errEl.classList.remove('show');

  if (!name || name.length < 2) { errEl.textContent = window.t('err-name-short');  errEl.classList.add('show'); return; }
  if (!email)                   { errEl.textContent = window.t('err-email-empty'); errEl.classList.add('show'); return; }
  if (pw.length < 8)            { errEl.textContent = window.t('err-pw-short');    errEl.classList.add('show'); return; }
  if (pw !== pw2)               { errEl.textContent = window.t('err-pw-mismatch'); errEl.classList.add('show'); return; }

  setAuthLoading('form-signup', true);
  try {
    const user = await signUp(email, pw, name);
    await loginUser(user);
    showToast(`${window.t('toast-welcome')} ${name}! 🎉`, 'ok');
  } catch (error) {
    errEl.textContent = error.message || window.t('err-signup');
    errEl.classList.add('show');
  }
  setAuthLoading('form-signup', false);

  /* FLUXO OTP — desabilitado, reativar quando quiser confirmação por email:
  try {
    const { error } = await db.auth.signUp({
      email,
      password: pw,
      options: { data: { full_name: name } },
    });
    if (error) throw error;
    _pendingSignup = { name, email, pw };
    _showVerifyStep(email);
  } catch (error) {
    errEl.textContent = error.message || 'Erro ao enviar código de verificação.';
    errEl.classList.add('show');
  }
  */
}

function _showVerifyStep(email) {
  document.getElementById('signup-fields').style.display = 'none';
  document.getElementById('signup-verify').style.display = 'block';
  document.getElementById('verify-email-hint').textContent = email;
  document.getElementById('verify-error').classList.remove('show');
  document.getElementById('verify-code-input').value = '';
  document.getElementById('verify-btn').disabled = false;
  document.getElementById('verify-btn').textContent = window.t('btn-verify');
  document.getElementById('verify-code-input').focus();
  _startResendCountdown();
}

function _startResendCountdown() {
  let secs = 60;
  const countEl  = document.getElementById('verify-resend-countdown');
  const resendBtn = document.getElementById('verify-resend-btn');
  resendBtn.disabled = true;
  clearInterval(_countdownTimer);
  _countdownTimer = setInterval(() => {
    secs--;
    countEl.textContent = secs > 0 ? ` (${secs}s)` : '';
    if (secs <= 0) { clearInterval(_countdownTimer); resendBtn.disabled = false; }
  }, 1000);
}

export async function verifySignupCode() {
  if (!_pendingSignup) return;
  const code  = document.getElementById('verify-code-input').value.replace(/\D/g, '');
  const errEl = document.getElementById('verify-error');
  errEl.classList.remove('show');

  if (code.length !== 6) {
    errEl.textContent = window.t('err-verify-length');
    errEl.classList.add('show');
    return;
  }

  const btn = document.getElementById('verify-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="loading-dots"><span></span><span></span><span></span></span>';

  try {
    const { data, error } = await db.auth.verifyOtp({
      email: _pendingSignup.email,
      token: code,
      type: 'signup',
    });
    if (error) throw error;

    clearInterval(_countdownTimer);
    const saved = _pendingSignup;
    _pendingSignup = null;
    await loginUser(data.user || (await db.auth.getUser()).data.user);
    showToast(`${window.t('toast-welcome')} ${saved.name}! 🎉`, 'ok');
  } catch (err) {
    const msg = err.message || '';
    errEl.textContent = msg.toLowerCase().includes('token') || msg.toLowerCase().includes('otp') || msg.toLowerCase().includes('invalid')
      ? window.t('err-verify-invalid')
      : (msg || window.t('err-verify'));
    errEl.classList.add('show');
    btn.disabled = false;
    btn.textContent = window.t('btn-verify');
  }
}

export async function resendSignupCode() {
  if (!_pendingSignup) return;
  const { error } = await db.auth.resend({
    type: 'signup',
    email: _pendingSignup.email,
  });
  if (error) { showToast(window.t('toast-resend-err'), 'err'); return; }
  showToast(window.t('toast-resend-ok'), 'ok');
  _startResendCountdown();
}

export function backToSignupForm() {
  clearInterval(_countdownTimer);
  _pendingSignup = null;
  document.getElementById('signup-verify').style.display = 'none';
  document.getElementById('signup-fields').style.display = 'block';
  document.getElementById('signup-error').classList.remove('show');
}

export async function doForgot() {
  const email = document.getElementById('forgot-email').value.trim().toLowerCase();
  const errEl = document.getElementById('forgot-error');
  const okEl = document.getElementById('forgot-success');
  errEl.classList.remove('show'); okEl.classList.remove('show');
  if (!email) { errEl.textContent = window.t('err-email-empty'); errEl.classList.add('show'); return; }
  try {
    await db.auth.resetPasswordForEmail(email);
    okEl.textContent = window.t('ok-forgot');
    okEl.classList.add('show');
  } catch (error) {
    errEl.textContent = error.message || window.t('err-forgot');
    errEl.classList.add('show');
  }
}

export async function doDemo() {
  const demoUser = {
    uid: 'demo_user',
    name: 'Usuário Demo',
    email: 'demo@reglinear.app',
    pwHash: '',
    isDemo: true,
    createdAt: new Date().toISOString(),
  };
  await loginUser(demoUser);
}

export async function loginUser(user) {
  try {
    currentUser = {
      uid: user.id || user.uid,
      name: user.user_metadata?.full_name || user.name || (user.email ? user.email.split('@')[0] : 'Usuário'),
      email: user.email || '',
    };

    document.getElementById('auth-overlay').classList.add('hidden');
    document.getElementById('app-container').classList.add('visible');

    const initials = currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    document.getElementById('topbar-avatar').textContent = initials;
    document.getElementById('topbar-name').textContent = currentUser.name.split(' ')[0];
    document.getElementById('profile-avatar-big').textContent = initials;
    document.getElementById('profile-name-display').textContent = currentUser.name;
    document.getElementById('profile-email-display').textContent = currentUser.email;
    document.getElementById('edit-name').value = currentUser.name;
    document.getElementById('edit-email').value = currentUser.email;
    document.getElementById('cloud-banner').style.display = 'flex';

    initRows();

    try { await loadHistory(); } catch (e) { console.warn('loadHistory error:', e); }
    try { await updateProfileStats(); } catch (e) { console.warn('updateProfileStats error:', e); }

    const loadedShared = await checkPendingSharedAnalysis().catch(() => false);
    if (!loadedShared) switchTab('guia', document.getElementById('btn-guia'));
  } catch (err) {
    console.error('loginUser error:', err);
    showToast('Erro ao iniciar sessão: ' + err.message, 'err');
  }
}

export async function doLogout() {
  if (!confirm('Deseja sair da sua conta?')) return;
  await signOut();
  currentUser = null;
  await clearSession();
  window.location.href = 'landing.html';
}

export async function deleteAccount() {
  if (!confirm('Tem certeza? Isso irá excluir sua conta e TODAS as análises permanentemente.')) return;
  if (!confirm('Esta ação é IRREVERSÍVEL. Confirma a exclusão definitiva?')) return;

  showToast(window.t('toast-deleting'), 'info');
  try {
    await deleteAccountRequest();
  } catch (err) {
    console.error('[deleteAccount]', err);
    showToast('Erro ao excluir conta: ' + (err.message || 'tente novamente.'), 'err');
    return;
  }

  await signOut();
  await clearSession();
  currentUser = null;
  document.getElementById('auth-overlay').classList.remove('hidden');
  document.getElementById('app-container').classList.remove('visible');
  showToast(window.t('toast-deleted'), 'info');
}

// ── Profile ──

export async function saveProfile() {
  const name = document.getElementById('edit-name').value.trim();
  const email = document.getElementById('edit-email').value.trim().toLowerCase();
  if (!name || !email) { showToast(window.t('toast-fill-all'), 'err'); return; }
  if (name.length < 2) { showToast(window.t('toast-name-short'), 'err'); return; }

  try {
    await db.auth.updateUser({ email, data: { full_name: name } });
    currentUser.name = name;
    currentUser.email = email;
    await setSession({ uid: currentUser.uid, name, email });

    const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    document.getElementById('topbar-avatar').textContent = initials;
    document.getElementById('topbar-name').textContent = name.split(' ')[0];
    document.getElementById('profile-avatar-big').textContent = initials;
    document.getElementById('profile-name-display').textContent = name;
    document.getElementById('profile-email-display').textContent = email;
    showToast(window.t('toast-profile-ok'), 'ok');
  } catch (error) {
    showToast(error.message || 'Erro ao atualizar perfil.', 'err');
  }
}

export async function changePw() {
  const oldPw = document.getElementById('old-pw').value;
  const newPw = document.getElementById('new-pw').value;
  const newPw2 = document.getElementById('new-pw2').value;
  if (!oldPw || !newPw || !newPw2) { showToast(window.t('toast-fill-all'), 'err'); return; }
  if (newPw.length < 8) { showToast(window.t('toast-pw-short'), 'err'); return; }
  if (newPw !== newPw2) { showToast(window.t('toast-pw-mismatch'), 'err'); return; }

  try {
    // Reautenticação: confirma a senha atual antes de permitir a troca.
    // Sem isso, uma sessão sequestrada trocaria a senha sem conhecê-la.
    const { data: { user } } = await db.auth.getUser();
    if (!user?.email) { showToast('Erro ao validar a sessão. Faça login novamente.', 'err'); return; }
    const { error: reauthErr } = await db.auth.signInWithPassword({ email: user.email, password: oldPw });
    if (reauthErr) { showToast('Senha atual incorreta.', 'err'); return; }

    await db.auth.updateUser({ password: newPw });
    document.getElementById('old-pw').value = '';
    document.getElementById('new-pw').value = '';
    document.getElementById('new-pw2').value = '';
    showToast(window.t('toast-pw-ok'), 'ok');
  } catch (error) {
    showToast(error.message || 'Erro ao alterar senha.', 'err');
  }
}

export async function tryRestoreSession() {
  spawnParticles();
  checkSharedLink();
  const user = await getCurrentUser();
  if (user) await loginUser(user);
}

// ── Navegação principal ──

// Bloqueia o painel financeiro para quem não tem sessão Supabase (modo demo):
// aplica blur + overlay de login. A proteção real dos dados é o requireAuth
// no backend; este gate é apenas a camada visual de "prévia bloqueada".
async function gateFinancePanel() {
  const panel = document.getElementById('panel-yahoo');
  if (!panel) return;
  panel.classList.toggle('mf-locked', !(await isAuthenticated()));
}

export function switchTab(panel, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn, .sidebar-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + panel).classList.add('active');
  if (btn) btn.classList.add('active');
  if (panel === 'historico')    loadHistory();
  if (panel === 'perfil')       updateProfileStats();
  if (panel === 'compartilhar') loadShareList();
  if (panel === 'amigos') loadFriendsPanel();
  if (panel === 'yahoo') gateFinancePanel();
}

export function goProfile() {
  switchTab('perfil', null);
}
