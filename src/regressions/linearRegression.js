// Regressão linear simples e múltipla — cálculos OLS, render, diagnóstico,
// previsão, save/load Supabase e exportações Excel BI / CSV.

import { mean, sum, fmt, fmtP, esc, rmse, mae, mape, qualLabel, sigStars } from '../core/utils.js';
import { showToast, showCloudSaving } from '../ui/notifications.js';
import { saveAnalysisRequest } from '../services/analysisService.js';
import { analyze } from '../services/computeService.js';
import { callAI, aiLoadingHTML, aiResultHTML, aiFallbackHTML } from '../services/authService.js';
import {
  XC, S, cell, zebra, buildWS, autoFilter, mergeRange, downloadCSV,
  buildRawSheet, buildPredSheet, buildResidSheet, buildKPISheet, buildCompSheet,
  buildDashSheet, buildInsightsSheet,
} from '../services/exportService.js';
import { switchTab } from '../ui/dashboard.js';
import { setRows, getData, initRows, updateCount } from '../ui/forms.js';
import { createScatterWithLine, createObsVsFitChart } from '../charts/scatterPlot.js';
import { registerChart } from '../charts/baseChart.js';
import {
  createResidualsVsFitted, createHistogram, createQQPlot, createCookDistance,
} from '../charts/residualPlot.js';
import { createPartialEffect } from '../charts/dashboardCharts.js';

// ── Estado ──
let lastResult = null;
let viewMode = 'padrao';
let chartPadrao = null, chartAvancado = null;
let chartResfit = null, chartHist = null, chartQQ = null, chartCook = null;

let mVars = [];
let mLastResult = null;
const MC = {};

export function getLastResult()   { return lastResult; }
export function getMLastResult()  { return mLastResult; }

// ── REGRESSÃO LINEAR SIMPLES ──

export async function compute(xs, ys) {
  return analyze('linear', {}, { xs, ys });
}

export async function runRegression() {
  const { xs, ys } = getData();
  if (xs.length < 3) { showToast('Insira pelo menos 3 pares de dados.', 'err'); return; }

  try {
    lastResult = await analyze('linear', {}, { xs, ys });
  } catch (e) { showToast('Erro no servidor: ' + e.message, 'err'); return; }
  lastResult.labelX = document.getElementById('label-x').value || 'X';
  lastResult.labelY = document.getElementById('label-y').value || 'Y';

  if (viewMode === 'padrao') renderPadrao(lastResult);
  else renderAvancado(lastResult);

  buildDiagnostic(lastResult);

  document.getElementById('btn-save').style.display = 'inline-flex';
  document.getElementById('export-section').style.display = 'block';
  document.getElementById('cloud-saving').style.display = 'none';

  showToast('Análise concluída!', 'ok');
}

function renderPadrao(res) {
  document.getElementById('view-padrao').style.display = 'block';
  document.getElementById('view-avancado').style.display = 'none';

  document.getElementById('metrics-padrao').innerHTML = `
    <div class="metric"><div class="metric-val metric-x">${fmt(res.b1)}</div><div class="metric-lab">β₁ (inclinação)</div></div>
    <div class="metric"><div class="metric-val metric-x">${fmt(res.b0)}</div><div class="metric-lab">β₀ (intercepto)</div></div>
    <div class="metric"><div class="metric-val metric-y">${fmt(res.r2)}</div><div class="metric-lab">R²</div></div>
    <div class="metric"><div class="metric-val metric-y">${fmt(res.r)}</div><div class="metric-lab">r (Pearson)</div></div>
    <div class="metric"><div class="metric-val metric-g">${fmt(res.se)}</div><div class="metric-lab">Erro padrão</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--txt2)">${res.n}</div><div class="metric-lab">n (observações)</div></div>
  `;

  const xMin = Math.min(...res.xs), xMax = Math.max(...res.xs);
  const lineX = [xMin, xMax];
  const lineY = lineX.map(x => res.b0 + res.b1 * x);

  if (chartPadrao) chartPadrao.destroy();
  chartPadrao = createScatterWithLine('chart-padrao', res.xs, res.ys, lineX, lineY, res.labelX, res.labelY);
  registerChart('chart-padrao', chartPadrao);

  const dir = res.b1 >= 0 ? 'positiva' : 'negativa';
  const strength = Math.abs(res.r) > 0.8 ? 'forte' : Math.abs(res.r) > 0.5 ? 'moderada' : 'fraca';
  document.getElementById('interp-padrao').innerHTML = `
    <div class="interp-box">
      Equação: <b>Ŷ = ${fmt(res.b0)} + ${fmt(res.b1)}·X</b><br>
      Existe uma correlação ${strength} e ${dir} (r = ${fmt(res.r)}).
      O modelo explica <b>${(res.r2 * 100).toFixed(1)}%</b> da variância de ${res.labelY}.
    </div>
  `;

  const rows = res.xs.map((x, i) => `
    <tr>
      <td>${i + 1}</td><td>${x.toFixed(3)}</td><td>${res.ys[i].toFixed(3)}</td>
      <td>${res.yhat[i].toFixed(3)}</td><td>${res.resid[i].toFixed(3)}</td>
    </tr>`).join('');
  document.getElementById('resid-tbl-padrao').innerHTML = `
    <table class="data-table">
      <thead><tr><th>#</th><th>${res.labelX}</th><th>${res.labelY}</th><th>Ŷ</th><th>Resíduo</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderAvancado(res) {
  document.getElementById('view-padrao').style.display = 'none';
  document.getElementById('view-avancado').style.display = 'block';

  document.getElementById('metrics-avancado').innerHTML = `
    <div class="metric"><div class="metric-val metric-x">${fmt(res.b1)}</div><div class="metric-lab">β₁</div></div>
    <div class="metric"><div class="metric-val metric-x">${fmt(res.b0)}</div><div class="metric-lab">β₀</div></div>
    <div class="metric"><div class="metric-val metric-y">${fmt(res.r2)}</div><div class="metric-lab">R²</div></div>
    <div class="metric"><div class="metric-val metric-y">${fmt(res.r2adj)}</div><div class="metric-lab">R² Ajustado</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--acc2)">${fmt(res.se)}</div><div class="metric-lab">Erro padrão</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--acc2)">${fmt(res.Fstat)}</div><div class="metric-lab">F-stat</div></div>
  `;

  const xMin = Math.min(...res.xs), xMax = Math.max(...res.xs);
  const range = (xMax - xMin) * 0.1;
  const pts = 40;
  const lineXs = Array.from({ length: pts }, (_, i) => xMin - range + i * (xMax - xMin + 2 * range) / (pts - 1));

  const icUp = [], icLo = [], ipUp = [], ipLo = [];
  lineXs.forEach(x => {
    const yh = res.b0 + res.b1 * x;
    const seIC = res.se * Math.sqrt(1 / res.n + (x - res.xm) ** 2 / res.Sxx);
    const seIP = res.se * Math.sqrt(1 + 1 / res.n + (x - res.xm) ** 2 / res.Sxx);
    icUp.push({ x, y: yh + res.t95 * seIC });
    icLo.push({ x, y: yh - res.t95 * seIC });
    ipUp.push({ x, y: yh + res.t95 * seIP });
    ipLo.push({ x, y: yh - res.t95 * seIP });
  });

  if (chartAvancado) chartAvancado.destroy();
  chartAvancado = new Chart(document.getElementById('chart-avancado'), {
    data: { datasets: [
      { type: 'line', label: 'IP 95%', data: ipUp, borderColor: 'rgba(255,107,107,.3)', borderWidth: 1, borderDash: [4, 4], pointRadius: 0, fill: false },
      { type: 'line', label: 'IP 95% (inf)', data: ipLo, borderColor: 'rgba(255,107,107,.3)', borderWidth: 1, borderDash: [4, 4], pointRadius: 0, fill: '-1', backgroundColor: 'rgba(255,107,107,.04)' },
      { type: 'line', label: 'IC 95%', data: icUp, borderColor: 'rgba(0,212,160,.3)', borderWidth: 1, borderDash: [3, 3], pointRadius: 0, fill: false },
      { type: 'line', label: 'IC 95% (inf)', data: icLo, borderColor: 'rgba(0,212,160,.3)', borderWidth: 1, borderDash: [3, 3], pointRadius: 0, fill: '-1', backgroundColor: 'rgba(0,212,160,.06)' },
      { type: 'line', label: 'Regressão', data: lineXs.map(x => ({ x, y: res.b0 + res.b1 * x })), borderColor: '#00D4A0', borderWidth: 2, pointRadius: 0, fill: false },
      { type: 'scatter', label: 'Dados', data: res.xs.map((x, i) => ({ x, y: res.ys[i] })), backgroundColor: 'rgba(123,111,255,.7)', pointRadius: 5 },
    ]},
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#9B9AB8', font: { size: 10 } } } },
      scales: {
        x: { type: 'linear', title: { display: true, text: res.labelX, color: '#7B6FFF' }, ticks: { color: '#9B9AB8' }, grid: { color: '#1E1E2E' } },
        y: { type: 'linear', title: { display: true, text: res.labelY, color: '#00D4A0' }, ticks: { color: '#9B9AB8' }, grid: { color: '#1E1E2E' } },
      },
    },
  });
  registerChart('chart-avancado', chartAvancado);

  const ciB1Lo = res.b1 - res.t95 * res.se_b1, ciB1Hi = res.b1 + res.t95 * res.se_b1;
  const ciB0Lo = res.b0 - res.t95 * res.se_b0, ciB0Hi = res.b0 + res.t95 * res.se_b0;
  document.getElementById('tests-avancado').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">
      <div class="alert ${res.p_b1 < 0.05 ? 'alert-ok' : 'alert-warn'}">
        <b>β₁:</b> t=${fmt(res.t_b1)}, p=${fmtP(res.p_b1)} ${res.p_b1 < 0.05 ? '✓ significativo' : '✗ não significativo'}<br>
        IC 95%: [${fmt(ciB1Lo)}, ${fmt(ciB1Hi)}]
      </div>
      <div class="alert ${res.p_b0 < 0.05 ? 'alert-ok' : 'alert-warn'}">
        <b>β₀:</b> t=${fmt(res.t_b0)}, p=${fmtP(res.p_b0)} ${res.p_b0 < 0.05 ? '✓ significativo' : '✗ não significativo'}<br>
        IC 95%: [${fmt(ciB0Lo)}, ${fmt(ciB0Hi)}]
      </div>
    </div>
    <div class="alert ${res.pF < 0.05 ? 'alert-ok' : 'alert-err'}" style="margin-top:8px">
      <b>Teste F global:</b> F(1,${res.n - 2})=${fmt(res.Fstat)}, p=${fmtP(res.pF)}
      — Modelo ${res.pF < 0.05 ? 'estatisticamente significativo ✓' : 'NÃO significativo ✗'}
    </div>
  `;

  document.getElementById('anova-tbl').innerHTML = `
    <table class="anova-table">
      <thead><tr><th>Fonte</th><th>SQ</th><th>GL</th><th>MQ</th><th>F</th><th>p-valor</th></tr></thead>
      <tbody>
        <tr><td>Regressão</td><td>${fmt(res.SSR)}</td><td>1</td><td>${fmt(res.MSR)}</td><td>${fmt(res.Fstat)}</td><td>${fmtP(res.pF)}</td></tr>
        <tr><td>Resíduo</td><td>${fmt(res.SSE)}</td><td>${res.n - 2}</td><td>${fmt(res.MSE)}</td><td>—</td><td>—</td></tr>
        <tr><td><b>Total</b></td><td>${fmt(res.SST)}</td><td>${res.n - 1}</td><td>—</td><td>—</td><td>—</td></tr>
      </tbody>
    </table>`;

  generateAIInsight(res);
}

