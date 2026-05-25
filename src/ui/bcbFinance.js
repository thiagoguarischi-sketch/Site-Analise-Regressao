import { showToast } from './notifications.js';
import { API_BASE }  from '../config/constants.js';
import { authHeaders } from '../services/supabaseService.js';
import { esc } from '../core/utils.js';

// ── Estado ────────────────────────────────────────────────────────────────────
let _series       = [];   // [{codigo, nome, periodicidade, unidade}]
let _datasets     = {};   // {codigo: {rows, nome, codigo, unidade}}
let _view         = 'normal';
let _normalized   = false;
let _compareChart = null;
let _searchTimer  = null;

const PALETTE = ['#00D4A0','#7C83FD','#FFC254','#FF6B8A','#4FC3F7','#CE93D8','#80CBC4','#FFAB40'];

const SPARK_MAX = 60;
function _downsample(arr) {
  if (arr.length <= SPARK_MAX) return arr;
  const step = (arr.length - 1) / (SPARK_MAX - 1);
  return Array.from({ length: SPARK_MAX }, (_, i) => arr[Math.round(i * step)]);
}

// ── Inicializa date pickers ───────────────────────────────────────────────────
function _initDatePickers() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const maxDate = yesterday.toISOString().slice(0, 10);

  const oneYearAgo = new Date(yesterday);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const defaultFrom = oneYearAgo.toISOString().slice(0, 10);

  const fromEl = document.getElementById('bcb-date-from');
  const toEl   = document.getElementById('bcb-date-to');
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
  const btn = e.target.closest('#bcb-results .yf-result-btn');
  if (btn) {
    bcbAddSerie(btn.dataset.codigo, btn.dataset.nome, btn.dataset.periodicidade, btn.dataset.unidade);
    return;
  }
  if (!e.target.closest('#bcb-search-wrap') && !e.target.closest('#bcb-results')) {
    const el = document.getElementById('bcb-results');
    if (el) el.innerHTML = '';
  }
});

