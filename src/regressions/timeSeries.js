// Séries temporais — Decomposição Clássica, ARIMA(p,d,q) e GARCH(1,1)

import { esc } from '../core/utils.js';
import { showToast } from '../ui/notifications.js';
import { saveAnalysisRequest } from '../services/analysisService.js';
import { analyze } from '../services/computeService.js';
import { callAI, aiLoadingHTML, aiResultHTML, aiFallbackHTML } from '../services/authService.js';
import {
  S, cell, zebra, buildWS, autoFilter, mergeRange, downloadCSV,
  buildKPISheet, buildCompSheet, buildDashSheet, buildInsightsSheet,
} from '../services/exportService.js';
import { switchTab } from '../ui/dashboard.js';
import { loadHistory, updateProfileStats } from '../ui/tables.js';
import {
  createTimeSeriesMain, createTrendChart, createSeasonChart,
  createTSResidChart, createVolatilityChart,
  createACFChart, createARIMAMainChart, createGARCHMainChart, createGARCHVarChart,
  createVARMainChart, createIRFChart,
} from '../charts/forecastChart.js';

let stLastResult = null;
let stCurrentModel = 'classic';
const STC = {};

// ─── VAR STATE ───────────────────────────────────────────────────────────────
let varK = 2;
let varNames = Array.from({ length: 8 }, (_, i) => `Var ${i + 1}`);

function stDestroyChart(id) { if (STC[id]) { STC[id].destroy(); delete STC[id]; } }

// ─── UI ─────────────────────────────────────────────────────────────────────

export function stInitRows(n = 12) {
  document.getElementById('st-data-rows').innerHTML = '';
  for (let i = 0; i < n; i++) stAddRow();
  stUpdateCount();
}

export function stAddRow() {
  const container = document.getElementById('st-data-rows');
  const i = container.children.length + 1;
  const row = document.createElement('div');
  row.className = 'data-row';
  row.innerHTML = `
    <span class="data-row-n">${i}</span>
    <input class="data-input" type="text" placeholder="Ex: Jan/24" oninput="stUpdateCount()" style="font-size:12px">
    <input class="data-input" type="number" placeholder="valor" oninput="stUpdateCount()" step="any">`;
  container.appendChild(row);
}

export function stAddRowTop() {
  const container = document.getElementById('st-data-rows');
  const row = document.createElement('div');
  row.className = 'data-row';
  row.innerHTML = `
    <span class="data-row-n">1</span>
    <input class="data-input" type="text" placeholder="Ex: Jan/24" oninput="stUpdateCount()" style="font-size:12px">
    <input class="data-input" type="number" placeholder="valor" oninput="stUpdateCount()" step="any">`;
  container.prepend(row);
  Array.from(container.children).forEach((r, i) => {
    const span = r.querySelector('.data-row-n');
    if (span) span.textContent = i + 1;
  });
  row.querySelector('input').focus();
}

export function stClearRows() {
  document.getElementById('st-data-rows').innerHTML = '';
  stInitRows();
  document.getElementById('st-results').style.display = 'none';
  document.getElementById('st-btn-save').style.display = 'none';
  stLastResult = null;
}

function stGetData() {
  const rows = document.getElementById('st-data-rows').children;
  const labels = [], values = [];
  for (const row of rows) {
    const inputs = row.querySelectorAll('input');
    const lbl = inputs[0].value.trim();
    const val = parseFloat(inputs[1].value);
    if (lbl && !isNaN(val)) { labels.push(lbl); values.push(val); }
  }
  return { labels, values };
}

export function stUpdateCount() {
  const { values } = stGetData();
  document.getElementById('st-data-count').textContent = `${values.length} ${window.t(values.length !== 1 ? 'periodo-plural' : 'periodo-single')}`;
  const elX = document.getElementById('st-dh-x');
  const elY = document.getElementById('st-dh-y');
  if (elX) elX.textContent = document.getElementById('st-label-x').value || 'Período';
  if (elY) elY.textContent = document.getElementById('st-label-y').value || 'Valor';
}

export function stSetModel(model) {
  stCurrentModel = model;
  document.querySelectorAll('.st-model-btn').forEach(b => {
    const active = b.dataset.model === model;
    b.style.background = active ? 'var(--y)' : '';
    b.style.color = active ? '#fff' : '';
    b.style.borderColor = active ? 'var(--y)' : '';
  });
  document.getElementById('st-classic-params').style.display = model === 'classic' ? 'grid' : 'none';
  document.getElementById('st-arima-params').style.display = model === 'arima' ? 'grid' : 'none';
  document.getElementById('st-var-params').style.display = model === 'var' ? 'grid' : 'none';
  document.getElementById('st-scalar-data-card').style.display = model === 'var' ? 'none' : 'block';
  document.getElementById('st-var-data-card').style.display = model === 'var' ? 'block' : 'none';
  // Recalcula larguras agora que o card está visível (clientWidth correto)
  if (model === 'var') varRebuildTable();
}

export function stLoadExample() {
  const isEn = (localStorage.getItem('slope-lang') || 'pt') === 'en';
  const examples = [
    { name: isEn ? 'Monthly Sales'        : 'Vendas Mensais',
      ly:   isEn ? 'Sales ($k)'           : 'Vendas (R$k)',
      lx:   isEn ? 'Month'               : 'Mês',
      labels: ['Jan/23','Feb/23','Mar/23','Apr/23','May/23','Jun/23','Jul/23','Aug/23','Sep/23','Oct/23','Nov/23','Dec/23','Jan/24','Feb/24','Mar/24','Apr/24','May/24','Jun/24'],
      values: [42,38,45,50,55,60,58,63,67,72,80,95,48,44,52,58,64,70] },
    { name: isEn ? 'Average Temperature'  : 'Temperatura Média',
      ly:   isEn ? 'Temp (°C)'           : 'Temp (°C)',
      lx:   isEn ? 'Month'               : 'Mês',
      labels: isEn
        ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr']
        : ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez','Jan','Fev','Mar','Abr'],
      values: [28,29,27,25,22,20,19,20,22,24,26,28,27,28,26,24] },
    { name: isEn ? 'Financial Returns'    : 'Retornos Financeiros',
      ly:   isEn ? 'Return (%)'          : 'Retorno (%)',
      lx:   isEn ? 'Week'               : 'Semana',
      labels: Array.from({ length: 24 }, (_, i) => `W${i + 1}`),
      values: [1.2,-0.8,2.1,-1.5,0.3,3.2,-2.1,1.8,-0.5,2.9,-1.2,0.7,1.5,-3.1,2.4,0.8,-1.9,3.5,-0.6,1.1,-2.3,2.8,-0.4,1.6] },
  ];
  const ex = examples[Math.floor(Math.random() * examples.length)];
  document.getElementById('st-analysis-name').value = ex.name;
  document.getElementById('st-label-y').value = ex.ly;
  document.getElementById('st-label-x').value = ex.lx;
  document.getElementById('st-data-rows').innerHTML = '';
  ex.labels.forEach((lbl, i) => {
    stAddRow();
    const rows = document.getElementById('st-data-rows').children;
    const last = rows[rows.length - 1];
    last.querySelectorAll('input')[0].value = lbl;
    last.querySelectorAll('input')[1].value = ex.values[i];
  });
  for (let i = ex.labels.length; i < 12; i++) stAddRow();
  stUpdateCount();
}

// ─── VAR UI ──────────────────────────────────────────────────────────────────

export function varUpdateName(idx, val) {
  varNames[idx] = val || `Var ${idx + 1}`;
  document.querySelectorAll('.var-dh-label').forEach((el, i) => {
    if (i === idx) el.value = varNames[idx];
  });
}

function varSyncKDisplay() {
  const el = document.getElementById('var-k-display');
  if (el) el.textContent = String(varK);
  const btnMinus = document.getElementById('var-btn-minus');
  if (btnMinus) btnMinus.disabled = varK <= 2;
}

export function varAddVariable() {
  if (varK >= 8) { showToast(window.t('toast-var-max-var'), 'err'); return; }
  varK++;
  varRebuildTable();
  varSyncKDisplay();
}

export function varRemoveVariable() {
  if (varK <= 2) { showToast(window.t('toast-var-min2'), 'err'); return; }
  varK--;
  varRebuildTable();
  varSyncKDisplay();
}

