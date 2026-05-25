import { showToast } from './notifications.js';
import { API_BASE }  from '../config/constants.js';
import { authHeaders } from '../services/supabaseService.js';
import { esc } from '../core/utils.js';

// ── Estado ────────────────────────────────────────────────────────────────────
let _tickers      = [];   // [{symbol, name, exch, type}]
let _datasets     = {};   // {symbol: {rows, currency, name, symbol}}
let _view         = 'normal';
let _normalized   = false;
let _compareChart = null;
let _searchTimer  = null;

const PALETTE = ['#7C83FD','#00D4A0','#FF6B8A','#FFC254','#4FC3F7','#CE93D8','#80CBC4','#FFAB40'];

// ── Inicializa date pickers com intervalo padrão de 1 ano ────────────────────
function _initDatePickers() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const maxDate = yesterday.toISOString().slice(0, 10);

  const oneYearAgo = new Date(yesterday);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const defaultFrom = oneYearAgo.toISOString().slice(0, 10);

  const fromEl = document.getElementById('yf-date-from');
  const toEl   = document.getElementById('yf-date-to');
  if (!fromEl || !toEl) return;

  fromEl.max = maxDate;
  toEl.max   = maxDate;
  fromEl.value = defaultFrom;
  toEl.value   = maxDate;

  fromEl.addEventListener('change', () => {
    if (toEl.value && fromEl.value > toEl.value) toEl.value = fromEl.value;
    toEl.min = fromEl.value;
  });
  toEl.addEventListener('change', () => {
    if (fromEl.value && toEl.value < fromEl.value) fromEl.value = toEl.value;
    fromEl.max = toEl.value || maxDate;
  });
}

document.addEventListener('DOMContentLoaded', _initDatePickers);

// ── Delegação de cliques ──────────────────────────────────────────────────────
document.addEventListener('click', e => {
  const btn = e.target.closest('#yf-results .yf-result-btn');
  if (btn) {
    yfAddTicker(btn.dataset.symbol, btn.dataset.name, btn.dataset.exch, btn.dataset.type);
    return;
  }
  if (!e.target.closest('.yf-search-wrap') && !e.target.closest('#yf-results')) {
    const el = document.getElementById('yf-results');
    if (el) el.innerHTML = '';
  }
});

