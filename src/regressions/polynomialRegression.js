// Regressão polinomial — Vandermonde + OLS, comparação de graus, diagnóstico residual.

import { fmt, fmtP, esc, rmse, mae, mape, qualLabel } from '../core/utils.js';
import { showToast } from '../ui/notifications.js';
import { saveAnalysisRequest } from '../services/analysisService.js';
import { analyze } from '../services/computeService.js';
import { callAI, aiLoadingHTML, aiResultHTML, aiFallbackHTML } from '../services/authService.js';
import {
  S, cell, zebra, buildWS, mergeRange, downloadCSV,
  buildRawSheet, buildPredSheet, buildResidSheet, buildKPISheet, buildCompSheet,
  buildDashSheet, buildInsightsSheet,
} from '../services/exportService.js';
import { switchTab } from '../ui/dashboard.js';
import { loadHistory, updateProfileStats } from '../ui/tables.js';
import {
  createResidualsVsFitted, createHistogram, createQQPlot,
} from '../charts/residualPlot.js';
import { createPolynomialCurve } from '../charts/dashboardCharts.js';
import { registerChart } from '../charts/baseChart.js';

let poLastResult = null;
let poDegree = 1;
const POC = {};

const poHints = {
  1: 'Grau 1 = regressão linear simples',
  2: 'Grau 2 = parábola (U ou arco)',
  3: 'Grau 3 = curva cúbica (inflexão)',
  4: 'Grau 4 = dois vales/picos',
  5: 'Grau 5 = curva muito flexível',
  6: 'Grau 6 = ajuste muito alto (risco de overfitting)',
};