export function varSetK(newK) {
  varK = Math.max(2, Math.min(8, newK));
  varRebuildTable(true);
  varSyncKDisplay();
}

// Largura dinâmica: preenche o container disponível e só aciona scroll
// quando a coluna ficaria menor que VAR_COL_MIN.
const VAR_COL_NUM = 28;   // índice (#) — fixo
const VAR_COL_MIN = 90;   // largura mínima por coluna antes de rolar

function varColWidth() {
  const scrollEl = document.getElementById('var-data-header')?.parentElement;
  const total = scrollEl?.clientWidth || 720;        // fallback quando oculto
  const numCols = 1 + varK;                          // Período + k variáveis
  const gaps = (numCols + 1) * 6;                    // espaços entre colunas
  const available = total - VAR_COL_NUM - gaps;
  return Math.max(VAR_COL_MIN, Math.floor(available / numCols));
}

function varGTC() {
  const w = varColWidth();
  return `${VAR_COL_NUM}px ${w}px ${Array(varK).fill(`${w}px`).join(' ')}`;
}

function varRebuildTable(clear = false) {
  const headerEl = document.getElementById('var-data-header');
  const rowsEl   = document.getElementById('var-data-rows');
  const gtc = varGTC();

  // Header — larguras fixas + texto centralizado
  headerEl.style.cssText =
    `display:grid;grid-template-columns:${gtc};gap:6px;align-items:center;padding:4px 0 2px`;
  headerEl.innerHTML =
    `<span></span>
     <div class="data-header-label" style="text-align:center">Período</div>` +
    Array.from({ length: varK }, (_, i) => {
      const name = varNames[i] ?? `Var ${i + 1}`;
      return `<div class="data-header-label" style="padding:0;text-align:center">
        <input type="text" class="var-dh-label" value="${esc(name)}"
          title="Clique para renomear a variável"
          oninput="varUpdateName(${i}, this.value)">
      </div>`;
    }).join('');

  if (clear) {
    rowsEl.innerHTML = '';
    for (let i = 0; i < 12; i++) varAddRowInternal(gtc, i + 1);
    varUpdateVarCountDisplay();
    return;
  }

  // Preserva dados existentes
  const existing = [];
  for (const row of rowsEl.children) {
    const inputs = row.querySelectorAll('input');
    const lbl  = inputs[0]?.value ?? '';
    const vals = Array.from({ length: inputs.length - 1 }, (_, j) => inputs[j + 1]?.value ?? '');
    existing.push({ lbl, vals });
  }

  rowsEl.innerHTML = '';
  const n = Math.max(existing.length, 12);
  for (let i = 0; i < n; i++) {
    const d = existing[i] || { lbl: '', vals: [] };
    varAddRowInternal(gtc, i + 1, d.lbl, d.vals);
  }
  varUpdateVarCountDisplay();
}

function varAddRowInternal(gtc, rowNum, lbl = '', vals = []) {
  const rowsEl = document.getElementById('var-data-rows');
  const row = document.createElement('div');
  row.style.cssText =
    `display:grid;grid-template-columns:${gtc};gap:6px;align-items:center;padding:2px 0`;
  row.innerHTML =
    `<span class="data-row-n" style="text-align:center">${rowNum}</span>
     <input class="data-input" type="text" placeholder="Ex: Jan/24" value="${esc(lbl)}"
       oninput="varUpdateVarCountDisplay()" style="font-size:12px;text-align:center">` +
    Array.from({ length: varK }, (_, i) =>
      `<input class="data-input" type="number" placeholder="—" step="any"
         value="${vals[i] ?? ''}" oninput="varUpdateVarCountDisplay()"
         style="text-align:center">`
    ).join('');
  rowsEl.appendChild(row);
}

export function varInitRows() {
  varRebuildTable(true);
  varSyncKDisplay();
}

export function varAddRow() {
  const rowsEl = document.getElementById('var-data-rows');
  varAddRowInternal(varGTC(), rowsEl.children.length + 1);
  varUpdateVarCountDisplay();
}

export function varAddRowTop() {
  const rowsEl = document.getElementById('var-data-rows');
  const gtc = varGTC();
  const row = document.createElement('div');
  row.style.cssText =
    `display:grid;grid-template-columns:${gtc};gap:6px;align-items:center;padding:2px 0`;
  row.innerHTML =
    `<span class="data-row-n" style="text-align:center">1</span>
     <input class="data-input" type="text" placeholder="Ex: Jan/24"
       oninput="varUpdateVarCountDisplay()" style="font-size:12px;text-align:center">` +
    Array.from({ length: varK }, () =>
      `<input class="data-input" type="number" placeholder="—" step="any"
         oninput="varUpdateVarCountDisplay()" style="text-align:center">`
    ).join('');
  rowsEl.prepend(row);
  Array.from(rowsEl.children).forEach((r, i) => {
    const span = r.querySelector('.data-row-n');
    if (span) span.textContent = i + 1;
  });
  varUpdateVarCountDisplay();
  row.querySelector('input').focus();
}

export function varClearRows() {
  varRebuildTable(true);
  document.getElementById('st-results').style.display = 'none';
  document.getElementById('st-btn-save').style.display = 'none';
  stLastResult = null;
}

export function varUpdateVarCountDisplay() {
  const { labelsList } = varGetData();
  const n = labelsList.length;
  const el = document.getElementById('var-data-count');
  if (el) el.textContent = `${n} ${window.t(n !== 1 ? 'periodo-plural' : 'periodo-single')}`;
}

function varGetData() {
  const rowsEl = document.getElementById('var-data-rows');
  const labelsList = [], matrix = [];
  for (const row of rowsEl.children) {
    const inputs = row.querySelectorAll('input');
    const lbl = inputs[0]?.value.trim() ?? '';
    const vals = Array.from({ length: varK }, (_, i) => parseFloat(inputs[i + 1]?.value));
    if (lbl && vals.every(v => !isNaN(v))) {
      labelsList.push(lbl);
      matrix.push(vals);
    }
  }
  return { labelsList, matrix };
}

export function varLoadExample() {
  const isEn = (localStorage.getItem('slope-lang') || 'pt') === 'en';
  const examples = [
    {
      names: isEn ? ['GDP ($bn)', 'Investment ($bn)'] : ['PIB (R$bi)', 'Investimento (R$bi)'],
      labels: ['Q1/21','Q2/21','Q3/21','Q4/21','Q1/22','Q2/22','Q3/22','Q4/22','Q1/23','Q2/23','Q3/23','Q4/23','Q1/24','Q2/24','Q3/24','Q4/24'],
      matrix: [
        [2200,320],[2260,335],[2310,350],[2380,370],
        [2350,360],[2420,380],[2480,395],[2550,415],
        [2510,405],[2580,425],[2640,440],[2720,465],
        [2680,450],[2750,472],[2820,490],[2900,510],
      ],
    },
    {
      names: isEn ? ['Exports', 'Exchange Rate', 'Commodity Price'] : ['Exportações', 'Taxa de Câmbio', 'Preço Commodities'],
      labels: Array.from({ length: 20 }, (_, i) => `M${i + 1}`),
      matrix: [
        [100,5.2,80],[105,5.4,82],[98,5.6,79],[108,5.3,85],
        [112,5.1,88],[115,4.9,91],[110,5.0,87],[118,4.8,94],
        [122,4.7,97],[120,4.9,95],[125,4.6,100],[130,4.4,104],
        [128,4.5,102],[135,4.3,108],[140,4.2,112],[138,4.4,110],
        [145,4.1,116],[150,4.0,120],[148,4.2,118],[155,3.9,124],
      ],
    },
  ];

  const ex = examples.find(e => e.names.length === varK) || examples[0];
  varK = ex.names.length;
  ex.names.forEach((n, i) => { varNames[i] = n; });

  // Reconstrói header com nomes corretos e popula as linhas
  varRebuildTable(true);
  const rowsEl = document.getElementById('var-data-rows');
  rowsEl.innerHTML = '';
  ex.labels.forEach((lbl, i) => varAddRowInternal(varGTC(), i + 1, lbl, ex.matrix[i].map(String)));

  varUpdateVarCountDisplay();
  varSyncKDisplay();
}

