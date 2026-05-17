// Regressão regularizada — Ridge (closed form), Lasso (subgradient + soft-threshold), OLS baseline
// e sweep de λ. (Adicionado à estrutura para preservar a feature do monolito.)

import { showToast } from '../ui/notifications.js';
import { saveAnalysisRequest } from '../services/analysisService.js';
import { analyze } from '../services/computeService.js';
import {
  S, cell, zebra, buildWS, mergeRange, downloadCSV,
  buildRawSheet, buildKPISheet, buildDashSheet, buildInsightsSheet,
} from '../services/exportService.js';
import { loadHistory, updateProfileStats } from '../ui/tables.js';
import { C, axis, legendStyle } from '../charts/baseChart.js';
import { createLambdaSweep } from '../charts/dashboardCharts.js';

let rrLastResult = null;
let rrType = 'ridge';
let rrChartMain = null;
let rrChartLambda = null;

export function rrSetType(t) {
  rrType = t;
  document.getElementById('rr-btn-ridge').classList.toggle('active', t === 'ridge');
  document.getElementById('rr-btn-lasso').classList.toggle('active', t === 'lasso');
  document.getElementById('rr-btn-both').classList.toggle('active', t === 'both');
}

export function rrInitRows(n = 8) {
  document.getElementById('rr-data-rows').innerHTML = '';
  for (let i = 0; i < n; i++) rrAddRow();
  rrUpdateCount();
}

export function rrAddRow() {
  const container = document.getElementById('rr-data-rows');
  const i = container.children.length + 1;
  const row = document.createElement('div');
  row.className = 'data-row';
  row.innerHTML = `
    <span class="data-row-n">${i}</span>
    <input class="data-input" type="number" placeholder="x" oninput="rrUpdateCount()" step="any">
    <input class="data-input" type="number" placeholder="y" oninput="rrUpdateCount()" step="any">`;
  container.appendChild(row);
  rrUpdateCount();
}

export function rrAddRowTop() {
  const container = document.getElementById('rr-data-rows');
  const row = document.createElement('div');
  row.className = 'data-row';
  row.innerHTML = `
    <span class="data-row-n">1</span>
    <input class="data-input" type="number" placeholder="x" oninput="rrUpdateCount()" step="any">
    <input class="data-input" type="number" placeholder="y" oninput="rrUpdateCount()" step="any">`;
  container.prepend(row);
  Array.from(container.children).forEach((r, i) => {
    const span = r.querySelector('.data-row-n');
    if (span) span.textContent = i + 1;
  });
  rrUpdateCount();
  row.querySelector('input').focus();
}

export function rrClearRows() {
  document.getElementById('rr-data-rows').innerHTML = '';
  rrInitRows();
  document.getElementById('rr-results').style.display = 'none';
  document.getElementById('rr-btn-save').style.display = 'none';
  rrLastResult = null;
}

function rrGetData() {
  const rows = document.getElementById('rr-data-rows').children;
  const xs = [], ys = [];
  for (const row of rows) {
    const inputs = row.querySelectorAll('input');
    const x = parseFloat(inputs[0].value), y = parseFloat(inputs[1].value);
    if (!isNaN(x) && !isNaN(y)) { xs.push(x); ys.push(y); }
  }
  return { xs, ys };
}

export function rrUpdateCount() {
  const { xs } = rrGetData();
  const el = document.getElementById('rr-data-count');
  if (el) el.textContent = `${xs.length} par${xs.length !== 1 ? 'es' : ''} de dados`;
  const elX = document.getElementById('rr-dh-x');
  const elY = document.getElementById('rr-dh-y');
  if (elX) elX.textContent = document.getElementById('rr-label-x').value || 'X';
  if (elY) elY.textContent = document.getElementById('rr-label-y').value || 'Y';
}

