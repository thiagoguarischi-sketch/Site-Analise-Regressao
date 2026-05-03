// Camada de UI do app autenticado: navegação, login/logout, perfil e auth overlay.

import {
  signUp, signIn, signOut, getCurrentUser,
} from '../services/authService.js';
import { db, setSession, clearSession } from '../services/supabaseService.js';
import { showToast } from './notifications.js';
import { loadHistory, updateProfileStats } from './tables.js';
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

export function togglePw(id, btn) {
  const inp = document.getElementById(id);
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '🙈';
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
    btn.textContent = formId === 'form-login' ? 'Entrar na conta' : 'Criar conta grátis';
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
    errEl.textContent = error.message || 'E-mail ou senha incorretos.';
    errEl.classList.add('show');
    document.getElementById('auth-card').classList.add('shake');
    setTimeout(() => document.getElementById('auth-card').classList.remove('shake'), 300);
  }
  setAuthLoading('form-login', false);
}

export async function doSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim().toLowerCase();
  const pw = document.getElementById('signup-pw').value;
  const pw2 = document.getElementById('signup-pw2').value;
  const errEl = document.getElementById('signup-error');
  const okEl = document.getElementById('signup-success');
  errEl.classList.remove('show'); okEl.classList.remove('show');

  if (pw !== pw2)   { errEl.textContent = 'As senhas não coincidem.'; errEl.classList.add('show'); return; }
  if (pw.length < 8){ errEl.textContent = 'Senha deve ter mínimo 8 caracteres.'; errEl.classList.add('show'); return; }
  setAuthLoading('form-signup', true);

  try {
    const user = await signUp(email, pw, name);
    okEl.textContent = 'Conta criada! Entrando...';
    okEl.classList.add('show');
    setTimeout(async () => { await loginUser(user); setAuthLoading('form-signup', false); }, 800);
  } catch (error) {
    errEl.textContent = error.message || 'Erro no cadastro.';
    errEl.classList.add('show');
    setAuthLoading('form-signup', false);
  }
}

export async function doForgot() {
  const email = document.getElementById('forgot-email').value.trim().toLowerCase();
  const errEl = document.getElementById('forgot-error');
  const okEl = document.getElementById('forgot-success');
  errEl.classList.remove('show'); okEl.classList.remove('show');
  if (!email) { errEl.textContent = 'Digite seu e-mail.'; errEl.classList.add('show'); return; }
  try {
    await db.auth.resetPasswordForEmail(email);
    okEl.textContent = 'Link de redefinição enviado para seu e-mail.';
    okEl.classList.add('show');
  } catch (error) {
    errEl.textContent = error.message || 'Erro ao enviar link.';
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
    document.getElementById('sync-status').style.display = 'flex';
    document.getElementById('cloud-banner').style.display = 'flex';

    initRows();

    try { await loadHistory(); } catch (e) { console.warn('loadHistory error:', e); }
    try { await updateProfileStats(); } catch (e) { console.warn('updateProfileStats error:', e); }

    const allTabBtns = document.querySelectorAll('.tab-btn');
    if (allTabBtns.length > 0) switchTab('nova', allTabBtns[0]);
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
  document.getElementById('auth-overlay').classList.remove('hidden');
  document.getElementById('app-container').classList.remove('visible');
  document.getElementById('login-email').value = '';
  document.getElementById('login-pw').value = '';
  document.getElementById('login-error').classList.remove('show');
  showToast('Até logo! 👋', 'info');
}

export async function deleteAccount() {
  if (!confirm('Tem certeza? Isso irá excluir sua conta e TODAS as análises permanentemente.')) return;
  if (!confirm('Esta ação é IRREVERSÍVEL. Confirma?')) return;
  await signOut();
  await clearSession();
  showToast('Conta "excluída" (simulado).', 'err');
  setTimeout(() => {
    currentUser = null;
    document.getElementById('auth-overlay').classList.remove('hidden');
    document.getElementById('app-container').classList.remove('visible');
  }, 1000);
}

// ── Profile ──

export async function saveProfile() {
  const name = document.getElementById('edit-name').value.trim();
  const email = document.getElementById('edit-email').value.trim().toLowerCase();
  if (!name || !email) { showToast('Preencha todos os campos.', 'err'); return; }
  if (name.length < 2) { showToast('Nome muito curto.', 'err'); return; }

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
    showToast('Perfil atualizado!', 'ok');
  } catch (error) {
    showToast(error.message || 'Erro ao atualizar perfil.', 'err');
  }
}

export async function changePw() {
  const oldPw = document.getElementById('old-pw').value;
  const newPw = document.getElementById('new-pw').value;
  const newPw2 = document.getElementById('new-pw2').value;
  if (!oldPw || !newPw || !newPw2) { showToast('Preencha todos os campos.', 'err'); return; }
  if (newPw.length < 8) { showToast('Nova senha muito curta (mín. 8 chars).', 'err'); return; }
  if (newPw !== newPw2) { showToast('Senhas não coincidem.', 'err'); return; }

  try {
    await db.auth.updateUser({ password: newPw });
    document.getElementById('old-pw').value = '';
    document.getElementById('new-pw').value = '';
    document.getElementById('new-pw2').value = '';
    showToast('Senha alterada com sucesso!', 'ok');
  } catch (error) {
    showToast(error.message || 'Erro ao alterar senha.', 'err');
  }
}

export async function tryRestoreSession() {
  spawnParticles();
  const user = await getCurrentUser();
  if (user) await loginUser(user);
}

// ── Navegação principal ──

export function switchTab(panel, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn, .sidebar-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + panel).classList.add('active');
  if (btn) btn.classList.add('active');
  if (panel === 'historico') loadHistory();
  if (panel === 'perfil')   updateProfileStats();
}

export function goProfile() {
  switchTab('perfil', null);
}