// ─── RUN ─────────────────────────────────────────────────────────────────────

export async function runSerie() {
  const futureN = parseInt(document.getElementById('st-future').value) || 6;
  const labelY = document.getElementById('st-label-y').value || 'Valor';
  const labelX = document.getElementById('st-label-x').value || 'Período';

  let res;

  try {
    if (stCurrentModel === 'var') {
      const { labelsList, matrix } = varGetData();
      const p = Math.max(1, parseInt(document.getElementById('st-var-p').value) || 1);
      if (matrix.length < p * varK + p + 2) {
        showToast(`VAR(${p}) — ${window.t('lbl-enter-at-least')} ${p * varK + p + 2} ${window.t('periodo-plural')}.`, 'err'); return;
      }
      res = await analyze('var', { p, futureN, varNames: varNames.slice(0, varK) }, { matrix, labelsList });
      if (!res) { showToast(window.t('toast-singular-var'), 'err'); return; }
    } else {
      const { labels, values } = stGetData();
      if (values.length < 6) { showToast(window.t('toast-min6-periods'), 'err'); return; }
      if (stCurrentModel === 'arima') {
        const p = Math.max(0, parseInt(document.getElementById('st-arima-p').value) || 1);
        const d = Math.max(0, Math.min(2, parseInt(document.getElementById('st-arima-d').value) || 1));
        const q = Math.max(0, parseInt(document.getElementById('st-arima-q').value) || 1);
        if (values.length < p + d + q + 5) {
          showToast(`${window.t('lbl-enter-at-least')} ${p+d+q+5} ${window.t('periodo-plural')} (ARIMA(${p},${d},${q})).`, 'err'); return;
        }
        res = await analyze('arima', { p, d, q, futureN }, { values, labels });
      } else if (stCurrentModel === 'garch') {
        if (values.length < 10) { showToast(window.t('toast-min10-garch'), 'err'); return; }
        res = await analyze('garch', { futureN }, { values, labels });
      } else {
        const windowSize = parseInt(document.getElementById('st-window').value) || 3;
        res = await analyze('serie', { windowSize, futureN }, { values, labels });
      }
      res.labels = labels;
      res.values = values;
    }
  } catch (e) {
    showToast(window.t('toast-server-err') + e.message, 'err'); return;
  }

  res.labelY = labelY;
  res.labelX = labelX;
  stLastResult = res;

  // Show/hide model-specific result sections
  document.getElementById('st-classic-section').style.display = res.model === 'classic' ? 'block' : 'none';
  document.getElementById('st-arima-section').style.display = res.model === 'arima' ? 'block' : 'none';
  document.getElementById('st-garch-section').style.display = res.model === 'garch' ? 'block' : 'none';
  document.getElementById('st-var-section').style.display = res.model === 'var' ? 'block' : 'none';

  if (res.model === 'classic') stRenderResults(res);
  else if (res.model === 'arima') arimaRenderResults(res);
  else if (res.model === 'garch') garchRenderResults(res);
  else varRenderResults(res);

  document.getElementById('st-results').style.display = 'block';
  document.getElementById('st-btn-save').style.display = 'inline-flex';
  stGenerateAI(res);
  showToast(window.t('toast-done-ts'), 'ok');
}

// ─── RENDER: DECOMPOSIÇÃO CLÁSSICA ───────────────────────────────────────────

function stRenderResults(res) {
  const { n, ym, stdev, cv, maxVal, minVal, maxIdx, minIdx, avgGrowth, b1,
    labels, values, projValues, projTrend, futureN } = res;

  document.getElementById('st-main-chart-title').textContent = window.t('ts-main');
  document.getElementById('st-metrics').innerHTML = `
    <div class="metric"><div class="metric-val metric-y">${ym.toFixed(2)}</div><div class="metric-lab">${window.t('ts-mean-lbl')}</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--x)">${stdev.toFixed(2)}</div><div class="metric-lab">${window.t('ts-stddev-lbl')}</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--y)">${cv.toFixed(1)}%</div><div class="metric-lab">CV (%)</div></div>
    <div class="metric"><div class="metric-val" style="color:${b1 >= 0 ? 'var(--y)' : 'var(--acc)'}">${b1 >= 0 ? '↑' : '↓'} ${Math.abs(b1).toFixed(3)}</div><div class="metric-lab">${window.t('ts-trend-period')}</div></div>
    <div class="metric"><div class="metric-val" style="color:${avgGrowth >= 0 ? 'var(--y)' : 'var(--acc)'}">${avgGrowth >= 0 ? '+' : ''}${avgGrowth.toFixed(1)}%</div><div class="metric-lab">${window.t('ts-avg-growth')}</div></div>
    <div class="metric"><div class="metric-val metric-y">${maxVal.toFixed(2)}</div><div class="metric-lab">${window.t('ts-best-lbl')} ${esc(labels[maxIdx] || String(maxIdx + 1))}</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--acc)">${minVal.toFixed(2)}</div><div class="metric-lab">${window.t('ts-worst-lbl')} ${esc(labels[minIdx] || String(minIdx + 1))}</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--txt2)">${n}</div><div class="metric-lab">n</div></div>
  `;

  const projLabels = Array.from({ length: futureN }, (_, i) => `+${i + 1}`);
  const allLabels = [...labels, ...projLabels];

  stDestroyChart('main');
  STC.main = createTimeSeriesMain('st-chart-main', res, allLabels);
  stDestroyChart('trend');
  STC.trend = createTrendChart('st-chart-trend', labels, res.trend);
  stDestroyChart('season');
  STC.season = createSeasonChart('st-chart-season', labels, res.seasonal);
  stDestroyChart('resid');
  STC.resid = createTSResidChart('st-chart-resid', labels, res.residual);
  stDestroyChart('vol');
  STC.vol = createVolatilityChart('st-chart-vol', labels, res.volatility);

  const projRows = projValues.map((v, i) => `<tr>
    <td>${projLabels[i]}</td>
    <td style="color:var(--y);font-weight:600">${v.toFixed(4)}</td>
    <td style="color:var(--txt3)">${projTrend[i].toFixed(4)}</td>
    <td style="color:${v >= ym ? 'var(--y)' : 'var(--acc)'}">${v >= ym ? '↑' : '↓'} ${((v - ym) / Math.abs(ym) * 100).toFixed(1)}%</td>
  </tr>`).join('');
  document.getElementById('st-proj-tbl').innerHTML = `
    <table class="data-table">
      <thead><tr><th>${window.t('ts-period-lbl')}</th><th>${window.t('ts-projection-lbl')}</th><th>${window.t('ts-trend-only')}</th><th>${window.t('ts-vs-mean')}</th></tr></thead>
      <tbody>${projRows}</tbody>
    </table>`;
}

// ─── RENDER: ARIMA ────────────────────────────────────────────────────────────

