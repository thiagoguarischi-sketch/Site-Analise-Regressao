// Compartilhamento de análises: gera links, resumos em texto e pré-visualização.

import { fetchAnalyses } from '../services/analysisService.js';
import { db } from '../services/supabaseService.js';
import { showToast } from './notifications.js';
import { esc, fmt } from '../core/utils.js';
import { loadSimpleAnalysis, loadMultipleAnalysis } from '../regressions/linearRegression.js';
import { loadLogisticAnalysis }   from '../regressions/logisticRegression.js';
import { loadPolynomialAnalysis } from '../regressions/polynomialRegression.js';
import { loadSerieAnalysis }      from '../regressions/timeSeries.js';

const PENDING_KEY = 'rl_pending_share';

let _analyses = [];
let _overlayAnalysis = null;
let _incomingShared = null;
let _friendPickAnalysisId = null;

async function _uid() {
  const { data: { user } } = await db.auth.getUser();
  return user?.id;
}

function _initials(name, email) {
  return (name || email || '?').split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

async function _loadAcceptedFriends() {
  const uid = await _uid();
  const { data: friendships } = await db
    .from('friendships')
    .select('requester_id, addressee_id')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${uid},addressee_id.eq.${uid}`);
  if (!friendships?.length) return [];
  const ids = friendships.map(f => f.requester_id === uid ? f.addressee_id : f.requester_id);
  const { data: profiles } = await db.from('profiles').select('id, full_name, email').in('id', ids);
  return profiles || [];
}

// ── Painel de compartilhamento ──

export async function loadShareList() {
  const container = document.getElementById('share-list');
  if (!container) return;
  container.innerHTML = '<p style="color:var(--txt3);font-size:13px">Carregando...</p>';

  try {
    _analyses = await fetchAnalyses();
    if (!_analyses.length) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px 20px;color:var(--txt3)">
          <div style="font-size:36px;margin-bottom:12px">📤</div>
          <div style="font-size:14px;font-weight:600;margin-bottom:6px">Nenhuma análise salva</div>
          <div style="font-size:13px">Execute e salve uma análise primeiro para poder compartilhá-la.</div>
        </div>`;
    } else {
      container.innerHTML = _analyses.map(a => _renderShareCard(a)).join('');
    }
  } catch {
    container.innerHTML = '<p style="color:var(--acc);font-size:13px">Erro ao carregar análises.</p>';
  }

  _loadReceivedShares();
}

