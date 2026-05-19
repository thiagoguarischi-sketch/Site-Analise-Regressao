// Regressão logística — gradient descent, deviance, AUC, ROC, calibração e exportações.

import { fmt, fmtP, esc, sigStars } from '../core/utils.js';
import { showToast } from '../ui/notifications.js';
import { saveAnalysisRequest } from '../services/analysisService.js';
import { analyze } from '../services/computeService.js';
import { callAI, aiLoadingHTML, aiResultHTML, aiFallbackHTML } from '../services/authService.js';
import {
  XC, S, cell, zebra, buildWS, autoFilter, mergeRange, downloadCSV,
  buildRawSheet, buildKPISheet, buildCompSheet, buildDashSheet, buildInsightsSheet,
} from '../services/exportService.js';
import { switchTab } from '../ui/dashboard.js';
import { loadHistory, updateProfileStats } from '../ui/tables.js';
import {
  createROC, createPredictedProbsScatter, createDevianceResid, createCalibration,
} from '../charts/dashboardCharts.js';

let lgVars = [];
let lgLastResult = null;
const LGC = {};

export function lgInitState() {
  lgVars = [];
  lgRenderVarChips();
  lgRenderTableHeader();
  lgInitRows();
}

export function lgAddVar() {
  const inp = document.getElementById('lg-new-var-name');
  const name = inp.value.trim();
  if (!name) { showToast(window.t('toast-var-name-req'), 'err'); return; }
  if (lgVars.find(v => v.name === name)) { showToast(window.t('toast-var-exists'), 'err'); return; }
  if (lgVars.length >= 8) { showToast(window.t('toast-var-max'), 'err'); return; }
  lgVars.push({ name });
  inp.value = '';
  lgRenderVarChips();
  lgRenderTableHeader();
  lgInitRows();
}

export function lgRemoveVar(name) {
  lgVars = lgVars.filter(v => v.name !== name);
  lgRenderVarChips();
  lgRenderTableHeader();
  lgInitRows();
}

function lgRenderVarChips() {
  const el = document.getElementById('lg-var-list');
  if (!lgVars.length) {
    el.innerHTML = `<span style="font-size:12px;color:var(--txt3)">${window.t('chip-no-vars')}</span>`;
    return;
  }
  el.innerHTML = lgVars.map((v, i) => `
    <span class="var-chip">
      X${i + 1}: ${esc(v.name)}
      <button class="var-chip-rm" onclick="lgRemoveVar('${esc(v.name)}')" title="Remover">×</button>
    </span>`).join('');
}

function lgRenderTableHeader() {
  const el = document.getElementById('lg-table-header');
  const ly = document.getElementById('lg-label-y').value || 'Y (0/1)';
  if (!lgVars.length) {
    el.innerHTML = `<div style="font-size:12px;color:var(--txt3);padding:8px 0">${window.t('chip-add-vars-first')}</div>`;
    return;
  }
  const cols = ['#', ...lgVars.map((v, i) => `X${i + 1}: ${v.name}`), ly];
  el.innerHTML = `<div style="display:grid;grid-template-columns:36px ${lgVars.map(() => '1fr').join(' ')} 1fr;gap:6px;margin-bottom:4px">
    ${cols.map((c, i) => `<div class="data-header-label ${i === 0 ? '' : i === cols.length - 1 ? 'data-header-y' : 'data-header-x'}" style="font-size:11px;padding:4px 6px;border-radius:5px;text-align:center;${i === 0 ? 'background:transparent;color:var(--txt3)' : ''}">${esc(c)}</div>`).join('')}
  </div>`;
}

function lgInitRows(n = 10) {
  document.getElementById('lg-data-rows').innerHTML = '';
  for (let i = 0; i < n; i++) lgAddRow();
  lgUpdateCount();
}

export function lgAddRow() {
  if (!lgVars.length) return;
  const container = document.getElementById('lg-data-rows');
  const i = container.children.length + 1;
  const row = document.createElement('div');
  row.style.cssText = `display:grid;grid-template-columns:36px ${lgVars.map(() => '1fr').join(' ')} 1fr;gap:6px;margin-bottom:6px;align-items:center`;
  row.innerHTML = `<span class="data-row-n">${i}</span>` +
    lgVars.map(() => `<input class="data-input" type="number" placeholder="x" oninput="lgUpdateCount()" step="any">`).join('') +
    `<input class="data-input" type="number" placeholder="0 ou 1" oninput="lgUpdateCount()" min="0" max="1" step="1">`;
  container.appendChild(row);
}