function arimaRenderResults(res) {
  const { p, d, q, phi, theta, sigma, aic, bic, n, ym, stdev, cv,
    labels, forecastY, ciLower, ciUpper, futureN, resid,
    maxVal, minVal, maxIdx, minIdx, acfResid, pacfResid, ljungBoxQ, lbLags } = res;

  document.getElementById('st-main-chart-title').textContent =
    `📈 ARIMA(${p},${d},${q}) — Série, Valores Ajustados e Previsão com IC 95%`;

  const badge = (v, lbl, col = 'var(--y)') =>
    `<div class="metric"><div class="metric-val" style="color:${col}">${v}</div><div class="metric-lab">${lbl}</div></div>`;
  const phiStr = phi.map((v, i) => `φ${i + 1}=${v.toFixed(3)}`).join(', ') || '—';
  const thetaStr = theta.map((v, i) => `θ${i + 1}=${v.toFixed(3)}`).join(', ') || '—';
  const qTest = ljungBoxQ > 0 ? (ljungBoxQ > 18.3 ? window.t('ts-autocorr') : window.t('ts-resid-ok')) : '—';

  document.getElementById('st-metrics').innerHTML = `
    ${badge(`ARIMA(${p},${d},${q})`, window.t('ts-model-lbl'))}
    ${badge(sigma.toFixed(4), window.t('ts-se-lbl'))}
    ${badge(aic.toFixed(2), 'AIC')}
    ${badge(bic.toFixed(2), 'BIC')}
    ${badge(cv.toFixed(1) + '%', 'CV (série)', cv >= 30 ? 'var(--acc)' : cv >= 15 ? 'var(--y)' : 'var(--y)')}
    ${badge(ljungBoxQ.toFixed(2), `Q(${lbLags}) Ljung-Box`, ljungBoxQ > 18.3 ? 'var(--acc)' : 'var(--y)')}
    <div class="metric" style="grid-column:1/-1">
      <span style="font-size:11px;color:var(--txt3)">AR: ${esc(phiStr)} &nbsp;|&nbsp; MA: ${esc(thetaStr)} &nbsp;|&nbsp; ${qTest}</span>
    </div>
  `;

  const projLabels = Array.from({ length: futureN }, (_, i) => `+${i + 1}`);
  stDestroyChart('main');
  STC.main = createARIMAMainChart('st-chart-main', res, [...labels, ...projLabels]);

  const confBand = resid.length > 0 ? 1.96 / Math.sqrt(resid.length) : 0.3;
  stDestroyChart('arima-acf');
  STC['arima-acf'] = createACFChart('st-chart-arima-acf', acfResid, confBand);
  stDestroyChart('arima-pacf');
  STC['arima-pacf'] = createACFChart('st-chart-arima-pacf', pacfResid, confBand);

  const projRows = forecastY.map((v, i) => `<tr>
    <td>${projLabels[i]}</td>
    <td style="color:var(--y);font-weight:600">${v.toFixed(4)}</td>
    <td style="color:var(--txt3)">${ciLower[i].toFixed(4)}</td>
    <td style="color:var(--txt3)">${ciUpper[i].toFixed(4)}</td>
    <td style="color:var(--y)">${(ciUpper[i] - ciLower[i]).toFixed(4)}</td>
  </tr>`).join('');
  document.getElementById('st-proj-tbl').innerHTML = `
    <table class="data-table">
      <thead><tr><th>Período</th><th>Previsão</th><th>IC 95% Inf</th><th>IC 95% Sup</th><th>Amplitude IC</th></tr></thead>
      <tbody>${projRows}</tbody>
    </table>`;
}

// ─── RENDER: GARCH ────────────────────────────────────────────────────────────

function garchRenderResults(res) {
  const { omega, alpha, beta, persistence, halfLife, h, sigma,
    labels, values, futureN, ciLower, ciUpper, n, mu,
    aic, bic, acfZ2, sigmaForecast, uncondVar } = res;

  document.getElementById('st-main-chart-title').textContent =
    '📈 GARCH(1,1) — Série com Bandas de Volatilidade Condicional e Previsão';

  const fmt = (v, dp = 4) => isFinite(v) ? Number(v).toFixed(dp) : '∞';
  const badge = (v, lbl, col = 'var(--y)') =>
    `<div class="metric"><div class="metric-val" style="color:${col}">${v}</div><div class="metric-lab">${lbl}</div></div>`;
  const persColor = persistence > 0.95 ? 'var(--acc)' : persistence > 0.85 ? 'var(--y)' : 'var(--y)';

  document.getElementById('st-metrics').innerHTML = `
    ${badge('GARCH(1,1)', 'Modelo')}
    ${badge(fmt(omega, 6), 'ω (constante)')}
    ${badge(fmt(alpha), 'α (efeito ARCH)', alpha > 0.3 ? 'var(--acc)' : 'var(--y)')}
    ${badge(fmt(beta), 'β (efeito GARCH)', beta > 0.9 ? 'var(--y)' : 'var(--y)')}
    ${badge(fmt(persistence), 'α+β (persistência)', persColor)}
    ${badge(fmt(halfLife, 1) + ' per.', 'Meia-vida do choque')}
    ${badge(fmt(Math.sqrt(uncondVar)), 'σ incondicional')}
    ${badge(aic.toFixed(2), 'AIC')}
  `;

  const projLabels = Array.from({ length: futureN }, (_, i) => `+${i + 1}`);
  stDestroyChart('main');
  STC.main = createGARCHMainChart('st-chart-main', res, [...labels, ...projLabels]);

  stDestroyChart('garch-var');
  STC['garch-var'] = createGARCHVarChart('st-chart-garch-var', labels, h);

  const confBand = n > 0 ? 1.96 / Math.sqrt(n) : 0.3;
  stDestroyChart('garch-acf');
  STC['garch-acf'] = createACFChart('st-chart-garch-acf', acfZ2, confBand);

  const projRows = sigmaForecast.map((s, i) => `<tr>
    <td>${projLabels[i]}</td>
    <td style="color:var(--y);font-weight:600">${mu.toFixed(4)}</td>
    <td style="color:var(--txt3)">${ciLower[i].toFixed(4)}</td>
    <td style="color:var(--txt3)">${ciUpper[i].toFixed(4)}</td>
    <td style="color:var(--y)">${s.toFixed(4)}</td>
  </tr>`).join('');
  document.getElementById('st-proj-tbl').innerHTML = `
    <table class="data-table">
      <thead><tr><th>Período</th><th>Nível esperado</th><th>IC 95% Inf</th><th>IC 95% Sup</th><th>σ_t previsto</th></tr></thead>
      <tbody>${projRows}</tbody>
    </table>`;
}

// ─── RENDER: VAR ─────────────────────────────────────────────────────────────

function varRenderResults(res) {
  const { k, p, T, nObs, labelsList, futureN, matrix, forecast, Phi,
    aic, bic, granger, ymArr, sdArr, varNames: vn } = res;

  document.getElementById('st-main-chart-title').textContent =
    `📈 VAR(${p}) — Séries Multivariadas + Previsão`;

  const fmt = (v, dp = 4) => isFinite(v) ? Number(v).toFixed(dp) : '—';
  const badge = (v, lbl, col = 'var(--y)') =>
    `<div class="metric"><div class="metric-val" style="color:${col}">${v}</div><div class="metric-lab">${lbl}</div></div>`;

  document.getElementById('st-metrics').innerHTML =
    `${badge(`VAR(${p})`, 'Modelo')}
     ${badge(k, 'Variáveis')}
     ${badge(T, 'Observações')}
     ${badge(nObs, 'Obs. efetivas')}
     ${badge(fmt(aic, 2), 'AIC')}
     ${badge(fmt(bic, 2), 'BIC')}` +
    vn.map((n, j) => badge(fmt(ymArr[j], 2), `Média — ${n}`)).join('') +
    vn.map((n, j) => badge(fmt(sdArr[j], 2), `DP — ${n}`)).join('');

  stDestroyChart('main');
  STC.main = createVARMainChart('st-chart-main', matrix, labelsList, forecast, futureN, vn);

  // IRF grid: k×k charts — destroy old, build new canvases
  const irfContainer = document.getElementById('st-var-irf-grid');
  Object.keys(STC).filter(id => id.startsWith('var-irf-')).forEach(id => {
    stDestroyChart(id); delete STC[id];
  });
  irfContainer.innerHTML = '';
  const H = Phi.length - 1;
  for (let imp = 0; imp < k; imp++) {
    for (let resp = 0; resp < k; resp++) {
      const id = `var-irf-${imp}-${resp}`;
      const irf = Array.from({ length: H + 1 }, (_, h) => Phi[h][resp][imp]);
      const card = document.createElement('div');
      card.className = 'diag-card';
      card.innerHTML = `<div class="diag-title" style="font-size:10px">Impulso: <b>${vn[imp]}</b> → Resposta: <b>${vn[resp]}</b></div>
        <div class="diag-chart-wrap"><canvas id="${id}"></canvas></div>`;
      irfContainer.appendChild(card);
      requestAnimationFrame(() => {
        STC[id] = createIRFChart(id, irf);
      });
    }
  }

  // Granger causality table
  const gRows = granger.map(g => `<tr>
    <td><b>${vn[g.from]}</b></td>
    <td>${vn[g.to]}</td>
    <td style="font-family:monospace">${isNaN(g.fStat) ? '—' : g.fStat.toFixed(3)}</td>
    <td style="font-family:monospace">${isNaN(g.pval) ? '—' : g.pval.toFixed(4)}</td>
    <td style="color:var(--y);font-weight:700">${g.sig || '—'}</td>
  </tr>`).join('');
  document.getElementById('st-var-granger-tbl').innerHTML = `
    <table class="data-table">
      <thead><tr><th>Causa (j)</th><th>Efeito (i)</th><th>F-stat</th><th>p-valor*</th><th>Sig.</th></tr></thead>
      <tbody>${gRows}</tbody>
    </table>
    <p style="font-size:10px;color:var(--txt3);margin-top:6px">* aprox. via chi²(p). Sig: *** p&lt;0.01, ** p&lt;0.05, * p&lt;0.10</p>`;

  // Projection table
  const projHeaders = ['Período', ...vn.map(n => n + ' (prev.)')].map(h => `<th>${h}</th>`).join('');
  const projRows = Array.from({ length: futureN }, (_, i) => {
    const cells = forecast[i].map(v => `<td style="color:var(--y);font-weight:600">${fmt(v, 3)}</td>`).join('');
    return `<tr><td>+${i + 1}</td>${cells}</tr>`;
  }).join('');
  document.getElementById('st-proj-tbl').innerHTML = `
    <table class="data-table"><thead><tr>${projHeaders}</tr></thead><tbody>${projRows}</tbody></table>`;
}

