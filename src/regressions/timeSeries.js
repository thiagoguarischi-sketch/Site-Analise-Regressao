// Séries temporais — Decomposição Clássica, ARIMA(p,d,q) e GARCH(1,1)

import { mean, sum, esc } from '../core/utils.js';
import { matMul, matT, matInv, matLogDet } from '../core/matrix.js';
import { showToast } from '../ui/notifications.js';
import { saveAnalysisRequest } from '../services/analysisService.js';
import { callAI, aiLoadingHTML, aiResultHTML, aiFallbackHTML } from '../services/authService.js';
import {
  S, cell, zebra, buildWS, autoFilter, mergeRange, downloadCSV,
  buildKPISheet, buildCompSheet, buildDashSheet, buildInsightsSheet,
} from '../services/exportService.js';
import { switchTab } from '../ui/dashboard.js';
import { loadHistory, updateProfileStats } from '../ui/tables.js';
import { registerChart } from '../charts/baseChart.js';
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
  document.getElementById('st-data-count').textContent = `${values.length} período${values.length !== 1 ? 's' : ''}`;
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
  const examples = [
    { name: 'Vendas Mensais', ly: 'Vendas (R$k)', lx: 'Mês',
      labels: ['Jan/23','Fev/23','Mar/23','Abr/23','Mai/23','Jun/23','Jul/23','Ago/23','Set/23','Out/23','Nov/23','Dez/23','Jan/24','Fev/24','Mar/24','Abr/24','Mai/24','Jun/24'],
      values: [42,38,45,50,55,60,58,63,67,72,80,95,48,44,52,58,64,70] },
    { name: 'Temperatura Média', ly: 'Temp (°C)', lx: 'Mês',
      labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez','Jan','Fev','Mar','Abr'],
      values: [28,29,27,25,22,20,19,20,22,24,26,28,27,28,26,24] },
    { name: 'Retornos Financeiros', ly: 'Retorno (%)', lx: 'Semana',
      labels: Array.from({ length: 24 }, (_, i) => `S${i + 1}`),
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
  if (varK >= 8) { showToast('Máximo de 8 variáveis no VAR.', 'err'); return; }
  varK++;
  varRebuildTable();
  varSyncKDisplay();
}

export function varRemoveVariable() {
  if (varK <= 2) { showToast('VAR requer pelo menos 2 variáveis.', 'err'); return; }
  varK--;
  varRebuildTable();
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
  if (el) el.textContent = `${n} período${n !== 1 ? 's' : ''}`;
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
  const examples = [
    {
      names: ['PIB (R$bi)', 'Investimento (R$bi)'],
      labels: ['T1/21','T2/21','T3/21','T4/21','T1/22','T2/22','T3/22','T4/22','T1/23','T2/23','T3/23','T4/23','T1/24','T2/24','T3/24','T4/24'],
      matrix: [
        [2200,320],[2260,335],[2310,350],[2380,370],
        [2350,360],[2420,380],[2480,395],[2550,415],
        [2510,405],[2580,425],[2640,440],[2720,465],
        [2680,450],[2750,472],[2820,490],[2900,510],
      ],
    },
    {
      names: ['Exportações', 'Taxa de Câmbio', 'Preço Commodities'],
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

// ─── MATH HELPERS ────────────────────────────────────────────────────────────

// Nelder-Mead minimization for GARCH parameter optimization
function nelderMead(f, x0, maxIter = 2000, tol = 1e-10) {
  const n = x0.length;
  const α = 1, γ = 2, ρ = 0.5, σ = 0.5;
  let pts = [x0.slice()];
  for (let i = 0; i < n; i++) {
    const p = x0.slice();
    p[i] = p[i] !== 0 ? p[i] * 1.05 : 0.00025;
    pts.push(p);
  }
  let vals = pts.map(p => f(p));
  for (let iter = 0; iter < maxIter; iter++) {
    const ord = [...Array(n + 1).keys()].sort((a, b) => vals[a] - vals[b]);
    pts = ord.map(i => pts[i]); vals = ord.map(i => vals[i]);
    if (Math.abs(vals[n] - vals[0]) < tol) break;
    const c = Array(n).fill(0);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) c[j] += pts[i][j] / n;
    const xr = c.map((v, j) => v + α * (v - pts[n][j]));
    const fr = f(xr);
    if (fr < vals[0]) {
      const xe = c.map((v, j) => v + γ * (xr[j] - v));
      const fe = f(xe);
      pts[n] = fe < fr ? xe : xr; vals[n] = fe < fr ? fe : fr;
    } else if (fr < vals[n - 1]) {
      pts[n] = xr; vals[n] = fr;
    } else {
      const xc = c.map((v, j) => v + ρ * (pts[n][j] - v));
      const fc = f(xc);
      if (fc < vals[n]) { pts[n] = xc; vals[n] = fc; }
      else {
        for (let i = 1; i <= n; i++) {
          pts[i] = pts[0].map((v, j) => v + σ * (pts[i][j] - v));
          vals[i] = f(pts[i]);
        }
      }
    }
  }
  return pts[0];
}

function computeACF(series, maxLag) {
  const n = series.length;
  const m = mean(series);
  const c0 = sum(series.map(v => (v - m) ** 2)) / n;
  if (c0 < 1e-12) return new Array(maxLag).fill(0);
  return Array.from({ length: maxLag }, (_, k) => {
    let ck = 0;
    for (let t = k + 1; t < n; t++) ck += (series[t] - m) * (series[t - k - 1] - m);
    return ck / (n * c0);
  });
}

function computePACF(series, maxLag) {
  const acfVals = [1, ...computeACF(series, maxLag)];
  return Array.from({ length: maxLag }, (_, k) => {
    const size = k + 1;
    const R = Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) => acfVals[Math.abs(i - j)])
    );
    const r = Array.from({ length: size }, (_, i) => [acfVals[i + 1]]);
    try {
      const inv = matInv(R);
      if (!inv) return 0;
      return matMul(inv, r)[k][0];
    } catch { return 0; }
  });
}