export function poSetDegree(d, btn) {
  poDegree = d;
  document.querySelectorAll('#po-degree-btns .degree-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('po-degree-hint').textContent = poHints[d] || '';
}

async function computePolynomial(xs, ys, degree) {
  return analyze('polynomial', { degree }, { xs, ys });
}

function poEval(beta, x) {
  return beta.reduce((s, b, j) => s + b * Math.pow(x, j), 0);
}

export async function poAutoSelectDegree() {
  const { xs, ys } = poGetData();
  if (xs.length < 4) { showToast('Insira pelo menos 4 pares.', 'err'); return; }
  let bestDeg = 1, bestR2adj = -Infinity;
  for (let d = 1; d <= Math.min(6, xs.length - 2); d++) {
    try {
      const r = await computePolynomial(xs, ys, d);
      if (r && r.r2adj > bestR2adj) { bestR2adj = r.r2adj; bestDeg = d; }
    } catch (_) {}
  }
  poDegree = bestDeg;
  document.querySelectorAll('#po-degree-btns .degree-btn').forEach((b, i) => {
    b.classList.toggle('active', i + 1 === bestDeg);
  });
  document.getElementById('po-degree-hint').textContent = `✓ Melhor grau: ${bestDeg} (R²adj = ${bestR2adj.toFixed(4)})`;
  showToast(`Melhor grau: ${bestDeg}`, 'ok');
}

export function poInitRows(n = 8) {
  document.getElementById('po-data-rows').innerHTML = '';
  for (let i = 0; i < n; i++) poAddRow();
  poUpdateCount();
}

export function poAddRow() {
  const container = document.getElementById('po-data-rows');
  const i = container.children.length + 1;
  const row = document.createElement('div');
  row.className = 'data-row';
  row.innerHTML = `
    <span class="data-row-n">${i}</span>
    <input class="data-input" type="number" placeholder="x" oninput="poUpdateCount()" step="any">
    <input class="data-input" type="number" placeholder="y" oninput="poUpdateCount()" step="any">`;
  container.appendChild(row);
  poUpdateCount();
}

export function poClearRows() {
  document.getElementById('po-data-rows').innerHTML = '';
  poInitRows();
  document.getElementById('po-results').style.display = 'none';
  poLastResult = null;
  document.getElementById('po-btn-save').style.display = 'none';
}

function poGetData() {
  const rows = document.getElementById('po-data-rows').children;
  const xs = [], ys = [];
  for (const row of rows) {
    const inputs = row.querySelectorAll('input');
    const x = parseFloat(inputs[0].value), y = parseFloat(inputs[1].value);
    if (!isNaN(x) && !isNaN(y)) { xs.push(x); ys.push(y); }
  }
  return { xs, ys };
}

export function poUpdateCount() {
  const { xs } = poGetData();
  document.getElementById('po-data-count').textContent = `${xs.length} par${xs.length !== 1 ? 'es' : ''} de dados`;
  document.getElementById('po-dh-x').textContent = document.getElementById('po-label-x').value || 'X';
  document.getElementById('po-dh-y').textContent = document.getElementById('po-label-y').value || 'Y';
}

export function poLoadExample() {
  const examples = [
    { name: 'Crescimento Planta', lx: 'Semanas', ly: 'Altura (cm)',
      xs: [1,2,3,4,5,6,7,8,9,10], ys: [2.1,5.8,11.2,18.5,24.1,28.3,30.9,32.1,32.8,33.0] },
    { name: 'Consumo de Combustível', lx: 'Velocidade (km/h)', ly: 'Consumo (L/100km)',
      xs: [40,50,60,70,80,90,100,110,120,130], ys: [9.2,7.5,6.4,5.8,5.5,5.8,6.5,7.8,9.6,12.0] },
    { name: 'Lucro vs Preço', lx: 'Preço (R$)', ly: 'Lucro (R$k)',
      xs: [10,15,20,25,30,35,40,45,50,55], ys: [5,18,35,52,68,75,72,60,40,15] },
  ];
  const ex = examples[Math.floor(Math.random() * examples.length)];
  document.getElementById('po-analysis-name').value = ex.name;
  document.getElementById('po-label-x').value = ex.lx;
  document.getElementById('po-label-y').value = ex.ly;
  document.getElementById('po-data-rows').innerHTML = '';
  ex.xs.forEach((x, i) => {
    poAddRow();
    const rows = document.getElementById('po-data-rows').children;
    const last = rows[rows.length - 1];
    last.querySelectorAll('input')[0].value = x;
    last.querySelectorAll('input')[1].value = ex.ys[i];
  });
  for (let i = ex.xs.length; i < 8; i++) poAddRow();
  poUpdateCount();
}

export async function runPolynomial() {
  const { xs, ys } = poGetData();
  if (xs.length < poDegree + 2) { showToast(`Insira pelo menos ${poDegree + 2} pares para grau ${poDegree}.`, 'err'); return; }

  const lx = document.getElementById('po-label-x').value || 'X';
  const ly = document.getElementById('po-label-y').value || 'Y';
  let res;
  try {
    res = await computePolynomial(xs, ys, poDegree);
  } catch (e) { showToast('Erro no servidor: ' + e.message, 'err'); return; }
  if (!res) { showToast('Erro de cálculo (dados colineares?).', 'err'); return; }
  res.xs = xs; res.ys = ys; res.labelX = lx; res.labelY = ly;
  poLastResult = res;

  renderPolynomialResults(res, xs, ys, lx, ly);
  document.getElementById('po-results').style.display = 'block';
  document.getElementById('po-btn-save').style.display = 'inline-flex';
  poGenerateAI(res);
  showToast('Análise polinomial concluída!', 'ok');
}

async function renderPolynomialResults(res, xs, ys, lx, ly) {
  const compareEl = document.getElementById('po-degree-compare');
  compareEl.innerHTML = '';
  let bestDeg = 1, bestR2adj = -Infinity;
  const maxDeg = Math.min(6, xs.length - 2);
  const degResults = [];
  for (let d = 1; d <= maxDeg; d++) {
    try {
      const r = await computePolynomial(xs, ys, d);
      degResults.push({ d, r });
      if (r && r.r2adj > bestR2adj) { bestR2adj = r.r2adj; bestDeg = d; }
    } catch (_) {}
  }
  for (const { d, r } of degResults) {
    if (!r) continue;
    const isBest = d === bestDeg;
    const card = document.createElement('div');
    card.className = 'degree-compare-card' + (isBest ? ' best' : '');
    card.onclick = () => {
      poSetDegree(d, null);
      document.querySelectorAll('#po-degree-btns .degree-btn').forEach((b, i) => b.classList.toggle('active', i + 1 === d));
      runPolynomial();
    };
    card.innerHTML = `<div class="dc-degree">Grau ${d}${isBest ? ' ★' : ''}</div><div class="dc-r2">${r.r2.toFixed(3)}</div><div class="dc-r2adj">R²adj ${r.r2adj.toFixed(3)}</div>`;
    compareEl.appendChild(card);
  }
  document.getElementById('po-best-degree-alert').innerHTML =
    `<div class="alert alert-ok">Melhor grau por R²adj: <b>Grau ${bestDeg}</b> (R²adj = ${bestR2adj.toFixed(4)})${bestDeg !== res.degree ? ' — você selecionou grau ' + res.degree : ''}. Clique em um card para mudar.</div>`;

  const superscript = ['', '', '²', '³', '⁴', '⁵', '⁶'];
  const eqParts = res.beta.map((b, j) => {
    if (j === 0) return `${b >= 0 ? '' : '-'}${Math.abs(b).toFixed(4)}`;
    const sign = b >= 0 ? ' + ' : ' - ';
    return `${sign}${Math.abs(b).toFixed(4)}·X${superscript[j] || '^' + j}`;
  });
  document.getElementById('po-equation').innerHTML = `<b>Ŷ = ${eqParts.join('')}</b>`;

  document.getElementById('po-metrics').innerHTML = `
    <div class="metric"><div class="metric-val metric-y">${fmt(res.r2)}</div><div class="metric-lab">R²</div></div>
    <div class="metric"><div class="metric-val metric-y">${fmt(res.r2adj)}</div><div class="metric-lab">R² Ajustado</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--acc2)">${fmt(res.se)}</div><div class="metric-lab">Erro padrão</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--acc2)">${fmt(res.Fstat)}</div><div class="metric-lab">F-stat</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--txt2)">${res.n}</div><div class="metric-lab">n</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--x)">${res.degree}</div><div class="metric-lab">Grau</div></div>`;

  document.getElementById('po-global-tests').innerHTML = `
    <div class="alert ${res.pF < 0.05 ? 'alert-ok' : 'alert-err'}">
      <b>Teste F:</b> F(${res.df_reg},${res.df_resid})=${fmt(res.Fstat)}, p=${fmtP(res.pF)}
      — Modelo ${res.pF < 0.05 ? 'significativo ✓' : 'NÃO significativo ✗'}
    </div>`;

  const superFull = ['β₀', 'β₁·X', 'β₂·X²', 'β₃·X³', 'β₄·X⁴', 'β₅·X⁵', 'β₆·X⁶'];
  const pClass = p => p < 0.05 ? 'sig-high' : p < 0.1 ? 'sig-med' : 'sig-none';
  const pSig = p => p < 0.001 ? '***' : p < 0.01 ? '**' : p < 0.05 ? '*' : p < 0.1 ? '†' : '';
  const rows = res.beta.map((b, j) => `<tr>
    <td>${superFull[j] || 'β' + j}</td>
    <td>${fmt(b)}</td><td>${fmt(res.se_beta[j])}</td>
    <td>${fmt(res.t_beta[j])}</td>
    <td class="${pClass(res.p_beta[j])}">${fmtP(res.p_beta[j])} ${pSig(res.p_beta[j])}</td>
    <td>[${fmt(res.ci_lo[j])}, ${fmt(res.ci_hi[j])}]</td>
  </tr>`).join('');
  document.getElementById('po-coef-tbl').innerHTML = `
    <table class="data-table">
      <thead><tr><th>Termo</th><th>Estimativa</th><th>EP</th><th>t</th><th>p-valor</th><th>IC 95%</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="font-size:11px;color:var(--txt3);margin-top:6px;padding:0 4px">* p<0.05 ** p<0.01 *** p<0.001 † p<0.1</p>`;

  document.getElementById('po-anova-tbl').innerHTML = `
    <table class="anova-table">
      <thead><tr><th>Fonte</th><th>SQ</th><th>GL</th><th>MQ</th><th>F</th><th>p-valor</th></tr></thead>
      <tbody>
        <tr><td>Regressão (Grau ${res.degree})</td><td>${fmt(res.SSR)}</td><td>${res.df_reg}</td><td>${fmt(res.MSR)}</td><td>${fmt(res.Fstat)}</td><td>${fmtP(res.pF)}</td></tr>
        <tr><td>Resíduo</td><td>${fmt(res.SSE)}</td><td>${res.df_resid}</td><td>${fmt(res.MSE)}</td><td>—</td><td>—</td></tr>
        <tr><td><b>Total</b></td><td>${fmt(res.SST)}</td><td>${res.n - 1}</td><td>—</td><td>—</td><td>—</td></tr>
      </tbody>
    </table>`;

  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const nPts = 120;
  const step = (xMax - xMin) / nPts;
  const lineXs = Array.from({ length: nPts + 1 }, (_, i) => xMin + i * step);
  const lineYs = lineXs.map(x => poEval(res.beta, x));

  Object.keys(POC).forEach(k => { if (POC[k]) { POC[k].destroy(); delete POC[k]; } });

  POC.main   = createPolynomialCurve('po-chart-main', xs, ys, lineXs, lineYs, res.degree, lx, ly);
  registerChart('po-chart-main', POC.main);
  POC.resfit = createResidualsVsFitted('po-chart-resfit', res.yhat, res.resid, 'rgba(255,179,71,.6)');
  POC.hist   = createHistogram('po-chart-hist', res.resid, res.n, { bg: 'rgba(255,179,71,.5)', border: 'var(--acc2)' });
  POC.qq     = createQQPlot('po-chart-qq', res.resid_std, res.n, { bg: 'rgba(255,179,71,.6)', lineColor: 'rgba(255,255,255,.2)' });

  const rRows = xs.map((x, i) => `<tr>
    <td style="padding:4px 8px;border-bottom:1px solid var(--brd);font-size:11px">${i + 1}</td>
    <td style="padding:4px 8px;border-bottom:1px solid var(--brd);font-size:11px">${x.toFixed(3)}</td>
    <td style="padding:4px 8px;border-bottom:1px solid var(--brd);font-size:11px">${ys[i].toFixed(3)}</td>
    <td style="padding:4px 8px;border-bottom:1px solid var(--brd);font-size:11px">${res.yhat[i].toFixed(3)}</td>
    <td style="padding:4px 8px;border-bottom:1px solid var(--brd);font-size:11px;color:${Math.abs(res.resid_std[i]) > 2 ? 'var(--acc)' : 'inherit'}">${res.resid[i].toFixed(3)}</td>
  </tr>`).join('');
  document.getElementById('po-resid-mini').innerHTML = `
    <table style="width:100%;border-collapse:collapse">
      <thead><tr>
        <th style="background:var(--bg3);padding:5px 8px;font-size:10px;color:var(--x);text-align:left">#</th>
        <th style="background:var(--bg3);padding:5px 8px;font-size:10px;color:var(--x);text-align:left">${lx}</th>
        <th style="background:var(--bg3);padding:5px 8px;font-size:10px;color:var(--x);text-align:left">${ly}</th>
        <th style="background:var(--bg3);padding:5px 8px;font-size:10px;color:var(--x);text-align:left">Ŷ</th>
        <th style="background:var(--bg3);padding:5px 8px;font-size:10px;color:var(--x);text-align:left">Resíduo</th>
      </tr></thead>
      <tbody>${rRows}</tbody>
    </table>`;
}

export async function poRunPrediction() {
  if (!poLastResult) { showToast('Execute uma análise primeiro.', 'err'); return; }
  const xNew = parseFloat(document.getElementById('po-pred-x').value);
  if (isNaN(xNew)) { showToast('Digite um valor de X.', 'err'); return; }
  const res = poLastResult;
  let pred;
  try {
    pred = await analyze('poly_pred', { xNew, beta: res.beta, se: res.se, df_resid: res.df_resid, degree: res.degree, XtXinv: res.XtXinv }, {});
  } catch (e) { showToast('Erro na previsão: ' + e.message, 'err'); return; }

  const box = document.getElementById('po-pred-result');
  box.style.display = 'block';
  box.innerHTML = `
    <div class="pred-result">
      <div style="font-size:13px;color:var(--txt2);margin-bottom:4px">Previsão para ${res.labelX} = ${xNew}</div>
      <div class="pred-val">${res.labelY} ≈ ${pred.yhat.toFixed(4)}</div>
      <div class="pred-interval">
        IP 95% (individual): [${pred.ipLo.toFixed(4)}, ${pred.ipHi.toFixed(4)}]<br>
        Grau ${res.degree} | R²adj = ${res.r2adj.toFixed(4)}
      </div>
    </div>`;
}

async function poGenerateAI(res) {
  const box = document.getElementById('po-ai-box');
  box.innerHTML = aiLoadingHTML();
  const superFull = ['β₀', 'β₁·X', 'β₂·X²', 'β₃·X³', 'β₄·X⁴', 'β₅·X⁵', 'β₆·X⁶'];
  const prompt = `Você é especialista em estatística. Analise esta regressão polinomial em português (3-4 parágrafos curtos):

Variável X: ${res.labelX}
Variável Y: ${res.labelY}
Grau do polinômio: ${res.degree}
n = ${res.n}

Coeficientes:
${res.beta.map((b, j) => `${superFull[j] || 'β' + j} = ${b.toFixed(6)}, t=${res.t_beta[j].toFixed(3)}, p=${res.p_beta[j].toFixed(4)}`).join('\n')}

R² = ${res.r2.toFixed(4)}, R²adj = ${res.r2adj.toFixed(4)}
F(${res.df_reg},${res.df_resid}) = ${res.Fstat.toFixed(4)}, p = ${res.pF.toFixed(6)}
Erro padrão = ${res.se.toFixed(4)}

Inclua: 1) interpretação da curva 2) qualidade do ajuste 3) significância 4) risco de overfitting se grau > 3.`;
  try {
    const text = await callAI(prompt);
    box.innerHTML = aiResultHTML(text);
  } catch (e) {
    box.innerHTML = aiFallbackHTML(`R²=${(res.r2 * 100).toFixed(1)}%, R²adj=${(res.r2adj * 100).toFixed(1)}%. F=${res.Fstat.toFixed(2)}, p=${fmtP(res.pF)}. Grau ${res.degree}.`);
  }
}

export async function poSaveAnalysis() {
  if (!poLastResult) { showToast('Execute uma análise primeiro.', 'err'); return; }
  document.getElementById('po-cloud-saving').style.display = 'flex';
  try {
    const res = poLastResult;
    await saveAnalysisRequest({
      nome: document.getElementById('po-analysis-name').value || 'Regressão Polinomial',
      tipo: 'polinomial',
      dados: {
        labelX: res.labelX, labelY: res.labelY,
        degree: res.degree, n: res.n,
        r2: res.r2, r2adj: res.r2adj,
        se: res.se, Fstat: res.Fstat, pF: res.pF,
        beta: res.beta,
        SSR: res.SSR, SSE: res.SSE, SST: res.SST,
        xs: res.xs, ys: res.ys,
      },
    });
    showToast('Regressão polinomial salva 🚀', 'ok');
    await loadHistory();
    await updateProfileStats();
  } catch (err) {
    showToast('Erro ao salvar: ' + (err.message || err), 'err');
  } finally {
    document.getElementById('po-cloud-saving').style.display = 'none';
  }
}

export async function loadPolynomialAnalysis(a) {
  const d = a.dados || {};
  switchTab('polinomial', document.querySelectorAll('.tab-btn')[3]);
  await new Promise(r => setTimeout(r, 100));
  document.getElementById('po-analysis-name').value = a.nome || '';
  document.getElementById('po-label-x').value = d.labelX || 'X';
  document.getElementById('po-label-y').value = d.labelY || 'Y';
  if (d.degree) {
    poDegree = d.degree;
    document.querySelectorAll('#po-degree-btns .degree-btn').forEach((b, i) => b.classList.toggle('active', i + 1 === d.degree));
  }
  if (d.xs && d.ys) {
    document.getElementById('po-data-rows').innerHTML = '';
    d.xs.forEach((x, i) => {
      poAddRow();
      const rows = document.getElementById('po-data-rows').children;
      const last = rows[rows.length - 1];
      last.querySelectorAll('input')[0].value = x;
      last.querySelectorAll('input')[1].value = d.ys[i];
    });
    for (let i = d.xs.length; i < 8; i++) poAddRow();
    poUpdateCount();
  }
  showToast('Regressão polinomial carregada ✏️', 'info');
}

export async function poExportExcel() {
  if (!poLastResult) return;
  const res = poLastResult;
  const name = document.getElementById('po-analysis-name').value || 'Polinomial';
  const wb = XLSX.utils.book_new();
  const _rmse = rmse(res.resid);
  const _mae  = mae(res.resid);
  const _mape = mape(res.ys, res.yhat);
  const isSignif = res.pF < 0.05;
  const tipo = `Polinomial Grau ${res.degree}`;

  XLSX.utils.book_append_sheet(wb, buildRawSheet('ID', [res.labelX], res.labelY,
    res.xs.map((x, i) => [i + 1, x, res.ys[i], tipo, name]), name), 'RAW_DATA');

  const predRows = res.xs.map((x, i) => {
    const e = res.resid[i];
    const pct = res.ys[i] !== 0 ? Math.abs(e / res.ys[i]) * 100 : '';
    return [i + 1, res.ys[i], res.yhat[i], e, e * e, Math.abs(e), pct, Math.abs(res.resid_std[i]) > 2 ? 'SIM' : 'não', tipo];
  });
  XLSX.utils.book_append_sheet(wb, buildPredSheet(predRows, name), 'PREDICTION_ANALYSIS');

  const residRows = res.resid.map((r, i) => [i + 1, r, res.resid_std[i], r * r, res.hi ? res.hi[i] : '', '', Math.abs(res.resid_std[i]) > 2.5 ? 'OUTLIER' : 'OK']);
  XLSX.utils.book_append_sheet(wb, buildResidSheet(residRows, name), 'RESIDUALS');

  XLSX.utils.book_append_sheet(wb, buildKPISheet([
    { section: '📌 MODELO' },
    { label: '🏷️ Nome', value: name }, { label: '🤖 Tipo', value: tipo },
    { label: '🔢 Grau', value: res.degree, note: res.degree >= 5 ? '⚠️ Risco de overfitting' : '✅ OK' },
    { section: '📊 QUALIDADE' },
    { label: '📈 R²', value: res.r2.toFixed(6), good: res.r2 >= 0.7 },
    { label: '📉 R² Ajustado', value: res.r2adj.toFixed(6), note: qualLabel(res.r2adj), good: res.r2adj >= 0.7 },
    { label: '📐 MAE', value: _mae.toFixed(6) }, { label: '📐 RMSE', value: _rmse.toFixed(6) },
    { label: '📊 MAPE %', value: _mape != null ? _mape.toFixed(2) + '%' : 'N/A' },
    { section: '⚗️ SIGNIFICÂNCIA' },
    { label: '📊 F-stat', value: res.Fstat.toFixed(4) },
    { label: '🎯 p-valor F', value: res.pF < 0.0001 ? '<0.0001' : res.pF.toFixed(4), good: isSignif },
    { section: '⚠️ OVERFITTING' },
    { label: '⚠️ Risco', value: res.degree >= 5 ? '🔴 ALTO' : res.degree >= 4 ? '🟡 MODERADO' : '🟢 BAIXO', good: res.degree < 4, note: `Grau ${res.degree}` },
  ], name), 'MODEL_KPIs');

  const degRows = [[cell('📊 COMPARAÇÃO DE GRAUS — ' + name, S.title)], [cell('📐 Grau', S.hPurple), cell('📈 R²', S.hTeal), cell('📉 R² Ajustado', S.hTeal), cell('🏆 Melhor?', S.hGreen)]];
  let bestR2adj = -Infinity, bestDeg = 1;
  const degData = [];
  for (let d = 1; d <= Math.min(6, res.xs.length - 2); d++) {
    const r = await computePolynomial(res.xs, res.ys, d);
    if (r && r.r2adj > bestR2adj) { bestR2adj = r.r2adj; bestDeg = d; }
    if (r) degData.push([d, r.r2, r.r2adj]);
  }
  degData.forEach(([d, r2, r2adj], i) => {
    const isBest = d === bestDeg;
    degRows.push([cell(d, isBest ? S.good : (zebra(i) ? S.even : S.odd)), cell(r2, isBest ? S.good : (zebra(i) ? S.num4 : S.num4Odd)), cell(r2adj, isBest ? S.good : (zebra(i) ? S.num4 : S.num4Odd)), cell(isBest ? '🏆 SIM' : '', isBest ? S.good : (zebra(i) ? S.even : S.odd))]);
  });
  const wsDeg = buildWS(degRows, [10, 14, 16, 12]);
  mergeRange(wsDeg, 0, 0, 0, 3);
  XLSX.utils.book_append_sheet(wb, wsDeg, 'DEGREE_COMPARISON');

  const compRows = [
    [name, tipo, '📈 R²', res.r2], [name, tipo, '📉 R²_Adj', res.r2adj],
    [name, tipo, '📐 MAE', _mae], [name, tipo, '📐 RMSE', _rmse], [name, tipo, '🔢 Grau', res.degree], [name, tipo, '🔢 n', res.n],
  ];
  XLSX.utils.book_append_sheet(wb, buildCompSheet(compRows, name), 'MODEL_COMPARISON');

  XLSX.utils.book_append_sheet(wb, buildDashSheet(
    [
      { label: '🔢 Grau', value: res.degree, note: res.degree === bestDeg ? '🏆 Grau ótimo' : `⚠️ Ótimo seria grau ${bestDeg}` },
      { label: '📈 R²', value: res.r2.toFixed(4), good: res.r2 >= 0.7 },
      { label: '📉 R² Ajustado', value: res.r2adj.toFixed(4), note: qualLabel(res.r2adj), good: res.r2adj >= 0.7 },
      { label: '📐 MAE', value: _mae.toFixed(4) }, { label: '📐 RMSE', value: _rmse.toFixed(4) },
      { label: '⚠️ Overfitting', value: res.degree >= 5 ? '🔴 ALTO' : res.degree >= 4 ? '🟡 MODERADO' : '🟢 BAIXO', good: res.degree < 4 },
    ],
    name, tipo,
    [['📐 Equação', res.beta.map((b, j) => j === 0 ? b.toFixed(4) : ` + ${b.toFixed(4)}·X^${j}`).join('')]],
    null,
    ['→ DEGREE_COMPARISON: R²adj por grau → escolher o melhor grau', '→ PREDICTION_ANALYSIS: Real vs Previsto → gráfico de linha', '→ MODEL_COMPARISON: Slicer por Grau para comparar']
  ), 'DASHBOARD');

  XLSX.utils.book_append_sheet(wb, buildInsightsSheet([
    { section: '🏆 QUALIDADE' },
    { label: 'Ajuste', value: qualLabel(res.r2adj), good: res.r2adj >= 0.7, note: `R²adj = ${(res.r2adj * 100).toFixed(1)}%` },
    { section: '📐 GRAU' },
    { label: 'Grau selecionado', value: res.degree },
    { label: 'Grau ótimo (R²adj)', value: bestDeg },
    { label: 'Alinhado?', value: res.degree === bestDeg ? '✅ SIM' : `❌ NÃO — recomendado grau ${bestDeg}`, good: res.degree === bestDeg },
    { label: 'Risco overfitting', value: res.degree >= 5 ? '🔴 ALTO' : res.degree >= 4 ? '🟡 MODERADO' : '🟢 BAIXO', good: res.degree < 4 },
    { section: '🚨 OUTLIERS' },
    { label: 'Outliers', value: res.resid_std.filter(r => Math.abs(r) > 2).length, good: res.resid_std.filter(r => Math.abs(r) > 2).length === 0 },
    { section: '💡 RECOMENDAÇÃO' },
    { label: 'Próximo passo', value: res.degree !== bestDeg ? `⚠️ Testar grau ${bestDeg}` : res.degree >= 5 ? '⚠️ Validar com cross-validation' : '✅ Modelo adequado' },
  ], name), 'INSIGHTS');

  XLSX.writeFile(wb, name.replace(/[^a-zA-Z0-9_-]/g, '_') + '_BI.xlsx');
}

export function poExportCSV() {
  if (!poLastResult) return;
  const res = poLastResult;
  const header = [res.labelX, res.labelY, 'Yhat', 'Residuo', 'Residuo_Std'];
  const rows = res.xs.map((x, i) => [x, res.ys[i], res.yhat[i], res.resid[i], res.resid_std[i]]);
  downloadCSV((document.getElementById('po-analysis-name').value || 'polinomial') + '.csv', header, rows);
}