// ─── AI ──────────────────────────────────────────────────────────────────────

async function stGenerateAI(res) {
  const box = document.getElementById('st-ai-box');
  box.innerHTML = aiLoadingHTML();

  const isEn = (localStorage.getItem('slope-lang') || 'pt') === 'en';
  let prompt, fallback;
  if (res.model === 'arima') {
    const phiStr = res.phi.map((v, i) => `φ${i + 1}=${v.toFixed(3)}`).join(', ') || (isEn ? 'none' : 'nenhum');
    const thetaStr = res.theta.map((v, i) => `θ${i + 1}=${v.toFixed(3)}`).join(', ') || (isEn ? 'none' : 'nenhum');
    const statsArima = `Series: ${esc(res.labelY)} | Period: ${esc(res.labelX)}\nFitted model: ARIMA(${res.p},${res.d},${res.q}) | n = ${res.n}\nAR params: ${esc(phiStr)}\nMA params: ${esc(thetaStr)}\nσ = ${res.sigma.toFixed(4)} | AIC = ${res.aic.toFixed(2)} | BIC = ${res.bic.toFixed(2)}\nLjung-Box Q(${res.lbLags}) = ${res.ljungBoxQ.toFixed(2)} (critical ~18.3 at α=5%)\nForecast next ${res.futureN} periods: ${res.forecastY.map(v => v.toFixed(2)).join(', ')}\n95% CI 1st period: [${res.ciLower[0].toFixed(2)}, ${res.ciUpper[0].toFixed(2)}]`;
    prompt = isEn
      ? `You are a time series econometrics expert. Analyze in English (3-4 short paragraphs):\n\n${statsArima}\n\nInclude: 1) fit quality and residual diagnostics 2) interpretation of AR and MA parameters 3) forecast assessment and uncertainty 4) when to use ARIMA vs other models.`
      : `Você é especialista em econometria e séries temporais. Analise em português (3-4 parágrafos curtos):\n\nSérie: ${esc(res.labelY)} | Período: ${esc(res.labelX)}\nModelo ajustado: ARIMA(${res.p},${res.d},${res.q}) | n = ${res.n}\nParâmetros AR: ${esc(phiStr)}\nParâmetros MA: ${esc(thetaStr)}\nσ = ${res.sigma.toFixed(4)} | AIC = ${res.aic.toFixed(2)} | BIC = ${res.bic.toFixed(2)}\nLjung-Box Q(${res.lbLags}) = ${res.ljungBoxQ.toFixed(2)} (crítico ~18.3 para α=5%)\nPrevisão próx. ${res.futureN} períodos: ${res.forecastY.map(v => v.toFixed(2)).join(', ')}\nIC 95% 1° período: [${res.ciLower[0].toFixed(2)}, ${res.ciUpper[0].toFixed(2)}]\n\nInclua: 1) qualidade do ajuste e diagnóstico dos resíduos 2) interpretação dos parâmetros AR e MA 3) avaliação das previsões e incerteza 4) quando usar ARIMA vs outros modelos.`;
    fallback = `ARIMA(${res.p},${res.d},${res.q}): σ=${res.sigma.toFixed(3)}, AIC=${res.aic.toFixed(1)}, Q(${res.lbLags})=${res.ljungBoxQ.toFixed(2)}.`;
  } else if (res.model === 'garch') {
    const hl = isFinite(res.halfLife) ? res.halfLife.toFixed(1) : '> 100';
    const statsGarch = `Series: ${esc(res.labelY)} | Period: ${esc(res.labelX)}\nFitted model: GARCH(1,1) | n = ${res.n}\nω = ${res.omega.toFixed(6)}, α = ${res.alpha.toFixed(4)}, β = ${res.beta.toFixed(4)}\nPersistence (α+β) = ${res.persistence.toFixed(4)} | Half-life = ${hl} periods\nUnconditional σ (long-run) = ${Math.sqrt(res.uncondVar).toFixed(4)}\nAIC = ${res.aic.toFixed(2)} | BIC = ${res.bic.toFixed(2)}\nForecast volatility (next 3 per.): ${res.sigmaForecast.slice(0, 3).map(v => v.toFixed(4)).join(', ')}`;
    prompt = isEn
      ? `You are a quantitative finance and volatility modeling expert. Analyze in English (3-4 short paragraphs):\n\n${statsGarch}\n\nInclude: 1) volatility clustering and what persistence implies 2) interpretation of α (shock impact) and β (variance memory) 3) outlook for future volatility 4) when to use GARCH vs ARIMA.`
      : `Você é especialista em finanças quantitativas e modelos de volatilidade. Analise em português (3-4 parágrafos curtos):\n\nSérie: ${esc(res.labelY)} | Período: ${esc(res.labelX)}\nModelo ajustado: GARCH(1,1) | n = ${res.n}\nω = ${res.omega.toFixed(6)}, α = ${res.alpha.toFixed(4)}, β = ${res.beta.toFixed(4)}\nPersistência (α+β) = ${res.persistence.toFixed(4)} | Meia-vida = ${hl} períodos\nσ incondicional (longo prazo) = ${Math.sqrt(res.uncondVar).toFixed(4)}\nAIC = ${res.aic.toFixed(2)} | BIC = ${res.bic.toFixed(2)}\nVolatilidade prevista (próx. 3 per.): ${res.sigmaForecast.slice(0, 3).map(v => v.toFixed(4)).join(', ')}\n\nInclua: 1) clustering de volatilidade e o que a persistência implica 2) interpretação de α (impacto de choques) e β (memória da variância) 3) perspectiva de volatilidade futura 4) quando usar GARCH vs ARIMA.`;
    fallback = `GARCH(1,1): α=${res.alpha.toFixed(3)}, β=${res.beta.toFixed(3)}, ${isEn ? 'persistence' : 'persistência'}=${res.persistence.toFixed(3)}, ${isEn ? 'half-life' : 'meia-vida'}=${hl} ${isEn ? 'periods' : 'períodos'}.`;
  } else if (res.model === 'var') {
    const grangerSig = res.granger.filter(g => g.sig).map(g =>
      `${res.varNames[g.from]} → ${res.varNames[g.to]} (F=${g.fStat.toFixed(2)}, ${g.sig})`
    ).join('; ') || (isEn ? 'no significant relationship' : 'nenhuma relação significativa');
    const statsVar = `Model: VAR(${res.p}) with ${res.k} variables | T = ${res.T} | Effective obs. = ${res.nObs}\nVariables: ${res.varNames.join(', ')}\nMeans: ${res.ymArr.map((v, i) => `${res.varNames[i]}=${v.toFixed(2)}`).join(', ')}\nAIC = ${res.aic.toFixed(3)} | BIC = ${res.bic.toFixed(3)}\nSignificant Granger causality: ${esc(grangerSig)}\nForecast next ${res.futureN} periods (last): ${res.forecast[res.futureN - 1].map((v, i) => `${res.varNames[i]}=${v.toFixed(2)}`).join(', ')}`;
    prompt = isEn
      ? `You are an econometrics and VAR model expert. Analyze in English (3-4 short paragraphs):\n\n${statsVar}\n\nInclude: 1) dynamics of variable relationships and Granger causality 2) expected IRF and shock persistence 3) fit quality and VAR limitations 4) when to use VAR vs univariate models.`
      : `Você é especialista em econometria e modelos VAR. Analise em português (3-4 parágrafos curtos):\n\nModelo: VAR(${res.p}) com ${res.k} variáveis | T = ${res.T} | Obs. efetivas = ${res.nObs}\nVariáveis: ${res.varNames.join(', ')}\nMédias: ${res.ymArr.map((v, i) => `${res.varNames[i]}=${v.toFixed(2)}`).join(', ')}\nAIC = ${res.aic.toFixed(3)} | BIC = ${res.bic.toFixed(3)}\nCausalidade de Granger significativa: ${esc(grangerSig)}\nPrevisão próx. ${res.futureN} períodos (última): ${res.forecast[res.futureN - 1].map((v, i) => `${res.varNames[i]}=${v.toFixed(2)}`).join(', ')}\n\nInclua: 1) dinâmica das relações entre variáveis e Granger-causalidade 2) IRF esperado e persistência dos choques 3) qualidade do ajuste e limitações do VAR 4) quando usar VAR vs modelos univariados.`;
    fallback = `VAR(${res.p}), ${res.k} ${isEn ? 'variables' : 'variáveis'}. AIC=${res.aic.toFixed(2)}, BIC=${res.bic.toFixed(2)}. ${isEn ? 'Causality' : 'Causalidade'}: ${grangerSig}.`;
  } else {
    const statsClassic = `Series: ${esc(res.labelY)} | Period: ${esc(res.labelX)}\nn = ${res.n} periods\nTrend: b₀=${res.b0.toFixed(4)}, b₁=${res.b1.toFixed(4)} per period\nMean=${res.ym.toFixed(4)}, SD=${res.stdev.toFixed(4)}, CV=${res.cv.toFixed(1)}%\nAvg growth=${res.avgGrowth.toFixed(2)}% per period\nBest: ${esc(res.labels[res.maxIdx] || String(res.maxIdx + 1))} (${res.maxVal.toFixed(2)})\nWorst: ${esc(res.labels[res.minIdx] || String(res.minIdx + 1))} (${res.minVal.toFixed(2)})\nProjection next ${res.futureN} periods: ${res.projValues.map(v => v.toFixed(2)).join(', ')}`;
    prompt = isEn
      ? `You are a time series expert. Analyze in English (3-4 short paragraphs):\n\n${statsClassic}\n\nInclude: 1) trend direction and strength 2) seasonal pattern 3) future outlook 4) model limitations.`
      : `Você é especialista em séries temporais. Analise em português (3-4 parágrafos curtos):\n\nSérie: ${esc(res.labelY)} | Período: ${esc(res.labelX)}\nn = ${res.n} períodos\nTendência: b₀=${res.b0.toFixed(4)}, b₁=${res.b1.toFixed(4)} por período\nMédia=${res.ym.toFixed(4)}, DP=${res.stdev.toFixed(4)}, CV=${res.cv.toFixed(1)}%\nCrescimento médio=${res.avgGrowth.toFixed(2)}% por período\nMelhor: ${esc(res.labels[res.maxIdx] || String(res.maxIdx + 1))} (${res.maxVal.toFixed(2)})\nPior: ${esc(res.labels[res.minIdx] || String(res.minIdx + 1))} (${res.minVal.toFixed(2)})\nProjeção próximos ${res.futureN} períodos: ${res.projValues.map(v => v.toFixed(2)).join(', ')}\n\nInclua: 1) direção e força da tendência 2) padrão sazonal 3) perspectivas futuras 4) limitações do modelo.`;
    fallback = `${isEn ? 'Trend' : 'Tendência'}: ${res.b1 >= 0 ? (isEn ? 'upward' : 'crescente') : (isEn ? 'downward' : 'decrescente')} (${res.b1.toFixed(3)}/${isEn ? 'period' : 'período'}). ${isEn ? 'Avg growth' : 'Cresc. médio'}: ${res.avgGrowth.toFixed(1)}%. ${isEn ? 'Next projection' : 'Próx. projeção'}: ${res.projValues[0]?.toFixed(2) ?? '—'}.`;
  }

  try {
    const text = await callAI(prompt);
    box.innerHTML = aiResultHTML(text);
  } catch (e) {
    box.innerHTML = aiFallbackHTML(fallback);
  }
}