export function lgAddRowTop() {
  if (!lgVars.length) return;
  const container = document.getElementById('lg-data-rows');
  const row = document.createElement('div');
  row.style.cssText = `display:grid;grid-template-columns:36px ${lgVars.map(() => '1fr').join(' ')} 1fr;gap:6px;margin-bottom:6px;align-items:center`;
  row.innerHTML = `<span class="data-row-n">1</span>` +
    lgVars.map(() => `<input class="data-input" type="number" placeholder="x" oninput="lgUpdateCount()" step="any">`).join('') +
    `<input class="data-input" type="number" placeholder="0 ou 1" oninput="lgUpdateCount()" min="0" max="1" step="1">`;
  container.prepend(row);
  Array.from(container.children).forEach((r, i) => {
    const span = r.querySelector('.data-row-n');
    if (span) span.textContent = i + 1;
  });
  row.querySelector('input').focus();
}

export function lgClearRows() {
  document.getElementById('lg-data-rows').innerHTML = '';
  lgInitRows();
  document.getElementById('lg-results').style.display = 'none';
  lgLastResult = null;
}

function lgGetData() {
  const rows = document.getElementById('lg-data-rows').children;
  const k = lgVars.length;
  const Xs = Array.from({ length: k }, () => []);
  const Y = [];
  for (const row of rows) {
    const inputs = row.querySelectorAll('input');
    const vals = Array.from(inputs).map(inp => parseFloat(inp.value));
    if (vals.some(isNaN)) continue;
    const yval = vals[k];
    if (yval !== 0 && yval !== 1) continue;
    vals.slice(0, k).forEach((v, j) => Xs[j].push(v));
    Y.push(yval);
  }
  return { Xs, Y, k };
}

export function lgUpdateCount() {
  const { Y } = lgGetData();
  document.getElementById('lg-data-count').textContent = `${Y.length} ${window.t(Y.length !== 1 ? 'obs-plural' : 'obs-single')}`;
}

export function lgLoadExample() {
  const isEn = (localStorage.getItem('slope-lang') || 'pt') === 'en';
  const vars = isEn
    ? ['Age', 'Income ($k)', 'Time on site (min)']
    : ['Idade', 'Renda (R$k)', 'Tempo no site (min)'];
  const data = [
    [25, 3.5, 8, 1], [45, 8.2, 3, 0], [32, 5.1, 12, 1], [28, 4.0, 15, 1], [55, 12.0, 2, 0],
    [38, 6.5, 9, 1], [22, 2.8, 20, 1], [60, 15.0, 1, 0], [35, 5.8, 11, 1], [48, 9.5, 4, 0],
    [29, 4.2, 14, 1], [52, 11.0, 2, 0], [41, 7.2, 7, 1], [26, 3.1, 18, 1], [58, 13.5, 1, 0],
    [33, 5.5, 10, 1], [44, 8.8, 5, 0], [27, 3.8, 16, 1], [50, 10.2, 3, 0], [36, 6.0, 8, 1],
  ];
  document.getElementById('lg-analysis-name').value = isEn ? 'Online Purchase' : 'Compra Online';
  document.getElementById('lg-label-y').value = isEn ? 'Purchased (0/1)' : 'Comprou (0/1)';
  lgVars = vars.map(name => ({ name }));
  lgRenderVarChips();
  lgRenderTableHeader();
  document.getElementById('lg-data-rows').innerHTML = '';
  data.forEach(row => {
    lgAddRow();
    const rows = document.getElementById('lg-data-rows').children;
    const last = rows[rows.length - 1];
    const inputs = last.querySelectorAll('input');
    row.forEach((v, j) => { inputs[j].value = v; });
  });
  lgUpdateCount();
}