// Apply d-order differencing, storing last values at each level for undifferencing
function difference(series, d) {
  let s = [...series];
  const lastVals = [];
  for (let i = 0; i < d; i++) {
    lastVals.push(s[s.length - 1]);
    const ds = [];
    for (let j = 1; j < s.length; j++) ds.push(s[j] - s[j - 1]);
    s = ds;
  }
  return { w: s, lastVals };
}

// Reverse d-order differencing on forecast values using stored last values
function undifference(forecastW, lastVals, d) {
  let fc = [...forecastW];
  for (let i = d - 1; i >= 0; i--) {
    const out = [];
    let prev = lastVals[i];
    for (const w of fc) { prev += w; out.push(prev); }
    fc = out;
  }
  return fc;
}

// OLS via normal equations: β = (X'X)⁻¹ X'Y
function olsVec(X, Y) {
  if (!X.length || !X[0].length) return [];
  const Xt = matT(X);
  const XtX = matMul(Xt, X);
  const XtY = matMul(Xt, Y.map(v => [v]));
  const inv = matInv(XtX);
  if (!inv) return new Array(X[0].length).fill(0);
  return matMul(inv, XtY).map(r => r[0]);
}

// Polynomial multiplication (coefficient arrays)
function polyMul(a, b) {
  const res = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) res[i + j] += a[i] * b[j];
  return res;
}

// ─── MODEL: DECOMPOSIÇÃO CLÁSSICA ────────────────────────────────────────────

function stCompute(values, windowSize, futureN) {
  const n = values.length;
  const xs = Array.from({ length: n }, (_, i) => i + 1);
  const xm = mean(xs), ym = mean(values);
  const Sxx = sum(xs.map(x => (x - xm) ** 2));
  const Sxy = sum(xs.map((x, i) => (x - xm) * (values[i] - ym)));
  const b1 = Sxx ? Sxy / Sxx : 0, b0 = ym - b1 * xm;
  const trend = xs.map(x => b0 + b1 * x);

  const ma = Array.from({ length: n }, (_, i) => {
    if (i < windowSize - 1) return null;
    return sum(values.slice(i - windowSize + 1, i + 1)) / windowSize;
  });

  const detrended = values.map((v, i) => v - trend[i]);
  const period = Math.max(2, windowSize);
  const seasonIdx = Array.from({ length: period }, (_, p) => {
    const vals = detrended.filter((_, i) => i % period === p);
    return vals.length ? mean(vals) : 0;
  });
  const seasonMean = mean(seasonIdx);
  const seasonAdj = seasonIdx.map(s => s - seasonMean);
  const seasonal = values.map((_, i) => seasonAdj[i % period]);
  const residual = values.map((v, i) => v - trend[i] - seasonal[i]);

  const volWindow = Math.max(3, windowSize);
  const volatility = Array.from({ length: n }, (_, i) => {
    if (i < volWindow - 1) return null;
    const slice = values.slice(i - volWindow + 1, i + 1);
    const m = mean(slice);
    return Math.sqrt(sum(slice.map(v => (v - m) ** 2)) / volWindow);
  });

  const growthRates = [];
  for (let i = 1; i < n; i++) {
    if (values[i - 1] !== 0) growthRates.push((values[i] - values[i - 1]) / Math.abs(values[i - 1]) * 100);
  }
  const avgGrowth = growthRates.length ? mean(growthRates) : 0;

  const projValues = [], projTrend = [];
  for (let i = 1; i <= futureN; i++) {
    const t = n + i;
    projTrend.push(b0 + b1 * t);
    projValues.push(b0 + b1 * t + seasonAdj[(n + i - 1) % period]);
  }

  const stdev = Math.sqrt(sum(values.map(v => (v - ym) ** 2)) / n);
  const cv = ym !== 0 ? (stdev / Math.abs(ym)) * 100 : 0;

  return {
    model: 'classic',
    n, b0, b1, trend, ma, seasonal, residual, volatility,
    projValues, projTrend, avgGrowth, growthRates,
    maxVal: Math.max(...values), minVal: Math.min(...values),
    maxIdx: values.indexOf(Math.max(...values)), minIdx: values.indexOf(Math.min(...values)),
    ym, stdev, cv, windowSize, futureN, period,
  };
}