function _attr(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

// ── Busca ─────────────────────────────────────────────────────────────────────
export function yfSearchInput() {
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(_doSearch, 320);
}

async function _doSearch() {
  const q    = (document.getElementById('yf-search')?.value ?? '').trim();
  const list = document.getElementById('yf-results');
  if (!list) return;
  if (!q) { list.innerHTML = ''; return; }

  list.innerHTML = `<div class="yf-loading">${window.t?.('mf-buscando') ?? 'Buscando…'}</div>`;
  try {
    const r = await fetch(`${API_BASE}/yahoo/search?q=${encodeURIComponent(q)}`, { headers: await authHeaders() });
    const { quotes = [], error } = await r.json();
    if (error)          { list.innerHTML = `<div class="yf-no-results">${esc(error)}</div>`; return; }
    if (!quotes.length) { list.innerHTML = `<div class="yf-no-results">Nenhum resultado para "${esc(q)}".</div>`; return; }

    list.innerHTML = quotes.map(q => {
      const name    = q.shortname || q.longname || '';
      const exch    = q.exchDisp  || q.exchange  || '';
      const type    = q.quoteType || '';
      const already = _tickers.some(t => t.symbol === q.symbol);
      return `<button class="yf-result-btn${already ? ' yf-result-added' : ''}"
        data-symbol="${_attr(q.symbol)}" data-name="${_attr(name)}"
        data-exch="${_attr(exch)}"       data-type="${_attr(type)}">
        <span class="yf-r-ticker">${esc(q.symbol)}</span>
        <span class="yf-r-name">${esc(name)}</span>
        <span class="yf-r-meta">${esc(exch)}${type ? ' · ' + esc(type) : ''}</span>
        ${already ? '<span class="yf-r-added">✓</span>' : ''}
      </button>`;
    }).join('');
  } catch {
    list.innerHTML = `<div class="yf-no-results">${window.t?.('mf-erro-conexao') ?? 'Erro de conexão. Tente novamente.'}</div>`;
  }
}

// ── Gerenciar tickers ─────────────────────────────────────────────────────────
export function yfAddTicker(symbol, name, exch, type) {
  if (_tickers.some(t => t.symbol === symbol)) {
    showToast(`${symbol} já está na lista.`, 'info');
    return;
  }
  _tickers.push({ symbol, name, exch, type });

  const s = document.getElementById('yf-search');
  if (s) s.value = '';
  const el = document.getElementById('yf-results');
  if (el) el.innerHTML = '';

  _renderChips();
  _setDisplay('yf-global-opts', 'flex');
  showToast(`${symbol} adicionado!`, 'ok');
}

export function yfRemoveTicker(symbol) {
  _tickers = _tickers.filter(t => t.symbol !== symbol);
  delete _datasets[symbol];
  _renderChips();
  if (!_tickers.length) {
    _setDisplay('yf-global-opts',  'none');
    _setDisplay('yf-results-area', 'none');
  } else {
    if (Object.keys(_datasets).length) _renderResults();
  }
  // destroy chart if symbol was on it
  if (_compareChart && _view === 'compare') _renderCompare();
}

function _renderChips() {
  const wrap = document.getElementById('yf-chips');
  if (!wrap) return;
  if (!_tickers.length) { wrap.style.display = 'none'; wrap.innerHTML = ''; return; }
  wrap.style.display = 'flex';
  wrap.innerHTML = _tickers.map(t => {
    const short = (t.name || '').length > 22 ? t.name.slice(0, 20) + '…' : (t.name || '');
    return `<div class="yf-chip">
      <span class="yf-chip-sym">${t.symbol}</span>
      ${short ? `<span class="yf-chip-nm">${short}</span>` : ''}
      <button class="yf-chip-rm" onclick="yfRemoveTicker('${_attr(t.symbol)}')" title="Remover">×</button>
    </div>`;
  }).join('');
}

// ── Carregar todos ────────────────────────────────────────────────────────────
export async function yfLoadAll() {
  if (!_tickers.length) { showToast(window.t('toast-add-ativo'), 'err'); return; }

  const fromVal  = document.getElementById('yf-date-from')?.value;
  const toVal    = document.getElementById('yf-date-to')?.value;
  const interval = document.getElementById('yf-interval')?.value || '1d';

  if (!fromVal || !toVal) { showToast(window.t('toast-select-dates'), 'err'); return; }
  if (fromVal >= toVal)   { showToast(window.t('toast-date-order'), 'err'); return; }

  const btn = document.getElementById('yf-load-btn');
  if (btn) { btn.disabled = true; btn.textContent = window.t?.('mf-carregando') ?? 'Carregando…'; }
  showToast(`Carregando ${_tickers.length} ativo${_tickers.length > 1 ? 's' : ''}…`, 'info');

  try {
    const headers = await authHeaders();
    const results = await Promise.all(_tickers.map(t =>
      fetch(`${API_BASE}/yahoo/chart?symbol=${encodeURIComponent(t.symbol)}&from=${fromVal}&to=${toVal}&interval=${interval}`, { headers })
        .then(r => r.json())
        .catch(() => ({ error: 'Falha na requisição' }))
    ));

    results.forEach((data, i) => {
      if (!data.error) _datasets[_tickers[i].symbol] = data;
      else showToast(`${_tickers[i].symbol}: ${data.error}`, 'err');
    });

    const n = Object.keys(_datasets).length;
    showToast(`${n} ativo${n !== 1 ? 's' : ''} carregado${n !== 1 ? 's' : ''}!`, 'ok');
    _renderResults();
    window.crossRefresh?.();
  } catch {
    showToast(window.t('toast-load-data-err'), 'err');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = window.t?.('mf-carregar') ?? 'Carregar dados'; }
  }
}