export async function runLogistic() {
  const { Xs, Y, k } = lgGetData();
  if (k === 0) { showToast(window.t('toast-add-vars'), 'err'); return; }
  if (Y.length < k + 2) { showToast(`${window.t('lbl-enter-at-least')} ${k + 2} ${window.t('obs-plural')}.`, 'err'); return; }
  if (!Y.some(y => y === 0) || !Y.some(y => y === 1)) { showToast(window.t('toast-y-binary'), 'err'); return; }

  let res;
  try {
    res = await analyze('logistic', {}, { Xs, Y });
  } catch (e) { showToast(window.t('toast-server-err') + e.message, 'err'); return; }
  res.varNames = lgVars.map(v => v.name);
  res.labelY = document.getElementById('lg-label-y').value || 'Y';
  res.Xs = Xs; res.Y = Y;
  lgLastResult = res;

  renderLogisticResults(res);
  document.getElementById('lg-results').style.display = 'block';
  document.getElementById('lg-btn-save').style.display = 'inline-flex';
  lgBuildPredInputs(res);
  lgGenerateAI(res);
  showToast(window.t('toast-done-log'), 'ok');
}

function renderLogisticResults(res) {
  const { n, k, mcFaddenR2, aic, bic, auc, deviance, nullDeviance, chiStat, pChi, cm } = res;

  document.getElementById('lg-metrics').innerHTML = `
    <div class="metric"><div class="metric-val metric-y">${mcFaddenR2.toFixed(4)}</div><div class="metric-lab">R² McFadden</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--x)">${auc.toFixed(4)}</div><div class="metric-lab">AUC-ROC</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--acc2)">${aic.toFixed(2)}</div><div class="metric-lab">AIC</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--acc2)">${bic.toFixed(2)}</div><div class="metric-lab">BIC</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--txt2)">${n}</div><div class="metric-lab">n</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--txt2)">${k}</div><div class="metric-lab">${window.t('reg-predictors')}</div></div>
  `;

  document.getElementById('lg-global-tests').innerHTML = `
    <div class="alert ${pChi < 0.05 ? 'alert-ok' : 'alert-err'}">
      <b>${window.t('test-chi2-lr')}:</b> χ²(${k})=${chiStat.toFixed(4)}, p=${fmtP(pChi)}
      — ${window.t('anova-regression')} ${pChi < 0.05 ? window.t('stat-sig') : window.t('stat-not-sig')}
    </div>
    <div style="display:flex;gap:10px;margin-top:8px;font-size:12px;color:var(--txt2)">
      <span>${window.t('lg-deviance-null')}: ${nullDeviance.toFixed(2)}</span>
      <span>${window.t('lg-deviance-resid')}: ${deviance.toFixed(2)}</span>
    </div>`;

  const pSig = p => p < 0.001 ? '***' : p < 0.01 ? '**' : p < 0.05 ? '*' : p < 0.1 ? '†' : '';
  const pClass = p => p < 0.05 ? 'sig-high' : p < 0.1 ? 'sig-med' : 'sig-none';
  const coefRows = res.beta.map((b, j) => {
    const name = j === 0 ? 'β₀ (Intercepto)' : `β${j} (${esc(res.varNames[j - 1])})`;
    return `<tr>
      <td>${name}</td>
      <td>${fmt(b)}</td>
      <td>${fmt(res.seBeta[j])}</td>
      <td>${fmt(res.or[j])}</td>
      <td>[${fmt(res.orLo[j])}, ${fmt(res.orHi[j])}]</td>
      <td>${fmt(res.zStat[j])}</td>
      <td class="${pClass(res.pZ[j])}">${fmtP(res.pZ[j])} ${pSig(res.pZ[j])}</td>
    </tr>`;
  }).join('');
  document.getElementById('lg-coef-tbl').innerHTML = `
    <table class="data-table">
      <thead><tr><th>${window.t('tbl-coef')}</th><th>β</th><th>${window.t('tbl-se')}</th><th>OR</th><th>${window.t('tbl-ci95')} OR</th><th>z</th><th>${window.t('tbl-pvalue')}</th></tr></thead>
      <tbody>${coefRows}</tbody>
    </table>
    <p style="font-size:11px;color:var(--txt3);margin-top:6px;padding:0 4px">* p<0.05 ** p<0.01 *** p<0.001 † p<0.1 | OR = Odds Ratio</p>`;

  const { tp, tn, fp, fn, acc, prec, rec, f1, spec } = cm;
  document.getElementById('lg-confusion-matrix').innerHTML = `
    <div style="font-size:12px;font-weight:600;color:var(--txt2);margin-bottom:8px">${window.t('cm-title')}</div>
    <table style="border-collapse:collapse;font-size:13px">
      <tr>
        <td style="padding:6px 10px;color:var(--txt3);font-size:11px"></td>
        <td style="padding:6px 10px;text-align:center;font-size:11px;color:var(--x);font-weight:600">${window.t('cm-pred-label')} 0</td>
        <td style="padding:6px 10px;text-align:center;font-size:11px;color:var(--y);font-weight:600">${window.t('cm-pred-label')} 1</td>
      </tr>
      <tr>
        <td style="padding:6px 10px;font-size:11px;color:var(--x);font-weight:600">${window.t('cm-actual')} 0</td>
        <td style="padding:8px 16px;background:rgba(0,212,160,.12);border:1px solid var(--brd);border-radius:6px 0 0 0;text-align:center;font-weight:700;color:var(--y)">${tn}</td>
        <td style="padding:8px 16px;background:rgba(255,107,107,.1);border:1px solid var(--brd);border-radius:0 6px 0 0;text-align:center;font-weight:700;color:var(--acc)">${fp}</td>
      </tr>
      <tr>
        <td style="padding:6px 10px;font-size:11px;color:var(--y);font-weight:600">${window.t('cm-actual')} 1</td>
        <td style="padding:8px 16px;background:rgba(255,107,107,.1);border:1px solid var(--brd);border-radius:0 0 0 6px;text-align:center;font-weight:700;color:var(--acc)">${fn}</td>
        <td style="padding:8px 16px;background:rgba(0,212,160,.12);border:1px solid var(--brd);border-radius:0 0 6px 0;text-align:center;font-weight:700;color:var(--y)">${tp}</td>
      </tr>
    </table>`;
  document.getElementById('lg-class-metrics').innerHTML = `
    <div style="font-size:12px;font-weight:600;color:var(--txt2);margin-bottom:8px">${window.t('cls-metrics-title')}</div>
    ${[[window.t('cls-accuracy'), acc], [window.t('cls-precision'), prec], [window.t('cls-recall'), rec], [window.t('cls-specificity'), spec], ['F1-Score', f1]].map(([lab, val]) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--brd);font-size:13px">
      <span style="color:var(--txt2)">${lab}</span>
      <span style="font-weight:600;color:${val >= 0.8 ? 'var(--y)' : val >= 0.6 ? 'var(--acc2)' : 'var(--acc)'}">${(val * 100).toFixed(1)}%</span>
    </div>`).join('')}`;

  renderLogisticCharts(res);
}

function renderLogisticCharts(res) {
  const { Y, probs, devResid } = res;

  Object.keys(LGC).forEach(k => { if (LGC[k]) { LGC[k].destroy(); delete LGC[k]; } });

  LGC.roc   = createROC('lg-chart-roc', Y, probs, res.auc);
  LGC.prob  = createPredictedProbsScatter('lg-chart-prob', probs, Y);
  LGC.resid = createDevianceResid('lg-chart-resid', probs, devResid);
  LGC.calib = createCalibration('lg-chart-calib', probs, Y);
}

function lgBuildPredInputs(res) {
  const el = document.getElementById('lg-pred-inputs');
  el.innerHTML = res.varNames.map((name, i) => `
    <div class="field-group">
      <label class="field-label">X${i + 1}: ${esc(name)}</label>
      <input class="data-input" type="number" id="lg-px-${i}" placeholder="valor" step="any" style="width:100%">
    </div>`).join('');
}

export function runLogisticPrediction() {
  if (!lgLastResult) { showToast(window.t('toast-run-first'), 'err'); return; }
  const res = lgLastResult;
  const xVals = res.varNames.map((_, i) => parseFloat(document.getElementById(`lg-px-${i}`).value));
  if (xVals.some(isNaN)) { showToast(window.t('toast-fill-vals'), 'err'); return; }
  const threshold = parseFloat(document.getElementById('lg-threshold').value);
  const z = res.beta[0] + xVals.reduce((s, v, j) => s + res.beta[j + 1] * v, 0);
  const prob = sigmoid(z);
  const pred = prob >= threshold ? 1 : 0;
  const box = document.getElementById('lg-pred-result');
  box.style.display = 'block';
  box.innerHTML = `
    <div class="pred-result">
      <div style="font-size:13px;color:var(--txt2);margin-bottom:4px">
        Previsão para: ${res.varNames.map((n, i) => `${esc(n)}=${xVals[i]}`).join(', ')}
      </div>
      <div class="pred-val" style="color:${pred === 1 ? 'var(--y)' : 'var(--acc)'}">
        ${res.labelY} = ${pred} (${pred === 1 ? window.t('lbl-class-1') : window.t('lbl-class-0')})
      </div>
      <div class="pred-interval">
        P(Y=1) = <b>${(prob * 100).toFixed(2)}%</b> &nbsp;|&nbsp; Limiar: ${threshold}<br>
        Logit (z) = ${z.toFixed(4)}
      </div>
    </div>`;
}

async function lgGenerateAI(res) {
  const box = document.getElementById('lg-ai-box');
  box.innerHTML = aiLoadingHTML();
  const isEn = (localStorage.getItem('slope-lang') || 'pt') === 'en';
  const coefSummary = res.beta.map((b, j) => j === 0 ? `β₀=${b.toFixed(4)}` : `β${j}(${res.varNames[j - 1]})=${b.toFixed(4)}, OR=${res.or[j].toFixed(4)}, p=${res.pZ[j].toFixed(4)}`).join('\n');
  const stats = `Y: ${res.labelY} | X: ${res.varNames.map((n, i) => `X${i + 1}=${n}`).join(', ')} | n=${res.n}, k=${res.k}\n${coefSummary}\nR²McF=${res.mcFaddenR2.toFixed(4)}, AUC=${res.auc.toFixed(4)}, χ²=${res.chiStat.toFixed(4)}, p=${res.pChi.toFixed(6)}\nAIC=${res.aic.toFixed(2)}, BIC=${res.bic.toFixed(2)}, Accuracy=${(res.cm.acc * 100).toFixed(1)}%, F1=${(res.cm.f1 * 100).toFixed(1)}%`;
  const prompt = isEn
    ? `You are a statistics expert. Analyze this logistic regression in English (4 short paragraphs):\n\n${stats}\n\nInclude: 1) interpretation of significant ORs 2) fit quality 3) discriminative power (AUC) 4) limitations.`
    : `Você é especialista em estatística. Analise esta regressão logística em português (4 parágrafos curtos):\n\n${stats}\n\nInclua: 1) interpretação dos OR significativos 2) qualidade do ajuste 3) poder discriminativo (AUC) 4) limitações.`;

  try {
    const text = await callAI(prompt);
    box.innerHTML = aiResultHTML(text);
  } catch (e) {
    box.innerHTML = aiFallbackHTML(`AUC=${res.auc.toFixed(3)}, R²McF=${res.mcFaddenR2.toFixed(3)}, Acurácia=${(res.cm.acc * 100).toFixed(1)}%.`);
  }
}

export async function lgSaveAnalysis() {
  if (!lgLastResult) { showToast(window.t('toast-run-first'), 'err'); return; }
  document.getElementById('lg-cloud-saving').style.display = 'flex';
  try {
    const res = lgLastResult;
    await saveAnalysisRequest({
      nome: document.getElementById('lg-analysis-name').value || 'Regressão Logística',
      tipo: 'logistica',
      dados: {
        labelY: res.labelY, varNames: res.varNames,
        mcFaddenR2: res.mcFaddenR2, auc: res.auc,
        n: res.n, k: res.k, beta: res.beta,
        aic: res.aic, bic: res.bic,
        cm: { acc: res.cm.acc, f1: res.cm.f1 },
        Xs: res.Xs, Y: res.Y,
      },
    });
    showToast(window.t('toast-saved-log'), 'ok');
    await loadHistory();
    await updateProfileStats();
  } catch (err) {
    showToast(window.t('toast-save-err') + (err.message || err), 'err');
  } finally {
    document.getElementById('lg-cloud-saving').style.display = 'none';
  }
}

export async function loadLogisticAnalysis(a) {
  const d = a.dados || {};
  switchTab('logistica', document.querySelectorAll('.tab-btn')[2]);
  await new Promise(r => setTimeout(r, 100));
  document.getElementById('lg-analysis-name').value = a.nome || '';
  document.getElementById('lg-label-y').value = d.labelY || 'Y (0/1)';
  if (d.varNames && d.varNames.length > 0) {
    lgVars = d.varNames.map(name => ({ name }));
    lgRenderVarChips();
    lgRenderTableHeader();
    if (d.Xs && d.Y && d.Y.length > 0) {
      document.getElementById('lg-data-rows').innerHTML = '';
      d.Y.forEach((y, i) => {
        lgAddRow();
        const rows = document.getElementById('lg-data-rows').children;
        const last = rows[rows.length - 1];
        const inputs = last.querySelectorAll('input');
        d.Xs.forEach((xi, j) => { inputs[j].value = xi[i]; });
        inputs[d.Xs.length].value = y;
      });
      lgUpdateCount();
    }
  }
  showToast(window.t('toast-loaded-log'), 'info');
}

export function lgExportExcel() {
  if (!lgLastResult) return;
  const res = lgLastResult;
  const name = document.getElementById('lg-analysis-name').value || 'Logística';
  const wb = XLSX.utils.book_new();

  const rawRows = res.Y.map((y, i) => [i + 1, ...res.Xs.map(x => x[i]), y, 'Logística', name]);
  XLSX.utils.book_append_sheet(wb, buildRawSheet('ID', res.varNames, res.labelY, rawRows, name), 'RAW_DATA');

  const predRows = res.Y.map((y, i) => [
    i + 1, y, res.probs[i], res.predY[i],
    y === res.predY[i] ? 'não' : 'SIM',
    res.devResid ? res.devResid[i] : '', '', '', 'Logística',
  ]);
  const lgPredRows = predRows.map((r, i) => {
    const errado = r[4] === 'SIM';
    const z = zebra(i);
    const base = errado ? S.warn : (z ? S.even : S.odd);
    return [
      cell(r[0], base), cell(r[1], base),
      cell(r[2], { ...(z ? S.pct2 : S.pctOdd) }),
      cell(r[3], base), cell(r[4], errado ? S.crit : S.good),
      cell(r[5], base), cell('', base), cell('', base), cell(r[8], z ? S.evenL : S.oddL),
    ];
  });
  const lgPredWS = buildWS([
    [cell(`🎯 PREDICTION ANALYSIS — ${name}`, S.title)],
    [cell('🔢 ID', S.hDark), cell('📈 Real', S.hGreen), cell('📊 P(Y=1)', S.hBlue), cell('🎯 Previsto', S.hBlue), cell('❌ Erro?', S.hRed), cell('📉 Dev.Resid', S.hOrange), cell('', S.hGray), cell('', S.hGray), cell('🤖 Modelo', S.hGray)],
    ...lgPredRows,
  ], [6, 10, 12, 12, 10, 14, 8, 8, 18]);
  mergeRange(lgPredWS, 0, 0, 0, 8);
  autoFilter(lgPredWS, 8, predRows.length + 1);
  XLSX.utils.book_append_sheet(wb, lgPredWS, 'PREDICTION_ANALYSIS');

  const wsCM = buildWS([
    [cell('🔲 CONFUSION MATRIX — ' + name, S.title)],
    [cell('', S.empty), cell('🎯 Pred = 0', S.hBlue), cell('🎯 Pred = 1', S.hBlue)],
    [cell('✅ Real = 0', S.hGreen), cell(res.cm.tn, S.good), cell(res.cm.fp, S.crit)],
    [cell('✅ Real = 1', S.hGreen), cell(res.cm.fn, S.crit), cell(res.cm.tp, S.good)],
    [cell('', S.empty)],
    [cell('📊 MÉTRICAS', S.section), cell('', S.sectionR), cell('', S.sectionR)],
    [cell('✅ Acurácia',    S.kpiLabel), cell((res.cm.acc * 100).toFixed(1) + '%', res.cm.acc >= 0.8 ? S.good : res.cm.acc < 0.6 ? S.crit : S.warn)],
    [cell('🎯 Precisão',   S.kpiLabel), cell((res.cm.prec * 100).toFixed(1) + '%', res.cm.prec >= 0.8 ? S.good : S.warn)],
    [cell('🔁 Recall',     S.kpiLabel), cell((res.cm.rec * 100).toFixed(1) + '%',  res.cm.rec >= 0.8 ? S.good : S.warn)],
    [cell('⚖️ F1-Score',   S.kpiLabel), cell((res.cm.f1 * 100).toFixed(1) + '%',   res.cm.f1 >= 0.8 ? S.good : S.warn)],
    [cell('📊 AUC-ROC',   S.kpiLabel), cell(res.auc.toFixed(4), res.auc >= 0.8 ? S.good : res.auc < 0.6 ? S.crit : S.warn)],
    [cell('🔬 Especific.', S.kpiLabel), cell(res.cm.spec ? (res.cm.spec * 100).toFixed(1) + '%' : 'N/A', S.even)],
  ], [18, 16, 16]);
  mergeRange(wsCM, 0, 0, 0, 2);
  XLSX.utils.book_append_sheet(wb, wsCM, 'CONFUSION_MATRIX');

  const aucQ = res.auc >= 0.9 ? '🏆 Excelente' : res.auc >= 0.8 ? '✅ Bom' : res.auc >= 0.7 ? '⚠️ Aceitável' : '❌ Fraco';
  XLSX.utils.book_append_sheet(wb, buildKPISheet([
    { section: '📌 MODELO' },
    { label: '🏷️ Nome', value: name }, { label: '🤖 Tipo', value: 'Logística' },
    { label: '🔢 n', value: res.n }, { label: '🔢 k', value: res.k },
    { section: '📊 QUALIDADE' },
    { label: '📊 R² McFadden', value: res.mcFaddenR2.toFixed(4), good: res.mcFaddenR2 >= 0.2 },
    { label: '📊 AUC-ROC', value: res.auc.toFixed(4), note: aucQ, good: res.auc >= 0.7 },
    { label: '📉 AIC', value: res.aic.toFixed(2) }, { label: '📉 BIC', value: res.bic.toFixed(2) },
    { section: '🎯 CLASSIFICAÇÃO' },
    { label: '✅ Acurácia', value: (res.cm.acc * 100).toFixed(1) + '%', good: res.cm.acc >= 0.8 },
    { label: '🎯 Precisão', value: (res.cm.prec * 100).toFixed(1) + '%', good: res.cm.prec >= 0.8 },
    { label: '🔁 Recall', value: (res.cm.rec * 100).toFixed(1) + '%', good: res.cm.rec >= 0.8 },
    { label: '⚖️ F1-Score', value: (res.cm.f1 * 100).toFixed(1) + '%', good: res.cm.f1 >= 0.8 },
    { section: '🔲 ERROS DE CLASSIFICAÇÃO' },
    { label: '✅ Verdadeiro Positivo (VP)', value: res.cm.tp, good: true },
    { label: '✅ Verdadeiro Negativo (VN)', value: res.cm.tn, good: true },
    { label: '❌ Falso Positivo (FP)', value: res.cm.fp, good: res.cm.fp === 0 },
    { label: '❌ Falso Negativo (FN)', value: res.cm.fn, good: res.cm.fn === 0 },
  ], name), 'MODEL_KPIs');

  const sigVarsLg = res.varNames.filter((_, j) => res.pZ[j + 1] < 0.05);
  const coefRows = res.beta.map((b, j) => {
    const pv = res.pZ[j];
    const z = zebra(j);
    const base = z ? S.even : S.odd;
    const sigS = pv < 0.05 ? S.good : S.warn;
    return [
      cell(j === 0 ? '🔢 β₀ (Intercepto)' : `📈 β${j} (${res.varNames[j - 1]})`, z ? S.kpiLabel : { ...S.kpiLabel, fill: { fgColor: { rgb: XC.ROW_BASE }, patternType: 'solid' } }),
      cell(b, base), cell(res.seBeta[j], base), cell(res.or[j].toFixed(4), base),
      cell(res.orLo[j].toFixed(4), base), cell(res.orHi[j].toFixed(4), base),
      cell(res.zStat[j], base), cell(pv < 0.0001 ? '<0.0001' : pv.toFixed(4), sigS),
      cell(sigStars(pv), sigS),
    ];
  });
  const wsCoef = buildWS([
    [cell('📋 COEFICIENTES (OR) — ' + name, S.title)],
    [cell('📋 Coeficiente', S.hPurple), cell('📈 β', S.hTeal), cell('🔧 EP', S.hGray), cell('⚖️ OR', S.hBlue), cell('📉 OR Lo 95%', S.hGray), cell('📈 OR Hi 95%', S.hGray), cell('📊 z', S.hOrange), cell('🎯 p-valor', S.hRed), cell('⭐', S.hGreen)],
    ...coefRows,
  ], [22, 12, 10, 12, 14, 14, 10, 12, 6]);
  mergeRange(wsCoef, 0, 0, 0, 8);
  XLSX.utils.book_append_sheet(wb, wsCoef, 'COEFICIENTES');

  const compRows = [
    [name, 'Logística', '📊 R² McFadden', res.mcFaddenR2],
    [name, 'Logística', '📊 AUC-ROC', res.auc],
    [name, 'Logística', '📉 AIC', res.aic],
    [name, 'Logística', '✅ Acurácia', res.cm.acc],
    [name, 'Logística', '⚖️ F1-Score', res.cm.f1],
    [name, 'Logística', '🎯 Precisão', res.cm.prec],
    [name, 'Logística', '🔁 Recall', res.cm.rec],
    [name, 'Logística', '🔢 n', res.n],
  ];
  XLSX.utils.book_append_sheet(wb, buildCompSheet(compRows, name), 'MODEL_COMPARISON');

  XLSX.utils.book_append_sheet(wb, buildDashSheet(
    [
      { label: '📊 AUC-ROC', value: res.auc.toFixed(4), note: aucQ, good: res.auc >= 0.7 },
      { label: '✅ Acurácia', value: (res.cm.acc * 100).toFixed(1) + '%', good: res.cm.acc >= 0.8 },
      { label: '⚖️ F1-Score', value: (res.cm.f1 * 100).toFixed(1) + '%', good: res.cm.f1 >= 0.8 },
      { label: '❌ Falsos Positivos', value: res.cm.fp, good: res.cm.fp === 0 },
      { label: '❌ Falsos Negativos', value: res.cm.fn, good: res.cm.fn === 0 },
      { label: '📊 R² McFadden', value: res.mcFaddenR2.toFixed(4), good: res.mcFaddenR2 >= 0.2 },
    ],
    name, 'Logística', null,
    ['→ PREDICTION_ANALYSIS: P(Y=1) por ID → curva ROC manual', '→ CONFUSION_MATRIX: visualizar VP/VN/FP/FN', '→ COEFICIENTES: OR > 1 = fator de risco, OR < 1 = fator protetor', '→ MODEL_COMPARISON: comparar AUC entre modelos']
  ), 'DASHBOARD');

  XLSX.utils.book_append_sheet(wb, buildInsightsSheet([
    { section: '🏆 QUALIDADE' },
    { label: 'AUC-ROC', value: aucQ + ` (${res.auc.toFixed(4)})`, good: res.auc >= 0.7 },
    { label: 'Acurácia', value: (res.cm.acc * 100).toFixed(1) + '%', good: res.cm.acc >= 0.8 },
    { section: '📈 VARIÁVEIS SIGNIFICATIVAS' },
    { label: 'Vars p<0.05', value: sigVarsLg.join(', ') || 'nenhuma', good: sigVarsLg.length > 0 },
    { label: 'Maior OR', value: (() => { let mx = 0, nm = ''; res.varNames.forEach((n, i) => { if (res.or[i + 1] > mx) { mx = res.or[i + 1]; nm = n; } }); return `${nm} (OR=${mx.toFixed(3)})`; })() },
    { section: '🔲 ERROS DE CLASSIFICAÇÃO' },
    { label: 'Falsos Positivos', value: res.cm.fp, good: res.cm.fp === 0 },
    { label: 'Falsos Negativos', value: res.cm.fn, good: res.cm.fn === 0 },
    { label: 'Recomendação threshold', value: res.cm.fp > res.cm.fn ? '⬆️ Aumentar threshold (reduzir FP)' : '⬇️ Diminuir threshold (reduzir FN)' },
    { section: '💡 RECOMENDAÇÃO' },
    { label: 'Próximo passo', value: res.auc < 0.7 ? '❌ Modelo fraco — adicionar mais features' : res.cm.fp > res.cm.fn * 2 ? '⚠️ Ajustar threshold de classificação' : '✅ Modelo adequado' },
  ], name), 'INSIGHTS');

  XLSX.writeFile(wb, name.replace(/[^a-zA-Z0-9_-]/g, '_') + '_BI.xlsx');
}

export function lgExportCSV() {
  if (!lgLastResult) return;
  const res = lgLastResult;
  const header = [...res.varNames, res.labelY, 'P_Y1', 'Yhat', 'Resid_Dev'];
  const rows = res.Y.map((y, i) => [...res.Xs.map(x => x[i]), y, res.probs[i].toFixed(6), res.predY[i], res.devResid[i].toFixed(6)]);
  downloadCSV((document.getElementById('lg-analysis-name').value || 'logistica') + '.csv', header, rows);
}

window.logisticRerender = () => {
  if (lgLastResult) renderLogisticResults(lgLastResult);
};