async function generateAIInsight(res) {
  const box = document.getElementById('ai-insight-box');
  box.innerHTML = aiLoadingHTML();

  const prompt = `Você é um especialista em estatística. Analise estes resultados de regressão linear simples e forneça uma interpretação clara e objetiva em português (3-4 parágrafos curtos):

Variável independente (X): ${res.labelX}
Variável dependente (Y): ${res.labelY}
n = ${res.n} observações
β₀ = ${res.b0.toFixed(4)}, β₁ = ${res.b1.toFixed(4)}
R² = ${res.r2.toFixed(4)}, R² ajustado = ${res.r2adj.toFixed(4)}
r de Pearson = ${res.r.toFixed(4)}
Erro padrão = ${res.se.toFixed(4)}
F-statístico = ${res.Fstat.toFixed(4)}, p-valor F = ${res.pF.toFixed(6)}
t para β₁ = ${res.t_b1.toFixed(4)}, p = ${res.p_b1.toFixed(6)}
t para β₀ = ${res.t_b0.toFixed(4)}, p = ${res.p_b0.toFixed(6)}

Inclua:
1. O que a equação significa praticamente
2. Qualidade do ajuste (R²) em linguagem simples
3. Significância estatística e o que isso implica
4. Uma limitação ou ressalva importante

Seja direto e use linguagem acessível.`;

  try {
    const text = await callAI(prompt);
    box.innerHTML = aiResultHTML(text);
  } catch (e) {
    console.warn('generateAIInsight error:', e.message);
    box.innerHTML = aiFallbackHTML(
      `Interpretação automática indisponível no momento.<br>
       R² = ${(res.r2 * 100).toFixed(1)}% da variância explicada.
       Correlação ${Math.abs(res.r) > 0.8 ? 'forte' : Math.abs(res.r) > 0.5 ? 'moderada' : 'fraca'} (r=${res.r.toFixed(4)}).
       Modelo ${res.pF < 0.05 ? 'estatisticamente significativo (p<0.05)' : 'não significativo (p≥0.05)'}.`
    );
  }
}

export async function runPrediction() {
  if (!lastResult) { showToast('Execute uma análise primeiro.', 'err'); return; }
  const xNew = parseFloat(document.getElementById('pred-x').value);
  const conf = parseFloat(document.getElementById('pred-conf').value);
  if (isNaN(xNew)) { showToast('Digite um valor de X.', 'err'); return; }

  const res = lastResult;
  let pred;
  try {
    pred = await analyze('linear_pred', { xNew, conf, b0: res.b0, b1: res.b1, se: res.se, n: res.n, xm: res.xm, Sxx: res.Sxx }, {});
  } catch (e) { showToast('Erro na previsão: ' + e.message, 'err'); return; }

  const box = document.getElementById('pred-result');
  box.style.display = 'block';
  box.innerHTML = `
    <div class="pred-result">
      <div style="font-size:13px;color:var(--txt2);margin-bottom:4px">Previsão para ${res.labelX} = ${xNew}</div>
      <div class="pred-val">${res.labelY} ≈ ${pred.yhat.toFixed(4)}</div>
      <div class="pred-interval">
        IC ${(conf * 100).toFixed(0)}% (média): [${pred.icLo.toFixed(4)}, ${pred.icHi.toFixed(4)}]<br>
        IP ${(conf * 100).toFixed(0)}% (individual): [${pred.ipLo.toFixed(4)}, ${pred.ipHi.toFixed(4)}]
      </div>
    </div>`;
}

