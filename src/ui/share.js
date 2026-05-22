// Compartilhamento de análises: gera links, resumos em texto e pré-visualização.

import { fetchAnalyses } from '../services/analysisService.js';
import { fetchFriends, postShare, fetchShares, fetchShare, removeShare } from '../services/socialService.js';
import { showToast } from './notifications.js';
import { esc, fmt, safeId, initials as _initials } from '../core/utils.js';
import { loadSimpleAnalysis, loadMultipleAnalysis } from '../regressions/linearRegression.js';
import { loadLogisticAnalysis }   from '../regressions/logisticRegression.js';
import { loadPolynomialAnalysis } from '../regressions/polynomialRegression.js';
import { loadSerieAnalysis }      from '../regressions/timeSeries.js';

const PENDING_KEY = 'rl_pending_share';

let _analyses = [];
let _overlayAnalysis = null;
let _incomingShared = null;
let _friendPickAnalysisId = null;
let _friendPickFriends = [];
let _receivedCache = null;

// Tipos de análise aceitos — qualquer payload externo (link #share=,
// friend_shares) é validado contra esta allowlist antes de ser usado.
const VALID_TIPOS = ['simples', 'multipla', 'logistica', 'polinomial', 'serie', 'quantilica', 'regularizada'];

// Saneia um objeto de análise vindo de fonte NÃO confiável (URL de terceiro,
// friend_shares). Retorna null se inválido. `tipo` é checado por allowlist e
// os textos são coagidos a string com tamanho limitado. O conteúdo de `dados`
// continua livre — a proteção contra XSS é o escape nos pontos de render.
function _sanitizeSharedAnalysis(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  if (!VALID_TIPOS.includes(raw.tipo)) return null;
  if (raw.dados == null || typeof raw.dados !== 'object') return null;
  return {
    nome:       typeof raw.nome === 'string' ? raw.nome.slice(0, 200) : 'Análise',
    tipo:       raw.tipo,
    dados:      raw.dados,
    label_x:    typeof raw.label_x === 'string' ? raw.label_x.slice(0, 120) : null,
    label_y:    typeof raw.label_y === 'string' ? raw.label_y.slice(0, 120) : null,
    created_at: typeof raw.created_at === 'string' ? raw.created_at : new Date().toISOString(),
  };
}

function _locale() {
  return localStorage.getItem('slope-lang') === 'en' ? 'en-US' : 'pt-BR';
}

async function _loadAcceptedFriends() {
  try {
    const friends = await fetchFriends();
    return friends.map(f => f.friend);
  } catch (e) {
    return [];
  }
}

// ── Painel de compartilhamento ──