// ── Renderização ──────────────────────────────────────────────────────────────
function _renderResults() {
  _setDisplay('yf-results-area', 'block');
  if (_view === 'compare') _renderCompare();
  else                     _renderNormal();
  _renderPairSection();
}

export function yfSwitchView(view) {
  _view = view;
  document.querySelectorAll('.yf-view-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.view === view)
  );
  _setDisplay('yf-view-normal',  view === 'normal'  ? 'grid' : 'none');
  _setDisplay('yf-view-compare', view === 'compare' ? 'block' : 'none');
  if (Object.keys(_datasets).length) _renderResults();
}

// ── Normal: cards por ativo ───────────────────────────────────────────────────
function _renderNormal() {
  const colY  = document.getElementById('yf-col-y')?.value || 'close';
  const grid  = document.getElementById('yf-view-normal');
  if (!grid) return;

  const loaded = _tickers.filter(t => _datasets[t.symbol]);
  if (!loaded.length) {
    grid.innerHTML = `<p style="color:var(--txt3);font-size:13px;grid-column:1/-1">${window.t?.('mf-no-data-yf') ?? 'Nenhum dado carregado ainda. Clique em "Carregar dados".'}</p>`;
    return;
  }

  grid.innerHTML = loaded.map((t, idx) => {
    const d      = _datasets[t.symbol];
    const rows   = d.rows;
    const vals   = rows.map(r => r[colY]).filter(v => v != null);
    const last   = vals[vals.length - 1] ?? 0;
    const first  = vals[0] ?? last;
    const chg    = first ? (last - first) / first * 100 : 0;
    const pos    = chg >= 0;
    const chgCol = pos ? 'var(--y)' : 'var(--acc)';
    const cur    = d.currency ? ` ${d.currency}` : '';
    const name   = d.name || t.name || t.symbol;
    const color  = PALETTE[idx % PALETTE.length];

    // Sparkline SVG (últimos 60 pontos)
    const spark  = vals.slice(-60);
    const sMin   = Math.min(...spark), sMax = Math.max(...spark);
    const W = 200, H = 48;
    const pts = spark.map((v, i) => {
      const x = (i / Math.max(spark.length - 1, 1)) * W;
      const y = H - ((v - sMin) / (sMax - sMin || 1)) * H;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return `<div class="yf-card">
      <div class="yf-card-head">
        <div>
          <div class="yf-card-sym" style="color:${color}">${t.symbol}</div>
          <div class="yf-card-nm">${name.length > 32 ? name.slice(0,30)+'…' : name}</div>
        </div>
        <div style="text-align:right">
          <div class="yf-card-price">${last.toFixed(2)}${cur}</div>
          <div style="font-size:12px;color:${chgCol};font-weight:600">${pos?'+':''}${chg.toFixed(2)}%</div>
        </div>
      </div>
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="width:100%;height:${H}px;display:block;margin:8px 0">
        <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <div class="yf-card-meta">
        <span>${rows.length} obs.</span>
        <span>${rows[0]?.date || ''} → ${rows[rows.length-1]?.date || ''}</span>
      </div>
      <div class="yf-card-import" style="flex-wrap:wrap;gap:4px">
        <select class="yf-select" id="yf-mdl-${_attr(t.symbol)}"
          onchange="yfOnModelChange('${_attr(t.symbol)}')"
          style="flex:1;min-width:0;font-size:12px">
          <option value="serie" selected>${window.t?.('mf-series-temporais') ?? 'Séries Temporais'}</option>
          <option value="nova">${window.t?.('mf-reg-linear') ?? 'Reg. Linear'}</option>
          <option value="polinomial">${window.t?.('mf-reg-polinomial') ?? 'Reg. Polinomial'}</option>
          <option value="quantilica">${window.t?.('mf-reg-quantilica') ?? 'Reg. Quantílica'}</option>
          <option value="regularizada">${window.t?.('mf-reg-regularizada') ?? 'Reg. Regularizada'}</option>
        </select>
        <select class="yf-select" id="yf-sub-${_attr(t.symbol)}"
          style="flex:1;min-width:0;font-size:12px">
          <option value="classic">${window.t?.('mf-decomp-classica') ?? 'Decomposição Clássica'}</option>
          <option value="arima">ARIMA</option>
          <option value="garch">GARCH</option>
          <option value="var">VAR</option>
        </select>
        <button class="yf-fetch-btn" style="padding:6px 12px;font-size:12px;white-space:nowrap"
          onclick="yfImportOne('${_attr(t.symbol)}')">${window.t?.('mf-importar') ?? 'Importar'}</button>
      </div>
    </div>`;
  }).join('');
}

// ── Comparador ────────────────────────────────────────────────────────────────
export function yfToggleNormalize() {
  _normalized = !_normalized;
  const btn = document.getElementById('yf-norm-btn');
  if (btn) {
    btn.textContent = _normalized ? (window.t?.('mf-variacao') ?? '% Variação') : (window.t?.('mf-preco-real') ?? '📊 Preço real');
    btn.classList.toggle('active', _normalized);
  }
  if (Object.keys(_datasets).length) _renderCompare();
}

function _renderCompare() {
  const colY   = document.getElementById('yf-col-y')?.value || 'close';
  const loaded = _tickers.filter(t => _datasets[t.symbol]);
  const ph     = document.getElementById('yf-compare-ph');

  if (!loaded.length) {
    if (ph) ph.style.display = 'block';
    return;
  }
  if (ph) ph.style.display = 'none';

  if (_compareChart) { _compareChart.destroy(); _compareChart = null; }

  const datasets = loaded.map((t, i) => {
    const rows = (_datasets[t.symbol]?.rows || []).filter(r => r[colY] != null);
    const base = rows[0]?.[colY] || 1;
    return {
      label: t.symbol,
      data: rows.map((r, j) => ({
        x: j,
        y: _normalized ? +((r[colY] - base) / base * 100).toFixed(4) : r[colY],
      })),
      borderColor: PALETTE[i % PALETTE.length],
      backgroundColor: PALETTE[i % PALETTE.length] + '18',
      borderWidth: 2, pointRadius: 0, pointHoverRadius: 5,
      tension: 0.15, fill: false,
    };
  });

  // Rótulos do eixo X vindos do dataset mais longo
  const longest = loaded.reduce((a, b) =>
    (_datasets[a.symbol]?.rows.length || 0) >= (_datasets[b.symbol]?.rows.length || 0) ? a : b
  );
  const allLabels = (_datasets[longest.symbol]?.rows || []).map(r => r.date);

  const isLight = document.documentElement.classList.contains('light');
  const tickCol = isLight ? '#565478' : '#8987A8';
  const gridCol = isLight ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.05)';

  const canvas = document.getElementById('yf-compare-chart');
  if (!canvas) return;

  _compareChart = new Chart(canvas, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: tickCol, font: { size: 11 }, boxWidth: 12 } },
        tooltip: {
          callbacks: {
            title: items => allLabels[items[0].parsed.x] ?? String(items[0].parsed.x),
            label:  ctx  => ` ${ctx.dataset.label}: ${
              _normalized ? ctx.parsed.y.toFixed(2) + '%' : ctx.parsed.y.toFixed(2)
            }`,
          },
        },
      },
      scales: {
        x: {
          type: 'linear',
          ticks: {
            color: tickCol, font: { size: 10 }, maxTicksLimit: 10,
            callback: v => allLabels[Math.round(v)] || v,
          },
          grid: { color: gridCol },
        },
        y: {
          ticks: { color: tickCol, font: { size: 10 } },
          grid:  { color: gridCol },
          title: {
            display: true,
            text: _normalized ? 'Variação (%)' : (document.getElementById('yf-col-y')?.value || 'Preço'),
            color: tickCol, font: { size: 10 },
          },
        },
      },
    },
  });
}