// ─── SAVE / LOAD ──────────────────────────────────────────────────────────────

export async function stSaveAnalysis() {
  if (!stLastResult) { showToast(window.t('toast-run-first'), 'err'); return; }
  document.getElementById('st-cloud-saving').style.display = 'flex';
  try {
    const res = stLastResult;
    let base;
    if (res.model === 'var') {
      base = {
        modelo: res.model, labelX: res.labelX, labelY: res.labelY, futureN: res.futureN,
        n: res.T, k: res.k, p: res.p, varNames: res.varNames,
        aic: res.aic, bic: res.bic,
        ymArr: res.ymArr, sdArr: res.sdArr,
        matrix: res.matrix, labelsList: res.labelsList, forecast: res.forecast,
      };
    } else {
      base = {
        modelo: res.model, labelX: res.labelX, labelY: res.labelY,
        n: res.n, ym: res.ym, stdev: res.stdev, cv: res.cv,
        labels: res.labels, values: res.values, futureN: res.futureN,
      };
      if (res.model === 'classic') {
        Object.assign(base, { b0: res.b0, b1: res.b1, avgGrowth: res.avgGrowth,
          maxVal: res.maxVal, minVal: res.minVal, maxIdx: res.maxIdx, minIdx: res.minIdx,
          windowSize: res.windowSize, projValues: res.projValues });
      } else if (res.model === 'arima') {
        Object.assign(base, { p: res.p, d: res.d, q: res.q,
          phi: res.phi, theta: res.theta, sigma: res.sigma,
          aic: res.aic, bic: res.bic,
          forecastY: res.forecastY, ciLower: res.ciLower, ciUpper: res.ciUpper });
      } else if (res.model === 'garch') {
        Object.assign(base, { omega: res.omega, alpha: res.alpha, beta: res.beta,
          persistence: res.persistence, halfLife: res.halfLife,
          aic: res.aic, bic: res.bic,
          ciLower: res.ciLower, ciUpper: res.ciUpper });
      }
    }
    await saveAnalysisRequest({
      nome: document.getElementById('st-analysis-name').value || 'Série Temporal',
      tipo: 'serie',
      dados: base,
    });
    showToast(window.t('toast-saved-ts'), 'ok');
    await loadHistory();
    await updateProfileStats();
  } catch (err) {
    showToast(window.t('toast-save-err') + (err.message || err), 'err');
  } finally {
    document.getElementById('st-cloud-saving').style.display = 'none';
  }
}