// ─── MODEL: ARIMA(p,d,q) ─────────────────────────────────────────────────────

function arimaCompute(values, p, d, q, futureN) {
  const n = values.length;
  const ym = mean(values);
  const stdev = Math.sqrt(sum(values.map(v => (v - ym) ** 2)) / n);
  const cv = ym !== 0 ? stdev / Math.abs(ym) * 100 : 0;

  // 1. Differencing
  const { w, lastVals } = difference(values, d);
  const nw = w.length;

  // 2. Hannan-Rissanen: high-order auxiliary AR for proxy residuals
  const P_aux = Math.min(nw - 2, Math.max(p + q + 3, 8));
  const arResid = new Array(nw).fill(0);
  if (P_aux > 0 && nw > P_aux + 3) {
    const Yaux = w.slice(P_aux);
    const Xaux = Array.from({ length: nw - P_aux }, (_, t) =>
      Array.from({ length: P_aux }, (_, i) => w[t + P_aux - 1 - i])
    );
    const phiAux = olsVec(Xaux, Yaux);
    for (let t = P_aux; t < nw; t++) {
      let yhat = 0;
      for (let i = 0; i < P_aux; i++) yhat += phiAux[i] * w[t - 1 - i];
      arResid[t] = w[t] - yhat;
    }
  }

  // 3. Joint ARMA estimation using proxy residuals for MA terms
  let phi = new Array(p).fill(0);
  let theta = new Array(q).fill(0);
  const minT = Math.max(p, q);
  if (p + q > 0 && nw > minT + 2) {
    const Yfull = w.slice(minT);
    const Xfull = Array.from({ length: nw - minT }, (_, idx) => {
      const t = idx + minT;
      const row = [];
      for (let i = 1; i <= p; i++) row.push(w[t - i]);
      for (let j = 1; j <= q; j++) row.push(arResid[t - j] || 0);
      return row;
    });
    if (Xfull.length > 0 && Xfull[0].length > 0) {
      const coeffs = olsVec(Xfull, Yfull);
      phi = coeffs.slice(0, p);
      theta = coeffs.slice(p);
    }
  }

  // 4. Compute final residuals with estimated params
  const fittedW = new Array(nw).fill(NaN);
  const eps = new Array(nw).fill(0);
  for (let t = minT; t < nw; t++) {
    let yhat = 0;
    for (let i = 0; i < p; i++) yhat += phi[i] * w[t - 1 - i];
    for (let j = 0; j < q; j++) yhat += theta[j] * eps[t - 1 - j];
    fittedW[t] = yhat;
    eps[t] = w[t] - yhat;
  }

  const validEps = eps.slice(minT);
  const nEff = validEps.length;
  const dof = Math.max(1, nEff - p - q);
  const sigma2 = sum(validEps.map(r => r ** 2)) / dof;
  const sigma = Math.sqrt(Math.max(0, sigma2));

  // 5. Reconstruct fitted values on original scale
  const fittedOrig = new Array(n).fill(NaN);
  for (let t = minT; t < nw; t++) {
    if (isNaN(fittedW[t])) continue;
    if (d === 0) {
      fittedOrig[t] = fittedW[t];
    } else if (d === 1) {
      const oi = t + 1;
      if (oi < n) fittedOrig[oi] = values[oi - 1] + fittedW[t];
    } else if (d === 2) {
      const oi = t + 2;
      if (oi < n) {
        const deltaYPrev = oi >= 2 ? values[oi - 1] - values[oi - 2] : 0;
        fittedOrig[oi] = values[oi - 1] + deltaYPrev + fittedW[t];
      }
    }
  }

  // 6. AIC / BIC (Gaussian log-likelihood)
  const ll = nEff > 0 && sigma2 > 0
    ? -nEff / 2 * (Math.log(2 * Math.PI) + Math.log(sigma2) + 1)
    : 0;
  const kParams = p + q + (d > 0 ? 1 : 0);
  const aic = -2 * ll + 2 * kParams;
  const bic = -2 * ll + kParams * Math.log(Math.max(nEff, 1));

  // 7. ψ-weights via the combined AR polynomial Φ(B) = φ(B)·(1-B)^d
  let phi_poly = [1];
  for (let i = 0; i < d; i++) phi_poly = polyMul(phi_poly, [1, -1]);
  phi_poly = polyMul(phi_poly, [1, ...phi.map(v => -v)]);
  const bigPhi = phi_poly.slice(1).map(v => -v); // Φ₁, Φ₂, ...

  const psi = [1];
  for (let j = 1; j <= futureN; j++) {
    let psij = j <= q ? (theta[j - 1] || 0) : 0;
    for (let i = 1; i <= Math.min(j, bigPhi.length); i++) psij += bigPhi[i - 1] * (psi[j - i] || 0);
    psi.push(psij);
  }
  // Cumulative ψ² for h-step forecast variance: Var(ŷ_{T+h}) = σ² · Σ_{j=0}^{h-1} ψ_j²
  const cumPsi2 = [];
  let csum = 0;
  for (let h = 0; h < futureN; h++) { csum += psi[h] ** 2; cumPsi2.push(csum); }

  // 8. Multi-step forecast on differenced scale
  const extW = [...w];
  const extEps = [...eps];
  const forecastW = [];
  for (let h = 0; h < futureN; h++) {
    let fval = 0;
    for (let i = 0; i < p; i++) fval += phi[i] * extW[extW.length - 1 - i];
    for (let j = 0; j < q; j++) fval += theta[j] * (extEps[extEps.length - 1 - j] || 0);
    forecastW.push(fval);
    extW.push(fval);
    extEps.push(0);
  }

  // 9. Undifference to original scale + CI
  const forecastY = undifference(forecastW, lastVals, d);
  const ciHalf = cumPsi2.map(v => 1.96 * sigma * Math.sqrt(v));
  const ciLower = forecastY.map((v, h) => v - ciHalf[h]);
  const ciUpper = forecastY.map((v, h) => v + ciHalf[h]);

  // 10. Residual diagnostics — ACF/PACF + Ljung-Box
  const acfLags = Math.min(15, Math.floor(nEff / 3));
  const acfResid = acfLags > 0 ? computeACF(validEps, acfLags) : [];
  const pacfResid = acfLags > 0 ? computePACF(validEps, acfLags) : [];
  const lbLags = Math.min(10, acfLags);
  const ljungBoxQ = lbLags > 0
    ? nEff * (nEff + 2) * sum(acfResid.slice(0, lbLags).map((r, k) => r ** 2 / (nEff - k - 1)))
    : 0;

  return {
    model: 'arima', p, d, q,
    phi, theta, sigma, sigma2, aic, bic, ll,
    w, nw, fittedW, fittedOrig, resid: validEps,
    forecastW, forecastY, ciLower, ciUpper,
    acfResid, pacfResid, ljungBoxQ, lbLags,
    futureN, n, ym, stdev, cv,
    maxVal: Math.max(...values), minVal: Math.min(...values),
    maxIdx: values.indexOf(Math.max(...values)),
    minIdx: values.indexOf(Math.min(...values)),
  };
}

