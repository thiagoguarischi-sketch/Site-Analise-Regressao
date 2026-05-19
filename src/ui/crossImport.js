import { showToast } from './notifications.js';
import { yfGetLoadedSeries } from './yahooFinance.js';
import { bcbGetLoadedSeries } from './bcbFinance.js';

// ── Configurações dos modelos de regressão ────────────────────────────────────
const _REG_CFG = {
  nova:         { rowsId: 'data-rows',    lx: 'label-x',    ly: 'label-y',    tab: 'nova' },
  polinomial:   { rowsId: 'po-data-rows', lx: 'po-label-x', ly: 'po-label-y', tab: 'polinomial' },
  quantilica:   { rowsId: 'qr-data-rows', lx: 'qr-label-x', ly: 'qr-label-y', tab: 'quantilica' },
  regularizada: { rowsId: 'rr-data-rows', lx: 'rr-label-x', ly: 'rr-label-y', tab: 'regularizada' },
};

const _REG_FNS = {
  nova:         { addRow: 'addRow',    upd: 'updateCount' },
  polinomial:   { addRow: 'poAddRow',  upd: 'poUpdateCount' },
  quantilica:   { addRow: 'qrAddRow',  upd: 'qrUpdateCount' },
  regularizada: { addRow: 'rrAddRow',  upd: 'rrUpdateCount' },
};

const _YF_COLS = {
  close: 'Fechamento', adjclose: 'Adj. Close', open: 'Abertura',
  high: 'Máxima', low: 'Mínima', volume: 'Volume',
};

// ── Estado do VAR cross-source ────────────────────────────────────────────────
// Cada item guarda só a fonte; id e col são lidos do DOM na hora da importação
let _varRows = [{ src: 'yf' }, { src: 'bcb' }];