export async function loadSerieAnalysis(a) {
  const d = a.dados || {};
  switchTab('serie', document.querySelector('.tab-btn[onclick*="serie"]'));
  await new Promise(r => setTimeout(r, 100));
  document.getElementById('st-analysis-name').value = a.nome || '';
  document.getElementById('st-label-y').value = d.labelY || 'Valor';
  document.getElementById('st-label-x').value = d.labelX || 'Período';
  if (d.futureN) document.getElementById('st-future').value = d.futureN;

  if (d.modelo === 'var') {
    stSetModel('var');
    await new Promise(r => setTimeout(r, 50));
    if (d.k && d.k >= 2) {
      varK = d.k;
      if (d.varNames?.length) {
        d.varNames.forEach((n, i) => { varNames[i] = n; });
      }
    }
    if (d.p !== undefined) document.getElementById('st-var-p').value = d.p;
    if (d.labelsList?.length && d.matrix?.length) {
      const gtc = varGTC();
      const rowsEl = document.getElementById('var-data-rows');
      rowsEl.innerHTML = '';
      d.labelsList.forEach((lbl, i) => {
        varAddRowInternal(gtc, i + 1, lbl, d.matrix[i]);
      });
      for (let i = d.labelsList.length; i < 12; i++) varAddRowInternal(gtc, i + 1);
    }
    varRebuildTable();
    varUpdateVarCountDisplay();
  } else if (d.modelo === 'arima') {
    stSetModel('arima');
    if (d.p !== undefined) document.getElementById('st-arima-p').value = d.p;
    if (d.d !== undefined) document.getElementById('st-arima-d').value = d.d;
    if (d.q !== undefined) document.getElementById('st-arima-q').value = d.q;
    if (d.labels?.length) {
      document.getElementById('st-data-rows').innerHTML = '';
      d.labels.forEach((lbl, i) => {
        stAddRow();
        const rows = document.getElementById('st-data-rows').children;
        const last = rows[rows.length - 1];
        last.querySelectorAll('input')[0].value = lbl;
        last.querySelectorAll('input')[1].value = d.values[i];
      });
      for (let i = d.labels.length; i < 12; i++) stAddRow();
      stUpdateCount();
    }
  } else if (d.modelo === 'garch') {
    stSetModel('garch');
    if (d.labels?.length) {
      document.getElementById('st-data-rows').innerHTML = '';
      d.labels.forEach((lbl, i) => {
        stAddRow();
        const rows = document.getElementById('st-data-rows').children;
        const last = rows[rows.length - 1];
        last.querySelectorAll('input')[0].value = lbl;
        last.querySelectorAll('input')[1].value = d.values[i];
      });
      for (let i = d.labels.length; i < 12; i++) stAddRow();
      stUpdateCount();
    }
  } else {
    stSetModel('classic');
    if (d.windowSize) document.getElementById('st-window').value = d.windowSize;
    if (d.labels?.length) {
      document.getElementById('st-data-rows').innerHTML = '';
      d.labels.forEach((lbl, i) => {
        stAddRow();
        const rows = document.getElementById('st-data-rows').children;
        const last = rows[rows.length - 1];
        last.querySelectorAll('input')[0].value = lbl;
        last.querySelectorAll('input')[1].value = d.values[i];
      });
      for (let i = d.labels.length; i < 12; i++) stAddRow();
      stUpdateCount();
    }
  }

  // Render saved results if available
  const hasResults = d.modelo === 'classic' ? d.b0 !== undefined
    : d.modelo === 'arima' ? d.phi !== undefined
    : d.modelo === 'garch' ? d.omega !== undefined
    : d.modelo === 'var' ? d.aic !== undefined
    : false;

  if (hasResults) {
    const res = { ...d, model: d.modelo, labelX: d.labelX || 'Período', labelY: d.labelY || 'Valor' };
    stLastResult = res;
    document.getElementById('st-classic-section').style.display = d.modelo === 'classic' ? 'block' : 'none';
    document.getElementById('st-arima-section').style.display  = d.modelo === 'arima'   ? 'block' : 'none';
    document.getElementById('st-garch-section').style.display  = d.modelo === 'garch'   ? 'block' : 'none';
    document.getElementById('st-var-section').style.display    = d.modelo === 'var'     ? 'block' : 'none';
    if (d.modelo === 'classic')    stRenderResults(res);
    else if (d.modelo === 'arima') arimaRenderResults(res);
    else if (d.modelo === 'garch') garchRenderResults(res);
    else if (d.modelo === 'var')   varRenderResults(res);
    document.getElementById('st-results').style.display = 'block';
    document.getElementById('st-btn-save').style.display = 'inline-flex';
  }

  showToast(window.t('toast-loaded-ts'), 'info');
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────

export function stExportExcel() {
  if (!stLastResult) return;
  const res = stLastResult;
  const name = document.getElementById('st-analysis-name').value || 'Serie Temporal';
  const wb = XLSX.utils.book_new();

  // ── RAW DATA sheet (model-aware) ──
  let rawHeaders, rawRows;
  if (res.model === 'arima') {
    rawHeaders = [cell('ID', S.hDark), cell('Período', S.hBlue), cell('Real', S.hGreen),
      cell('Ajustado', S.hTeal), cell('Resíduo', S.hOrange), cell('Modelo', S.hGray)];
    rawRows = res.values.map((v, i) => {
      const fit = res.fittedOrig[i];
      const z = zebra(i);
      return [cell(i + 1, z ? S.even : S.odd), cell(res.labels[i], z ? S.evenL : S.oddL),
        cell(v, z ? S.num4 : S.num4Odd), cell(isNaN(fit) ? '' : fit, z ? S.num4 : S.num4Odd),
        cell(isNaN(fit) ? '' : v - fit, z ? S.num4 : S.num4Odd), cell(`ARIMA(${res.p},${res.d},${res.q})`, z ? S.evenL : S.oddL)];
    });
  } else if (res.model === 'garch') {
    rawHeaders = [cell('ID', S.hDark), cell('Período', S.hBlue), cell('Real', S.hGreen),
      cell('σ_t', S.hTeal), cell('ε²_t', S.hOrange), cell('z_t', S.hGray)];
    rawRows = res.values.map((v, i) => {
      const z = zebra(i);
      return [cell(i + 1, z ? S.even : S.odd), cell(res.labels[i], z ? S.evenL : S.oddL),
        cell(v, z ? S.num4 : S.num4Odd), cell(res.sigma[i], z ? S.num4 : S.num4Odd),
        cell(res.eps2[i], z ? S.num4 : S.num4Odd), cell(res.zStd[i], z ? S.num4 : S.num4Odd)];
    });
  } else if (res.model === 'var') {
    const vn = res.varNames;
    rawHeaders = [cell('ID', S.hDark), cell('Período', S.hBlue),
      ...vn.map(n => cell(n, S.hGreen)),
      ...vn.map(n => cell(n + ' Prev.', S.hTeal))];
    rawRows = res.labelsList.map((lbl, i) => {
      const z = zebra(i);
      return [cell(i + 1, z ? S.even : S.odd), cell(lbl, z ? S.evenL : S.oddL),
        ...res.matrix[i].map(v => cell(v, z ? S.num4 : S.num4Odd)),
        ...vn.map(() => cell('', z ? S.even : S.odd))];
    });
    res.forecast.forEach((row, i) => {
      const z = zebra(res.labelsList.length + i);
      rawRows.push([cell('', z ? S.even : S.odd), cell(`+${i + 1}`, z ? S.evenL : S.oddL),
        ...vn.map(() => cell('', z ? S.even : S.odd)),
        ...row.map(v => cell(v, z ? S.num4 : S.num4Odd))]);
    });
  } else {
    rawHeaders = [cell('ID', S.hDark), cell('Período', S.hBlue), cell('Real', S.hGreen),
      cell('Tendência', S.hTeal), cell('Sazonalidade', S.hOrange), cell('Resíduo', S.hGray)];
    rawRows = res.values.map((v, i) => {
      const z = zebra(i);
      return [cell(i + 1, z ? S.even : S.odd), cell(res.labels[i], z ? S.evenL : S.oddL),
        cell(v, z ? S.num4 : S.num4Odd), cell(res.trend[i], z ? S.num4 : S.num4Odd),
        cell(res.seasonal[i], z ? S.num4 : S.num4Odd),
        cell(res.residual[i], Math.abs(res.residual[i]) > 2 * res.stdev ? S.warn : (z ? S.num4 : S.num4Odd))];
    });
  }
  const rawColCount = rawHeaders.length - 1;
  const rawColWidths = res.model === 'var'
    ? [6, 16, ...Array(rawHeaders.length - 2).fill(12)]
    : [6, 16, 12, 12, 14, 12];
  const rawWS = buildWS([
    [cell(`📊 RAW DATA — ${name} [${res.model.toUpperCase()}]`, S.title)],
    rawHeaders,
    ...rawRows,
  ], rawColWidths);
  mergeRange(rawWS, 0, 0, 0, rawColCount);
  if (res.model !== 'var') autoFilter(rawWS, 5, res.values.length + 1);
  XLSX.utils.book_append_sheet(wb, rawWS, 'RAW_DATA');

  // ── FORECAST sheet ──
  const projLabels = Array.from({ length: res.futureN }, (_, i) => `+${i + 1}`);
  let fcWS;
  if (res.model === 'var') {
    const vn = res.varNames;
    const fcH = [cell('Período', S.hBlue), ...vn.map(n => cell(n, S.hGreen))];
    const fcR = res.forecast.map((row, i) => {
      const z = zebra(i);
      return [cell(projLabels[i], z ? S.even : S.odd), ...row.map(v => cell(v, z ? S.num4 : S.num4Odd))];
    });
    const colW = [16, ...vn.map(() => 14)];
    fcWS = buildWS([[cell(`🔮 FORECAST — ${name}`, S.title)], fcH, ...fcR], colW);
    mergeRange(fcWS, 0, 0, 0, vn.length);
  } else {
    const isForecast = res.model !== 'classic';
    const fcValues = res.model === 'classic' ? res.projValues : res.model === 'arima' ? res.forecastY : Array.from({ length: res.futureN }, () => res.mu);
    const ciL = res.ciLower;
    const ciU = res.ciUpper;
    const fcHeaders = isForecast
      ? [cell('Período', S.hBlue), cell('Previsão', S.hGreen), cell('IC 95% Inf', S.hTeal), cell('IC 95% Sup', S.hOrange), cell('Amplitude IC', S.hGray)]
      : [cell('Período', S.hBlue), cell('Projeção', S.hGreen), cell('Só tendência', S.hTeal), cell('vs Média %', S.hOrange)];
    const fcRows = fcValues.map((v, i) => {
      const z = zebra(i);
      if (isForecast) {
        return [cell(projLabels[i], z ? S.even : S.odd), cell(v, z ? S.num4 : S.num4Odd),
          cell(ciL[i], z ? S.num4 : S.num4Odd), cell(ciU[i], z ? S.num4 : S.num4Odd),
          cell(ciU[i] - ciL[i], z ? S.num4 : S.num4Odd)];
      } else {
        const varPct = res.ym !== 0 ? (v - res.ym) / Math.abs(res.ym) * 100 : '';
        return [cell(projLabels[i], z ? S.even : S.odd), cell(v, z ? S.num4 : S.num4Odd),
          cell(res.projTrend[i], z ? S.num4 : S.num4Odd),
          cell(varPct, { ...(varPct >= 0 ? S.good : S.warn), numFmt: '0.00' })];
      }
    });
    fcWS = buildWS([[cell(`🔮 FORECAST — ${name}`, S.title)], fcHeaders, ...fcRows], [16, 14, 14, 14, 14]);
    mergeRange(fcWS, 0, 0, 0, 4);
  }
  XLSX.utils.book_append_sheet(wb, fcWS, 'FORECAST');

  // ── KPI sheet ──
  const kpiRows = [{ section: `📌 ${res.model.toUpperCase()}` }, { label: '🏷️ Nome', value: name }];
  if (res.model === 'arima') {
    kpiRows.push(
      { label: '📐 Ordem', value: `ARIMA(${res.p},${res.d},${res.q})` },
      { section: '📊 PARÂMETROS' },
      ...res.phi.map((v, i) => ({ label: `φ${i + 1}`, value: v.toFixed(4) })),
      ...res.theta.map((v, i) => ({ label: `θ${i + 1}`, value: v.toFixed(4) })),
      { section: '📈 QUALIDADE' },
      { label: 'σ', value: res.sigma.toFixed(4) },
      { label: 'AIC', value: res.aic.toFixed(2) },
      { label: 'BIC', value: res.bic.toFixed(2) },
      { label: `Q(${res.lbLags}) Ljung-Box`, value: res.ljungBoxQ.toFixed(2), note: res.ljungBoxQ > 18.3 ? '⚠️ Autocorrelação' : '✅ OK', good: res.ljungBoxQ <= 18.3 },
    );
  } else if (res.model === 'garch') {
    const hl = isFinite(res.halfLife) ? res.halfLife.toFixed(1) : '∞';
    kpiRows.push(
      { section: '📊 PARÂMETROS GARCH(1,1)' },
      { label: 'ω (constante)', value: res.omega.toFixed(6) },
      { label: 'α (ARCH)', value: res.alpha.toFixed(4) },
      { label: 'β (GARCH)', value: res.beta.toFixed(4) },
      { section: '📈 DINÂMICA' },
      { label: 'Persistência (α+β)', value: res.persistence.toFixed(4), note: res.persistence > 0.95 ? '🔴 Alta' : res.persistence > 0.85 ? '🟡 Moderada' : '🟢 Baixa', good: res.persistence <= 0.95 },
      { label: 'Meia-vida do choque', value: hl + ' períodos' },
      { label: 'σ incondicional', value: Math.sqrt(res.uncondVar).toFixed(4) },
      { label: 'AIC', value: res.aic.toFixed(2) },
    );
  } else if (res.model === 'var') {
    kpiRows.push(
      { label: '🔗 Ordem VAR', value: `VAR(${res.p})` },
      { label: '🔢 Variáveis (k)', value: res.k },
      { label: '🔢 Observações', value: res.T },
      { label: '🔢 Obs. efetivas', value: res.nObs },
      { section: '📊 CRITÉRIOS DE INFORMAÇÃO' },
      { label: 'AIC', value: res.aic.toFixed(4) },
      { label: 'BIC', value: res.bic.toFixed(4) },
      { section: '📈 VARIÁVEIS' },
      ...res.varNames.map((n, j) => ({ label: `Média — ${n}`, value: res.ymArr[j].toFixed(4) })),
      ...res.varNames.map((n, j) => ({ label: `DP — ${n}`, value: res.sdArr[j].toFixed(4) })),
    );
  } else {
    kpiRows.push(
      { label: '🔢 n', value: res.n }, { label: '🔮 Períodos projetados', value: res.futureN },
      { section: '📊 ESTATÍSTICAS' },
      { label: '📈 Média', value: res.ym.toFixed(4) },
      { label: '📉 Desvio Padrão', value: res.stdev.toFixed(4) },
      { label: '📊 CV (%)', value: res.cv.toFixed(1) + '%', note: res.cv >= 30 ? '🔴 Alta volatilidade' : res.cv >= 15 ? '🟡 Moderada' : '🟢 Baixa', good: res.cv < 15 },
      { label: '📈 Tendência β₁', value: res.b1.toFixed(4), note: res.b1 >= 0 ? '↑ Crescente' : '↓ Decrescente' },
      { label: '📊 Cresc. médio (%)', value: res.avgGrowth.toFixed(2) + '%' },
    );
  }
  XLSX.utils.book_append_sheet(wb, buildKPISheet(kpiRows, name), 'MODEL_KPIs');

  XLSX.writeFile(wb, name.replace(/[^a-zA-Z0-9_-]/g, '_') + `_${res.model.toUpperCase()}_BI.xlsx`);
}

window.timeSeriesRerender = () => {
  if (!stLastResult) return;
  const res = stLastResult;
  if (res.model === 'classic') stRenderResults(res);
  else if (res.model === 'arima') arimaRenderResults(res);
  else if (res.model === 'garch') garchRenderResults(res);
  else varRenderResults(res);
};

export function stExportCSV() {
  if (!stLastResult) return;
  const res = stLastResult;
  let header, rows;
  if (res.model === 'arima') {
    header = [res.labelX, res.labelY, 'Ajustado', 'Residuo'];
    rows = res.values.map((v, i) => [res.labels[i], v, isNaN(res.fittedOrig[i]) ? '' : res.fittedOrig[i], isNaN(res.fittedOrig[i]) ? '' : v - res.fittedOrig[i]]);
  } else if (res.model === 'garch') {
    header = [res.labelX, res.labelY, 'sigma_t', 'eps2_t', 'z_t'];
    rows = res.values.map((v, i) => [res.labels[i], v, res.sigma[i], res.eps2[i], res.zStd[i]]);
  } else if (res.model === 'var') {
    header = ['Periodo', ...res.varNames, ...res.varNames.map(n => n + '_prev')];
    rows = [
      ...res.labelsList.map((lbl, i) => [lbl, ...res.matrix[i], ...new Array(res.k).fill('')]),
      ...res.forecast.map((row, i) => [`+${i + 1}`, ...new Array(res.k).fill(''), ...row]),
    ];
  } else {
    header = [res.labelX, res.labelY, 'Tendencia', 'Sazonalidade', 'Residuo'];
    rows = res.values.map((v, i) => [res.labels[i], v, res.trend[i], res.seasonal[i], res.residual[i]]);
  }
  downloadCSV((document.getElementById('st-analysis-name').value || 'serie') + '.csv', header, rows);
}
