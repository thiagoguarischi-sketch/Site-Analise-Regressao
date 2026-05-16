import { showToast } from './notifications.js';
import { yfGetLoadedSeries } from './yahooFinance.js';
import { bcbGetLoadedSeries } from './bcbFinance.js';

const _MODEL_CFG = {
  nova:         { rowsId: 'data-rows',    lx: 'label-x',    ly: 'label-y',    tab: 'nova' },
  polinomial:   { rowsId: 'po-data-rows', lx: 'po-label-x', ly: 'po-label-y', tab: 'polinomial' },
  quantilica:   { rowsId: 'qr-data-rows', lx: 'qr-label-x', ly: 'qr-label-y', tab: 'quantilica' },
  regularizada: { rowsId: 'rr-data-rows', lx: 'rr-label-x', ly: 'rr-label-y', tab: 'regularizada' },
};

const _MODEL_FNS = {
  nova:         { addRow: 'addRow',    upd: 'updateCount' },
  polinomial:   { addRow: 'poAddRow',  upd: 'poUpdateCount' },
  quantilica:   { addRow: 'qrAddRow',  upd: 'qrUpdateCount' },
  regularizada: { addRow: 'rrAddRow',  upd: 'rrUpdateCount' },
};

const _YF_COLS = {
  close: 'Fechamento', adjclose: 'Adj. Close', open: 'Abertura',
  high: 'Máxima', low: 'Mínima', volume: 'Volume',
};

function _a(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function _lbl(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function _buildOptions(src) {
  const series = src === 'yf' ? yfGetLoadedSeries() : bcbGetLoadedSeries();
  if (!series.length) return `<option value="">— sem dados carregados —</option>`;
  return series.map(s => `<option value="${_a(s.id)}">${s.label}</option>`).join('');
}

// Atualiza a lista de séries disponíveis para um eixo (x ou y)
export function crossUpdateSeries(axis) {
  const src      = document.getElementById(`cross-${axis}-src`)?.value;
  const idSel    = document.getElementById(`cross-${axis}-id`);
  const colWrap  = document.getElementById(`cross-${axis}-col-wrap`);
  if (!idSel) return;

  idSel.innerHTML = _buildOptions(src);
  // Seletor de coluna só faz sentido para Yahoo Finance (BCB sempre usa 'valor')
  if (colWrap) colWrap.style.display = src === 'yf' ? '' : 'none';
}

// Atualiza o combinador após dados serem carregados em qualquer fonte
export function crossRefresh() {
  const yf  = yfGetLoadedSeries();
  const bcb = bcbGetLoadedSeries();
  const total = yf.length + bcb.length;

  const noData    = document.getElementById('cross-no-data');
  const selectors = document.getElementById('cross-selectors');
  if (!noData || !selectors) return;

  if (total < 2) {
    noData.style.display    = '';
    selectors.style.display = 'none';
    return;
  }

  noData.style.display    = 'none';
  selectors.style.display = '';

  const xSrcEl = document.getElementById('cross-x-src');
  const ySrcEl = document.getElementById('cross-y-src');

  // Padrão inteligente: se ambas as fontes têm dados, sugere fontes diferentes
  if (xSrcEl && ySrcEl) {
    if (yf.length > 0 && bcb.length > 0) {
      xSrcEl.value = 'yf';
      ySrcEl.value = 'bcb';
    } else if (yf.length >= 2) {
      xSrcEl.value = 'yf';
      ySrcEl.value = 'yf';
    } else {
      xSrcEl.value = 'bcb';
      ySrcEl.value = 'bcb';
    }
  }

  crossUpdateSeries('x');
  crossUpdateSeries('y');

  // Se mesma fonte, tenta pré-selecionar Y como a segunda opção
  if (xSrcEl?.value === ySrcEl?.value) {
    const xId    = document.getElementById('cross-x-id')?.value;
    const yIdSel = document.getElementById('cross-y-id');
    if (yIdSel) {
      const other = Array.from(yIdSel.options).find(o => o.value !== xId);
      if (other) yIdSel.value = other.value;
    }
  }
}

// Importa o par selecionado para o modelo escolhido
export function crossImportPair(switchTabFn) {
  const xSrc  = document.getElementById('cross-x-src')?.value;
  const xId   = document.getElementById('cross-x-id')?.value;
  const xCol  = document.getElementById('cross-x-col')?.value || 'close';
  const ySrc  = document.getElementById('cross-y-src')?.value;
  const yId   = document.getElementById('cross-y-id')?.value;
  const yCol  = document.getElementById('cross-y-col')?.value || 'close';
  const model = document.getElementById('cross-model')?.value || 'nova';

  if (!xId || !yId) { showToast('Selecione as variáveis X e Y.', 'err'); return; }

  // BCB sempre usa a coluna 'valor'; YF usa a coluna escolhida
  const effXCol = xSrc === 'bcb' ? 'valor' : xCol;
  const effYCol = ySrc === 'bcb' ? 'valor' : yCol;

  if (xSrc === ySrc && xId === yId && effXCol === effYCol) {
    showToast('X e Y são idênticos. Escolha séries ou colunas diferentes.', 'err');
    return;
  }

  const xAll = xSrc === 'yf' ? yfGetLoadedSeries() : bcbGetLoadedSeries();
  const yAll = ySrc === 'yf' ? yfGetLoadedSeries() : bcbGetLoadedSeries();
  const sX   = xAll.find(s => s.id === xId);
  const sY   = yAll.find(s => s.id === yId);

  if (!sX?.rows?.length) { showToast(`Dados não carregados para ${xId}.`, 'err'); return; }
  if (!sY?.rows?.length) { showToast(`Dados não carregados para ${yId}.`, 'err'); return; }

  // Alinha por data com tolerância de ±2 dias úteis para cobrir feriados
  const TOLERANCE_MS = 2 * 86400 * 1000;
  const mapY = new Map();
  const tsY  = [];
  sY.rows
    .filter(r => r[effYCol] != null && !isNaN(r[effYCol]))
    .forEach(r => {
      mapY.set(r.date, r[effYCol]);
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

  const pairs = sX.rows
    .filter(r => r[effXCol] != null && !isNaN(r[effXCol]))
    .map(r => {
      const xVal = r[effXCol];
      const yVal = closestY(new Date(r.date).getTime());
      return yVal != null ? { x: xVal, y: yVal } : null;
    })
    .filter(Boolean);

  if (pairs.length < 3) {
    showToast('Datas não se alinham (mín. 3 obs. coincidentes entre as fontes).', 'err');
    return;
  }

  const cfg = _MODEL_CFG[model];
  const fns = _MODEL_FNS[model];
  if (!cfg) { showToast('Modelo indisponível.', 'err'); return; }

  const xLabel = xSrc === 'yf' ? `${xId} — ${_YF_COLS[xCol] || xCol}` : sX.label;
  const yLabel = ySrc === 'yf' ? `${yId} — ${_YF_COLS[yCol] || yCol}` : sY.label;

  const container = document.getElementById(cfg.rowsId);
  if (!container) { showToast('Modelo indisponível.', 'err'); return; }

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