function buildDiagnostic(res) {
  document.getElementById('diag-inline-section').style.display = 'block';

  const { sw, bp, dw } = res;

  document.getElementById('diag-tests').innerHTML = `
    <div class="diag-grid">
      <div class="alert ${sw.p > 0.05 ? 'alert-ok' : 'alert-err'}">
        <b>Shapiro-Wilk:</b> W=${sw.W.toFixed(4)}, p=${fmtP(sw.p)}<br>
        ${sw.p > 0.05 ? '✓ Normalidade dos resíduos não rejeitada' : '✗ Possível violação de normalidade'}
      </div>
      <div class="alert ${bp.p > 0.05 ? 'alert-ok' : 'alert-warn'}">
        <b>Breusch-Pagan:</b> LM=${bp.stat.toFixed(4)}, p=${fmtP(bp.p)}<br>
        ${bp.p > 0.05 ? '✓ Homocedasticidade não rejeitada' : '⚠ Possível heterocedasticidade'}
      </div>
      <div class="alert ${dw > 1.5 && dw < 2.5 ? 'alert-ok' : 'alert-warn'}">
        <b>Durbin-Watson:</b> DW=${dw.toFixed(4)}<br>
        ${dw > 1.5 && dw < 2.5 ? '✓ Sem evidência forte de autocorrelação' : '⚠ Verificar autocorrelação nos resíduos'}
      </div>
      <div class="alert alert-ok">
        <b>Observações influentes:</b> ${res.cooks_d.filter(c => c > 4 / res.n).length} ponto(s) com Cook's D > 4/n<br>
        Leverage: ${res.hi.filter(h => h > 2 * 2 / res.n).length} observaç${res.hi.filter(h => h > 2 * 2 / res.n).length === 1 ? 'ão' : 'ões'} com leverage elevado
      </div>
    </div>`;

  if (chartResfit) chartResfit.destroy();
  chartResfit = createResidualsVsFitted('chart-resfit', res.yhat, res.resid);

  if (chartHist) chartHist.destroy();
  chartHist = createHistogram('chart-hist', res.resid, res.n, { nBins: 8 });

  if (chartQQ) chartQQ.destroy();
  chartQQ = createQQPlot('chart-qq', res.resid_std, res.n);

  if (chartCook) chartCook.destroy();
  chartCook = createCookDistance('chart-cook', res.cooks_d, res.n);

  const rows = res.xs.map((x, i) => {
    const isOut = Math.abs(res.resid_std[i]) > 2.5;
    const isInfl = res.cooks_d[i] > 4 / res.n;
    return `<tr>
      <td>${i + 1}</td><td>${x.toFixed(3)}</td><td>${res.ys[i].toFixed(3)}</td>
      <td>${res.hi[i].toFixed(4)}</td>
      <td style="color:${isOut ? 'var(--acc)' : 'inherit'}">${res.resid_std[i].toFixed(3)}</td>
      <td style="color:${isInfl ? 'var(--acc)' : 'inherit'}">${res.cooks_d[i].toFixed(4)}</td>
      <td>${isOut ? '<span style="color:var(--acc)">Outlier</span>' : ''}${isInfl ? '<span style="color:var(--acc2)"> Influente</span>' : ''}</td>
    </tr>`;
  }).join('');
  document.getElementById('influential-tbl').innerHTML = `
    <table class="data-table">
      <thead><tr><th>#</th><th>X</th><th>Y</th><th>Leverage</th><th>Resíd. Std</th><th>Cook's D</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

export function hideResults() {
  document.getElementById('view-padrao').style.display = 'none';
  document.getElementById('view-avancado').style.display = 'none';
  document.getElementById('export-section').style.display = 'none';
  document.getElementById('btn-save').style.display = 'none';
  document.getElementById('diag-inline-section').style.display = 'none';
  lastResult = null;
}

export function setViewMode(mode) {
  viewMode = mode;
  document.getElementById('vt-padrao').classList.toggle('active', mode === 'padrao');
  document.getElementById('vt-avancado').classList.toggle('active', mode === 'avancado');
  document.getElementById('mode-hint').textContent = mode === 'padrao'
    ? 'Modo padrão: gráfico + métricas básicas'
    : 'Modo avançado: IC/IP, testes t, ANOVA, previsão, IA';
  if (lastResult) {
    if (mode === 'padrao') renderPadrao(lastResult);
    else renderAvancado(lastResult);
  }
}

// ── Save / Load (linear simples) ──

export async function saveAnalysis() {
  if (!lastResult) { showToast('Execute uma análise primeiro.', 'err'); return; }
  showCloudSaving(true);
  try {
    const name = document.getElementById('analysis-name').value || 'Análise sem nome';
    const lx   = document.getElementById('label-x').value || 'X';
    const ly   = document.getElementById('label-y').value || 'Y';
    await saveAnalysisRequest({
      nome: name, tipo: 'simples',
      label_x: lx, label_y: ly,
      dados: lastResult,
    });
    showToast('Análise salva 🚀', 'ok');
  } catch (err) {
    console.error('ERRO SALVAR:', err);
    showToast('Erro ao salvar análise 😢', 'err');
  } finally {
    showCloudSaving(false);
  }
}

export async function loadSimpleAnalysis(a) {
  try {
    const d = a.dados || {};
    const tabBtn = document.querySelector('.tab-btn[onclick*="nova"]');
    switchTab('nova', tabBtn);
    await new Promise(r => setTimeout(r, 120));

    document.getElementById('analysis-name').value = a.nome || '';
    document.getElementById('label-x').value = a.label_x || d.labelX || 'X';
    document.getElementById('label-y').value = a.label_y || d.labelY || 'Y';

    if (d.xs && d.ys && d.xs.length > 0) setRows(d.xs, d.ys);
    else initRows();

    if (d.b0 !== undefined) {
      lastResult = d;
      lastResult.labelX = a.label_x || d.labelX || 'X';
      lastResult.labelY = a.label_y || d.labelY || 'Y';
      document.getElementById('btn-save').style.display = 'inline-flex';
      document.getElementById('export-section').style.display = 'block';
      if (viewMode === 'padrao') renderPadrao(lastResult);
      else renderAvancado(lastResult);
      buildDiagnostic(lastResult);
    }

    showToast('Análise carregada para edição ✏️', 'info');
  } catch (err) {
    console.error('loadSimpleAnalysis error:', err);
    showToast('Erro ao carregar análise.', 'err');
  }
}

// ── Export Excel + CSV (linear simples) ──

export function exportExcel() {
  if (!lastResult) return;
  const res = lastResult;
  const name = document.getElementById('analysis-name').value || 'Regressão Linear';
  const wb = XLSX.utils.book_new();
  const _rmse = rmse(res.resid);
  const _mae  = mae(res.resid);
  const _mape = mape(res.ys, res.yhat);

  const rawRows = res.xs.map((x, i) => [i + 1, x, res.ys[i], 'Linear Simples', name]);
  XLSX.utils.book_append_sheet(wb, buildRawSheet('ID', [res.labelX], res.labelY, rawRows, name), 'RAW_DATA');

  const predRows = res.xs.map((x, i) => {
    const e = res.resid[i];
    const pct = res.ys[i] !== 0 ? Math.abs(e / res.ys[i]) * 100 : '';
    return [i + 1, res.ys[i], res.yhat[i], e, e * e, Math.abs(e), pct, Math.abs(res.resid_std[i]) > 2 ? 'SIM' : 'não', 'Linear Simples'];
  });
  XLSX.utils.book_append_sheet(wb, buildPredSheet(predRows, name), 'PREDICTION_ANALYSIS');

  const residRows = res.xs.map((x, i) => {
    const flags = [];
    if (Math.abs(res.resid_std[i]) > 2.5) flags.push('OUTLIER');
    if (res.cooks_d && res.cooks_d[i] > 4 / res.n) flags.push('INFLUENTE');
    return [i + 1, res.resid[i], res.resid_std[i], res.resid[i] ** 2, res.hi ? res.hi[i] : '', res.cooks_d ? res.cooks_d[i] : '', flags.join(' | ') || 'OK'];
  });
  XLSX.utils.book_append_sheet(wb, buildResidSheet(residRows, name), 'RESIDUALS');

  const isSignif = res.pF < 0.05;
  const kpiRows = [
    { section: '📌 MODELO' },
    { label: '🏷️ Nome', value: name },
    { label: '🤖 Tipo', value: 'Regressão Linear Simples' },
    { section: '📊 QUALIDADE DO AJUSTE' },
    { label: '📈 R²', value: typeof res.r2 === 'number' ? res.r2.toFixed(6) : res.r2, note: 'Variância explicada (0–1)', good: res.r2 >= 0.7 ? true : res.r2 < 0.4 ? false : null },
    { label: '📉 R² Ajustado', value: typeof res.r2adj === 'number' ? res.r2adj.toFixed(6) : res.r2adj, note: qualLabel(res.r2adj), good: res.r2adj >= 0.7 ? true : res.r2adj < 0.4 ? false : null },
    { label: '🔗 r de Pearson', value: typeof res.r === 'number' ? res.r.toFixed(4) : res.r, note: Math.abs(res.r) >= 0.8 ? '💪 Correlação forte' : '📊 Correlação moderada' },
    { section: '📏 ERROS' },
    { label: '📐 MAE', value: _mae.toFixed(6), note: 'Erro médio absoluto' },
    { label: '📐 RMSE', value: _rmse.toFixed(6), note: 'Raiz do erro quadrático médio' },
    { label: '📊 MAPE (%)', value: _mape != null ? _mape.toFixed(2) + '%' : 'N/A', note: 'Erro percentual médio' },
    { label: '🔧 Erro Padrão', value: typeof res.se === 'number' ? res.se.toFixed(6) : '' },
    { section: '⚗️ SIGNIFICÂNCIA' },
    { label: '📊 F-estatístico', value: typeof res.Fstat === 'number' ? res.Fstat.toFixed(4) : '' },
    { label: '🎯 p-valor F', value: res.pF < 0.0001 ? '<0.0001' : res.pF.toFixed(4), note: 'p < 0.05 = significativo', good: isSignif ? true : false },
    { label: '✅ Significativo?', value: isSignif ? '✅ SIM' : '❌ NÃO', good: isSignif },
    { section: '📐 COEFICIENTES' },
    { label: '🔢 β₀ (Intercepto)', value: typeof res.b0 === 'number' ? res.b0.toFixed(6) : '' },
    { label: '📈 β₁ (Inclinação)', value: typeof res.b1 === 'number' ? res.b1.toFixed(6) : '', note: res.b1 >= 0 ? '↑ Relação positiva' : '↓ Relação negativa' },
    { section: '🔍 AMOSTRA' },
    { label: '🔢 n (observações)', value: res.n },
    { label: '🚨 Outliers (|std|>2)', value: res.resid_std.filter(r => Math.abs(r) > 2).length, good: res.resid_std.filter(r => Math.abs(r) > 2).length === 0 ? true : null },
  ];
  XLSX.utils.book_append_sheet(wb, buildKPISheet(kpiRows, name), 'MODEL_KPIs');

  const compRows = [
    [name, 'Linear Simples', '📈 R²', res.r2],
    [name, 'Linear Simples', '📉 R² Ajustado', res.r2adj],
    [name, 'Linear Simples', '📐 MAE', _mae],
    [name, 'Linear Simples', '📐 RMSE', _rmse],
    [name, 'Linear Simples', '📊 MAPE %', _mape ?? ''],
    [name, 'Linear Simples', '🔧 Erro Padrão', res.se],
    [name, 'Linear Simples', '📊 F-stat', res.Fstat],
    [name, 'Linear Simples', '🎯 p-valor F', res.pF],
    [name, 'Linear Simples', '🔢 n', res.n],
    [name, 'Linear Simples', '📈 β₀', res.b0],
    [name, 'Linear Simples', '📈 β₁', res.b1],
  ];
  XLSX.utils.book_append_sheet(wb, buildCompSheet(compRows, name), 'MODEL_COMPARISON');

  const wsAnova = buildWS([
    [cell('📊 ANOVA — ' + name, S.title)],
    [cell('📋 Fonte', S.hBlue), cell('∑ SQ', S.hOrange), cell('GL', S.hGray), cell('MQ', S.hOrange), cell('F', S.hTeal), cell('p-valor', S.hRed)],
    [cell('Regressão', S.kpiLabel), cell(res.SSR, S.num4), cell(1, S.even), cell(res.MSR, S.num4), cell(res.Fstat, S.num4), cell(res.pF < 0.0001 ? '<0.0001' : res.pF.toFixed(4), res.pF < 0.05 ? S.good : S.crit)],
    [cell('Resíduo',   S.kpiLabel), cell(res.SSE, S.num4Odd), cell(res.n - 2, S.odd), cell(res.MSE, S.num4Odd), cell('', S.odd), cell('', S.odd)],
    [cell('Total',     { ...S.kpiLabel, font: { bold: true, sz: 11 } }), cell(res.SST, S.num4), cell(res.n - 1, S.even), cell('', S.even), cell('', S.even), cell('', S.even)],
  ], [16, 14, 6, 14, 12, 10]);
  mergeRange(wsAnova, 0, 0, 0, 5);
  XLSX.utils.book_append_sheet(wb, wsAnova, 'ANOVA');

  XLSX.utils.book_append_sheet(wb, buildDashSheet(
    [
      { label: '📈 R²', value: res.r2.toFixed(4), note: qualLabel(res.r2adj), good: res.r2 >= 0.7 },
      { label: '📉 R² Ajustado', value: res.r2adj.toFixed(4), note: qualLabel(res.r2adj), good: res.r2adj >= 0.7 },
      { label: '📐 MAE', value: _mae.toFixed(4), note: 'Quanto menor, melhor' },
      { label: '📐 RMSE', value: _rmse.toFixed(4), note: 'Quanto menor, melhor' },
      { label: '📊 MAPE', value: _mape != null ? _mape.toFixed(2) + '%' : 'N/A', note: 'Erro percentual médio' },
      { label: '✅ Significativo?', value: isSignif ? '✅ SIM' : '❌ NÃO', good: isSignif },
      { label: '🚨 Outliers', value: res.resid_std.filter(r => Math.abs(r) > 2).length, good: res.resid_std.filter(r => Math.abs(r) > 2).length === 0 },
    ],
    name, 'Linear Simples',
    [['📐 Equação', `Ŷ = ${res.b0.toFixed(4)} + ${res.b1.toFixed(4)} × ${res.labelX}`]],
    [
      '→ PREDICTION_ANALYSIS: selecione Real + Previsto → Inserir → Gráfico de Dispersão',
      '→ MODEL_COMPARISON: Inserir → Tabela Dinâmica → Métrica por Modelo',
      '→ RESIDUALS: filtrar coluna 🚦 Flag = OUTLIER para análise de pontos extremos',
      '→ Adicionar Slicer em MODEL_COMPARISON por "Tipo" para comparar modelos',
    ]
  ), 'DASHBOARD');

  XLSX.utils.book_append_sheet(wb, buildInsightsSheet([
    { section: '🏆 QUALIDADE GERAL' },
    { label: 'Ajuste global', value: qualLabel(res.r2adj), note: `R²adj = ${(res.r2adj * 100).toFixed(1)}%`, good: res.r2adj >= 0.7 },
    { label: 'Modelo significativo?', value: isSignif ? '✅ SIM' : '❌ NÃO', good: isSignif },
    { section: '📈 IMPACTO DA VARIÁVEL' },
    { label: `Efeito de ${res.labelX}`, value: `Para cada +1 unidade → ${res.labelY} ${res.b1 >= 0 ? 'aumenta' : 'diminui'} ${Math.abs(res.b1).toFixed(4)}` },
    { label: 'Força da correlação', value: Math.abs(res.r) >= 0.8 ? '💪 Forte' : Math.abs(res.r) >= 0.5 ? '📊 Moderada' : '⚠️ Fraca', note: `r = ${res.r.toFixed(4)}` },
    { section: '🚨 OUTLIERS & INFLUÊNCIA' },
    { label: 'Outliers detectados', value: res.resid_std.filter(r => Math.abs(r) > 2).length, good: res.resid_std.filter(r => Math.abs(r) > 2).length === 0, note: '|resíduo std| > 2' },
    { label: 'Observações influentes', value: res.cooks_d ? res.cooks_d.filter(c => c > 4 / res.n).length : 'N/A', note: "Cook's D > 4/n" },
    { section: '📏 ERROS' },
    { label: 'MAE', value: _mae.toFixed(4) },
    { label: 'RMSE', value: _rmse.toFixed(4) },
    { label: 'MAPE', value: _mape != null ? _mape.toFixed(2) + '%' : 'N/A' },
    { section: '💡 RECOMENDAÇÃO' },
    { label: 'Próximo passo', value: res.r2adj < 0.5 ? '⚠️ Considerar variáveis adicionais ou modelo não-linear' : res.resid_std.filter(r => Math.abs(r) > 2).length > 2 ? '🔍 Investigar outliers antes de usar o modelo' : '✅ Modelo adequado para uso' },
  ], name), 'INSIGHTS');

  XLSX.writeFile(wb, name.replace(/[^a-zA-Z0-9_-]/g, '_') + '_BI.xlsx');
}

export function exportCSV() {
  if (!lastResult) return;
  const res = lastResult;
  const header = [res.labelX, res.labelY, 'Yhat', 'Residuo', 'Residuo_Std'];
  const rows = res.xs.map((x, i) => [x, res.ys[i], res.yhat[i], res.resid[i], res.resid_std[i]]);
  downloadCSV((document.getElementById('analysis-name').value || 'analise') + '.csv', header, rows);
}

// ────────────────────────────────────────────────────────────────────────────
//  REGRESSÃO LINEAR MÚLTIPLA
// ────────────────────────────────────────────────────────────────────────────

export function mInitState() {
  mVars = [];
  mRenderVarChips();
  mRenderTableHeader();
  mInitRows();
}

export function mAddVar() {
  const inp = document.getElementById('m-new-var-name');
  const name = inp.value.trim();
  if (!name) { showToast('Digite o nome da variável.', 'err'); return; }
  if (mVars.find(v => v.name === name)) { showToast('Variável já existe.', 'err'); return; }
  if (mVars.length >= 8) { showToast('Máximo 8 variáveis.', 'err'); return; }
  mVars.push({ name });
  inp.value = '';
  mRenderVarChips();
  mRenderTableHeader();
  mInitRows();
}

export function mRemoveVar(name) {
  mVars = mVars.filter(v => v.name !== name);
  mRenderVarChips();
  mRenderTableHeader();
  mInitRows();
}

function mRenderVarChips() {
  const el = document.getElementById('m-var-list');
  if (!mVars.length) {
    el.innerHTML = '<span style="font-size:12px;color:var(--txt3)">Nenhuma variável adicionada.</span>';
    return;
  }
  el.innerHTML = mVars.map((v, i) => `
    <span class="var-chip">
      X${i + 1}: ${esc(v.name)}
      <button class="var-chip-rm" onclick="mRemoveVar('${esc(v.name)}')" title="Remover">×</button>
    </span>`).join('');
}

function mRenderTableHeader() {
  const el = document.getElementById('m-table-header');
  const ly = document.getElementById('m-label-y').value || 'Y';
  if (!mVars.length) {
    el.innerHTML = '<div style="font-size:12px;color:var(--txt3);padding:8px 0">Adicione variáveis independentes primeiro.</div>';
    return;
  }
  const cols = ['#', ...mVars.map((v, i) => `X${i + 1}: ${v.name}`), ly];
  el.innerHTML = `<div style="display:grid;grid-template-columns:36px ${mVars.map(() => '1fr').join(' ')} 1fr;gap:6px;margin-bottom:4px">
    ${cols.map((c, i) => `<div class="data-header-label ${i === 0 ? '' : i === cols.length - 1 ? 'data-header-y' : 'data-header-x'}" style="${i === 0 ? '' : ''}font-size:11px;padding:4px 6px;border-radius:5px;text-align:center;${i === 0 ? 'background:transparent;color:var(--txt3)' : ''}">${esc(c)}</div>`).join('')}
  </div>`;
}

function mInitRows(n = 8) {
  document.getElementById('m-data-rows').innerHTML = '';
  for (let i = 0; i < n; i++) mAddRow();
  mUpdateCount();
}

export function mAddRow() {
  if (!mVars.length) return;
  const container = document.getElementById('m-data-rows');
  const i = container.children.length + 1;
  const row = document.createElement('div');
  row.style.cssText = `display:grid;grid-template-columns:36px ${mVars.map(() => '1fr').join(' ')} 1fr;gap:6px;margin-bottom:6px;align-items:center`;
  row.innerHTML = `<span class="data-row-n">${i}</span>` +
    mVars.map(() => `<input class="data-input" type="number" placeholder="x" oninput="mUpdateCount()" step="any">`).join('') +
    `<input class="data-input" type="number" placeholder="y" oninput="mUpdateCount()" step="any">`;
  container.appendChild(row);
}

export function mClearRows() {
  document.getElementById('m-data-rows').innerHTML = '';
  mInitRows();
  document.getElementById('m-results').style.display = 'none';
  mLastResult = null;
}

function mGetData() {
  const rows = document.getElementById('m-data-rows').children;
  const k = mVars.length;
  const Xs = Array.from({ length: k }, () => []);
  const Y = [];
  for (const row of rows) {
    const inputs = row.querySelectorAll('input');
    const vals = Array.from(inputs).map(inp => parseFloat(inp.value));
    if (vals.some(isNaN)) continue;
    vals.slice(0, k).forEach((v, j) => Xs[j].push(v));
    Y.push(vals[k]);
  }
  return { Xs, Y, k };
}

export function mUpdateCount() {
  const { Y } = mGetData();
  document.getElementById('m-data-count').textContent = `${Y.length} observação${Y.length !== 1 ? 'ões' : ''}`;
}

export function mLoadExample() {
  const examples = [
    {
      name: 'Preço de Imóveis', ly: 'Preço (R$k)',
      vars: ['Área (m²)', 'Quartos', 'Idade (anos)'],
      data: [
        [80, 2, 5, 320], [95, 3, 3, 410], [120, 3, 8, 480], [60, 1, 15, 210],
        [150, 4, 2, 620], [85, 2, 10, 350], [110, 3, 6, 450], [70, 2, 20, 270],
        [130, 4, 4, 550], [90, 3, 7, 390], [100, 2, 1, 420], [140, 4, 12, 510],
        [75, 2, 18, 295], [165, 5, 3, 700], [55, 1, 25, 185],
      ],
    },
    {
      name: 'Desempenho Vendas', ly: 'Vendas (R$k)',
      vars: ['Equipe (pessoas)', 'Investimento (R$k)', 'Meses de operação'],
      data: [
        [5, 10, 6, 80], [8, 15, 12, 140], [3, 5, 3, 45], [10, 20, 24, 210],
        [6, 12, 9, 105], [12, 25, 18, 270], [4, 8, 6, 70], [7, 14, 15, 155],
        [9, 18, 20, 195], [11, 22, 30, 250], [2, 4, 2, 30], [15, 30, 36, 320],
        [6, 10, 10, 115], [8, 16, 14, 165], [13, 26, 28, 285],
      ],
    },
  ];
  const ex = examples[Math.floor(Math.random() * examples.length)];
  document.getElementById('m-analysis-name').value = ex.name;
  document.getElementById('m-label-y').value = ex.ly;
  mVars = ex.vars.map(name => ({ name }));
  mRenderVarChips();
  mRenderTableHeader();
  document.getElementById('m-data-rows').innerHTML = '';
  ex.data.forEach(row => {
    mAddRow();
    const rows = document.getElementById('m-data-rows').children;
    const last = rows[rows.length - 1];
    const inputs = last.querySelectorAll('input');
    row.forEach((v, j) => { inputs[j].value = v; });
  });
  for (let i = ex.data.length; i < 8; i++) mAddRow();
  mUpdateCount();
}

async function computeMultiple(Xs, Y) {
  return analyze('multiple', {}, { Xs, Y });
}

export async function runMultiple() {
  const { Xs, Y, k } = mGetData();
  if (k === 0) { showToast('Adicione variáveis independentes.', 'err'); return; }
  if (Y.length < k + 2) { showToast(`Insira pelo menos ${k + 2} observações.`, 'err'); return; }

  const ly = document.getElementById('m-label-y').value || 'Y';
  let res;
  try {
    res = await analyze('multiple', {}, { Xs, Y });
  } catch (e) {
    showToast(e.message.includes('singular') ? 'Matriz singular. Verifique multicolinearidade.' : 'Erro no servidor: ' + e.message, 'err');
    return;
  }
  res.varNames = mVars.map(v => v.name);
  res.labelY = ly;
  res.Xs = Xs;
  res.Y = Y;
  mLastResult = res;

  renderMultipleResults(res);
  document.getElementById('m-results').style.display = 'block';
  document.getElementById('m-btn-save').style.display = 'inline-flex';
  buildMultiplePredInputs(res);
  mGenerateAI(res);
  showToast('Análise múltipla concluída!', 'ok');
}

function renderMultipleResults(res) {
  const { beta, varNames, labelY, r2, r2adj, se, n, k, Fstat, pF, SSR, SSE, SST, MSR, MSE, df_resid } = res;

  let eq = `Ŷ = ${fmt(beta[0])}`;
  varNames.forEach((name, i) => { eq += ` + ${fmt(beta[i + 1])}·X${i + 1}(${name})`; });
  document.getElementById('m-equation').innerHTML = `<b>${esc(eq)}</b>`;

  document.getElementById('m-metrics').innerHTML = `
    <div class="metric"><div class="metric-val metric-y">${fmt(r2)}</div><div class="metric-lab">R²</div></div>
    <div class="metric"><div class="metric-val metric-y">${fmt(r2adj)}</div><div class="metric-lab">R² Ajustado</div></div>
    <div class="metric"><div class="metric-val metric-g">${fmt(se)}</div><div class="metric-lab">Erro padrão</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--acc2)">${fmt(Fstat)}</div><div class="metric-lab">F-stat</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--txt2)">${n}</div><div class="metric-lab">n</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--txt2)">${k}</div><div class="metric-lab">preditores</div></div>
  `;

  document.getElementById('m-global-tests').innerHTML = `
    <div class="alert ${pF < 0.05 ? 'alert-ok' : 'alert-err'}">
      <b>Teste F global:</b> F(${k}, ${df_resid})=${fmt(Fstat)}, p=${fmtP(pF)}
      — Modelo ${pF < 0.05 ? 'estatisticamente significativo ✓' : 'NÃO significativo ✗'}
    </div>`;

  const pSig = p => p < 0.001 ? '***' : p < 0.01 ? '**' : p < 0.05 ? '*' : p < 0.1 ? '†' : '';
  const pClass = p => p < 0.05 ? 'sig-high' : p < 0.1 ? 'sig-med' : 'sig-none';
  const coefRows = beta.map((b, j) => {
    const name = j === 0 ? 'β₀ (Intercepto)' : `β${j} (${esc(varNames[j - 1])})`;
    return `<tr>
      <td>${name}</td>
      <td>${fmt(b)}</td>
      <td>${fmt(res.se_beta[j])}</td>
      <td>${fmt(res.t_beta[j])}</td>
      <td class="${pClass(res.p_beta[j])}">${fmtP(res.p_beta[j])} ${pSig(res.p_beta[j])}</td>
      <td>[${fmt(res.ci_lo[j])}, ${fmt(res.ci_hi[j])}]</td>
    </tr>`;
  }).join('');
  document.getElementById('m-coef-tbl').innerHTML = `
    <table class="data-table">
      <thead><tr><th>Coeficiente</th><th>Estimativa</th><th>EP</th><th>t</th><th>p-valor</th><th>IC 95%</th></tr></thead>
      <tbody>${coefRows}</tbody>
    </table>
    <p style="font-size:11px;color:var(--txt3);margin-top:6px;padding:0 4px">* p<0.05 &nbsp;** p<0.01 &nbsp;*** p<0.001 &nbsp;† p<0.1</p>`;

  const maxVIF = Math.max(...res.vif);
  const vifRows = res.vif.map((v, i) => {
    const pct = Math.min(100, (v / 10) * 100);
    const color = v < 5 ? 'var(--y)' : v < 10 ? 'var(--acc2)' : 'var(--acc)';
    const status = v < 5 ? '✓ OK' : v < 10 ? '⚠ Moderado' : '✗ Alto';
    return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
      <div style="min-width:130px;font-size:12px;color:var(--txt2)">X${i + 1}: ${esc(varNames[i])}</div>
      <div style="min-width:60px;font-size:13px;font-weight:600;color:${color}">${v >= 9999 ? '>999' : v.toFixed(2)}</div>
      <div class="vif-bar-wrap"><div class="vif-bar" style="width:${pct}%;background:${color}"></div></div>
      <div style="font-size:11px;color:${color};min-width:80px">${status}</div>
    </div>`;
  }).join('');
  document.getElementById('m-vif-section').innerHTML = vifRows +
    `<div class="interp-box ${maxVIF < 5 ? 'green' : maxVIF < 10 ? 'amber' : ''}" style="margin-top:8px">
      VIF > 10: alta multicolinearidade (remove variável). VIF 5–10: moderada. VIF < 5: aceitável.
    </div>`;

  document.getElementById('m-anova-tbl').innerHTML = `
    <table class="anova-table">
      <thead><tr><th>Fonte</th><th>SQ</th><th>GL</th><th>MQ</th><th>F</th><th>p-valor</th></tr></thead>
      <tbody>
        <tr><td>Regressão</td><td>${fmt(SSR)}</td><td>${k}</td><td>${fmt(MSR)}</td><td>${fmt(Fstat)}</td><td>${fmtP(pF)}</td></tr>
        <tr><td>Resíduo</td><td>${fmt(SSE)}</td><td>${df_resid}</td><td>${fmt(MSE)}</td><td>—</td><td>—</td></tr>
        <tr><td><b>Total</b></td><td>${fmt(SST)}</td><td>${n - 1}</td><td>—</td><td>—</td><td>—</td></tr>
      </tbody>
    </table>`;

  renderMultipleCharts(res);
}