function _renderShareCard(a) {
  const d = a.dados || {};
  const tipoLabel = _tipoLabel(a);
  const badgeClass = _badgeClass(a);
  const metric = _keyMetric(a);
  const date = new Date(a.created_at).toLocaleString('pt-BR');

  return `
    <div class="share-card" id="scard-${a.id}">
      <div style="display:flex;align-items:flex-start;gap:10px">
        <div style="font-size:28px;margin-top:2px">${_tipoIcon(a.tipo)}</div>
        <div style="flex:1;min-width:0">
          <span class="history-badge ${badgeClass}" style="margin-bottom:6px;display:inline-block">${tipoLabel}</span>
          <div class="history-title">${esc(a.nome)}</div>
          <div class="history-desc">${metric.label} = <b style="color:var(--y)">${metric.val}</b> &nbsp;•&nbsp; n = ${d.n ?? '—'}</div>
          <div class="history-date">Salvo em ${date}</div>
        </div>
      </div>
      <div class="share-actions">
        <button class="share-btn" onclick="copyShareLink('${a.id}')">🔗 Copiar link</button>
        <button class="share-btn" onclick="copyShareText('${a.id}')">📋 Copiar resumo</button>
        <button class="share-btn" style="color:var(--y);border-color:rgba(0,212,160,.35)" onclick="openShareWithFriendModal('${a.id}')">👤 Enviar a amigo</button>
        <button class="share-btn share-btn-preview" onclick="previewShareCard('${a.id}')">👁 Pré-visualizar</button>
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
      showToast('Link copiado! Cole em qualquer lugar.', 'ok');
    });
  } catch {
    showToast('Erro ao gerar link.', 'err');
  }
}

export function copyShareText(id) {
  const a = _analyses.find(x => x.id === id);
  if (!a) return;
  navigator.clipboard.writeText(_buildTextSummary(a)).then(() => {
    showToast('Resumo copiado!', 'ok');
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
    showToast('Link copiado!', 'ok');
  });
}

export function copyOverlayText() {
  if (!_overlayAnalysis) return;
  navigator.clipboard.writeText(_buildTextSummary(_overlayAnalysis)).then(() => {
    showToast('Resumo copiado!', 'ok');
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

  content.innerHTML = '<p style="color:var(--txt3);font-size:13px;text-align:center;padding:24px">Carregando amigos...</p>';
  overlay.classList.add('open');

  const friends = await _loadAcceptedFriends();

  if (!friends.length) {
    content.innerHTML = `
      <div style="text-align:center;padding:24px">
        <div style="font-size:36px;margin-bottom:10px">👥</div>
        <div style="font-size:14px;font-weight:700;color:var(--txt);margin-bottom:6px">Sem amigos adicionados</div>
        <div style="font-size:13px;color:var(--txt3)">Adicione amigos na aba 👥 para poder enviar análises.</div>
        <button class="btn-ghost" style="margin-top:16px" onclick="closeFriendPickOverlay()">Fechar</button>
      </div>`;
    return;
  }

  content.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
      <div>
        <div style="font-size:15px;font-weight:700;color:var(--txt)">Enviar para amigo</div>
        <div style="font-size:12px;color:var(--txt3);margin-top:3px">
          Análise: <b style="color:var(--txt2)">${esc(a?.nome || '')}</b>
        </div>
      </div>
      <button class="btn-ghost" style="font-size:18px;padding:4px 10px;line-height:1" onclick="closeFriendPickOverlay()">×</button>
    </div>
    <div class="interp-box" style="margin-bottom:14px;font-size:12px">
      📦 Os <strong>dados brutos e resultados completos</strong> serão enviados. Seu amigo verá exatamente a mesma análise.
    </div>
    ${friends.map(f => `
      <div class="friend-card" style="cursor:pointer" onclick="sendToFriend('${analysisId}','${f.id}','${esc(f.full_name || f.email || 'Usuário')}')">
        <div class="friend-avatar">${_initials(f.full_name, f.email)}</div>
        <div style="flex:1;min-width:0">
          <div class="friend-name">${esc(f.full_name || 'Usuário')}</div>
          <div class="friend-email">${esc(f.email || '')}</div>
        </div>
        <span style="font-size:12px;color:var(--y);font-weight:600;flex-shrink:0">Enviar →</span>
      </div>
    `).join('')}
  `;
}

export function closeFriendPickOverlay() {
  document.getElementById('friend-pick-overlay').classList.remove('open');
  _friendPickAnalysisId = null;
}

export async function sendToFriend(analysisId, receiverId, receiverName) {
  const a = _analyses.find(x => x.id === analysisId);
  if (!a) return;
  const uid = await _uid();
  const { error } = await db.from('friend_shares').insert({
    sender_id: uid,
    receiver_id: receiverId,
    analysis_nome: a.nome,
    analysis_tipo: a.tipo,
    analysis_dados: a.dados,
    label_x: a.label_x || null,
    label_y: a.label_y || null,
  });
  if (error) { showToast('Erro ao enviar para amigo.', 'err'); return; }
  closeFriendPickOverlay();
  showToast(`Análise enviada para ${receiverName}! 📬`, 'ok');
}