// ─── MODEL: GARCH(1,1) ───────────────────────────────────────────────────────

function garchCompute(values, futureN) {
  const n = values.length;
  const mu = mean(values);
  const eps = values.map(v => v - mu);
  const eps2 = eps.map(e => e ** 2);
  const varEps = sum(eps2) / n || 1;

  // Conditional variance recursion: h_t = ω + α·ε²_{t-1} + β·h_{t-1}
  function hSeries(om, al, be) {
    const h = new Array(n);
    h[0] = varEps;
    for (let t = 1; t < n; t++) {
      h[t] = om + al * eps2[t - 1] + be * h[t - 1];
      if (!isFinite(h[t]) || h[t] <= 0) h[t] = varEps;
    }
    return h;
  }

  // Gaussian log-likelihood (negated for minimization)
  function negLogLik(params) {
    const [om, al, be] = params;
    if (om <= 1e-10 || al < 0 || be < 0 || al + be >= 0.9999) return 1e10;
    const h = hSeries(om, al, be);
    let ll = 0;
    for (let t = 0; t < n; t++) ll += Math.log(h[t]) + eps2[t] / h[t];
    return isFinite(ll) ? ll / 2 : 1e10;
  }

  // Initialize with method-of-moments values and optimize via Nelder-Mead
  const a0 = 0.1, b0 = 0.85;
  const w0 = Math.max(1e-8, varEps * (1 - a0 - b0));
  const raw = nelderMead(negLogLik, [w0, a0, b0]);

  let omega = Math.max(1e-10, raw[0]);
  let alpha = Math.max(0.001, Math.min(0.498, raw[1]));
  let beta  = Math.max(0.001, Math.min(0.998 - alpha, raw[2]));

  const h = hSeries(omega, alpha, beta);
  const sigma = h.map(v => Math.sqrt(Math.max(0, v)));

  const persistence = alpha + beta;
  const uncondVar = persistence < 1 ? omega / (1 - persistence) : varEps;
  const halfLife = persistence > 0 && persistence < 1
    ? Math.abs(Math.log(0.5) / Math.log(persistence))
    : Infinity;

  const ll = -negLogLik([omega, alpha, beta]);
  const aic = -2 * ll + 2 * 3; // 3 params: ω, α, β
  const bic = -2 * ll + 3 * Math.log(n);

  // Standardized residuals z_t = ε_t / σ_t
  const zStd = eps.map((e, t) => sigma[t] > 1e-10 ? e / sigma[t] : 0);

  // Multi-step variance forecast: σ²_{T+h} = σ²_unc + (α+β)^h · (σ²_T - σ²_unc)
  const hT = h[n - 1];
  const hForecast = Array.from({ length: futureN }, (_, k) =>
    persistence < 1
      ? uncondVar + persistence ** (k + 1) * (hT - uncondVar)
      : hT
  );
  const sigmaForecast = hForecast.map(v => Math.sqrt(Math.max(0, v)));
  const ciLower = sigmaForecast.map(s => mu - 1.96 * s);
  const ciUpper = sigmaForecast.map(s => mu + 1.96 * s);

  // ACF of z²_t to diagnose remaining ARCH effects
  const acfZ2Lags = Math.min(12, Math.floor(n / 3));
  const acfZ2 = acfZ2Lags > 0 ? computeACF(zStd.map(z => z ** 2), acfZ2Lags) : [];

  const ym = mu;
  const stdev = Math.sqrt(varEps);
  const cv = mu !== 0 ? stdev / Math.abs(mu) * 100 : 0;

  return {
    model: 'garch', omega, alpha, beta, persistence, halfLife,
    h, sigma, zStd, eps, eps2, mu, varEps, uncondVar,
    hForecast, sigmaForecast, ciLower, ciUpper,
    acfZ2, ll, aic, bic, futureN, n, ym, stdev, cv,
    maxVal: Math.max(...values), minVal: Math.min(...values),
    maxIdx: values.indexOf(Math.max(...values)),
    minIdx: values.indexOf(Math.min(...values)),
  };
}