function _attr(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

// ── Busca ─────────────────────────────────────────────────────────────────────
export function bcbSearchInput() {
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(_doSearch, 400);
}

async function _doSearch() {
  const q    = (document.getElementById('bcb-search')?.value ?? '').trim();
  const list = document.getElementById('bcb-results');
  if (!list) return;
  if (!q) { list.innerHTML = ''; return; }

  list.innerHTML = `<div class="yf-loading">${window.t?.('mf-buscando-bcb') ?? 'Buscando no Banco Central…'}</div>`;
  try {
    const r = await fetch(`${API_BASE}/bcb/search?q=${encodeURIComponent(q)}`, { headers: await authHeaders() });
    const { series = [], error } = await r.json();
    if (error)           { list.innerHTML = `<div class="yf-no-results">${esc(error)}</div>`; return; }
    if (!series.length)  { list.innerHTML = `<div class="yf-no-results">Nenhuma série encontrada para "${esc(q)}".</div>`; return; }

    list.innerHTML = series.map(s => {
      const already = _series.some(x => x.codigo === s.codigo);
      return `<button class="yf-result-btn${already ? ' yf-result-added' : ''}"
        data-codigo="${_attr(s.codigo)}" data-nome="${_attr(s.nome)}"
        data-periodicidade="${_attr(s.periodicidade)}" data-unidade="${_attr(s.unidade)}">
        <span class="yf-r-ticker">${esc(s.codigo)}</span>
        <span class="yf-r-name">${esc(s.nome)}</span>
        ${s.periodicidade ? `<span class="yf-r-meta">${esc(s.periodicidade)}${s.unidade ? ' · ' + esc(s.unidade) : ''}</span>` : ''}
        ${already ? '<span class="yf-r-added">✓</span>' : ''}
      </button>`;
    }).join('');
  } catch {
    list.innerHTML = `<div class="yf-no-results">${window.t?.('mf-erro-conexao') ?? 'Erro de conexão. Tente novamente.'}</div>`;
  }
}

// ── Gerenciar séries ──────────────────────────────────────────────────────────
export function bcbAddSerie(codigo, nome, periodicidade, unidade) {
  if (_series.some(s => s.codigo === codigo)) {
    showToast(`Série ${codigo} já está na lista.`, 'info');
    return;
  }
  _series.push({ codigo, nome, periodicidade, unidade });

  const inp = document.getElementById('bcb-search');
  if (inp) inp.value = '';
  const el = document.getElementById('bcb-results');
  if (el) el.innerHTML = '';

  _renderChips();
  _setDisplay('bcb-global-opts', 'flex');
  showToast(`Série ${codigo} adicionada!`, 'ok');
}

export function bcbRemoveSerie(codigo) {
  _series = _series.filter(s => s.codigo !== codigo);
  delete _datasets[codigo];
  _renderChips();
  if (!_series.length) {
    _setDisplay('bcb-global-opts',  'none');
    _setDisplay('bcb-results-area', 'none');
  } else {
    if (Object.keys(_datasets).length) _renderResults();
  }
  if (_compareChart && _view === 'compare') _renderCompare();
}

function _renderChips() {
  const wrap = document.getElementById('bcb-chips');
  if (!wrap) return;
  if (!_series.length) { wrap.style.display = 'none'; wrap.innerHTML = ''; return; }
  wrap.style.display = 'flex';
  wrap.innerHTML = _series.map(s => {
    const short = (s.nome || '').length > 22 ? s.nome.slice(0, 20) + '…' : (s.nome || '');
    return `<div class="yf-chip">
      <span class="yf-chip-sym">${s.codigo}</span>
      ${short ? `<span class="yf-chip-nm">${short}</span>` : ''}
      <button class="yf-chip-rm" onclick="bcbRemoveSerie('${_attr(s.codigo)}')" title="Remover">×</button>
    </div>`;
  }).join('');
}

// ── Carregar todos ────────────────────────────────────────────────────────────
export async function bcbLoadAll() {
  if (!_series.length) { showToast(window.t('toast-add-serie'), 'err'); return; }

  const fromVal = document.getElementById('bcb-date-from')?.value;
  const toVal   = document.getElementById('bcb-date-to')?.value;

  if (!fromVal || !toVal) { showToast(window.t('toast-select-dates'), 'err'); return; }
  if (fromVal >= toVal)   { showToast(window.t('toast-date-order'), 'err'); return; }

  const btn = document.getElementById('bcb-load-btn');
  if (btn) { btn.disabled = true; btn.textContent = window.t?.('mf-carregando') ?? 'Carregando…'; }
  showToast(`Carregando ${_series.length} série${_series.length > 1 ? 's' : ''}…`, 'info');

  try {
    const headers = await authHeaders();
    const results = await Promise.all(_series.map(s =>
      fetch(`${API_BASE}/bcb/serie?codigo=${encodeURIComponent(s.codigo)}&from=${fromVal}&to=${toVal}`, { headers })
        .then(r => r.json())
        .catch(() => ({ error: 'Falha na requisição' }))
    ));

    results.forEach((data, i) => {
      const cod = _series[i].codigo;
      if (data.error) {
        showToast(`${cod}: ${data.error}`, 'err');
      } else if (!data.rows?.length) {
        showToast(`${cod}: sem dados para o período selecionado.`, 'info');
      } else {
        _datasets[cod] = { ...data, nome: _series[i].nome, unidade: _series[i].unidade };
      }
    });

    const n = Object.keys(_datasets).length;
    if (!n) return;
    showToast(`${n} série${n !== 1 ? 's' : ''} carregada${n !== 1 ? 's' : ''}!`, 'ok');
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
  _setDisplay('bcb-results-area', 'block');
  if (_view === 'compare') _renderCompare();
  else                     _renderNormal();
  _renderPairSection();
}

export function bcbSwitchView(view) {
  _view = view;
  document.querySelectorAll('.bcb-view-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.view === view)
  );
  _setDisplay('bcb-view-normal',  view === 'normal'  ? 'grid' : 'none');
  _setDisplay('bcb-view-compare', view === 'compare' ? 'block' : 'none');
  if (Object.keys(_datasets).length) _renderResults();
}

// ── Normal: cards por série ───────────────────────────────────────────────────
function _renderNormal() {
  const grid = document.getElementById('bcb-view-normal');
  if (!grid) return;

  const loaded = _series.filter(s => _datasets[s.codigo]);
  if (!loaded.length) {
    grid.innerHTML = `<p style="color:var(--txt3);font-size:13px;grid-column:1/-1">${window.t?.('mf-no-data-yf') ?? 'Nenhum dado carregado ainda. Clique em "Carregar dados".'}</p>`;
    return;
  }

  grid.innerHTML = loaded.map((s, idx) => {
    const d     = _datasets[s.codigo];
    const rows  = d.rows;
    const vals  = rows.map(r => r.valor).filter(v => v != null);
    const last  = vals[vals.length - 1] ?? 0;
    const first = vals[0] ?? last;
    const chg   = first !== 0 ? (last - first) / Math.abs(first) * 100 : 0;
    const pos   = chg >= 0;
    const color = PALETTE[idx % PALETTE.length];
    const unit  = d.unidade || s.unidade || '';
    const nome  = s.nome || `Série ${s.codigo}`;

    const spark = _downsample(vals);
    const sMin  = Math.min(...spark), sMax = Math.max(...spark);
    const W = 200, H = 48;
    const pts = spark.map((v, i) => {
      const x = (i / Math.max(spark.length - 1, 1)) * W;
      const y = H - ((v - sMin) / (sMax - sMin || 1)) * H;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return `<div class="yf-card">
      <div class="yf-card-head">
        <div>
          <div class="yf-card-sym" style="color:${color}">${s.codigo}</div>
          <div class="yf-card-nm">${nome.length > 32 ? nome.slice(0,30)+'…' : nome}</div>
        </div>
        <div style="text-align:right">
          <div class="yf-card-price">${last.toLocaleString('pt-BR', {maximumFractionDigits:4})}${unit ? ' ' + unit : ''}</div>
          <div style="font-size:12px;color:${pos ? 'var(--y)' : 'var(--acc)'};font-weight:600">${pos?'+':''}${chg.toFixed(2)}%</div>
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
        <select class="yf-select" id="bcb-mdl-${_attr(s.codigo)}"
          onchange="bcbOnModelChange('${_attr(s.codigo)}')"
          style="flex:1;min-width:0;font-size:12px">
          <option value="serie" selected>${window.t?.('mf-series-temporais') ?? 'Séries Temporais'}</option>
          <option value="nova">${window.t?.('mf-reg-linear') ?? 'Reg. Linear'}</option>
          <option value="polinomial">${window.t?.('mf-reg-polinomial') ?? 'Reg. Polinomial'}</option>
          <option value="quantilica">${window.t?.('mf-reg-quantilica') ?? 'Reg. Quantílica'}</option>
          <option value="regularizada">${window.t?.('mf-reg-regularizada') ?? 'Reg. Regularizada'}</option>
        </select>
        <select class="yf-select" id="bcb-sub-${_attr(s.codigo)}"
          style="flex:1;min-width:0;font-size:12px">
          <option value="classic">${window.t?.('mf-decomp-classica') ?? 'Decomposição Clássica'}</option>
          <option value="arima">ARIMA</option>
          <option value="garch">GARCH</option>
          <option value="var">VAR</option>
        </select>
        <button class="yf-fetch-btn" style="padding:6px 12px;font-size:12px;white-space:nowrap"
          onclick="bcbImportOne('${_attr(s.codigo)}')">${window.t?.('mf-importar') ?? 'Importar'}</button>
      </div>
    </div>`;
  }).join('');
}

// ── Comparador ────────────────────────────────────────────────────────────────
export function bcbToggleNormalize() {
  _normalized = !_normalized;
  const btn = document.getElementById('bcb-norm-btn');
  if (btn) {
    btn.textContent = _normalized ? (window.t?.('mf-variacao') ?? '% Variação') : (window.t?.('mf-valor-real') ?? '📊 Valor real');
    btn.classList.toggle('active', _normalized);
  }
  if (Object.keys(_datasets).length) _renderCompare();
}

function _renderCompare() {
  const loaded = _series.filter(s => _datasets[s.codigo]);
  const ph = document.getElementById('bcb-compare-ph');
  if (!loaded.length) { if (ph) ph.style.display = 'block'; return; }
  if (ph) ph.style.display = 'none';

  if (_compareChart) { _compareChart.destroy(); _compareChart = null; }

  const datasets = loaded.map((s, i) => {
    const rows = (_datasets[s.codigo]?.rows || []).filter(r => r.valor != null);
    const base = rows[0]?.valor || 1;
    return {
      label: s.codigo,
      data: rows.map((r, j) => ({
        x: j,
        y: _normalized ? +((r.valor - base) / Math.abs(base) * 100).toFixed(4) : r.valor,
      })),
      borderColor: PALETTE[i % PALETTE.length],
      backgroundColor: PALETTE[i % PALETTE.length] + '18',
      borderWidth: 2, pointRadius: 0, pointHoverRadius: 5,
      tension: 0.15, fill: false,
    };
  });

  const longest = loaded.reduce((a, b) =>
    (_datasets[a.codigo]?.rows.length || 0) >= (_datasets[b.codigo]?.rows.length || 0) ? a : b
  );
  const allLabels = (_datasets[longest.codigo]?.rows || []).map(r => r.date);

  const isLight = document.documentElement.classList.contains('light');
  const tickCol = isLight ? '#565478' : '#8987A8';
  const gridCol = isLight ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.05)';

  const canvas = document.getElementById('bcb-compare-chart');
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
              _normalized
                ? ctx.parsed.y.toFixed(2) + '%'
                : ctx.parsed.y.toLocaleString('pt-BR', { maximumFractionDigits: 4 })
            }`,
          },
        },
      },
      scales: {
        x: {
          type: 'linear',
          ticks: { color: tickCol, font: { size: 10 }, maxTicksLimit: 10,
            callback: v => allLabels[Math.round(v)] || v },
          grid: { color: gridCol },
        },
        y: {
          ticks: { color: tickCol, font: { size: 10 } },
          grid:  { color: gridCol },
          title: { display: true,
            text: _normalized ? 'Variação (%)' : 'Valor',
            color: tickCol, font: { size: 10 } },
        },
      },
    },
  });
}

// ── Mostrar/ocultar sub-modelo de séries temporais ────────────────────────────
export function bcbOnModelChange(codigo) {
  const mdl = document.getElementById(`bcb-mdl-${codigo}`)?.value;
  const sub = document.getElementById(`bcb-sub-${codigo}`);
  if (sub) sub.style.display = mdl === 'serie' ? '' : 'none';
}

// ── Importar uma série ────────────────────────────────────────────────────────
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

export function bcbImportOne(codigo, switchTabFn) {
  const d = _datasets[codigo];
  if (!d?.rows?.length) { showToast(`Dados não carregados para a série ${codigo}.`, 'err'); return; }

  const mdl    = document.getElementById(`bcb-mdl-${codigo}`)?.value || 'serie';
  const subMdl = mdl === 'serie'
    ? (document.getElementById(`bcb-sub-${codigo}`)?.value || 'classic')
    : null;
  const effKey = subMdl ?? mdl;

  const cfg = _MODEL_CFG[effKey];
  const fns = _MODEL_FNS[effKey];
  if (!cfg) { showToast(window.t('toast-model-unavail'), 'err'); return; }

  const valid = d.rows.filter(r => r.valor != null && !isNaN(r.valor));
  if (valid.length < 3) { showToast(window.t('toast-data-insuf-obs'), 'err'); return; }

  const serie  = _series.find(s => s.codigo === codigo);
  const yLabel = serie?.nome || `BCB ${codigo}`;

  if (cfg.isVar) {
    const varCandidates = _series.filter(s => {
      if (!_datasets[s.codigo]) return false;
      const m  = document.getElementById(`bcb-mdl-${s.codigo}`)?.value;
      const sb = document.getElementById(`bcb-sub-${s.codigo}`)?.value;
      return m === 'serie' && sb === 'var';
    });

    if (varCandidates.length > 1) {
      _importMultipleToVar(varCandidates, switchTabFn);
      return;
    }

    if (typeof switchTabFn === 'function')
      switchTabFn(cfg.tab, document.querySelector(`[onclick*="${cfg.tab}"]`));
    window.stSetModel?.('var');
    window.varInitRows?.();
    const rowsEl = document.getElementById('var-data-rows');
    if (!rowsEl) { showToast(window.t('toast-var-unavail'), 'err'); return; }
    rowsEl.innerHTML = '';
    valid.forEach(() => window.varAddRow?.());
    Array.from(rowsEl.children).forEach((row, i) => {
      const inp = row.querySelectorAll('input');
      inp[0].value = valid[i].date;
      inp[1].value = valid[i].valor;
    });
    window.varUpdateName?.(0, yLabel);
    window.varUpdateVarCountDisplay?.();
    showToast(`${valid.length} obs. da série ${codigo} → VAR (var. 1). Preencha as demais variáveis.`, 'ok');
    return;

  } else if (cfg.isSerie) {
    window.stSetModel?.(effKey);
    const container = document.getElementById(cfg.rowsId);
    if (!container) { showToast(window.t('toast-model-unavail'), 'err'); return; }
    container.innerHTML = '';
    valid.forEach(() => window[fns.addRow]?.());
    Array.from(container.children).forEach((row, i) => {
      const inp = row.querySelectorAll('input');
      inp[0].value = valid[i].date;
      inp[1].value = valid[i].valor;
    });
    _lbl(cfg.lx, 'Data');
    _lbl(cfg.ly, yLabel);
    window[fns.upd]?.();

  } else {
    const container = document.getElementById(cfg.rowsId);
    if (!container) { showToast(window.t('toast-model-unavail'), 'err'); return; }
    container.innerHTML = '';
    if (effKey === 'nova') {
      window.setRows(valid.map((_, i) => i + 1), valid.map(r => r.valor));
    } else {
      valid.forEach((r, i) => {
        window[fns.addRow]?.();
        const last = container.children[container.children.length - 1];
        const inp  = last.querySelectorAll('input');
        inp[0].value = i + 1;
        inp[1].value = r.valor;
      });
    }
    _lbl(cfg.lx, 'Período');
    _lbl(cfg.ly, yLabel);
    window[fns.upd]?.();
  }

  if (typeof switchTabFn === 'function')
    switchTabFn(cfg.tab, document.querySelector(`[onclick*="${cfg.tab}"]`));

  showToast(`${valid.length} obs. da série ${codigo} importadas!`, 'ok');
}

// ── Importar múltiplas séries para VAR ────────────────────────────────────────
function _importMultipleToVar(series, switchTabFn) {
  const k = Math.min(series.length, 8);
  const selected = series.slice(0, k);

  const TOLERANCE_MS = 2 * 86400 * 1000;

  const maps = selected.map(s => {
    const byDate = new Map();
    const ts = [];
    (_datasets[s.codigo]?.rows || [])
      .filter(r => r.valor != null && !isNaN(r.valor))
      .forEach(r => { byDate.set(r.date, r.valor); ts.push(new Date(r.date).getTime()); });
    ts.sort((a, b) => a - b);
    return { codigo: s.codigo, nome: s.nome, byDate, ts };
  });

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
    showToast(`Dados insuficientes para série ${selected[0].codigo} (mín. 3 obs.).`, 'err');
    return;
  }

  if (typeof switchTabFn === 'function')
    switchTabFn('serie', document.querySelector('[onclick*="serie"]'));
  window.stSetModel?.('var');
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

  maps.forEach((m, j) => {
    window.varUpdateName?.(j, m.nome || `BCB ${m.codigo}`);
  });

  window.varUpdateVarCountDisplay?.();

  const extra = series.length > 8
    ? ` (máx. 8; ${series.length - 8} ignorado${series.length - 8 > 1 ? 's' : ''})`
    : '';
  showToast(`${refTs.length} obs. — ${k} séries importadas para o VAR${extra}`, 'ok');
}

// ── Seção de importar par de séries ──────────────────────────────────────────
function _renderPairSection() {
  const loaded = _series.filter(s => _datasets[s.codigo]);
  const section = document.getElementById('bcb-pair-section');
  if (!section) return;

  if (loaded.length < 2) { section.style.display = 'none'; return; }
  section.style.display = 'block';

  const opts = loaded.map(s =>
    `<option value="${_attr(s.codigo)}">${s.codigo}${s.nome ? ' — ' + (s.nome.length > 28 ? s.nome.slice(0,26)+'…' : s.nome) : ''}</option>`
  ).join('');

  const xSel = document.getElementById('bcb-pair-x');
  const ySel = document.getElementById('bcb-pair-y');
  if (!xSel || !ySel) return;

  const prevX = xSel.value, prevY = ySel.value;
  xSel.innerHTML = opts;
  ySel.innerHTML = opts;

  if (loaded.some(s => s.codigo === prevX)) xSel.value = prevX;
  if (loaded.some(s => s.codigo === prevY)) ySel.value = prevY;
  else if (loaded.length >= 2) ySel.value = loaded[1].codigo;
}

export function bcbImportPair(switchTabFn) {
  const xCod  = document.getElementById('bcb-pair-x')?.value;
  const yCod  = document.getElementById('bcb-pair-y')?.value;
  const model = document.getElementById('bcb-pair-model')?.value || 'nova';

  if (!xCod || !yCod) { showToast(window.t('toast-select-2series'), 'err'); return; }
  if (xCod === yCod)  { showToast(window.t('toast-xy-same-series'), 'err'); return; }

  const dX = _datasets[xCod], dY = _datasets[yCod];
  if (!dX?.rows?.length) { showToast(`Dados não carregados para série ${xCod}.`, 'err'); return; }
  if (!dY?.rows?.length) { showToast(`Dados não carregados para série ${yCod}.`, 'err'); return; }

  const TOLERANCE_MS = 2 * 86400 * 1000;
  const mapY = new Map();
  const tsY  = [];
  dY.rows.filter(r => r.valor != null && !isNaN(r.valor)).forEach(r => {
    mapY.set(r.date, r.valor);
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
    .filter(r => r.valor != null && !isNaN(r.valor))
    .map(r => {
      const yVal = closestY(new Date(r.date).getTime());
      return yVal != null ? { x: r.valor, y: yVal } : null;
    })
    .filter(Boolean);

  if (pairs.length < 3) {
    showToast(window.t('toast-dates-no-align'), 'err');
    return;
  }

  const cfg = _MODEL_CFG[model];
  const fns = _MODEL_FNS[model];
  if (!cfg) { showToast(window.t('toast-model-unavail'), 'err'); return; }

  const sX = _series.find(s => s.codigo === xCod);
  const sY = _series.find(s => s.codigo === yCod);
  const xLabel = sX?.nome || `BCB ${xCod}`;
  const yLabel = sY?.nome || `BCB ${yCod}`;

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

  showToast(`${pairs.length} obs. importadas: ${xCod} (X) × ${yCod} (Y)`, 'ok');
}

// ── Re-renderiza cards ao trocar idioma ───────────────────────────────────────
export function bcbRerender() {
  if (Object.keys(_datasets).length) _renderResults();
}

// ── Expõe datasets carregados para o combinador cross-source ──────────────────
export function bcbGetLoadedSeries() {
  return Object.entries(_datasets).map(([codigo, d]) => {
    const nome = d.nome || `BCB ${codigo}`;
    const label = nome.length > 40
      ? `${codigo} — ${nome.slice(0, 38)}…`
      : `${codigo} — ${nome}`;
    return { id: codigo, label, source: 'bcb', rows: d.rows };
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
