import { showToast } from './notifications.js';
import { API_BASE }  from '../config/constants.js';

// ── Estado ────────────────────────────────────────────────────────────────────
let _tickers      = [];   // [{symbol, name, exch, type}]
let _datasets     = {};   // {symbol: {rows, currency, name, symbol}}
let _view         = 'normal';
let _normalized   = false;
let _compareChart = null;
let _searchTimer  = null;

const PALETTE = ['#7C83FD','#00D4A0','#FF6B8A','#FFC254','#4FC3F7','#CE93D8','#80CBC4','#FFAB40'];

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

  list.innerHTML = `<div class="yf-loading">Buscando…</div>`;
  try {
    const r = await fetch(`${API_BASE}/yahoo/search?q=${encodeURIComponent(q)}`);
    const { quotes = [], error } = await r.json();
    if (error)          { list.innerHTML = `<div class="yf-no-results">${error}</div>`; return; }
    if (!quotes.length) { list.innerHTML = `<div class="yf-no-results">Nenhum resultado para "${q}".</div>`; return; }

    list.innerHTML = quotes.map(q => {
      const name    = q.shortname || q.longname || '';
      const exch    = q.exchDisp  || q.exchange  || '';
      const type    = q.quoteType || '';
      const already = _tickers.some(t => t.symbol === q.symbol);
      return `<button class="yf-result-btn${already ? ' yf-result-added' : ''}"
        data-symbol="${_attr(q.symbol)}" data-name="${_attr(name)}"
        data-exch="${_attr(exch)}"       data-type="${_attr(type)}">
        <span class="yf-r-ticker">${q.symbol}</span>
        <span class="yf-r-name">${name}</span>
        <span class="yf-r-meta">${exch}${type ? ' · ' + type : ''}</span>
        ${already ? '<span class="yf-r-added">✓</span>' : ''}
      </button>`;
    }).join('');
  } catch {
    list.innerHTML = `<div class="yf-no-results">Erro de conexão. Tente novamente.</div>`;
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
  if (!_tickers.length) { showToast('Adicione ao menos um ativo.', 'err'); return; }

  const period   = document.getElementById('yf-period')?.value   || '1y';
  const interval = document.getElementById('yf-interval')?.value || '1d';

  const btn = document.getElementById('yf-load-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Carregando…'; }
  showToast(`Carregando ${_tickers.length} ativo${_tickers.length > 1 ? 's' : ''}…`, 'info');

  try {
    const results = await Promise.all(_tickers.map(t =>
      fetch(`${API_BASE}/yahoo/chart?symbol=${encodeURIComponent(t.symbol)}&period=${period}&interval=${interval}`)
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
  } catch {
    showToast('Erro ao carregar dados.', 'err');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Carregar dados'; }
  }
}

// ── Renderização ──────────────────────────────────────────────────────────────
function _renderResults() {
  _setDisplay('yf-results-area', 'block');
  if (_view === 'compare') _renderCompare();
  else                     _renderNormal();
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
    grid.innerHTML = '<p style="color:var(--txt3);font-size:13px;grid-column:1/-1">Nenhum dado carregado ainda. Clique em "Carregar dados".</p>';
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
      <div class="yf-card-import">
        <select class="yf-select" id="yf-mdl-${_attr(t.symbol)}" style="flex:1;font-size:12px">
          <option value="serie" selected>Séries Temporais</option>
          <option value="nova">Reg. Linear</option>
          <option value="polinomial">Reg. Polinomial</option>
          <option value="quantilica">Reg. Quantílica</option>
          <option value="regularizada">Reg. Regularizada</option>
        </select>
        <button class="yf-fetch-btn" style="padding:6px 12px;font-size:12px"
          onclick="yfImportOne('${_attr(t.symbol)}')">Importar</button>
      </div>
    </div>`;
  }).join('');
}

// ── Comparador ────────────────────────────────────────────────────────────────
export function yfToggleNormalize() {
  _normalized = !_normalized;
  const btn = document.getElementById('yf-norm-btn');
  if (btn) {
    btn.textContent = _normalized ? '% Variação' : '📊 Preço real';
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

// ── Importar um ativo ─────────────────────────────────────────────────────────
const _YNAMES = {
  open:'Abertura', high:'Máxima', low:'Mínima',
  close:'Fechamento', adjclose:'Adj. Close', volume:'Volume',
};

const _MODEL_CFG = {
  nova:         { rowsId:'data-rows',    lx:'label-x',    ly:'label-y',    tab:'nova' },
  polinomial:   { rowsId:'po-data-rows', lx:'po-label-x', ly:'po-label-y', tab:'polinomial' },
  quantilica:   { rowsId:'qr-data-rows', lx:'qr-label-x', ly:'qr-label-y', tab:'quantilica' },
  regularizada: { rowsId:'rr-data-rows', lx:'rr-label-x', ly:'rr-label-y', tab:'regularizada' },
  serie:        { rowsId:'st-data-rows', lx:'st-label-x', ly:'st-label-y', tab:'serie', isSerie:true },
};

const _MODEL_FNS = {
  nova:         { addRow:'addRow',    upd:'updateCount' },
  polinomial:   { addRow:'poAddRow',  upd:'poUpdateCount' },
  quantilica:   { addRow:'qrAddRow',  upd:'qrUpdateCount' },
  regularizada: { addRow:'rrAddRow',  upd:'rrUpdateCount' },
  serie:        { addRow:'stAddRow',  upd:'stUpdateCount' },
};

export function yfImportOne(symbol, switchTabFn) {
  const d = _datasets[symbol];
  if (!d?.rows?.length) { showToast(`Dados não carregados para ${symbol}.`, 'err'); return; }

  const colY  = document.getElementById('yf-col-y')?.value || 'close';
  const model = document.getElementById(`yf-mdl-${symbol}`)?.value || 'serie';
  const cfg   = _MODEL_CFG[model] || _MODEL_CFG.serie;
  const fns   = _MODEL_FNS[model] || _MODEL_FNS.serie;

  const valid = d.rows.filter(r => r[colY] != null && !isNaN(r[colY]));
  if (valid.length < 3) { showToast('Dados insuficientes (mín. 3 obs.).', 'err'); return; }

  const yLabel    = `${symbol} — ${_YNAMES[colY] || colY}`;
  const container = document.getElementById(cfg.rowsId);
  if (!container) { showToast('Modelo indisponível.', 'err'); return; }
  container.innerHTML = '';

  if (cfg.isSerie) {
    valid.forEach(() => window[fns.addRow]?.());
    Array.from(container.children).forEach((row, i) => {
      const inp = row.querySelectorAll('input');
      inp[0].value = valid[i].date;
      inp[1].value = valid[i][colY];
    });
    _lbl(cfg.lx, 'Data');
    _lbl(cfg.ly, yLabel);
  } else {
    if (model === 'nova') {
      window.setRows(valid.map((_, i) => i + 1), valid.map(r => r[colY]));
    } else {
      valid.forEach((r, i) => {
        window[fns.addRow]?.();
        const last = container.children[container.children.length - 1];
        const inp  = last.querySelectorAll('input');
        inp[0].value = i + 1;
        inp[1].value = r[colY];
      });
      for (let i = valid.length; i < 8; i++) window[fns.addRow]?.();
    }
    _lbl(cfg.lx, 'Período');
    _lbl(cfg.ly, yLabel);
  }

  window[fns.upd]?.();

  if (typeof switchTabFn === 'function')
    switchTabFn(cfg.tab, document.querySelector(`[onclick*="${cfg.tab}"]`));

  showToast(`${valid.length} obs. de ${symbol} importadas!`, 'ok');
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