export function rrLoadExample() {
  const examples = [
    { name: 'Área vs Preço', lx: 'Área (m²)', ly: 'Preço (R$k)',
      xs: [45,55,60,70,80,90,100,110,120,135,150,60,75,85,95],
      ys: [180,210,230,260,290,320,360,390,420,470,510,225,275,305,340] },
    { name: 'Horas vs Produção', lx: 'Horas', ly: 'Produção',
      xs: [1,2,3,4,5,6,7,8,9,10,11,12,3,6,9],
      ys: [12,22,30,36,40,43,44,42,38,32,24,14,31,42,37] },
  ];
  const ex = examples[Math.floor(Math.random() * examples.length)];
  document.getElementById('rr-analysis-name').value = ex.name;
  document.getElementById('rr-label-x').value = ex.lx;
  document.getElementById('rr-label-y').value = ex.ly;
  document.getElementById('rr-data-rows').innerHTML = '';
  ex.xs.forEach((x, i) => {
    rrAddRow();
    const rows = document.getElementById('rr-data-rows').children;
    const last = rows[rows.length - 1];
    last.querySelectorAll('input')[0].value = x;
    last.querySelectorAll('input')[1].value = ex.ys[i];
  });
  for (let i = ex.xs.length; i < 8; i++) rrAddRow();
  rrUpdateCount();
}


export async function runRegularized() {
  const { xs, ys } = rrGetData();
  if (xs.length < 3) { showToast('Mínimo 3 pares.', 'err'); return; }

  const lambda = parseFloat(document.getElementById('rr-lambda').value) || 0.1;
  const lr     = parseFloat(document.getElementById('rr-lr').value) || 0.001;
  const iters  = parseInt(document.getElementById('rr-iters').value) || 5000;
  const tol    = parseFloat(document.getElementById('rr-tol').value) || 1e-7;
  const lx = document.getElementById('rr-label-x').value || 'X';
  const ly = document.getElementById('rr-label-y').value || 'Y';

  const btn = document.getElementById('rr-run-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="loading-dots"><span></span><span></span><span></span></span>';
  await new Promise(r => setTimeout(r, 30));

  try {
    const { ridge, lasso, ols, sweep } = await analyze('regularized', { lambda, lr, iters, tol, type: rrType }, { xs, ys });

    rrLastResult = { xs, ys, ridge, lasso, ols, sweep, lambda, lr, iters, tol, lx, ly, type: rrType };
    rrRenderResults(rrLastResult);
    document.getElementById('rr-results').style.display = 'block';
    document.getElementById('rr-btn-save').style.display = 'inline-flex';
    showToast('Análise concluída!', 'ok');
  } catch (e) {
    showToast('Erro: ' + e.message, 'err');
  }

  btn.disabled = false;
  btn.textContent = '▶ Gerar análise';
}

function rrRenderResults(res) {
  const { xs, ys, ridge, lasso, ols, lambda, lx, ly, type } = res;

  const models = type === 'ridge' ? [ols, ridge] : type === 'lasso' ? [ols, lasso] : [ols, ridge, lasso];
  const modelColors = { 'OLS (baseline)': 'rgba(200,200,200,.8)', 'Ridge': '#7B6FFF', 'Lasso': '#FFB347' };

  const cardsHtml = models.map(m => `
    <div style="background:var(--bg3);border:1px solid var(--brd);border-radius:10px;padding:14px;border-top:3px solid ${modelColors[m.method]}">
      <div style="font-size:11px;font-weight:700;color:${modelColors[m.method]};margin-bottom:10px">${m.method}</div>
      <div style="display:flex;gap:16px;flex-wrap:wrap">
        <div style="text-align:center">
          <div style="font-size:18px;font-weight:700;color:var(--y)">${m.r2.toFixed(4)}</div>
          <div style="font-size:10px;color:var(--txt3);margin-top:2px">R²</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:18px;font-weight:700;color:var(--x)">${m.b1.toFixed(4)}</div>
          <div style="font-size:10px;color:var(--txt3);margin-top:2px">β₁</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:18px;font-weight:700;color:var(--acc2)">${m.b0.toFixed(4)}</div>
          <div style="font-size:10px;color:var(--txt3);margin-top:2px">β₀</div>
        </div>
      </div>
    </div>`).join('');
  document.getElementById('rr-coef-cards').innerHTML = cardsHtml;

  document.getElementById('rr-global-tests').innerHTML = `
    <div class="alert alert-ok">
      λ = ${lambda} | OLS β₁ = ${ols.b1.toFixed(4)} → Ridge β₁ = ${ridge.b1.toFixed(4)} | Lasso β₁ = ${lasso.b1.toFixed(4)}<br>
      ${window.t('rr-shrinkage-ridge')}: ${((1 - Math.abs(ridge.b1 / ols.b1)) * 100).toFixed(1)}% &nbsp;|&nbsp; ${window.t('rr-shrinkage-lasso')}: ${((1 - Math.abs(lasso.b1 / ols.b1)) * 100).toFixed(1)}%
    </div>`;

  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const lineXs = [xMin, xMax];

  const datasets = [
    { type: 'scatter', label: 'Dados', data: xs.map((x, i) => ({ x, y: ys[i] })), backgroundColor: 'rgba(0,212,160,.6)', pointRadius: 5, order: 10 },
  ];

  datasets.push({ type: 'line', label: 'OLS (baseline)', data: lineXs.map(x => ({ x, y: ols.b0 + ols.b1 * x })), borderColor: 'rgba(200,200,200,.7)', borderWidth: 1.5, borderDash: [4, 3], pointRadius: 0, fill: false });

  if (type === 'ridge' || type === 'both')
    datasets.push({ type: 'line', label: `Ridge (λ=${lambda})`, data: lineXs.map(x => ({ x, y: ridge.b0 + ridge.b1 * x })), borderColor: '#7B6FFF', borderWidth: 2.5, pointRadius: 0, fill: false });
  if (type === 'lasso' || type === 'both')
    datasets.push({ type: 'line', label: `Lasso (λ=${lambda})`, data: lineXs.map(x => ({ x, y: lasso.b0 + lasso.b1 * x })), borderColor: '#FFB347', borderWidth: 2.5, pointRadius: 0, fill: false });

  if (rrChartMain) rrChartMain.destroy();
  rrChartMain = new Chart(document.getElementById('rr-chart-main'), {
    data: { datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: legendStyle(11) },
      scales: {
        x: { type: 'linear', ...axis(lx, C.x) },
        y: { type: 'linear', ...axis(ly, C.y) },
      },
    },
  });

  const legendItems = datasets.filter(d => d.type === 'line').map(d =>
    `<span style="display:inline-flex;align-items:center;gap:5px">
      <span style="width:20px;height:3px;background:${d.borderColor};display:inline-block;border-radius:2px"></span>
      <span style="color:var(--txt2)">${d.label}</span>
    </span>`).join('');
  document.getElementById('rr-legend').innerHTML = legendItems;

  const tableRows = models.map(m => `<tr>
    <td style="color:${modelColors[m.method]};font-weight:600">${m.method}</td>
    <td>${m.b0.toFixed(6)}</td>
    <td>${m.b1.toFixed(6)}</td>
    <td style="color:var(--y);font-weight:600">${m.r2.toFixed(4)}</td>
    <td>${m.method === 'OLS (baseline)' ? '—' : lambda}</td>
    <td>${m.method === 'OLS (baseline)' ? '—' : ((1 - Math.abs(m.b1 / ols.b1)) * 100).toFixed(1) + '%'}</td>
  </tr>`).join('');
  document.getElementById('rr-coef-tbl').innerHTML = `
    <table class="data-table">
      <thead><tr><th>${window.t('rr-model-col')}</th><th>β₀</th><th>β₁</th><th>R²</th><th>λ</th><th>${window.t('rr-shrinkage-col')}</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>`;

  document.getElementById('rr-lambda-hint').innerHTML =
    `<b>λ = ${lambda}</b>: ${window.t('rr-penalty-hint')}`;

  const sweepType = type === 'lasso' ? 'lasso' : 'ridge';
  const sweep = res.sweep || [];
  if (rrChartLambda) rrChartLambda.destroy();
  rrChartLambda = createLambdaSweep('rr-chart-lambda', sweep, ols.b1, sweepType);
}