async function _loadReceivedShares() {
  const container = document.getElementById('share-received-list');
  if (!container) return;

  const uid = await _uid();
  if (!uid) return;

  const { data: shares, error } = await db
    .from('friend_shares')
    .select('id, sender_id, analysis_nome, analysis_tipo, analysis_dados, label_x, label_y, created_at')
    .eq('receiver_id', uid)
    .order('created_at', { ascending: false });

  if (error || !shares?.length) {
    container.innerHTML = '<p style="color:var(--txt3);font-size:13px;text-align:center;padding:8px 0">Nenhuma análise recebida.</p>';
    return;
  }

  const senderIds = [...new Set(shares.map(s => s.sender_id))];
  const { data: profiles } = await db.from('profiles').select('id, full_name, email').in('id', senderIds);
  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));

  container.innerHTML = shares.map(s => {
    const sender = profileMap[s.sender_id] || {};
    const tipoLabel = { simples:'Linear', multipla:'Múltipla', logistica:'Logística', polinomial:'Polinomial', serie:'Série Temp.', quantilica:'Quantílica', regularizada:'Regularizada' }[s.analysis_tipo] || s.analysis_tipo;
    const icon = { simples:'📈', multipla:'📊', logistica:'🎯', polinomial:'〰️', serie:'📅', quantilica:'🎻', regularizada:'⚖️' }[s.analysis_tipo] || '📊';
    const date = new Date(s.created_at).toLocaleString('pt-BR');
    return `
      <div class="share-card">
        <div style="display:flex;align-items:flex-start;gap:10px">
          <div style="font-size:26px;margin-top:2px">${icon}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:11px;color:var(--txt3);margin-bottom:4px">
              De <strong style="color:var(--txt2)">${esc(sender.full_name || sender.email || 'Usuário')}</strong> · ${date}
            </div>
            <div class="history-title">${esc(s.analysis_nome)}</div>
            <div class="history-desc">${tipoLabel}</div>
          </div>
        </div>
        <div class="share-actions">
          <button class="btn-primary" style="font-size:12px;padding:6px 14px" onclick="loadReceivedShare('${s.id}')">📥 Carregar análise</button>
          <button class="share-btn" style="color:var(--acc);border-color:rgba(255,107,107,.3)" onclick="deleteReceivedShare('${s.id}',this)">🗑 Remover</button>
        </div>
      </div>`;
  }).join('');
}

export async function loadReceivedShare(shareId) {
  const uid = await _uid();
  const { data, error } = await db
    .from('friend_shares')
    .select('analysis_nome, analysis_tipo, analysis_dados, label_x, label_y, created_at')
    .eq('id', shareId)
    .eq('receiver_id', uid)
    .single();
  if (error || !data) { showToast('Erro ao carregar análise.', 'err'); return; }
  await _doLoadAnalysis({
    nome: data.analysis_nome,
    tipo: data.analysis_tipo,
    dados: data.analysis_dados,
    label_x: data.label_x,
    label_y: data.label_y,
    created_at: data.created_at,
  });
}

export async function deleteReceivedShare(shareId, btn) {
  if (!confirm('Remover esta análise recebida?')) return;
  btn.closest('.share-card').remove();
  await db.from('friend_shares').delete().eq('id', shareId);
  showToast('Análise removida.', 'info');
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
  const date = new Date(a.created_at).toLocaleString('pt-BR');
  const div = '─'.repeat(38);
  const lines = [`${_tipoIcon(a.tipo)} ${tipoLabel} — "${a.nome}"`, div];

  if (a.tipo === 'simples') {
    lines.push(`Equação: Ŷ = ${fmt(d.b0)} + ${fmt(d.b1)}·${esc(a.label_x || 'X')}`);
    lines.push(`R² = ${fmt(d.r2)}  |  R² adj = ${fmt(d.r2adj)}`);
    lines.push(`p-valor = ${d.pF < 0.001 ? '<0.001' : fmt(d.pF)}  |  n = ${d.n}`);
  } else if (a.tipo === 'multipla') {
    lines.push(`R² = ${fmt(d.r2)}  |  R² adj = ${fmt(d.r2adj)}`);
    lines.push(`F = ${fmt(d.Fstat)}  |  p = ${d.pF < 0.001 ? '<0.001' : fmt(d.pF)}`);
    lines.push(`n = ${d.n}  |  k = ${d.k} preditores`);
  } else if (a.tipo === 'logistica') {
    lines.push(`R² McFadden = ${fmt(d.mcFaddenR2)}`);
    lines.push(`AUC-ROC = ${fmt(d.auc)}  |  Acurácia = ${d.cm?.acc != null ? (d.cm.acc * 100).toFixed(1) + '%' : '—'}`);
    lines.push(`n = ${d.n}  |  k = ${d.k} preditores`);
  } else if (a.tipo === 'polinomial') {
    lines.push(`Grau ${d.degree}  |  R² = ${fmt(d.r2)}  |  R² adj = ${fmt(d.r2adj)}`);
    lines.push(`n = ${d.n}`);
  } else if (a.tipo === 'serie') {
    lines.push(`Tendência = ${fmt(d.b1)}/período  |  CV = ${d.cv?.toFixed(1) ?? '—'}%`);
    lines.push(`Média = ${fmt(d.ym)}  |  Cresc. médio = ${d.avgGrowth?.toFixed(2) ?? '—'}%`);
    lines.push(`n = ${d.n}`);
  } else if (a.tipo === 'quantilica') {
    lines.push(`Perda Pinball (τ=0.5) = ${fmt(d.pinballLosses?.['0.5'] ?? d.pinballLosses?.[0.5])}`);
    lines.push(`n = ${d.n}`);
  } else if (a.tipo === 'regularizada') {
    lines.push(`Ridge R² = ${fmt(d.ridge?.r2)}  |  Lasso R² = ${fmt(d.lasso?.r2)}`);
    lines.push(`λ = ${fmt(d.lambda)}  |  n = ${d.n}`);
  }

  lines.push(div, `Salvo em ${date}`, 'Gerado via Slope');
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
      { label: 'Acurácia', val: d.cm?.acc != null ? (d.cm.acc * 100).toFixed(1) + '%' : '—' },
    ];
  } else if (a.tipo === 'polinomial') {
    items = [{ label: 'Grau', val: d.degree }, { label: 'R²', val: fmt(d.r2) }, { label: 'n', val: d.n }];
  } else if (a.tipo === 'serie') {
    items = [{ label: 'CV', val: (d.cv?.toFixed(1) ?? '—') + '%' }, { label: 'Tendência', val: fmt(d.b1) }, { label: 'n', val: d.n }];
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
      <div class="share-metric-val">${it.val ?? '—'}</div>
      <div class="share-metric-lab">${it.label}</div>
    </div>
  `).join('');
}

function _openShareOverlay(a) {
  const tipoLabel = _tipoLabel(a);
  const date = new Date(a.created_at).toLocaleString('pt-BR');
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
      <button class="btn-primary" style="flex:1;min-width:140px" onclick="copyOverlayLink()">🔗 Copiar link</button>
      <button class="btn-ghost" style="flex:1;min-width:140px" onclick="copyOverlayText()">📋 Copiar texto</button>
      <button class="btn-ghost" onclick="closeShareOverlay()">Fechar</button>
    </div>
  `;
  document.getElementById('share-overlay').classList.add('open');
}