export async function loadShareList() {
  const container = document.getElementById('share-list');
  if (!container) return;
  container.innerHTML = `<p style="color:var(--txt3);font-size:13px">${window.t('share-loading')}</p>`;

  try {
    _analyses = await fetchAnalyses();
    if (!_analyses.length) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px 20px;color:var(--txt3)">
          <div style="font-size:36px;margin-bottom:12px">📤</div>
          <div style="font-size:14px;font-weight:600;margin-bottom:6px">${window.t('share-empty-title')}</div>
          <div style="font-size:13px">${window.t('share-empty-desc')}</div>
        </div>`;
    } else {
      container.innerHTML = _analyses.map(a => _renderShareCard(a)).join('');
    }
  } catch {
    container.innerHTML = `<p style="color:var(--acc);font-size:13px">${window.t('share-error-load')}</p>`;
  }

  _loadReceivedShares();
}

function _renderShareCard(a) {
  const d = a.dados || {};
  const tipoLabel = _tipoLabel(a);
  const badgeClass = _badgeClass(a);
  const metric = _keyMetric(a);
  const date = new Date(a.created_at).toLocaleString(_locale());

  const id = safeId(a.id);
  return `
    <div class="share-card" id="scard-${id}">
      <div style="display:flex;align-items:flex-start;gap:10px">
        <div style="font-size:28px;margin-top:2px">${_tipoIcon(a.tipo)}</div>
        <div style="flex:1;min-width:0">
          <span class="history-badge ${badgeClass}" style="margin-bottom:6px;display:inline-block">${tipoLabel}</span>
          <div class="history-title">${esc(a.nome)}</div>
          <div class="history-desc">${esc(metric.label)} = <b style="color:var(--y)">${esc(metric.val)}</b> &nbsp;•&nbsp; n = ${esc(d.n ?? '—')}</div>
          <div class="history-date">${window.t('share-saved-on')} ${date}</div>
        </div>
      </div>
      <div class="share-actions">
        <button class="share-btn" onclick="copyShareLink('${id}')">${window.t('share-btn-link')}</button>
        <button class="share-btn" onclick="copyShareText('${id}')">${window.t('share-btn-summary')}</button>
        <button class="share-btn" style="color:var(--y);border-color:rgba(0,212,160,.35)" onclick="openShareWithFriendModal('${id}')">${window.t('share-btn-friend')}</button>
        <button class="share-btn share-btn-preview" onclick="previewShareCard('${id}')">${window.t('share-btn-preview')}</button>
      </div>
    </div>
  `;
}

// ── Ações de compartilhamento ──

export function copyShareLink(id) {
  const a = _analyses.find(x => x.id === id);
  if (!a) return;
  try {
    const url = _buildShareUrl(a);
    navigator.clipboard.writeText(url).then(() => {
      showToast(window.t('share-toast-link'), 'ok');
    });
  } catch {
    showToast(window.t('share-toast-link-err'), 'err');
  }
}

export function copyShareText(id) {
  const a = _analyses.find(x => x.id === id);
  if (!a) return;
  navigator.clipboard.writeText(_buildTextSummary(a)).then(() => {
    showToast(window.t('share-toast-summary'), 'ok');
  });
}

export function previewShareCard(id) {
  const a = _analyses.find(x => x.id === id);
  if (!a) return;
  _overlayAnalysis = a;
  _openShareOverlay(a);
}

export function copyOverlayLink() {
  if (!_overlayAnalysis) return;
  navigator.clipboard.writeText(_buildShareUrl(_overlayAnalysis)).then(() => {
    showToast(window.t('share-overlay-link'), 'ok');
  });
}

export function copyOverlayText() {
  if (!_overlayAnalysis) return;
  navigator.clipboard.writeText(_buildTextSummary(_overlayAnalysis)).then(() => {
    showToast(window.t('share-toast-summary'), 'ok');
  });
}

export function closeShareOverlay() {
  document.getElementById('share-overlay').classList.remove('open');
  _overlayAnalysis = null;
}

// ── Compartilhar com amigo ──

export async function openShareWithFriendModal(analysisId) {
  _friendPickAnalysisId = analysisId;
  const overlay = document.getElementById('friend-pick-overlay');
  const content = document.getElementById('friend-pick-content');
  const a = _analyses.find(x => x.id === analysisId);

  content.innerHTML = `<p style="color:var(--txt3);font-size:13px;text-align:center;padding:24px">${window.t('share-friends-loading')}</p>`;
  overlay.classList.add('open');

  const friends = await _loadAcceptedFriends();
  _friendPickFriends = friends;

  if (!friends.length) {
    content.innerHTML = `
      <div style="text-align:center;padding:24px">
        <div style="font-size:36px;margin-bottom:10px">👥</div>
        <div style="font-size:14px;font-weight:700;color:var(--txt);margin-bottom:6px">${window.t('share-no-friends-title')}</div>
        <div style="font-size:13px;color:var(--txt3)">${window.t('share-no-friends-desc')}</div>
        <button class="btn-ghost" style="margin-top:16px" onclick="closeFriendPickOverlay()">${window.t('share-close')}</button>
      </div>`;
    return;
  }

  content.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
      <div>
        <div style="font-size:15px;font-weight:700;color:var(--txt)">${window.t('share-send-title')}</div>
        <div style="font-size:12px;color:var(--txt3);margin-top:3px">
          ${window.t('share-send-analysis')} <b style="color:var(--txt2)">${esc(a?.nome || '')}</b>
        </div>
      </div>
      <button class="btn-ghost" style="font-size:18px;padding:4px 10px;line-height:1" onclick="closeFriendPickOverlay()">×</button>
    </div>
    <div class="interp-box" style="margin-bottom:14px;font-size:12px">
      ${window.t('share-send-info')}
    </div>
    ${friends.map(f => `
      <div class="friend-card" style="cursor:pointer" onclick="sendToFriend('${safeId(analysisId)}','${safeId(f.id)}')">
        <div class="friend-avatar">${_initials(f.full_name, f.email)}</div>
        <div style="flex:1;min-width:0">
          <div class="friend-name">${esc(f.full_name || 'Usuário')}</div>
          <div class="friend-email">${esc(f.email || '')}</div>
        </div>
        <span style="font-size:12px;color:var(--y);font-weight:600;flex-shrink:0">${window.t('share-send-btn')}</span>
      </div>
    `).join('')}
  `;
}

export function closeFriendPickOverlay() {
  document.getElementById('friend-pick-overlay').classList.remove('open');
  _friendPickAnalysisId = null;
}

export async function sendToFriend(analysisId, receiverId) {
  const a = _analyses.find(x => x.id === analysisId);
  if (!a) return;
  // Nome do destinatário resolvido pelo cache (não trafega via onclick).
  const friend = _friendPickFriends.find(f => f.id === receiverId);
  const receiverName = friend ? (friend.full_name || friend.email || 'Usuário') : 'Usuário';
  try {
    await postShare(receiverId, {
      nome: a.nome, tipo: a.tipo, dados: a.dados,
      label_x: a.label_x || null, label_y: a.label_y || null,
    });
  } catch (e) {
    showToast(window.t('share-send-err'), 'err');
    return;
  }
  closeFriendPickOverlay();
  showToast(`${window.t('share-send-title')} → ${receiverName} 📬`, 'ok');
}

async function _loadReceivedShares() {
  const container = document.getElementById('share-received-list');
  if (!container) return;

  let shares;
  try {
    shares = await fetchShares();
  } catch (e) { shares = []; }

  if (!shares.length) {
    container.innerHTML = `<p style="color:var(--txt3);font-size:13px;text-align:center;padding:8px 0">${window.t('share-received-none')}</p>`;
    return;
  }

  _receivedCache = shares;
  _renderReceivedList(container, shares);
}

function _renderReceivedList(container, shares) {
  container.innerHTML = shares.map(s => {
    const sender = s.sender || {};
    const tipoLabel = {
      simples:     window.t('share-tipo-simples'),
      multipla:    window.t('share-tipo-multipla'),
      logistica:   window.t('share-tipo-logistica'),
      polinomial:  window.t('share-tipo-polinomial'),
      serie:       window.t('share-tipo-serie'),
      quantilica:  window.t('share-tipo-quantilica'),
      regularizada:window.t('share-tipo-regularizada'),
    }[s.analysis_tipo] || esc(s.analysis_tipo);
    const icon = { simples:'📈', multipla:'📊', logistica:'🎯', polinomial:'〰️', serie:'📅', quantilica:'🎻', regularizada:'⚖️' }[s.analysis_tipo] || '📊';
    const date = new Date(s.created_at).toLocaleString(_locale());
    return `
      <div class="share-card">
        <div style="display:flex;align-items:flex-start;gap:10px">
          <div style="font-size:26px;margin-top:2px">${icon}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:11px;color:var(--txt3);margin-bottom:4px">
              ${window.t('share-received-from')} <strong style="color:var(--txt2)">${esc(sender.full_name || sender.email || 'Usuário')}</strong> · ${date}
            </div>
            <div class="history-title">${esc(s.analysis_nome)}</div>
            <div class="history-desc">${tipoLabel}</div>
          </div>
        </div>
        <div class="share-actions">
          <button class="btn-primary" style="font-size:12px;padding:6px 14px" onclick="loadReceivedShare('${safeId(s.id)}')">${window.t('share-received-load-btn')}</button>
          <button class="share-btn" style="color:var(--acc);border-color:rgba(255,107,107,.3)" onclick="deleteReceivedShare('${safeId(s.id)}',this)">${window.t('share-remove-btn')}</button>
        </div>
      </div>`;
  }).join('');
}

// ── Re-renderiza ao trocar idioma ──

export function shareRerender() {
  if (_analyses.length) {
    const list = document.getElementById('share-list');
    if (list) list.innerHTML = _analyses.map(a => _renderShareCard(a)).join('');
  }
  if (_receivedCache) {
    const container = document.getElementById('share-received-list');
    if (container) _renderReceivedList(container, _receivedCache);
  }
}

export async function loadReceivedShare(shareId) {
  let data;
  try {
    data = await fetchShare(shareId);
  } catch (e) { showToast(window.t('share-received-err'), 'err'); return; }
  const a = _sanitizeSharedAnalysis({
    nome: data.analysis_nome,
    tipo: data.analysis_tipo,
    dados: data.analysis_dados,
    label_x: data.label_x,
    label_y: data.label_y,
    created_at: data.created_at,
  });
  if (!a) { showToast(window.t('share-received-err'), 'err'); return; }
  await _doLoadAnalysis(a);
}

export async function deleteReceivedShare(shareId, btn) {
  if (!confirm(window.t('share-remove-confirm'))) return;
  try {
    await removeShare(shareId);
  } catch (e) {
    showToast(window.t('share-received-err'), 'err');
    return;
  }
  btn.closest('.share-card').remove();
  showToast(window.t('share-removed-toast'), 'info');
}

// ── Geração de conteúdo ──

function _buildShareUrl(a) {
  const payload = {
    nome: a.nome,
    tipo: a.tipo,
    dados: a.dados,
    label_x: a.label_x,
    label_y: a.label_y,
    created_at: a.created_at,
  };
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  return `${location.origin}${location.pathname}#share=${encoded}`;
}

function _buildTextSummary(a) {
  const d = a.dados || {};
  const tipoLabel = _tipoLabel(a);
  const date = new Date(a.created_at).toLocaleString(_locale());
  const div = '─'.repeat(38);
  const lines = [`${_tipoIcon(a.tipo)} ${tipoLabel} — "${a.nome}"`, div];

  if (a.tipo === 'simples') {
    lines.push(`${window.t('share-summary-equacao')}: Ŷ = ${fmt(d.b0)} + ${fmt(d.b1)}·${esc(a.label_x || 'X')}`);
    lines.push(`R² = ${fmt(d.r2)}  |  R² adj = ${fmt(d.r2adj)}`);
    lines.push(`${window.t('share-summary-pvalor')} = ${d.pF < 0.001 ? '<0.001' : fmt(d.pF)}  |  n = ${d.n}`);
  } else if (a.tipo === 'multipla') {
    lines.push(`R² = ${fmt(d.r2)}  |  R² adj = ${fmt(d.r2adj)}`);
    lines.push(`F = ${fmt(d.Fstat)}  |  p = ${d.pF < 0.001 ? '<0.001' : fmt(d.pF)}`);
    lines.push(`n = ${d.n}  |  k = ${d.k} ${window.t('share-summary-preditores')}`);
  } else if (a.tipo === 'logistica') {
    lines.push(`R² McFadden = ${fmt(d.mcFaddenR2)}`);
    lines.push(`AUC-ROC = ${fmt(d.auc)}  |  ${window.t('share-summary-acuracia')} = ${d.cm?.acc != null ? (d.cm.acc * 100).toFixed(1) + '%' : '—'}`);
    lines.push(`n = ${d.n}  |  k = ${d.k} ${window.t('share-summary-preditores')}`);
  } else if (a.tipo === 'polinomial') {
    lines.push(`${window.t('share-metric-grau')} ${d.degree}  |  R² = ${fmt(d.r2)}  |  R² adj = ${fmt(d.r2adj)}`);
    lines.push(`n = ${d.n}`);
  } else if (a.tipo === 'serie') {
    lines.push(`${window.t('share-summary-tendencia')} = ${fmt(d.b1)}/${window.t('share-summary-periodo')}  |  CV = ${d.cv?.toFixed(1) ?? '—'}%`);
    lines.push(`${window.t('share-summary-media')} = ${fmt(d.ym)}  |  ${window.t('share-summary-cresc')} = ${d.avgGrowth?.toFixed(2) ?? '—'}%`);
    lines.push(`n = ${d.n}`);
  } else if (a.tipo === 'quantilica') {
    lines.push(`${window.t('share-summary-pinball')} (τ=0.5) = ${fmt(d.pinballLosses?.['0.5'] ?? d.pinballLosses?.[0.5])}`);
    lines.push(`n = ${d.n}`);
  } else if (a.tipo === 'regularizada') {
    lines.push(`Ridge R² = ${fmt(d.ridge?.r2)}  |  Lasso R² = ${fmt(d.lasso?.r2)}`);
    lines.push(`λ = ${fmt(d.lambda)}  |  n = ${d.n}`);
  }

  lines.push(div, `${window.t('share-summary-saved')} ${date}`, window.t('share-summary-footer'));
  return lines.join('\n');
}

function _buildMetricCards(a) {
  const d = a.dados || {};
  let items = [];

  if (a.tipo === 'simples') {
    items = [{ label: 'R²', val: fmt(d.r2) }, { label: 'r Pearson', val: fmt(d.r) }, { label: 'n', val: d.n }];
  } else if (a.tipo === 'multipla') {
    items = [{ label: 'R² adj', val: fmt(d.r2adj) }, { label: 'F-stat', val: fmt(d.Fstat) }, { label: 'n', val: d.n }];
  } else if (a.tipo === 'logistica') {
    items = [
      { label: 'AUC-ROC', val: fmt(d.auc) },
      { label: 'R² McF', val: fmt(d.mcFaddenR2) },
      { label: window.t('share-metric-acuracia'), val: d.cm?.acc != null ? (d.cm.acc * 100).toFixed(1) + '%' : '—' },
    ];
  } else if (a.tipo === 'polinomial') {
    items = [{ label: window.t('share-metric-grau'), val: d.degree }, { label: 'R²', val: fmt(d.r2) }, { label: 'n', val: d.n }];
  } else if (a.tipo === 'serie') {
    items = [{ label: 'CV', val: (d.cv?.toFixed(1) ?? '—') + '%' }, { label: window.t('share-metric-tendencia'), val: fmt(d.b1) }, { label: 'n', val: d.n }];
  } else if (a.tipo === 'quantilica') {
    items = [{ label: 'PB (τ=0.5)', val: fmt(d.pinballLosses?.['0.5']) }, { label: 'n', val: d.n }];
  } else if (a.tipo === 'regularizada') {
    items = [{ label: 'Ridge R²', val: fmt(d.ridge?.r2) }, { label: 'Lasso R²', val: fmt(d.lasso?.r2) }, { label: 'λ', val: fmt(d.lambda) }];
  } else {
    const m = _keyMetric(a);
    items = [{ label: m.label, val: m.val }, { label: 'n', val: d.n }];
  }

  return items.map(it => `
    <div style="text-align:center;padding:0 8px">
      <div class="share-metric-val">${esc(it.val ?? '—')}</div>
      <div class="share-metric-lab">${esc(it.label)}</div>
    </div>
  `).join('');
}

function _openShareOverlay(a) {
  const tipoLabel = _tipoLabel(a);
  const date = new Date(a.created_at).toLocaleString(_locale());
  const text = _buildTextSummary(a);

  document.getElementById('share-overlay-content').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
      <div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
          <span style="font-size:22px">${_tipoIcon(a.tipo)}</span>
          <span class="modal-title">${esc(a.nome)}</span>
        </div>
        <div class="modal-subtitle">${tipoLabel} • ${date}</div>
      </div>
      <button class="btn-ghost" style="font-size:18px;padding:4px 10px;line-height:1" onclick="closeShareOverlay()">×</button>
    </div>

    <div class="share-metric-strip">
      ${_buildMetricCards(a)}
    </div>

    <div class="share-text-block">${esc(text)}</div>

    <div class="modal-actions">
      <button class="btn-primary" style="flex:1;min-width:140px" onclick="copyOverlayLink()">🔗 ${window.t('share-btn-link').replace('🔗 ','')}</button>
      <button class="btn-ghost" style="flex:1;min-width:140px" onclick="copyOverlayText()">${window.t('share-overlay-text-btn')}</button>
      <button class="btn-ghost" onclick="closeShareOverlay()">${window.t('share-close')}</button>
    </div>
  `;
  document.getElementById('share-overlay').classList.add('open');
}

// ── Link compartilhado (view para quem recebe) ──

export function checkSharedLink() {
  const hash = location.hash;
  if (!hash.startsWith('#share=')) return;
  try {
    const raw = JSON.parse(decodeURIComponent(escape(atob(hash.slice(7)))));
    _incomingShared = _sanitizeSharedAnalysis(raw);
    if (!_incomingShared) { console.warn('Link de compartilhamento inválido.'); return; }
    _showReadonlyShared(_incomingShared);
  } catch {
    console.warn('Link de compartilhamento inválido.');
  }
}

export function triggerLoadShared() {
  if (!_incomingShared) return;
  const a = _incomingShared;
  document.querySelector('.shared-readonly-overlay')?.remove();
  history.pushState('', '', location.pathname);

  const loggedIn = document.getElementById('app-container')?.classList.contains('visible');
  if (loggedIn) {
    _doLoadAnalysis(a);
    _incomingShared = null;
  } else {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(a));
    showToast(window.t('share-login-toast'), 'info');
  }
}

export async function checkPendingSharedAnalysis() {
  const raw = sessionStorage.getItem(PENDING_KEY);
  if (!raw) return false;
  sessionStorage.removeItem(PENDING_KEY);
  try {
    const a = _sanitizeSharedAnalysis(JSON.parse(raw));
    if (!a) return false;
    await _doLoadAnalysis(a);
    return true;
  } catch {
    return false;
  }
}

async function _doLoadAnalysis(a) {
  if (a.tipo === 'simples')         await loadSimpleAnalysis(a);
  else if (a.tipo === 'multipla')   await loadMultipleAnalysis(a);
  else if (a.tipo === 'logistica')  await loadLogisticAnalysis(a);
  else if (a.tipo === 'polinomial') await loadPolynomialAnalysis(a);
  else if (a.tipo === 'serie')      await loadSerieAnalysis(a);
  else {
    const tab = a.tipo;
    const btn = document.querySelector(`[onclick*="'${tab}'"]`);
    window.switchTab?.(tab, btn);
    showToast(window.t('share-data-loaded-toast'), 'info');
    return;
  }
  showToast(`"${a.nome}" ✓`, 'ok');
}

function _showReadonlyShared(a) {
  const tipoLabel = _tipoLabel(a);
  const date = new Date(a.created_at).toLocaleString(_locale());
  const text = _buildTextSummary(a);
  const hasRawData = !!(a.dados?.xs?.length || a.dados?.ys?.length
    || a.dados?.labels?.length || a.dados?.matrix?.length);

  const overlay = document.createElement('div');
  overlay.className = 'shared-readonly-overlay';
  overlay.innerHTML = `
    <div class="shared-readonly-card">
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:42px;margin-bottom:8px">${_tipoIcon(a.tipo)}</div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--txt3);margin-bottom:6px">
          ${window.t('share-readonly-badge')}
        </div>
        <div style="font-size:22px;font-weight:700;color:var(--txt);margin-bottom:4px">${esc(a.nome)}</div>
        <div style="font-size:12px;color:var(--txt3)">${tipoLabel} • ${date}</div>
      </div>

      <div class="share-metric-strip" style="margin-bottom:16px">
        ${_buildMetricCards(a)}
      </div>

      <div class="share-text-block" style="margin-bottom:20px">${esc(text)}</div>

      ${hasRawData ? `
      <div style="background:rgba(0,212,160,.07);border:1px solid rgba(0,212,160,.2);border-radius:10px;padding:12px 14px;margin-bottom:16px;font-size:13px;color:var(--txt2);line-height:1.5">
        💡 <strong style="color:var(--y)">${window.t('share-readonly-data-title')}</strong>
        ${window.t('share-readonly-data-desc')}
      </div>` : ''}

      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:16px">
        ${hasRawData ? `
        <button class="btn-primary" style="flex:1;min-width:180px" onclick="triggerLoadShared()">
          ${window.t('share-readonly-load-btn')}
        </button>` : ''}
        <button class="btn-ghost" style="flex:1;min-width:140px" onclick="history.pushState('','',location.pathname);this.closest('.shared-readonly-overlay').remove()">
          ${window.t('share-readonly-new-btn')}
        </button>
        <button class="btn-ghost" onclick="this.closest('.shared-readonly-overlay').remove()">
          ${window.t('share-close')}
        </button>
      </div>

      <p style="text-align:center;font-size:11px;color:var(--txt3)">
        ${window.t('share-readonly-footer')} <strong style="color:var(--x)">Slope</strong>
      </p>
    </div>
  `;
  document.body.appendChild(overlay);
}

// ── Helpers ──

function _tipoLabel(a) {
  const d = a.dados || {};
  return {
    simples:     window.t('share-tipo-simples'),
    multipla:    window.t('share-tipo-multipla'),
    logistica:   window.t('share-tipo-logistica'),
    polinomial:  `${window.t('share-tipo-polinomial')} ${esc(d.degree ?? '?')}`,
    serie:       window.t('share-tipo-serie'),
    quantilica:  window.t('share-tipo-quantilica'),
    regularizada:window.t('share-tipo-regularizada'),
  }[a.tipo] || esc(a.tipo);
}

function _tipoIcon(tipo) {
  return { simples:'📈', multipla:'📊', logistica:'🎯', polinomial:'〰️', serie:'📅', quantilica:'🎻', regularizada:'⚖️' }[tipo] || '📊';
}

function _badgeClass(a) {
  return {
    simples:     'history-badge-simples',
    multipla:    'history-badge-multipla',
    logistica:   'history-badge-logistica',
    polinomial:  'history-badge-polinomial',
    serie:       'history-badge-serie',
    quantilica:  'history-badge-quantilica',
    regularizada:'history-badge-regularizada',
  }[a.tipo] || 'history-badge-simples';
}

function _keyMetric(a) {
  const d = a.dados || {};
  if (a.tipo === 'simples')      return { label: 'R²',       val: fmt(d.r2) };
  if (a.tipo === 'logistica')    return { label: 'AUC',       val: fmt(d.auc) };
  if (a.tipo === 'serie')        return { label: 'CV',        val: (d.cv?.toFixed(1) ?? '—') + '%' };
  if (a.tipo === 'quantilica')   return { label: 'PB(0.5)',   val: fmt(d.pinballLosses?.['0.5'] ?? d.pinballLosses?.[0.5]) };
  if (a.tipo === 'regularizada') return { label: 'R²(Ridge)', val: fmt(d.ridge?.r2) };
  return { label: 'R² adj', val: fmt(d.r2adj) };
}