function destroyMC(id) { if (MC[id]) { MC[id].destroy(); delete MC[id]; } }

function renderMultipleCharts(res) {
  const { yhat, resid, resid_std, Y, n, Xs, varNames, labelY } = res;

  destroyMC('obsFit');
  MC['obsFit'] = createObsVsFitChart('m-chart-obs-fit', Y, yhat, labelY);

  destroyMC('resFit');
  MC['resFit'] = createResidualsVsFitted('m-chart-resfit', yhat, resid, 'rgba(0,212,160,.6)');

  destroyMC('hist');
  MC['hist'] = createHistogram('m-chart-hist', resid, n, { bg: 'rgba(255,179,71,.5)', border: 'var(--acc2)' });

  destroyMC('qq');
  MC['qq'] = createQQPlot('m-chart-qq', resid_std, n, { bg: 'rgba(255,107,107,.6)' });

  const container = document.getElementById('m-partial-charts');
  container.innerHTML = '';
  Object.keys(MC).filter(k => k.startsWith('partial')).forEach(k => destroyMC(k));

  Xs.forEach((xi, idx) => {
    const div = document.createElement('div');
    div.className = 'diag-card';
    div.innerHTML = `<div class="diag-title">Y vs X${idx + 1}: ${esc(varNames[idx])}</div><div class="diag-chart-wrap"><canvas id="m-partial-${idx}"></canvas></div>`;
    container.appendChild(div);
    setTimeout(() => {
      MC[`partial${idx}`] = createPartialEffect(`m-partial-${idx}`, xi, Y, res.beta, idx, Xs, mean, varNames, labelY);
    }, 80);
  });
}