// ─── RUN ─────────────────────────────────────────────────────────────────────

export function runSerie() {
  const futureN = parseInt(document.getElementById('st-future').value) || 6;
  const labelY = document.getElementById('st-label-y').value || 'Valor';
  const labelX = document.getElementById('st-label-x').value || 'Período';

  let res;

  if (stCurrentModel === 'var') {
    const { labelsList, matrix } = varGetData();
    const p = Math.max(1, parseInt(document.getElementById('st-var-p').value) || 1);
    if (matrix.length < p * varK + p + 2) {
      showToast(`VAR(${p}) com ${varK} variáveis requer pelo menos ${p * varK + p + 2} períodos.`, 'err'); return;
    }
    res = varCompute(matrix, labelsList, p, futureN);
    if (!res) { showToast('Matriz singular — reduza p ou adicione mais dados.', 'err'); return; }
  } else {
    const { labels, values } = stGetData();
    if (values.length < 6) { showToast('Insira pelo menos 6 períodos.', 'err'); return; }
    if (stCurrentModel === 'arima') {
      const p = Math.max(0, parseInt(document.getElementById('st-arima-p').value) || 1);
      const d = Math.max(0, Math.min(2, parseInt(document.getElementById('st-arima-d').value) || 1));
      const q = Math.max(0, parseInt(document.getElementById('st-arima-q').value) || 1);
      if (values.length < p + d + q + 5) {
        showToast(`Dados insuficientes para ARIMA(${p},${d},${q}). Necessário: ${p+d+q+5} períodos.`, 'err'); return;
      }
      res = arimaCompute(values, p, d, q, futureN);
    } else if (stCurrentModel === 'garch') {
      if (values.length < 10) { showToast('GARCH requer pelo menos 10 períodos.', 'err'); return; }
      res = garchCompute(values, futureN);
    } else {
      const windowSize = parseInt(document.getElementById('st-window').value) || 3;
      res = stCompute(values, windowSize, futureN);
    }
    res.labels = labels;
    res.values = values;
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
  showToast('Análise concluída!', 'ok');
}

// ─── RENDER: DECOMPOSIÇÃO CLÁSSICA ───────────────────────────────────────────

function stRenderResults(res) {
  const { n, ym, stdev, cv, maxVal, minVal, maxIdx, minIdx, avgGrowth, b1,
    labels, values, projValues, projTrend, futureN } = res;

  document.getElementById('st-main-chart-title').textContent = '📈 Série + Tendência + Média Móvel + Projeção';
  document.getElementById('st-metrics').innerHTML = `
    <div class="metric"><div class="metric-val metric-y">${ym.toFixed(2)}</div><div class="metric-lab">Média</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--x)">${stdev.toFixed(2)}</div><div class="metric-lab">Desvio padrão</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--y)">${cv.toFixed(1)}%</div><div class="metric-lab">CV (%)</div></div>
    <div class="metric"><div class="metric-val" style="color:${b1 >= 0 ? 'var(--y)' : 'var(--acc)'}">${b1 >= 0 ? '↑' : '↓'} ${Math.abs(b1).toFixed(3)}</div><div class="metric-lab">Tendência/período</div></div>
    <div class="metric"><div class="metric-val" style="color:${avgGrowth >= 0 ? 'var(--y)' : 'var(--acc)'}">${avgGrowth >= 0 ? '+' : ''}${avgGrowth.toFixed(1)}%</div><div class="metric-lab">Crescimento médio</div></div>
    <div class="metric"><div class="metric-val metric-y">${maxVal.toFixed(2)}</div><div class="metric-lab">Melhor: ${esc(labels[maxIdx] || String(maxIdx + 1))}</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--acc)">${minVal.toFixed(2)}</div><div class="metric-lab">Pior: ${esc(labels[minIdx] || String(minIdx + 1))}</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--txt2)">${n}</div><div class="metric-lab">n</div></div>
  `;

  const projLabels = Array.from({ length: futureN }, (_, i) => `+${i + 1}`);
  const allLabels = [...labels, ...projLabels];

  stDestroyChart('main');
  STC.main = createTimeSeriesMain('st-chart-main', res, allLabels);
  registerChart('st-chart-main', STC.main);
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
      <thead><tr><th>Período</th><th>Projeção</th><th>Só tendência</th><th>vs. Média</th></tr></thead>
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
  const qTest = ljungBoxQ > 0 ? (ljungBoxQ > 18.3 ? '⚠️ Autocorrelação residual' : '✅ Resíduos OK') : '—';

  document.getElementById('st-metrics').innerHTML = `
    ${badge(`ARIMA(${p},${d},${q})`, 'Modelo')}
    ${badge(sigma.toFixed(4), 'σ (erro padrão)')}
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
  registerChart('st-chart-main', STC.main);

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
  registerChart('st-chart-main', STC.main);

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

// ─── VAR MATH ────────────────────────────────────────────────────────────────

function chi2pval(x, df) {
  if (x <= 0 || df <= 0) return 1;
  const mu = 1 - 2 / (9 * df);
  const sigma = Math.sqrt(2 / (9 * df));
  const z = (Math.cbrt(x / df) - mu) / sigma;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const p = 0.3989422820 * Math.exp(-0.5 * z * z) *
    t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
  return z >= 0 ? p : 1 - p;
}

function varCompute(matrix, labelsList, p, futureN) {
  const T = matrix.length;
  const k = matrix[0].length;
  const m = k * p + 1;
  const nObs = T - p;

  if (nObs < m + 1) return null;

  // Build regressor matrix Z (nObs × m) and response Y (nObs × k)
  const Z = [], Y_mat = [];
  for (let t = p; t < T; t++) {
    const zt = [];
    for (let l = 1; l <= p; l++) for (let j = 0; j < k; j++) zt.push(matrix[t - l][j]);
    zt.push(1);
    Z.push(zt);
    Y_mat.push([...matrix[t]]);
  }

  // OLS: B (m × k) = (Z'Z)^{-1} Z'Y
  const ZT = matT(Z);
  const ZTZ_inv = matInv(matMul(ZT, Z));
  if (!ZTZ_inv) return null;
  const B = matMul(ZTZ_inv, matMul(ZT, Y_mat));

  // Extract A_l (k × k): A_l[i][j] = coefficient of Y[t-l,j] in equation i
  const A = Array.from({ length: p }, (_, l) =>
    Array.from({ length: k }, (_, i) =>
      Array.from({ length: k }, (_, j) => B[l * k + j][i])
    )
  );
  const cVec = Array.from({ length: k }, (_, i) => B[m - 1][i]);

  // Residuals
  const Yhat = matMul(Z, B);
  const E = Y_mat.map((row, t) => row.map((v, j) => v - Yhat[t][j]));

  // Sigma_hat = E'E / (nObs - m)
  const dof = nObs - m;
  const ETE = matMul(matT(E), E);
  const Sigma = ETE.map(row => row.map(v => v / dof));

  const logDetSigma = matLogDet(Sigma);
  const nParams = k * k * p + k;
  const aic = logDetSigma + 2 * nParams / nObs;
  const bic = logDetSigma + Math.log(nObs) * nParams / nObs;

  // IRF: Phi[0] = I_k, Phi[h] = sum_{l=1}^{min(h,p)} A_l * Phi[h-l]
  const H = futureN + 10;
  const Ik = Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) => +(i === j)));
  const Phi = [Ik];
  for (let h = 1; h <= H; h++) {
    const Ph = Array.from({ length: k }, () => new Array(k).fill(0));
    for (let l = 1; l <= Math.min(h, p); l++) {
      const Al = A[l - 1], Phhl = Phi[h - l];
      for (let i = 0; i < k; i++)
        for (let j = 0; j < k; j++)
          for (let r = 0; r < k; r++) Ph[i][j] += Al[i][r] * Phhl[r][j];
    }
    Phi.push(Ph);
  }

  // Forecast from last p observations
  const history = matrix.slice(T - p).map(r => [...r]);
  const forecast = [];
  for (let h = 0; h < futureN; h++) {
    const yhat = [...cVec];
    for (let l = 0; l < p; l++) {
      const Yl = history[history.length - 1 - l];
      for (let i = 0; i < k; i++)
        for (let j = 0; j < k; j++) yhat[i] += A[l][i][j] * Yl[j];
    }
    forecast.push(yhat);
    history.push([...yhat]);
  }

  // Granger causality: does variable j Granger-cause variable i?
  const granger = [];
  for (let i = 0; i < k; i++) {
    const RSS_U = E.reduce((s, row) => s + row[i] ** 2, 0);
    for (let j = 0; j < k; j++) {
      if (i === j) continue;
      const keepCols = [];
      for (let c = 0; c < m - 1; c++) if (c % k !== j) keepCols.push(c);
      keepCols.push(m - 1);
      const ZR = Z.map(row => keepCols.map(c => row[c]));
      const ZRT = matT(ZR);
      const ZRTZRinv = matInv(matMul(ZRT, ZR));
      let fStat = NaN, pval = NaN, sig = '';
      if (ZRTZRinv) {
        const yi = Y_mat.map(row => [row[i]]);
        const BR = matMul(ZRTZRinv, matMul(ZRT, yi));
        const YRhat = matMul(ZR, BR);
        const RSS_R = yi.reduce((s, [v], t) => s + (v - YRhat[t][0]) ** 2, 0);
        fStat = ((RSS_R - RSS_U) / p) / (RSS_U / dof);
        const W = p * fStat;
        pval = chi2pval(W, p);
        sig = pval < 0.01 ? '***' : pval < 0.05 ? '**' : pval < 0.10 ? '*' : '';
      }
      granger.push({ from: j, to: i, fStat, pval, sig });
    }
  }

  const ymArr = Array.from({ length: k }, (_, j) => mean(matrix.map(r => r[j])));
  const sdArr = Array.from({ length: k }, (_, j) => {
    const mj = ymArr[j];
    return Math.sqrt(sum(matrix.map(r => (r[j] - mj) ** 2)) / T);
  });

  return {
    model: 'var', k, p, T, nObs, dof, labelsList, futureN,
    matrix, forecast, Phi, A, cVec, Sigma,
    aic, bic, granger, E, Yhat,
    ymArr, sdArr, varNames: varNames.slice(0, k),
  };
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
  registerChart('st-chart-main', STC.main);

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

  let prompt, fallback;
  if (res.model === 'arima') {
    const phiStr = res.phi.map((v, i) => `φ${i + 1}=${v.toFixed(3)}`).join(', ') || 'nenhum';
    const thetaStr = res.theta.map((v, i) => `θ${i + 1}=${v.toFixed(3)}`).join(', ') || 'nenhum';
    prompt = `Você é especialista em econometria e séries temporais. Analise em português (3-4 parágrafos curtos):

Série: ${esc(res.labelY)} | Período: ${esc(res.labelX)}
Modelo ajustado: ARIMA(${res.p},${res.d},${res.q}) | n = ${res.n}
Parâmetros AR: ${esc(phiStr)}
Parâmetros MA: ${esc(thetaStr)}
σ = ${res.sigma.toFixed(4)} | AIC = ${res.aic.toFixed(2)} | BIC = ${res.bic.toFixed(2)}
Ljung-Box Q(${res.lbLags}) = ${res.ljungBoxQ.toFixed(2)} (crítico ~18.3 para α=5%)
Previsão próx. ${res.futureN} períodos: ${res.forecastY.map(v => v.toFixed(2)).join(', ')}
IC 95% 1° período: [${res.ciLower[0].toFixed(2)}, ${res.ciUpper[0].toFixed(2)}]

Inclua: 1) qualidade do ajuste e diagnóstico dos resíduos 2) interpretação dos parâmetros AR e MA 3) avaliação das previsões e incerteza 4) quando usar ARIMA vs outros modelos.`;
    fallback = `ARIMA(${res.p},${res.d},${res.q}): σ=${res.sigma.toFixed(3)}, AIC=${res.aic.toFixed(1)}, Q(${res.lbLags})=${res.ljungBoxQ.toFixed(2)}.`;
  } else if (res.model === 'garch') {
    const hl = isFinite(res.halfLife) ? res.halfLife.toFixed(1) : '> 100';
    prompt = `Você é especialista em finanças quantitativas e modelos de volatilidade. Analise em português (3-4 parágrafos curtos):