// ── Utilitários ───────────────────────────────────────────────────────────────
function _a(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function _lbl(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function _buildOptions(src, selectedId = '') {
  const series = src === 'yf' ? yfGetLoadedSeries() : bcbGetLoadedSeries();
  if (!series.length) return `<option value="">— sem dados carregados —</option>`;
  return series
    .map(s => `<option value="${_a(s.id)}"${s.id === selectedId ? ' selected' : ''}>${s.label}</option>`)
    .join('');
}

// Alinha duas séries por data com tolerância de ±2 dias úteis
function _buildDateMap(rows, col) {
  const map = new Map();
  const ts  = [];
  rows.filter(r => r[col] != null && !isNaN(r[col])).forEach(r => {
    map.set(r.date, r[col]);
    ts.push(new Date(r.date).getTime());
  });
  return { map, ts };
}

function _closestVal(map, ts, refTs, toleranceMs = 2 * 86400 * 1000) {
  const dateStr = new Date(refTs).toISOString().slice(0, 10);
  if (map.has(dateStr)) return map.get(dateStr);
  let best = null, bestDiff = Infinity;
  for (const t of ts) {
    const diff = Math.abs(t - refTs);
    if (diff < bestDiff) { bestDiff = diff; best = t; }
  }
  if (bestDiff > toleranceMs) return null;
  return map.get(new Date(best).toISOString().slice(0, 10)) ?? null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEÇÃO 1 — REGRESSÃO (par X × Y)
// ═══════════════════════════════════════════════════════════════════════════════

export function crossUpdateSeries(axis) {
  const src     = document.getElementById(`cross-${axis}-src`)?.value;
  const idSel   = document.getElementById(`cross-${axis}-id`);
  const colWrap = document.getElementById(`cross-${axis}-col-wrap`);
  if (!idSel) return;
  idSel.innerHTML = _buildOptions(src);
  if (colWrap) colWrap.style.display = src === 'yf' ? '' : 'none';
}

export function crossImportPair(switchTabFn) {
  const xSrc  = document.getElementById('cross-x-src')?.value;
  const xId   = document.getElementById('cross-x-id')?.value;
  const xCol  = document.getElementById('cross-x-col')?.value || 'close';
  const ySrc  = document.getElementById('cross-y-src')?.value;
  const yId   = document.getElementById('cross-y-id')?.value;
  const yCol  = document.getElementById('cross-y-col')?.value || 'close';
  const model = document.getElementById('cross-model')?.value || 'nova';

  if (!xId || !yId) { showToast(window.t('toast-select-xy'), 'err'); return; }

  const effXCol = xSrc === 'bcb' ? 'valor' : xCol;
  const effYCol = ySrc === 'bcb' ? 'valor' : yCol;

  if (xSrc === ySrc && xId === yId && effXCol === effYCol) {
    showToast(window.t('toast-xy-same-series'), 'err');
    return;
  }

  const sX = (xSrc === 'yf' ? yfGetLoadedSeries() : bcbGetLoadedSeries()).find(s => s.id === xId);
  const sY = (ySrc === 'yf' ? yfGetLoadedSeries() : bcbGetLoadedSeries()).find(s => s.id === yId);

  if (!sX?.rows?.length) { showToast(`Dados não carregados para ${xId}.`, 'err'); return; }
  if (!sY?.rows?.length) { showToast(`Dados não carregados para ${yId}.`, 'err'); return; }

  const { map: mapY, ts: tsY } = _buildDateMap(sY.rows, effYCol);

  const pairs = sX.rows
    .filter(r => r[effXCol] != null && !isNaN(r[effXCol]))
    .map(r => {
      const yVal = _closestVal(mapY, tsY, new Date(r.date).getTime());
      return yVal != null ? { x: r[effXCol], y: yVal } : null;
    })
    .filter(Boolean);

  if (pairs.length < 3) {
    showToast(window.t('toast-dates-no-align-cross'), 'err');
    return;
  }

  const cfg = _REG_CFG[model];
  const fns = _REG_FNS[model];
  if (!cfg) { showToast(window.t('toast-model-unavail'), 'err'); return; }

  const xLabel = xSrc === 'yf' ? `${xId} — ${_YF_COLS[xCol] || xCol}` : sX.label;
  const yLabel = ySrc === 'yf' ? `${yId} — ${_YF_COLS[yCol] || yCol}` : sY.label;

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

  showToast(`${pairs.length} obs. alinhadas: ${xId} (X) × ${yId} (Y)`, 'ok');
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEÇÃO 2 — SÉRIES TEMPORAIS
// ═══════════════════════════════════════════════════════════════════════════════

export function crossSTModelChange() {
  const model = document.getElementById('cross-st-model')?.value;
  const isVar = model === 'var';
  const singleEl = document.getElementById('cross-st-single');
  const varEl    = document.getElementById('cross-st-var');
  if (singleEl) singleEl.style.display = isVar ? 'none' : '';
  if (varEl)    varEl.style.display    = isVar ? ''     : 'none';
}

export function crossSTSrcChange() {
  const src     = document.getElementById('cross-st-src')?.value;
  const idSel   = document.getElementById('cross-st-id');
  const colWrap = document.getElementById('cross-st-col-wrap');
  if (idSel)   idSel.innerHTML = _buildOptions(src);
  if (colWrap) colWrap.style.display = src === 'yf' ? '' : 'none';
}

// Atualiza a fonte de uma linha do VAR e re-renderiza
export function crossVarSrcChange(idx, src) {
  if (_varRows[idx]) _varRows[idx].src = src;
  _renderVarList();
}

export function crossAddVarSeries() {
  if (_varRows.length >= 8) { showToast(window.t('toast-var-max-var'), 'info'); return; }
  const yf = yfGetLoadedSeries();
  _varRows.push({ src: yf.length > 0 ? 'yf' : 'bcb' });
  _renderVarList();
}

export function crossRemoveVarSeries(idx) {
  if (_varRows.length <= 2) return;
  _varRows.splice(idx, 1);
  _renderVarList();
}

function _renderVarList() {
  const container = document.getElementById('cross-var-list');
  if (!container) return;

  const yf  = yfGetLoadedSeries();
  const bcb = bcbGetLoadedSeries();

  container.innerHTML = _varRows.map((row, i) => {
    const srcOpts = [
      `<option value="yf"${row.src === 'yf'  ? ' selected' : ''}>📈 Yahoo Finance</option>`,
      `<option value="bcb"${row.src === 'bcb' ? ' selected' : ''}>🏛️ BCB</option>`,
    ].join('');

    const series   = row.src === 'yf' ? yf : bcb;
    const serOpts  = series.length
      ? series.map(s => `<option value="${_a(s.id)}">${s.label}</option>`).join('')
      : `<option value="">— sem dados —</option>`;
    const showCol  = row.src === 'yf';
    const rmBtn    = _varRows.length > 2
      ? `<button onclick="crossRemoveVarSeries(${i})" title="Remover"
           style="padding:4px 10px;font-size:12px;background:var(--bg3);border:1px solid var(--brd2);border-radius:6px;cursor:pointer;color:var(--txt2)">✕</button>`
      : `<span style="width:34px;display:inline-block"></span>`;

    return `<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px">
      <span style="font-size:11px;color:var(--txt3);min-width:22px;font-weight:700;text-align:right">V${i + 1}</span>
      <select class="yf-select" style="width:140px" onchange="crossVarSrcChange(${i}, this.value)">${srcOpts}</select>
      <select class="yf-select" style="flex:1" id="cross-var-id-${i}">${serOpts}</select>
      ${showCol
        ? `<select class="yf-select" style="width:110px" id="cross-var-col-${i}">
            <option value="close">Fechamento</option>
            <option value="adjclose">Adj. Close</option>
            <option value="open">Abertura</option>
            <option value="high">Máxima</option>
            <option value="low">Mínima</option>
            <option value="volume">Volume</option>
           </select>`
        : `<div style="width:110px"></div>`}
      ${rmBtn}
    </div>`;
  }).join('');
}

// Importa série única (classic / ARIMA / GARCH)
export function crossImportST(switchTabFn) {
  const model = document.getElementById('cross-st-model')?.value || 'classic';

  if (model === 'var') {
    _crossImportVAR(switchTabFn);
    return;
  }

  const src = document.getElementById('cross-st-src')?.value;
  const id  = document.getElementById('cross-st-id')?.value;
  const col = document.getElementById('cross-st-col')?.value || 'close';

  if (!id) { showToast(window.t('toast-select-serie'), 'err'); return; }

  const effCol = src === 'bcb' ? 'valor' : col;
  const s = (src === 'yf' ? yfGetLoadedSeries() : bcbGetLoadedSeries()).find(x => x.id === id);

  if (!s?.rows?.length) { showToast(`Dados não carregados para ${id}.`, 'err'); return; }

  const valid = s.rows.filter(r => r[effCol] != null && !isNaN(r[effCol]));
  if (valid.length < 3) { showToast(window.t('toast-data-insuf-obs'), 'err'); return; }

  window.stSetModel?.(model);

  const container = document.getElementById('st-data-rows');
  if (!container) { showToast(window.t('toast-model-unavail'), 'err'); return; }

  container.innerHTML = '';
  valid.forEach(() => window.stAddRow?.());
  Array.from(container.children).forEach((row, i) => {
    const inp = row.querySelectorAll('input');
    inp[0].value = valid[i].date;
    inp[1].value = valid[i][effCol];
  });

  _lbl('st-label-x', 'Data');
  _lbl('st-label-y', s.label);
  window.stUpdateCount?.();

  if (typeof switchTabFn === 'function')
    switchTabFn('serie', document.querySelector('[onclick*="serie"]'));

  const modelNames = { classic: 'Decomposição Clássica', arima: 'ARIMA', garch: 'GARCH' };
  showToast(`${valid.length} obs. de ${id} importadas → ${modelNames[model] || model}.`, 'ok');
}

// Importa múltiplas séries para VAR
function _crossImportVAR(switchTabFn) {
  // Lê id e col do DOM (re-renderizado por _renderVarList)
  const rows = _varRows
    .map((r, i) => ({
      src:    r.src,
      id:     document.getElementById(`cross-var-id-${i}`)?.value  || '',
      col:    document.getElementById(`cross-var-col-${i}`)?.value || 'close',
      effCol: r.src === 'bcb' ? 'valor' : (document.getElementById(`cross-var-col-${i}`)?.value || 'close'),
    }))
    .filter(r => r.id);

  if (rows.length < 2) { showToast(window.t('toast-var-min2-series'), 'err'); return; }

  const maps = rows.map(r => {
    const s = (r.src === 'yf' ? yfGetLoadedSeries() : bcbGetLoadedSeries()).find(x => x.id === r.id);
    if (!s?.rows?.length) return null;
    const { map, ts } = _buildDateMap(s.rows, r.effCol);
    ts.sort((a, b) => a - b);
    return { id: r.id, label: s.label, map, ts };
  });

  if (maps.some(m => !m)) { showToast(window.t('toast-data-not-loaded'), 'err'); return; }

  const refTs = maps[0].ts;
  if (refTs.length < 3) { showToast(window.t('toast-data-insuf-first'), 'err'); return; }

  if (typeof switchTabFn === 'function')
    switchTabFn('serie', document.querySelector('[onclick*="serie"]'));

  window.stSetModel?.('var');
  window.varSetK?.(maps.length);

  const rowsEl = document.getElementById('var-data-rows');
  if (!rowsEl) { showToast(window.t('toast-var-unavail'), 'err'); return; }

  rowsEl.innerHTML = '';
  refTs.forEach(() => window.varAddRow?.());

  Array.from(rowsEl.children).forEach((row, i) => {
    const inp  = row.querySelectorAll('input');
    const date = new Date(refTs[i]).toISOString().slice(0, 10);
    inp[0].value = date;
    maps.forEach((m, j) => {
      const val = _closestVal(m.map, m.ts, refTs[i]);
      if (inp[j + 1]) inp[j + 1].value = val ?? '';
    });
  });

  maps.forEach((m, j) => window.varUpdateName?.(j, m.label));
  window.varUpdateVarCountDisplay?.();

  showToast(`${refTs.length} obs. — ${maps.length} séries importadas para o VAR.`, 'ok');
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFRESH GLOBAL — chamado após qualquer carregamento de dados
// ═══════════════════════════════════════════════════════════════════════════════

export function crossRefresh() {
  const yf    = yfGetLoadedSeries();
  const bcb   = bcbGetLoadedSeries();
  const total = yf.length + bcb.length;

  // ── Seção de Regressão (requer ≥ 2 séries) ──────────────────────────────
  const regNoData    = document.getElementById('cross-no-data');
  const regSelectors = document.getElementById('cross-selectors');
  if (regNoData && regSelectors) {
    if (total < 2) {
      regNoData.style.display    = '';
      regSelectors.style.display = 'none';
    } else {
      regNoData.style.display    = 'none';
      regSelectors.style.display = '';

      const xSrcEl = document.getElementById('cross-x-src');
      const ySrcEl = document.getElementById('cross-y-src');
      if (xSrcEl && ySrcEl) {
        if (yf.length > 0 && bcb.length > 0) { xSrcEl.value = 'yf'; ySrcEl.value = 'bcb'; }
        else if (yf.length >= 2)              { xSrcEl.value = 'yf'; ySrcEl.value = 'yf'; }
        else                                  { xSrcEl.value = 'bcb'; ySrcEl.value = 'bcb'; }
      }

      crossUpdateSeries('x');
      crossUpdateSeries('y');

      // Se mesma fonte, pré-seleciona Y como segunda opção
      if (document.getElementById('cross-x-src')?.value === document.getElementById('cross-y-src')?.value) {
        const xId    = document.getElementById('cross-x-id')?.value;
        const yIdSel = document.getElementById('cross-y-id');
        if (yIdSel) {
          const other = Array.from(yIdSel.options).find(o => o.value !== xId);
          if (other) yIdSel.value = other.value;
        }
      }
    }
  }

  // ── Seção de Séries Temporais (requer ≥ 1 série) ────────────────────────
  const stNoData    = document.getElementById('cross-st-no-data');
  const stSelectors = document.getElementById('cross-st-selectors');
  if (stNoData && stSelectors) {
    if (total < 1) {
      stNoData.style.display    = '';
      stSelectors.style.display = 'none';
    } else {
      stNoData.style.display    = 'none';
      stSelectors.style.display = '';

      // Fonte padrão: YF se tiver dados, senão BCB
      const stSrcEl = document.getElementById('cross-st-src');
      if (stSrcEl) stSrcEl.value = yf.length > 0 ? 'yf' : 'bcb';

      crossSTSrcChange();

      // Padrão para VAR: mistura de fontes quando possível
      if (yf.length > 0 && bcb.length > 0) {
        _varRows[0] = { src: 'yf'  };
        _varRows[1] = { src: 'bcb' };
      } else if (yf.length >= 2) {
        _varRows[0] = { src: 'yf' };
        _varRows[1] = { src: 'yf' };
      } else {
        _varRows[0] = { src: 'bcb' };
        _varRows[1] = { src: 'bcb' };
      }
      _renderVarList();
    }
  }
}