function buildMultiplePredInputs(res) {
  const el = document.getElementById('m-pred-inputs');
  el.innerHTML = res.varNames.map((name, i) => `
    <div class="field-group">
      <label class="field-label">X${i + 1}: ${esc(name)}</label>
      <input class="data-input" type="number" id="m-px-${i}" placeholder="valor" step="any" style="width:100%">
    </div>`).join('');
}

export async function runMultiplePrediction() {
  if (!mLastResult) { showToast('Execute uma análise primeiro.', 'err'); return; }
  const res = mLastResult;
  const xVals = res.varNames.map((_, i) => parseFloat(document.getElementById(`m-px-${i}`).value));
  if (xVals.some(isNaN)) { showToast('Preencha todos os valores.', 'err'); return; }

  const conf = parseFloat(document.getElementById('m-pred-conf').value);
  let pred;
  try {
    pred = await analyze('multiple_pred', { xVals, conf, beta: res.beta, se: res.se, df_resid: res.df_resid, XtXinv: res.XtXinv }, {});
  } catch (e) { showToast('Erro na previsão: ' + e.message, 'err'); return; }

  const box = document.getElementById('m-pred-result');
  box.style.display = 'block';
  box.innerHTML = `
    <div class="pred-result">
      <div style="font-size:13px;color:var(--txt2);margin-bottom:4px">
        Previsão para: ${res.varNames.map((n, i) => `${esc(n)}=${xVals[i]}`).join(', ')}
      </div>
      <div class="pred-val">${res.labelY} ≈ ${pred.yhat.toFixed(4)}</div>
      <div class="pred-interval">
        IC ${(conf * 100).toFixed(0)}% (média): [${pred.icLo.toFixed(4)}, ${pred.icHi.toFixed(4)}]<br>
        IP ${(conf * 100).toFixed(0)}% (individual): [${pred.ipLo.toFixed(4)}, ${pred.ipHi.toFixed(4)}]
      </div>
    </div>`;
}