// ── Mostrar/ocultar sub-modelo de séries temporais ────────────────────────────
export function yfOnModelChange(symbol) {
  const mdl = document.getElementById(`yf-mdl-${symbol}`)?.value;
  const sub = document.getElementById(`yf-sub-${symbol}`);
  if (sub) sub.style.display = mdl === 'serie' ? '' : 'none';
}

// ── Importar um ativo ─────────────────────────────────────────────────────────
const _YNAMES_PT = {
  open:'Abertura', high:'Máxima', low:'Mínima',
  close:'Fechamento', adjclose:'Adj. Close', volume:'Volume',
};
const _YNAMES_EN = {
  open:'Open', high:'High', low:'Low',
  close:'Close', adjclose:'Adj. Close', volume:'Volume',
};
function _ynames() {
  return (window.t?.('mf-fechamento') === 'Close') ? _YNAMES_EN : _YNAMES_PT;
}

const _MODEL_CFG = {
  nova:         { rowsId:'data-rows',    lx:'label-x',    ly:'label-y',    tab:'nova' },
  polinomial:   { rowsId:'po-data-rows', lx:'po-label-x', ly:'po-label-y', tab:'polinomial' },
  quantilica:   { rowsId:'qr-data-rows', lx:'qr-label-x', ly:'qr-label-y', tab:'quantilica' },
  regularizada: { rowsId:'rr-data-rows', lx:'rr-label-x', ly:'rr-label-y', tab:'regularizada' },
  classic:      { rowsId:'st-data-rows', lx:'st-label-x', ly:'st-label-y', tab:'serie', isSerie:true },
  arima:        { rowsId:'st-data-rows', lx:'st-label-x', ly:'st-label-y', tab:'serie', isSerie:true },
  garch:        { rowsId:'st-data-rows', lx:'st-label-x', ly:'st-label-y', tab:'serie', isSerie:true },
  var:          { rowsId:'var-data-rows', tab:'serie', isVar:true },
};