export async function rrSaveAnalysis() {
  if (!rrLastResult) { showToast('Execute uma análise primeiro.', 'err'); return; }
  document.getElementById('rr-cloud-saving').style.display = 'flex';
  try {
    const res = rrLastResult;
    await saveAnalysisRequest({
      nome: document.getElementById('rr-analysis-name').value || 'Regressão Regularizada',
      tipo: 'regularizada',
      dados: {
        labelX: res.lx, labelY: res.ly,
        type: res.type, lambda: res.lambda,
        n: res.xs.length,
        ridge: { b0: res.ridge.b0, b1: res.ridge.b1, r2: res.ridge.r2 },
        lasso: { b0: res.lasso.b0, b1: res.lasso.b1, r2: res.lasso.r2 },
        ols:   { b0: res.ols.b0,   b1: res.ols.b1,   r2: res.ols.r2 },
        xs: res.xs, ys: res.ys,
      },
    });
    showToast('Análise salva 🚀', 'ok');
    await loadHistory();
    await updateProfileStats();
  } catch (err) {
    showToast('Erro ao salvar: ' + (err.message || err), 'err');
  } finally {
    document.getElementById('rr-cloud-saving').style.display = 'none';
  }
}

export function rrExportExcel() {
  if (!rrLastResult) return;
  const res = rrLastResult;
  const name = document.getElementById('rr-analysis-name').value || 'Regularizada';
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, buildRawSheet('ID', [res.lx], res.ly,
    res.xs.map((x, i) => [i + 1, x, res.ys[i], 'Regularizada', name]), name), 'RAW_DATA');

  const olsResid = res.xs.map((x, i) => res.ys[i] - res.ols.yhat[i]);
  const predRows = res.xs.map((x, i) => {
    const eO = olsResid[i], eR = res.ridge.resid[i], eL = res.lasso.resid[i];
    const best = Math.abs(eO) <= Math.abs(eR) && Math.abs(eO) <= Math.abs(eL) ? 'OLS' : Math.abs(eR) <= Math.abs(eL) ? 'Ridge' : 'Lasso';
    const z = zebra(i);
    const base = z ? S.even : S.odd;
    return [
      cell(i + 1, base), cell(res.ys[i], base),
      cell(res.ols.yhat[i], z ? S.num4 : S.num4Odd),
      cell(res.ridge.yhat[i], z ? S.num4 : S.num4Odd),
      cell(res.lasso.yhat[i], z ? S.num4 : S.num4Odd),
      cell(eO, base), cell(eR, base), cell(eL, base),
      cell(best, best === 'OLS' ? S.good : best === 'Ridge' ? S.kpiNote : S.warn),
    ];
  });
  const predWS = buildWS([
    [cell('🎯 PREDICTION ANALYSIS — ' + name, S.title)],
    [cell('🔢 ID', S.hDark), cell('📈 Real', S.hGreen), cell('🎯 Ŷ OLS', S.hBlue), cell('🎯 Ŷ Ridge', S.hTeal), cell('🎯 Ŷ Lasso', S.hOrange), cell('📉 Erro OLS', S.hGray), cell('📉 Erro Ridge', S.hGray), cell('📉 Erro Lasso', S.hGray), cell('🏆 Melhor', S.hPurple)],
    ...predRows,
  ], [6, 12, 12, 12, 12, 12, 12, 12, 12]);
  mergeRange(predWS, 0, 0, 0, 8);
  XLSX.utils.book_append_sheet(wb, predWS, 'PREDICTION_ANALYSIS');

  const olsR = rmse(olsResid), ridgeR = rmse(res.ridge.resid), lassoR = rmse(res.lasso.resid);
  const bestModel = res.ridge.r2 >= res.lasso.r2 && res.ridge.r2 >= res.ols.r2 ? 'Ridge' : res.lasso.r2 >= res.ols.r2 ? 'Lasso' : 'OLS';
  const shrinkR = ((1 - Math.abs(res.ridge.b1 / (res.ols.b1 || 1))) * 100).toFixed(1);
  const shrinkL = ((1 - Math.abs(res.lasso.b1 / (res.ols.b1 || 1))) * 100).toFixed(1);

  const mcWS = buildWS([
    [cell('📊 COMPARAÇÃO DE MODELOS — ' + name, S.title)],
    [cell('📋 Métrica', S.hDark), cell('📊 OLS', S.hBlue), cell('🟣 Ridge', S.hPurple), cell('🟠 Lasso', S.hOrange)],
    [cell('📈 R²', S.kpiLabel), cell(res.ols.r2.toFixed(4), res.ols.r2 === Math.max(res.ols.r2, res.ridge.r2, res.lasso.r2) ? S.good : S.even), cell(res.ridge.r2.toFixed(4), res.ridge.r2 === Math.max(res.ols.r2, res.ridge.r2, res.lasso.r2) ? S.good : S.odd), cell(res.lasso.r2.toFixed(4), res.lasso.r2 === Math.max(res.ols.r2, res.ridge.r2, res.lasso.r2) ? S.good : S.even)],
    [cell('📐 RMSE', S.kpiLabel), cell(olsR.toFixed(4), olsR === Math.min(olsR, ridgeR, lassoR) ? S.good : S.odd), cell(ridgeR.toFixed(4), ridgeR === Math.min(olsR, ridgeR, lassoR) ? S.good : S.even), cell(lassoR.toFixed(4), lassoR === Math.min(olsR, ridgeR, lassoR) ? S.good : S.odd)],
    [cell('📈 β₀', S.kpiLabel), cell(res.ols.b0.toFixed(4), S.odd), cell(res.ridge.b0.toFixed(4), S.even), cell(res.lasso.b0.toFixed(4), S.odd)],
    [cell('📈 β₁', S.kpiLabel), cell(res.ols.b1.toFixed(4), S.even), cell(res.ridge.b1.toFixed(4), S.odd), cell(res.lasso.b1.toFixed(4), S.even)],
    [cell('📉 Shrinkage β₁', S.kpiLabel), cell('0%', S.odd), cell(shrinkR + '%', parseFloat(shrinkR) > 0 ? S.warn : S.even), cell(shrinkL + '%', parseFloat(shrinkL) > 50 ? S.crit : S.odd)],
    [cell('🏆 Melhor?', S.kpiLabel), cell(bestModel === 'OLS' ? '🏆 SIM' : '', bestModel === 'OLS' ? S.good : S.even), cell(bestModel === 'Ridge' ? '🏆 SIM' : '', bestModel === 'Ridge' ? S.good : S.odd), cell(bestModel === 'Lasso' ? '🏆 SIM' : '', bestModel === 'Lasso' ? S.good : S.even)],
    [cell('⚙️ λ', S.kpiLabel), cell('—', S.odd), cell(res.lambda, S.even), cell(res.lambda, S.odd)],
  ], [18, 14, 14, 14]);
  mergeRange(mcWS, 0, 0, 0, 3);
  XLSX.utils.book_append_sheet(wb, mcWS, 'MODEL_COMPARISON');

  const sweepRows = [[cell('🔭 LAMBDA SWEEP — ' + name, S.title)], [cell('⚙️ λ', S.hDark), cell('🟣 Ridge β₁', S.hPurple), cell('🟣 Ridge R²', S.hPurple), cell('🟠 Lasso β₁', S.hOrange), cell('🟠 Lasso R²', S.hOrange)]];
  [0.001, 0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10, 20, 50, 100].forEach((lam, i) => {
    const r = computeRidge(res.xs, res.ys, lam);
    const l = computeLasso(res.xs, res.ys, lam, res.lr, res.iters, res.tol);
    const z = zebra(i);
    const isSelected = lam === res.lambda;
    const base = isSelected ? S.good : (z ? S.even : S.odd);
    sweepRows.push([cell(lam, base), cell(r ? r.b1 : '', z ? S.num4 : S.num4Odd), cell(r ? r.r2 : '', z ? S.num4 : S.num4Odd), cell(l ? l.b1 : '', z ? S.num4 : S.num4Odd), cell(l ? l.r2 : '', z ? S.num4 : S.num4Odd)]);
  });
  const sweepWS = buildWS(sweepRows, [10, 14, 12, 14, 12]);
  mergeRange(sweepWS, 0, 0, 0, 4);
  XLSX.utils.book_append_sheet(wb, sweepWS, 'LAMBDA_SWEEP');

  XLSX.utils.book_append_sheet(wb, buildKPISheet([
    { section: '📌 MODELO' },
    { label: '🏷️ Nome', value: name }, { label: '⚙️ λ utilizado', value: res.lambda },
    { label: '🏆 Melhor modelo (R²)', value: bestModel, good: true },
    { section: '📊 OLS (sem regularização)' },
    { label: '📈 R²', value: res.ols.r2.toFixed(4), good: res.ols.r2 >= 0.7 },
    { label: '📐 RMSE', value: olsR.toFixed(4) },
    { label: '📈 β₁', value: res.ols.b1.toFixed(4) },
    { section: '🟣 RIDGE' },
    { label: '📈 R²', value: res.ridge.r2.toFixed(4), good: res.ridge.r2 >= 0.7 },
    { label: '📐 RMSE', value: ridgeR.toFixed(4) },
    { label: '📈 β₁', value: res.ridge.b1.toFixed(4) },
    { label: '📉 Shrinkage', value: shrinkR + '%', note: 'vs OLS' },
    { section: '🟠 LASSO' },
    { label: '📈 R²', value: res.lasso.r2.toFixed(4), good: res.lasso.r2 >= 0.7 },
    { label: '📐 RMSE', value: lassoR.toFixed(4) },
    { label: '📈 β₁', value: res.lasso.b1.toFixed(4) },
    { label: '📉 Shrinkage', value: shrinkL + '%', note: 'vs OLS' },
    { label: '🎯 Seleção (β₁=0?)', value: res.lasso.b1 === 0 ? '✅ SIM — feature removida' : '❌ NÃO', good: null },
  ], name), 'MODEL_KPIs');

  XLSX.utils.book_append_sheet(wb, buildDashSheet(
    [
      { label: '🏆 Melhor modelo', value: bestModel, good: true },
      { label: '⚙️ λ', value: res.lambda },
      { label: '📊 OLS R²', value: res.ols.r2.toFixed(4), good: res.ols.r2 >= 0.7 },
      { label: '🟣 Ridge R²', value: res.ridge.r2.toFixed(4), good: res.ridge.r2 >= 0.7 },
      { label: '🟠 Lasso R²', value: res.lasso.r2.toFixed(4), good: res.lasso.r2 >= 0.7 },
      { label: '📉 Ridge Shrinkage', value: shrinkR + '%' },
      { label: '📉 Lasso Shrinkage', value: shrinkL + '%', note: res.lasso.b1 === 0 ? '✅ Feature removida' : '' },
    ],
    name, 'Regularizada', null,
    ['→ MODEL_COMPARISON: R² e RMSE lado a lado por modelo', '→ LAMBDA_SWEEP: gráfico β₁ vs λ → visualizar shrinkage', '→ PREDICTION_ANALYSIS: Ŷ dos 3 modelos por observação', '→ Slicer por Tipo para isolar OLS / Ridge / Lasso']
  ), 'DASHBOARD');

  XLSX.utils.book_append_sheet(wb, buildInsightsSheet([
    { section: '🏆 COMPARAÇÃO' },
    { label: 'Melhor modelo (R²)', value: bestModel, good: true },
    { label: 'OLS R²', value: res.ols.r2.toFixed(4), good: res.ols.r2 >= 0.7 },
    { label: 'Ridge R²', value: res.ridge.r2.toFixed(4), good: res.ridge.r2 >= 0.7 },
    { label: 'Lasso R²', value: res.lasso.r2.toFixed(4), good: res.lasso.r2 >= 0.7 },
    { section: '📉 REGULARIZAÇÃO' },
    { label: 'Ridge shrinkage β₁', value: shrinkR + '%', note: 'vs OLS' },
    { label: 'Lasso shrinkage β₁', value: shrinkL + '%', note: 'vs OLS' },
    { label: 'Lasso zerou β₁?', value: res.lasso.b1 === 0 ? '✅ SIM — feature eliminada' : '❌ NÃO', good: null },
    { section: '💡 RECOMENDAÇÃO' },
    { label: 'λ', value: res.ridge.r2 > res.ols.r2 * 0.99 ? '✅ λ adequado' : '⚠️ Testar λ menor' },
    { label: 'Próximo passo', value: bestModel !== 'OLS' ? `✅ Usar ${bestModel} para melhor generalização` : '⚠️ Ridge/Lasso não melhoraram — verificar dados' },
  ], name), 'INSIGHTS');

  XLSX.writeFile(wb, name.replace(/[^a-zA-Z0-9_-]/g, '_') + '_BI.xlsx');
}

export function rrExportCSV() {
  if (!rrLastResult) return;
  const res = rrLastResult;
  const header = [res.lx, res.ly, 'Yhat_OLS', 'Yhat_Ridge', 'Yhat_Lasso', 'Resid_Ridge', 'Resid_Lasso'];
  const rows = res.xs.map((x, i) => [x, res.ys[i],
    res.ols.yhat[i].toFixed(4), res.ridge.yhat[i].toFixed(4), res.lasso.yhat[i].toFixed(4),
    res.ridge.resid[i].toFixed(4), res.lasso.resid[i].toFixed(4),
  ]);
  downloadCSV((document.getElementById('rr-analysis-name').value || 'regularizada') + '.csv', header, rows);
}

window.regularizedRerender = () => {
  if (rrLastResult) rrRenderResults(rrLastResult);
};