async function mGenerateAI(res) {
  const box = document.getElementById('m-ai-box');
  box.innerHTML = aiLoadingHTML();

  const prompt = `Você é especialista em estatística. Analise esta regressão linear múltipla em português (4 parágrafos curtos):

Variável dependente: ${res.labelY}
Variáveis independentes: ${res.varNames.map((n, i) => `X${i + 1}=${n}`).join(', ')}
n=${res.n}, k=${res.k} preditores

Coeficientes:
${res.beta.map((b, j) => j === 0 ? `β₀=${b.toFixed(4)}` : `β${j}(${res.varNames[j - 1]})=${b.toFixed(4)}, t=${res.t_beta[j].toFixed(3)}, p=${res.p_beta[j].toFixed(4)}`).join('\n')}

R²=${res.r2.toFixed(4)}, R²adj=${res.r2adj.toFixed(4)}, F=${res.Fstat.toFixed(4)}, p-F=${res.pF.toFixed(6)}
Erro padrão=${res.se.toFixed(4)}
VIF: ${res.vif.map((v, i) => `${res.varNames[i]}=${v >= 9999 ? '>999' : v.toFixed(2)}`).join(', ')}

Inclua: 1) equação na prática 2) quais preditores são significativos 3) qualidade do ajuste 4) multicolinearidade e ressalvas.`;

  try {
    const text = await callAI(prompt);
    box.innerHTML = aiResultHTML(text);
  } catch (e) {
    console.warn('mGenerateAI error:', e.message);
    box.innerHTML = aiFallbackHTML(`R²adj=${(res.r2adj * 100).toFixed(1)}% explicado. F=${res.Fstat.toFixed(2)}, p=${fmtP(res.pF)}.`);
  }
}