const _MODEL_FNS = {
  nova:         { addRow:'addRow',    upd:'updateCount' },
  polinomial:   { addRow:'poAddRow',  upd:'poUpdateCount' },
  quantilica:   { addRow:'qrAddRow',  upd:'qrUpdateCount' },
  regularizada: { addRow:'rrAddRow',  upd:'rrUpdateCount' },
  classic:      { addRow:'stAddRow',  upd:'stUpdateCount' },
  arima:        { addRow:'stAddRow',  upd:'stUpdateCount' },
  garch:        { addRow:'stAddRow',  upd:'stUpdateCount' },
  var:          { addRow:'varAddRow', upd:'varUpdateVarCountDisplay' },
};

export function yfImportOne(symbol, switchTabFn) {
  const d = _datasets[symbol];
  if (!d?.rows?.length) { showToast(`Dados não carregados para ${symbol}.`, 'err'); return; }

  const colY  = document.getElementById('yf-col-y')?.value || 'close';
  const mdl   = document.getElementById(`yf-mdl-${symbol}`)?.value || 'serie';
  const subMdl = mdl === 'serie'
    ? (document.getElementById(`yf-sub-${symbol}`)?.value || 'classic')
    : null;
  const effKey = subMdl ?? mdl;

  const cfg = _MODEL_CFG[effKey];
  const fns = _MODEL_FNS[effKey];
  if (!cfg) { showToast(window.t('toast-model-unavail'), 'err'); return; }

  const valid = d.rows.filter(r => r[colY] != null && !isNaN(r[colY]));
  if (valid.length < 3) { showToast(window.t('toast-data-insuf-obs'), 'err'); return; }

  const yLabel = `${symbol} — ${_ynames()[colY] || colY}`;

  if (cfg.isVar) {
    // Verificar se há múltiplos ativos com VAR selecionado
    const varCandidates = _tickers.filter(t => {
      if (!_datasets[t.symbol]) return false;
      const m = document.getElementById(`yf-mdl-${t.symbol}`)?.value;
      const s = document.getElementById(`yf-sub-${t.symbol}`)?.value;
      return m === 'serie' && s === 'var';
    });

    if (varCandidates.length > 1) {
      _importMultipleToVar(varCandidates, colY, switchTabFn);
      return;
    }

    // ── VAR: switch de aba PRIMEIRO para clientWidth correto nas colunas ──
    if (typeof switchTabFn === 'function')
      switchTabFn(cfg.tab, document.querySelector(`[onclick*="${cfg.tab}"]`));
    window.stSetModel?.('var');   // card visível → varRebuildTable usa largura real
    window.varInitRows?.();
    const rowsEl = document.getElementById('var-data-rows');
    if (!rowsEl) { showToast(window.t('toast-var-unavail'), 'err'); return; }
    rowsEl.innerHTML = '';
    valid.forEach(() => window.varAddRow?.());
    Array.from(rowsEl.children).forEach((row, i) => {
      const inp = row.querySelectorAll('input');
      inp[0].value = valid[i].date;
      inp[1].value = valid[i][colY];
    });
    window.varUpdateName?.(0, yLabel);
    window.varUpdateVarCountDisplay?.();
    showToast(`${valid.length} obs. de ${symbol} → VAR (var. 1). Preencha as demais variáveis.`, 'ok');
    return;

  } else if (cfg.isSerie) {
    // ── Décomposição clássica / ARIMA / GARCH ─────────────────────────────
    window.stSetModel?.(effKey);
    const container = document.getElementById(cfg.rowsId);
    if (!container) { showToast(window.t('toast-model-unavail'), 'err'); return; }
    container.innerHTML = '';
    valid.forEach(() => window[fns.addRow]?.());
    Array.from(container.children).forEach((row, i) => {
      const inp = row.querySelectorAll('input');
      inp[0].value = valid[i].date;
      inp[1].value = valid[i][colY];
    });
    _lbl(cfg.lx, 'Data');
    _lbl(cfg.ly, yLabel);
    window[fns.upd]?.();

  } else {
    // ── Regressões (linear, polinomial, quantílica, regularizada) ─────────
    const container = document.getElementById(cfg.rowsId);
    if (!container) { showToast(window.t('toast-model-unavail'), 'err'); return; }
    container.innerHTML = '';
    if (effKey === 'nova') {
      window.setRows(valid.map((_, i) => i + 1), valid.map(r => r[colY]));
    } else {
      valid.forEach((r, i) => {
        window[fns.addRow]?.();
        const last = container.children[container.children.length - 1];
        const inp  = last.querySelectorAll('input');
        inp[0].value = i + 1;
        inp[1].value = r[colY];
      });
    }
    _lbl(cfg.lx, 'Período');
    _lbl(cfg.ly, yLabel);
    window[fns.upd]?.();
  }

  if (typeof switchTabFn === 'function')
    switchTabFn(cfg.tab, document.querySelector(`[onclick*="${cfg.tab}"]`));

  showToast(`${valid.length} obs. de ${symbol} importadas!`, 'ok');
}