Série: ${esc(res.labelY)} | Período: ${esc(res.labelX)}
Modelo ajustado: GARCH(1,1) | n = ${res.n}
ω = ${res.omega.toFixed(6)}, α = ${res.alpha.toFixed(4)}, β = ${res.beta.toFixed(4)}
Persistência (α+β) = ${res.persistence.toFixed(4)} | Meia-vida = ${hl} períodos
σ incondicional (longo prazo) = ${Math.sqrt(res.uncondVar).toFixed(4)}
AIC = ${res.aic.toFixed(2)} | BIC = ${res.bic.toFixed(2)}
Volatilidade prevista (próx. 3 per.): ${res.sigmaForecast.slice(0, 3).map(v => v.toFixed(4)).join(', ')}

Inclua: 1) clustering de volatilidade e o que a persistência implica 2) interpretação de α (impacto de choques) e β (memória da variância) 3) perspectiva de volatilidade futura 4) quando usar GARCH vs ARIMA.`;
    fallback = `GARCH(1,1): α=${res.alpha.toFixed(3)}, β=${res.beta.toFixed(3)}, persistência=${res.persistence.toFixed(3)}, meia-vida=${hl} períodos.`;
  } else if (res.model === 'var') {
    const grangerSig = res.granger.filter(g => g.sig).map(g =>
      `${res.varNames[g.from]} → ${res.varNames[g.to]} (F=${g.fStat.toFixed(2)}, ${g.sig})`
    ).join('; ') || 'nenhuma relação significativa';
    prompt = `Você é especialista em econometria e modelos VAR. Analise em português (3-4 parágrafos curtos):