export async function mSaveAnalysis() {
  if (!mLastResult) { showToast('Execute uma análise primeiro.', 'err'); return; }
  document.getElementById('m-cloud-saving').style.display = 'flex';
  try {
    const res = mLastResult;
    await saveAnalysisRequest({
      nome: document.getElementById('m-analysis-name').value || 'Regressão Múltipla',
      tipo: 'multipla',
      dados: {
        labelY: res.labelY, varNames: res.varNames,
        r2: res.r2, r2adj: res.r2adj, n: res.n, k: res.k,
        Fstat: res.Fstat, pF: res.pF, beta: res.beta,
        se: res.se, Xs: res.Xs, Y: res.Y,
      },
    });
    showToast('Regressão múltipla salva 🚀', 'ok');
  } catch (err) {
    console.error('ERRO MULTIPLA:', err);
    showToast('Erro ao salvar regressão múltipla', 'err');
  } finally {
    document.getElementById('m-cloud-saving').style.display = 'none';
  }
}

export async function loadMultipleAnalysis(a) {
  try {
    const d = a.dados || {};
    const tabBtn = document.querySelector('.tab-btn[onclick*="multipla"]');
    switchTab('multipla', tabBtn);
    await new Promise(r => setTimeout(r, 120));

    document.getElementById('m-analysis-name').value = a.nome || '';
    document.getElementById('m-label-y').value = d.labelY || 'Y';

    if (d.varNames && d.varNames.length > 0) {
      mVars = d.varNames.map(name => ({ name }));
      mRenderVarChips();
      mRenderTableHeader();

      if (d.Xs && d.Y && d.Y.length > 0) {
        document.getElementById('m-data-rows').innerHTML = '';
        d.Y.forEach((y, i) => {
          mAddRow();
          const rows = document.getElementById('m-data-rows').children;
          const last = rows[rows.length - 1];
          const inputs = last.querySelectorAll('input');
          d.Xs.forEach((xi, j) => { if (inputs[j]) inputs[j].value = xi[i]; });
          if (inputs[d.Xs.length]) inputs[d.Xs.length].value = y;
        });
        for (let i = d.Y.length; i < 8; i++) mAddRow();
        mUpdateCount();
      }
    }
    showToast('Regressão múltipla carregada ✏️', 'info');
  } catch (err) {
    console.error('loadMultipleAnalysis error:', err);
    showToast('Erro ao carregar regressão múltipla.', 'err');
  }
}