// ── Importar múltiplos ativos para VAR (um por variável) ─────────────────────
function _importMultipleToVar(assets, colY, switchTabFn) {
  const k = Math.min(assets.length, 8);
  const selected = assets.slice(0, k);

  // Mapa data→valor e lista de timestamps por ativo
  const maps = selected.map(t => {
    const byDate = new Map();
    const ts = [];
    (_datasets[t.symbol]?.rows || [])
      .filter(r => r[colY] != null && !isNaN(r[colY]))
      .forEach(r => { byDate.set(r.date, r[colY]); ts.push(new Date(r.date).getTime()); });
    ts.sort((a, b) => a - b);
    return { symbol: t.symbol, byDate, ts };
  });

  // Usa as datas do primeiro ativo como referência e alinha os demais
  // com tolerância de ±2 dias úteis para cobrir feriados entre mercados.
  const TOLERANCE_MS = 2 * 86400 * 1000;

  function closestVal(m, refTs) {
    const dateStr = new Date(refTs).toISOString().slice(0, 10);
    if (m.byDate.has(dateStr)) return m.byDate.get(dateStr);
    let best = null, bestDiff = Infinity;
    for (const t of m.ts) {
      const diff = Math.abs(t - refTs);
      if (diff < bestDiff) { bestDiff = diff; best = t; }
    }
    if (bestDiff > TOLERANCE_MS) return null;
    return m.byDate.get(new Date(best).toISOString().slice(0, 10)) ?? null;
  }

  const refTs = maps[0].ts;
  if (refTs.length < 3) {
    showToast(`Dados insuficientes para ${selected[0].symbol} (mín. 3 obs.).`, 'err');
    return;
  }

  // Ativa aba e modelo ANTES de rebuildar (garante clientWidth correto)
  if (typeof switchTabFn === 'function')
    switchTabFn('serie', document.querySelector('[onclick*="serie"]'));
  window.stSetModel?.('var');

  // Define número de variáveis e reconstrói tabela
  window.varSetK?.(k);

  const rowsEl = document.getElementById('var-data-rows');
  if (!rowsEl) { showToast(window.t('toast-var-unavail'), 'err'); return; }

  rowsEl.innerHTML = '';
  refTs.forEach(() => window.varAddRow?.());

  Array.from(rowsEl.children).forEach((row, i) => {
    const inp  = row.querySelectorAll('input');
    const date = new Date(refTs[i]).toISOString().slice(0, 10);
    inp[0].value = date;
    maps.forEach((m, j) => {
      const val = closestVal(m, refTs[i]);
      if (inp[j + 1]) inp[j + 1].value = val ?? '';
    });
  });

  // Nomeia variáveis com os símbolos
  maps.forEach((m, j) => {
    window.varUpdateName?.(j, `${m.symbol} — ${_ynames()[colY] || colY}`);
  });

  window.varUpdateVarCountDisplay?.();

  const extra = assets.length > 8
    ? ` (máx. 8; ${assets.length - 8} ignorado${assets.length - 8 > 1 ? 's' : ''})`
    : '';
  showToast(`${refTs.length} obs. — ${k} ativos importados para o VAR${extra}`, 'ok');
}