Modelo: VAR(${res.p}) com ${res.k} variáveis | T = ${res.T} | Obs. efetivas = ${res.nObs}
Variáveis: ${res.varNames.join(', ')}
Médias: ${res.ymArr.map((v, i) => `${res.varNames[i]}=${v.toFixed(2)}`).join(', ')}
AIC = ${res.aic.toFixed(3)} | BIC = ${res.bic.toFixed(3)}
Causalidade de Granger significativa: ${esc(grangerSig)}
Previsão próx. ${res.futureN} períodos (última): ${res.forecast[res.futureN - 1].map((v, i) => `${res.varNames[i]}=${v.toFixed(2)}`).join(', ')}

Inclua: 1) dinâmica das relações entre variáveis e Granger-causalidade 2) IRF esperado e persistência dos choques 3) qualidade do ajuste e limitações do VAR 4) quando usar VAR vs modelos univariados.`;
    fallback = `VAR(${res.p}), ${res.k} variáveis. AIC=${res.aic.toFixed(2)}, BIC=${res.bic.toFixed(2)}. Causalidade: ${grangerSig}.`;
  } else {
    prompt = `Você é especialista em séries temporais. Analise em português (3-4 parágrafos curtos):

Série: ${esc(res.labelY)} | Período: ${esc(res.labelX)}
n = ${res.n} períodos
Tendência: b₀=${res.b0.toFixed(4)}, b₁=${res.b1.toFixed(4)} por período
Média=${res.ym.toFixed(4)}, DP=${res.stdev.toFixed(4)}, CV=${res.cv.toFixed(1)}%
Crescimento médio=${res.avgGrowth.toFixed(2)}% por período
Melhor: ${esc(res.labels[res.maxIdx] || String(res.maxIdx + 1))} (${res.maxVal.toFixed(2)})
Pior: ${esc(res.labels[res.minIdx] || String(res.minIdx + 1))} (${res.minVal.toFixed(2)})
Projeção próximos ${res.futureN} períodos: ${res.projValues.map(v => v.toFixed(2)).join(', ')}

Inclua: 1) direção e força da tendência 2) padrão sazonal 3) perspectivas futuras 4) limitações do modelo.`;
    fallback = `Tendência: ${res.b1 >= 0 ? 'crescente' : 'decrescente'} (${res.b1.toFixed(3)}/período). Cresc. médio: ${res.avgGrowth.toFixed(1)}%. Próx. projeção: ${res.projValues[0]?.toFixed(2) ?? '—'}.`;
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
  if (!stLastResult) { showToast('Execute uma análise primeiro.', 'err'); return; }
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
    showToast('Série temporal salva 🚀', 'ok');
    await loadHistory();
    await updateProfileStats();
  } catch (err) {
    showToast('Erro ao salvar: ' + (err.message || err), 'err');
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
  showToast('Série temporal carregada ✏️', 'info');
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