export function mExportExcel() {
  if (!mLastResult) return;
  const res = mLastResult;
  const name = document.getElementById('m-analysis-name').value || 'Regressão Múltipla';
  const wb = XLSX.utils.book_new();
  const _rmse = rmse(res.resid);
  const _mae  = mae(res.resid);
  const _mape = mape(res.Y, res.yhat);
  const isSignif = res.pF < 0.05;

  const rawRows = res.Y.map((y, i) => [i + 1, ...res.Xs.map(x => x[i]), y, 'Múltipla', name]);
  XLSX.utils.book_append_sheet(wb, buildRawSheet('ID', res.varNames, res.labelY, rawRows, name), 'RAW_DATA');

  const predRows = res.Y.map((y, i) => {
    const e = res.resid[i];
    const pct = y !== 0 ? Math.abs(e / y) * 100 : '';
    return [i + 1, y, res.yhat[i], e, e * e, Math.abs(e), pct, Math.abs(res.resid_std[i]) > 2 ? 'SIM' : 'não', 'Múltipla'];
  });
  XLSX.utils.book_append_sheet(wb, buildPredSheet(predRows, name), 'PREDICTION_ANALYSIS');

  const residRows = res.resid.map((r, i) => [i + 1, r, res.resid_std[i], r * r, res.hi ? res.hi[i] : '', '', Math.abs(res.resid_std[i]) > 2.5 ? 'OUTLIER' : 'OK']);
  XLSX.utils.book_append_sheet(wb, buildResidSheet(residRows, name), 'RESIDUALS');

  const sigVars = res.varNames.filter((_, j) => res.p_beta[j + 1] < 0.05);
  const highVIF = res.vif.filter(v => v > 10).length;
  XLSX.utils.book_append_sheet(wb, buildKPISheet([
    { section: '📌 MODELO' },
    { label: '🏷️ Nome', value: name }, { label: '🤖 Tipo', value: 'Regressão Múltipla' },
    { label: '🔢 n', value: res.n }, { label: '🔢 k (preditores)', value: res.k },
    { section: '📊 QUALIDADE' },
    { label: '📈 R²', value: res.r2.toFixed(6), note: 'Variância explicada', good: res.r2 >= 0.7 },
    { label: '📉 R² Ajustado', value: res.r2adj.toFixed(6), note: qualLabel(res.r2adj), good: res.r2adj >= 0.7 },
    { label: '📐 MAE', value: _mae.toFixed(6) }, { label: '📐 RMSE', value: _rmse.toFixed(6) },
    { label: '📊 MAPE %', value: _mape != null ? _mape.toFixed(2) + '%' : 'N/A' },
    { section: '⚗️ SIGNIFICÂNCIA' },
    { label: '📊 F-stat', value: res.Fstat.toFixed(4) },
    { label: '🎯 p-valor F', value: res.pF < 0.0001 ? '<0.0001' : res.pF.toFixed(4), good: isSignif },
    { label: '✅ Significativo?', value: isSignif ? '✅ SIM' : '❌ NÃO', good: isSignif },
    { label: '📋 Vars significativas', value: sigVars.join(', ') || 'nenhuma', good: sigVars.length > 0 },
    { section: '⚠️ MULTICOLINEARIDADE' },
    { label: '🔴 VIF > 10 (crítico)', value: highVIF, good: highVIF === 0, note: highVIF > 0 ? 'Verificar COEFICIENTES' : 'OK' },
    { label: '🟡 VIF > 5 (moderado)', value: res.vif.filter(v => v > 5).length },
    { section: '🚨 OUTLIERS' },
    { label: '🚨 Outliers (|std|>2)', value: res.resid_std.filter(r => Math.abs(r) > 2).length, good: res.resid_std.filter(r => Math.abs(r) > 2).length === 0 },
  ], name), 'MODEL_KPIs');

  const coefRows = [
    [cell('📋 Coeficiente', S.hPurple), cell('📈 Estimativa', S.hTeal), cell('🔧 Erro Padrão', S.hGray), cell('📊 t', S.hBlue), cell('🎯 p-valor', S.hRed), cell('📉 IC Lo 95%', S.hGray), cell('📈 IC Hi 95%', S.hGray), cell('🔬 VIF', S.hOrange), cell('⭐ Signif', S.hGreen)],
    ...res.beta.map((b, j) => {
      const pv = res.p_beta[j];
      const vif = j === 0 ? '' : (res.vif[j - 1] >= 9999 ? '>999' : res.vif[j - 1].toFixed(2));
      const vifHigh = j > 0 && res.vif[j - 1] > 10;
      const z = zebra(j);
      const base = z ? S.even : S.odd;
      const sigS = pv < 0.05 ? S.good : S.warn;
      const vifS = vifHigh ? S.crit : base;
      return [
        cell(j === 0 ? '🔢 β₀ (Intercepto)' : `📈 β${j} (${res.varNames[j - 1]})`, z ? S.kpiLabel : { ...S.kpiLabel, fill: { fgColor: { rgb: XC.ROW_BASE }, patternType: 'solid' } }),
        cell(b, base), cell(res.se_beta[j], base),
        cell(res.t_beta[j], base), cell(pv < 0.0001 ? '<0.0001' : pv.toFixed(4), sigS),
        cell(res.ci_lo[j], base), cell(res.ci_hi[j], base),
        cell(vif, vifS), cell(sigStars(pv), sigS),
      ];
    }),
  ];
  const wsCoef = buildWS([[cell(`📋 COEFICIENTES — ${name}`, S.title)], ...coefRows], [22, 14, 12, 12, 12, 14, 14, 10, 8]);
  mergeRange(wsCoef, 0, 0, 0, 8);
  XLSX.utils.book_append_sheet(wb, wsCoef, 'COEFICIENTES');

  const compRows = [];
  [['📈 R²', res.r2], ['📉 R²_Adj', res.r2adj], ['📐 MAE', _mae], ['📐 RMSE', _rmse],
   ['📊 F_stat', res.Fstat], ['🎯 p_F', res.pF], ['🔢 n', res.n], ['🔢 k', res.k],
  ].forEach(([m, v]) => compRows.push([name, 'Múltipla', m, v]));
  XLSX.utils.book_append_sheet(wb, buildCompSheet(compRows, name), 'MODEL_COMPARISON');

  const wsAnova = buildWS([
    [cell('📊 ANOVA — ' + name, S.title)],
    [cell('📋 Fonte', S.hBlue), cell('∑ SQ', S.hOrange), cell('GL', S.hGray), cell('MQ', S.hOrange), cell('F', S.hTeal), cell('p-valor', S.hRed)],
    [cell('Regressão', S.kpiLabel), cell(res.SSR, S.num4), cell(res.k, S.even), cell(res.MSR, S.num4), cell(res.Fstat, S.num4), cell(res.pF < 0.0001 ? '<0.0001' : res.pF.toFixed(4), res.pF < 0.05 ? S.good : S.crit)],
    [cell('Resíduo',   S.kpiLabel), cell(res.SSE, S.num4Odd), cell(res.df_resid, S.odd), cell(res.MSE, S.num4Odd), cell('', S.odd), cell('', S.odd)],
    [cell('Total',     S.kpiLabel), cell(res.SST, S.num4), cell(res.n - 1, S.even), cell('', S.even), cell('', S.even), cell('', S.even)],
  ], [16, 14, 6, 14, 12, 10]);
  mergeRange(wsAnova, 0, 0, 0, 5);
  XLSX.utils.book_append_sheet(wb, wsAnova, 'ANOVA');

  XLSX.utils.book_append_sheet(wb, buildDashSheet(
    [
      { label: '📈 R²', value: res.r2.toFixed(4), note: qualLabel(res.r2adj), good: res.r2 >= 0.7 },
      { label: '📉 R² Ajustado', value: res.r2adj.toFixed(4), note: qualLabel(res.r2adj), good: res.r2adj >= 0.7 },
      { label: '📐 MAE', value: _mae.toFixed(4) }, { label: '📐 RMSE', value: _rmse.toFixed(4) },
      { label: '✅ Significativo?', value: isSignif ? '✅ SIM' : '❌ NÃO', good: isSignif },
      { label: '📋 Vars signif.', value: sigVars.join(', ') || 'nenhuma', good: sigVars.length > 0 },
      { label: '⚠️ VIF crítico (>10)', value: highVIF, good: highVIF === 0 },
      { label: '🚨 Outliers', value: res.resid_std.filter(r => Math.abs(r) > 2).length, good: res.resid_std.filter(r => Math.abs(r) > 2).length === 0 },
    ],
    name, 'Regressão Múltipla', null, null,
    ['→ PREDICTION_ANALYSIS: Real vs Previsto → Dispersão', '→ COEFICIENTES: ordenar p-valor para variáveis-chave', '→ MODEL_COMPARISON: Tabela Dinâmica Métrica por Modelo', '→ Slicer em VIF para identificar multicolinearidade']
  ), 'DASHBOARD');

  const majorVar = (() => { let mx = 0, nm = ''; res.varNames.forEach((n, i) => { if (Math.abs(res.beta[i + 1]) > mx) { mx = Math.abs(res.beta[i + 1]); nm = n; } }); return nm; })();
  XLSX.utils.book_append_sheet(wb, buildInsightsSheet([
    { section: '🏆 QUALIDADE GERAL' },
    { label: 'Ajuste', value: qualLabel(res.r2adj), good: res.r2adj >= 0.7, note: `R²adj = ${(res.r2adj * 100).toFixed(1)}%` },
    { label: 'Modelo significativo?', value: isSignif ? '✅ SIM' : '❌ NÃO', good: isSignif },
    { section: '📈 VARIÁVEIS' },
    { label: 'Vars significativas', value: sigVars.join(', ') || 'nenhuma', good: sigVars.length > 0 },
    { label: 'Maior impacto absoluto |β|', value: majorVar },
    { section: '⚠️ DIAGNÓSTICO' },
    { label: 'Multicolinearidade', value: highVIF > 0 ? '❌ VIF crítico em ' + highVIF + ' var(s)' : '✅ VIF OK', good: highVIF === 0 },
    { label: 'Outliers', value: res.resid_std.filter(r => Math.abs(r) > 2).length, good: res.resid_std.filter(r => Math.abs(r) > 2).length === 0 },
    { section: '💡 RECOMENDAÇÃO' },
    { label: 'Próximo passo', value: highVIF > 0 ? '⚠️ Remover/combinar vars com VIF > 10' : res.r2adj < 0.5 ? '⚠️ Adicionar mais preditores ou checar não-linearidade' : '✅ Modelo adequado' },
  ], name), 'INSIGHTS');

  XLSX.writeFile(wb, name.replace(/[^a-zA-Z0-9_-]/g, '_') + '_BI.xlsx');
}

export function mExportCSV() {
  if (!mLastResult) return;
  const res = mLastResult;
  const header = [...res.varNames, res.labelY, 'Yhat', 'Residuo', 'Residuo_Std'];
  const rows = res.Y.map((y, i) => [...res.Xs.map(x => x[i]), y, res.yhat[i], res.resid[i], res.resid_std[i]]);
  downloadCSV((document.getElementById('m-analysis-name').value || 'multipla') + '.csv', header, rows);
}