// ── Seção de importar par de ativos ──────────────────────────────────────────
function _renderPairSection() {
  const loaded = _tickers.filter(t => _datasets[t.symbol]);
  const section = document.getElementById('yf-pair-section');
  if (!section) return;

  if (loaded.length < 2) { section.style.display = 'none'; return; }
  section.style.display = 'block';

  const opts = loaded.map(t =>
    `<option value="${_attr(t.symbol)}">${t.symbol}${t.name ? ' — ' + (t.name.length > 28 ? t.name.slice(0,26)+'…' : t.name) : ''}</option>`
  ).join('');

  const xSel = document.getElementById('yf-pair-x-sym');
  const ySel = document.getElementById('yf-pair-y-sym');
  if (!xSel || !ySel) return;

  const prevX = xSel.value, prevY = ySel.value;
  xSel.innerHTML = opts;
  ySel.innerHTML = opts;

  // Tenta manter seleção anterior; senão pré-seleciona X=primeiro, Y=segundo
  if (loaded.some(t => t.symbol === prevX)) xSel.value = prevX;
  if (loaded.some(t => t.symbol === prevY)) ySel.value = prevY;
  else if (loaded.length >= 2) ySel.value = loaded[1].symbol;
}

export function yfImportPair(switchTabFn) {
  const xSym  = document.getElementById('yf-pair-x-sym')?.value;
  const ySym  = document.getElementById('yf-pair-y-sym')?.value;
  const xCol  = document.getElementById('yf-pair-x-col')?.value || 'close';
  const yCol  = document.getElementById('yf-pair-y-col')?.value || 'close';
  const model = document.getElementById('yf-pair-model')?.value || 'nova';

  if (!xSym || !ySym) { showToast(window.t('toast-select-2assets'), 'err'); return; }
  if (xSym === ySym && xCol === yCol) { showToast(window.t('toast-xy-same-assets'), 'err'); return; }

  const dX = _datasets[xSym], dY = _datasets[ySym];
  if (!dX?.rows?.length) { showToast(`Dados não carregados para ${xSym}.`, 'err'); return; }
  if (!dY?.rows?.length) { showToast(`Dados não carregados para ${ySym}.`, 'err'); return; }

  // Alinha por data com tolerância de ±2 dias úteis
  const TOLERANCE_MS = 2 * 86400 * 1000;
  const mapY = new Map();
  const tsY  = [];
  dY.rows.filter(r => r[yCol] != null && !isNaN(r[yCol])).forEach(r => {
    mapY.set(r.date, r[yCol]);
    tsY.push(new Date(r.date).getTime());
  });

  function closestY(refTs) {
    const dateStr = new Date(refTs).toISOString().slice(0, 10);
    if (mapY.has(dateStr)) return mapY.get(dateStr);
    let best = null, bestDiff = Infinity;
    for (const t of tsY) {
      const diff = Math.abs(t - refTs);
      if (diff < bestDiff) { bestDiff = diff; best = t; }
    }
    if (bestDiff > TOLERANCE_MS) return null;
    return mapY.get(new Date(best).toISOString().slice(0, 10)) ?? null;
  }

  const pairs = dX.rows
    .filter(r => r[xCol] != null && !isNaN(r[xCol]))
    .map(r => {
      const yVal = closestY(new Date(r.date).getTime());
      return yVal != null ? { x: r[xCol], y: yVal } : null;
    })
    .filter(Boolean);

  if (pairs.length < 3) {
    showToast(window.t('toast-dates-no-align'), 'err');
    return;
  }

  const cfg = _MODEL_CFG[model];
  const fns = _MODEL_FNS[model];
  if (!cfg) { showToast(window.t('toast-model-unavail'), 'err'); return; }

  const xLabel = `${xSym} — ${_YNAMES[xCol] || xCol}`;
  const yLabel = `${ySym} — ${_YNAMES[yCol] || yCol}`;

  const container = document.getElementById(cfg.rowsId);
  if (!container) { showToast(window.t('toast-model-unavail'), 'err'); return; }

  container.innerHTML = '';
  if (model === 'nova') {
    window.setRows(pairs.map(p => p.x), pairs.map(p => p.y));
  } else {
    pairs.forEach(p => {
      window[fns.addRow]?.();
      const last = container.children[container.children.length - 1];
      const inp  = last.querySelectorAll('input');
      inp[0].value = p.x;
      inp[1].value = p.y;
    });
  }

  _lbl(cfg.lx, xLabel);
  _lbl(cfg.ly, yLabel);
  window[fns.upd]?.();

  if (typeof switchTabFn === 'function')
    switchTabFn(cfg.tab, document.querySelector(`[onclick*="${cfg.tab}"]`));

  showToast(`${pairs.length} obs. importadas: ${xSym} (X) × ${ySym} (Y)`, 'ok');
}

// ── Re-renderiza cards ao trocar idioma ───────────────────────────────────────
export function yfRerender() {
  if (Object.keys(_datasets).length) _renderResults();
}

// ── Expõe datasets carregados para o combinador cross-source ──────────────────
export function yfGetLoadedSeries() {
  return Object.entries(_datasets).map(([symbol, d]) => {
    const name = d.name || symbol;
    const label = name.length > 40
      ? `${symbol} — ${name.slice(0, 38)}…`
      : `${symbol} — ${name}`;
    return { id: symbol, label, source: 'yf', rows: d.rows };
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function _lbl(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function _setDisplay(id, val) {
  const el = document.getElementById(id);
  if (el) el.style.display = val;
}