// ── Link compartilhado (view para quem recebe) ──

export function checkSharedLink() {
  const hash = location.hash;
  if (!hash.startsWith('#share=')) return;
  try {
    _incomingShared = JSON.parse(decodeURIComponent(escape(atob(hash.slice(7)))));
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
    showToast('Faça login para carregar a análise compartilhada.', 'info');
  }
}

export async function checkPendingSharedAnalysis() {
  const raw = sessionStorage.getItem(PENDING_KEY);
  if (!raw) return false;
  sessionStorage.removeItem(PENDING_KEY);
  try {
    await _doLoadAnalysis(JSON.parse(raw));
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
    showToast('Dados carregados — clique em Executar para ver os resultados.', 'info');
    return;
  }
  showToast(`Análise "${a.nome}" carregada com sucesso! ✓`, 'ok');
}

function _showReadonlyShared(a) {
  const tipoLabel = _tipoLabel(a);
  const date = new Date(a.created_at).toLocaleString('pt-BR');
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
          Análise Compartilhada
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
        💡 <strong style="color:var(--y)">Dados disponíveis!</strong>
        Você pode carregar esta análise diretamente no app — os dados e resultados serão preenchidos automaticamente.
      </div>` : ''}

      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:16px">
        ${hasRawData ? `
        <button class="btn-primary" style="flex:1;min-width:180px" onclick="triggerLoadShared()">
          📥 Carregar esta análise
        </button>` : ''}
        <button class="btn-ghost" style="flex:1;min-width:140px" onclick="history.pushState('','',location.pathname);this.closest('.shared-readonly-overlay').remove()">
          📊 Nova análise
        </button>
        <button class="btn-ghost" onclick="this.closest('.shared-readonly-overlay').remove()">
          Fechar
        </button>
      </div>

      <p style="text-align:center;font-size:11px;color:var(--txt3)">
        Gerado via <strong style="color:var(--x)">Slope</strong>
      </p>
    </div>
  `;
  document.body.appendChild(overlay);
}

// ── Helpers ──

function _tipoLabel(a) {
  const d = a.dados || {};
  return {
    simples:     'Regressão Linear',
    multipla:    'Regressão Múltipla',
    logistica:   'Regressão Logística',
    polinomial:  `Reg. Polinomial Grau ${d.degree ?? '?'}`,
    serie:       'Série Temporal',
    quantilica:  'Reg. Quantílica',
    regularizada:'Reg. Regularizada',
  }[a.tipo] || a.tipo;
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
