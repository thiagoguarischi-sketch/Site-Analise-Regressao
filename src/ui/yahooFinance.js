import { showToast } from './notifications.js';
import { API_BASE } from '../config/constants.js';

let _symbol = null;
let _data   = null;
let _searchTimer = null;

// Delegação: captura cliques nos botões de resultado sem depender de onclick inline
document.addEventListener('click', e => {
  const btn = e.target.closest('#yf-results .yf-result-btn');
  if (btn) yfSelectSymbol(btn.dataset.symbol, btn.dataset.name, btn.dataset.exch, btn.dataset.type);
});

function _attr(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

// ── Abrir / fechar modal ──────────────────────────────────────────────────────

export function openYahooModal() {
  const m = document.getElementById('yf-modal');
  if (m) { m.classList.add('open'); document.getElementById('yf-search').focus(); }
}

export function closeYahooModal() {
  const m = document.getElementById('yf-modal');
  if (m) m.classList.remove('open');
  _reset();
}

function _reset() {
  _symbol = null;
  _data   = null;
  const s = document.getElementById('yf-search');
  if (s) s.value = '';
  _setEl('yf-results', '');
  _setEl('yf-options', null, 'none');
  _setEl('yf-preview', null, 'none');
  // Reset model selector to Linear
  document.querySelectorAll('.yf-model-btn').forEach(b => b.classList.toggle('active', b.dataset.model === 'nova'));
  const hidden = document.getElementById('yf-model');
  if (hidden) hidden.value = 'nova';
}

// ── Pesquisa de ticker ────────────────────────────────────────────────────────

export function yfSearchInput() {
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(_doSearch, 320);
}

async function _doSearch() {
  const q = (document.getElementById('yf-search')?.value ?? '').trim();
  const list = document.getElementById('yf-results');
  if (!list) return;
  if (q.length < 1) { list.innerHTML = ''; return; }

  list.innerHTML = `<div class="yf-loading">Buscando…</div>`;
  try {
    const r = await fetch(`${API_BASE}/yahoo/search?q=${encodeURIComponent(q)}`);
    const { quotes = [], error } = await r.json();
    if (error) { list.innerHTML = `<div class="yf-no-results">${error}</div>`; return; }
    if (!quotes.length) { list.innerHTML = `<div class="yf-no-results">Nenhum resultado para "${q}".</div>`; return; }

    list.innerHTML = quotes.map(q => {
      const name = q.shortname || q.longname || '';
      const exch = q.exchDisp || q.exchange || '';
      const type = q.quoteType || '';
      return `<button class="yf-result-btn"
        data-symbol="${_attr(q.symbol)}"
        data-name="${_attr(name)}"
        data-exch="${_attr(exch)}"
        data-type="${_attr(type)}">
        <span class="yf-r-ticker">${q.symbol}</span>
        <span class="yf-r-name">${name}</span>
        <span class="yf-r-meta">${exch}${type ? ' · ' + type : ''}</span>
      </button>`;
    }).join('');
  } catch {
    list.innerHTML = `<div class="yf-no-results">Erro de conexão. Tente novamente.</div>`;
  }
}

// ── Selecionar ativo ──────────────────────────────────────────────────────────

export function yfSelectSymbol(symbol, name, exch, type) {
  _symbol = symbol;
  _data   = null;

  const search = document.getElementById('yf-search');
  if (search) search.value = `${symbol}${name ? ' — ' + name : ''}`;
  _setEl('yf-results', '');

  const lbl = document.getElementById('yf-symbol-label');
  if (lbl) lbl.textContent = `${symbol}${name ? ' — ' + name : ''}${exch ? ' (' + exch + ')' : ''}`;

  _setEl('yf-options', null, 'flex');
  _setEl('yf-preview', null, 'none');
}

// ── Carregar dados ────────────────────────────────────────────────────────────

export async function yfFetchData() {
  if (!_symbol) return;
  const period   = document.getElementById('yf-period')?.value   || '1y';
  const interval = document.getElementById('yf-interval')?.value || '1d';

  _setEl('yf-fetch-btn', null, null, true);
  showToast('Carregando dados do Yahoo Finance…', 'info');

  try {
    const r = await fetch(`${API_BASE}/yahoo/chart?symbol=${encodeURIComponent(_symbol)}&period=${period}&interval=${interval}`);
    const data = await r.json();
    _setEl('yf-fetch-btn', null, null, false);

    if (data.error) { showToast(data.error, 'err'); return; }
    _data = data;
    _renderPreview(data);
    showToast(`${data.rows.length} registros carregados!`, 'ok');
  } catch {
    _setEl('yf-fetch-btn', null, null, false);
    showToast('Erro ao buscar dados. Verifique a conexão.', 'err');
  }
}

function _renderPreview({ rows, currency }) {
  const colY = document.getElementById('yf-col-y')?.value || 'close';

  const sample = rows.slice(-10).reverse();
  const cur = currency ? ` (${currency})` : '';

  const LABELS = { open: `Abertura${cur}`, high: `Máx${cur}`, low: `Mín${cur}`, close: `Fechamento${cur}`, adjclose: `Adj. Close${cur}`, volume: 'Volume', index: 'Índice' };

  document.getElementById('yf-count').textContent = `${rows.length} observações`;
  document.getElementById('yf-preview-tbl').innerHTML = `
    <table style="border-collapse:collapse;width:100%;font-size:12px">
      <thead><tr>
        ${['Data', 'Abertura', 'Máxima', 'Mínima', 'Fechamento'].map(h =>
          `<th style="background:var(--bg3);padding:5px 8px;color:var(--x);text-align:left;font-weight:600;font-size:11px">${h}</th>`
        ).join('')}
      </tr></thead>
      <tbody>${sample.map(r => `<tr>
        <td style="padding:4px 8px;border-bottom:1px solid var(--brd);color:var(--txt2)">${r.date}</td>
        <td style="padding:4px 8px;border-bottom:1px solid var(--brd)">${r.open ?? '—'}</td>
        <td style="padding:4px 8px;border-bottom:1px solid var(--brd)">${r.high ?? '—'}</td>
        <td style="padding:4px 8px;border-bottom:1px solid var(--brd)">${r.low  ?? '—'}</td>
        <td style="padding:4px 8px;border-bottom:1px solid var(--brd);font-weight:600;color:var(--y)">${r.close ?? '—'}</td>
      </tr>`).join('')}</tbody>
    </table>`;

  _setEl('yf-preview', null, 'block');
}

// ── Importar para regressão ───────────────────────────────────────────────────

const YNAMES = {
  open: 'Abertura', high: 'Máxima', low: 'Mínima',
  close: 'Fechamento', adjclose: 'Adj. Close', volume: 'Volume',
};

// Configuração de cada modelo: container de rows, prefixo das labels e tab de destino
const MODEL_CFG = {
  nova:         { rowsId: 'data-rows',    labelX: 'label-x',    labelY: 'label-y',    tab: 'nova' },
  polinomial:   { rowsId: 'po-data-rows', labelX: 'po-label-x', labelY: 'po-label-y', tab: 'polinomial' },
  quantilica:   { rowsId: 'qr-data-rows', labelX: 'qr-label-x', labelY: 'qr-label-y', tab: 'quantilica' },
  regularizada: { rowsId: 'rr-data-rows', labelX: 'rr-label-x', labelY: 'rr-label-y', tab: 'regularizada' },
  serie:        { rowsId: 'st-data-rows', labelX: 'st-label-x', labelY: 'st-label-y', tab: 'serie', isSerie: true },
};

// Prefixos das funções expostas no window por modelo
const MODEL_FNS = {
  nova:         { addRow: 'addRow',    updateCount: 'updateCount' },
  polinomial:   { addRow: 'poAddRow',  updateCount: 'poUpdateCount' },
  quantilica:   { addRow: 'qrAddRow',  updateCount: 'qrUpdateCount' },
  regularizada: { addRow: 'rrAddRow',  updateCount: 'rrUpdateCount' },
  serie:        { addRow: 'stAddRow',  updateCount: 'stUpdateCount' },
};

export function yfConfirmImport(switchTabFn) {
  if (!_data?.rows?.length) { showToast('Carregue os dados antes de importar.', 'err'); return; }

  const colY  = document.getElementById('yf-col-y')?.value  || 'close';
  const model = document.getElementById('yf-model')?.value  || 'nova';
  const cfg   = MODEL_CFG[model] || MODEL_CFG.nova;
  const fns   = MODEL_FNS[model] || MODEL_FNS.nova;

  const valid = _data.rows.filter(r => r[colY] != null && !isNaN(r[colY]));
  if (valid.length < 3) { showToast('Dados insuficientes (mín. 3 observações).', 'err'); return; }

  const yLabel = `${_data.symbol} — ${YNAMES[colY] || colY}`;

  // Limpa o container do modelo destino
  const container = document.getElementById(cfg.rowsId);
  if (!container) { showToast('Modelo indisponível.', 'err'); return; }
  container.innerHTML = '';

  if (cfg.isSerie) {
    // Séries temporais: col 0 = texto (data), col 1 = número (valor)
    valid.forEach(() => window[fns.addRow]?.());
    Array.from(container.children).forEach((row, i) => {
      const inputs = row.querySelectorAll('input');
      inputs[0].value = valid[i].date;
      inputs[1].value = valid[i][colY];
    });
    _setLabel(cfg.labelX, 'Data');
    _setLabel(cfg.labelY, yLabel);
  } else {
    // Modelos numéricos: col 0 = índice (X), col 1 = preço (Y)
    if (model === 'nova') {
      // Usa setRows que já cuida dos paddings de linhas vazias
      window.setRows(valid.map((_, i) => i + 1), valid.map(r => r[colY]));
    } else {
      valid.forEach((r, i) => {
        window[fns.addRow]?.();
        const rows = container.children;
        const last = rows[rows.length - 1];
        const inputs = last.querySelectorAll('input');
        inputs[0].value = i + 1;
        inputs[1].value = r[colY];
      });
      // Padding até mín. 8 linhas
      for (let i = valid.length; i < 8; i++) window[fns.addRow]?.();
    }
    _setLabel(cfg.labelX, 'Período');
    _setLabel(cfg.labelY, yLabel);
  }

  window[fns.updateCount]?.();

  closeYahooModal();
  if (typeof switchTabFn === 'function') {
    switchTabFn(cfg.tab, document.querySelector(`[onclick*="${cfg.tab}"]`));
  }
  showToast(`${valid.length} observações importadas!`, 'ok');
}

function _setLabel(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

export function yfPickModel(btn) {
  document.querySelectorAll('.yf-model-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const hidden = document.getElementById('yf-model');
  if (hidden) hidden.value = btn.dataset.model;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _setEl(id, innerHTML, display, disabled) {
  const el = document.getElementById(id);
  if (!el) return;
  if (innerHTML !== null && innerHTML !== undefined) el.innerHTML = innerHTML;
  if (display  !== null && display  !== undefined) el.style.display  = display;
  if (disabled !== null && disabled !== undefined) el.disabled = disabled;
}
