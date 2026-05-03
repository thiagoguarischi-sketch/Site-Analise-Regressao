// Séries temporais — decomposição aditiva, MM, volatilidade, projeção e exportação BI.

import { mean, sum, esc } from '../core/utils.js';
import { showToast } from '../ui/notifications.js';
import { saveAnalysisRequest } from '../services/analysisService.js';
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
} from '../charts/forecastChart.js';

let stLastResult = null;
const STC = {};

function stDestroyChart(id) { if (STC[id]) { STC[id].destroy(); delete STC[id]; } }

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

export function stLoadExample() {
  const examples = [
    { name: 'Vendas Mensais', ly: 'Vendas (R$k)', lx: 'Mês',
      labels: ['Jan/23','Fev/23','Mar/23','Abr/23','Mai/23','Jun/23','Jul/23','Ago/23','Set/23','Out/23','Nov/23','Dez/23','Jan/24','Fev/24','Mar/24','Abr/24','Mai/24','Jun/24'],
      values: [42,38,45,50,55,60,58,63,67,72,80,95,48,44,52,58,64,70] },
    { name: 'Temperatura Média', ly: 'Temp (°C)', lx: 'Mês',
      labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez','Jan','Fev','Mar','Abr'],
      values: [28,29,27,25,22,20,19,20,22,24,26,28,27,28,26,24] },
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

function stCompute(values, windowSize, futureN) {
  const n = values.length;
  const xs = Array.from({ length: n }, (_, i) => i + 1);
  const xm = mean(xs), ym = mean(values);
  const Sxx = sum(xs.map(x => (x - xm) ** 2));
  const Sxy = sum(xs.map((x, i) => (x - xm) * (values[i] - ym)));
  const b1 = Sxy / Sxx, b0 = ym - b1 * xm;
  const trend = xs.map(x => b0 + b1 * x);

  const ma = [];
  for (let i = 0; i < n; i++) {
    if (i < windowSize - 1) { ma.push(null); continue; }
    const slice = values.slice(i - windowSize + 1, i + 1);
    ma.push(sum(slice) / windowSize);
  }

  const detrended = values.map((v, i) => v - trend[i]);
  const period = Math.max(2, windowSize);
  const seasonIdx = Array.from({ length: period }, (_, p) => {
    const vals = detrended.filter((_, i) => i % period === p);
    return vals.length ? sum(vals) / vals.length : 0;
  });
  const seasonMean = mean(seasonIdx);
  const seasonAdj = seasonIdx.map(s => s - seasonMean);
  const seasonal = values.map((_, i) => seasonAdj[i % period]);
  const residual = values.map((v, i) => v - trend[i] - seasonal[i]);

  const volWindow = Math.max(3, windowSize);
  const volatility = [];
  for (let i = 0; i < n; i++) {
    if (i < volWindow - 1) { volatility.push(null); continue; }
    const slice = values.slice(i - volWindow + 1, i + 1);
    const m = mean(slice);
    volatility.push(Math.sqrt(sum(slice.map(v => (v - m) ** 2)) / volWindow));
  }

  const growthRates = [];
  for (let i = 1; i < n; i++) {
    if (values[i - 1] !== 0) growthRates.push((values[i] - values[i - 1]) / Math.abs(values[i - 1]) * 100);
  }
  const avgGrowth = growthRates.length ? sum(growthRates) / growthRates.length : 0;

  const maxVal = Math.max(...values), minVal = Math.min(...values);
  const maxIdx = values.indexOf(maxVal), minIdx = values.indexOf(minVal);

  const projValues = [], projTrend = [];
  for (let i = 1; i <= futureN; i++) {
    const t = n + i;
    projTrend.push(b0 + b1 * t);
    projValues.push(b0 + b1 * t + seasonAdj[(n + i - 1) % period]);
  }

  const stdev = Math.sqrt(sum(values.map(v => (v - ym) ** 2)) / n);
  const cv = ym !== 0 ? (stdev / Math.abs(ym)) * 100 : 0;

  return {
    n, b0, b1, trend, ma, seasonal, residual, volatility,
    projValues, projTrend, avgGrowth, growthRates,
    maxVal, minVal, maxIdx, minIdx,
    ym, stdev, cv, windowSize, futureN, period,
  };
}

export function runSerie() {
  const { labels, values } = stGetData();
  const windowSize = parseInt(document.getElementById('st-window').value) || 3;
  const futureN = parseInt(document.getElementById('st-future').value) || 6;
  if (values.length < 4) { showToast('Insira pelo menos 4 períodos.', 'err'); return; }

  const labelY = document.getElementById('st-label-y').value || 'Valor';
  const labelX = document.getElementById('st-label-x').value || 'Período';

  const res = stCompute(values, windowSize, futureN);
  res.labels = labels;
  res.values = values;
  res.labelY = labelY;
  res.labelX = labelX;
  stLastResult = res;

  stRenderResults(res);
  document.getElementById('st-results').style.display = 'block';
  document.getElementById('st-btn-save').style.display = 'inline-flex';
  stGenerateAI(res);
  showToast('Análise concluída!', 'ok');
}

function stRenderResults(res) {
  const { n, ym, stdev, cv, maxVal, minVal, maxIdx, minIdx, avgGrowth, b1,
          labels, values, projValues, projTrend, futureN } = res;

  document.getElementById('st-metrics').innerHTML = `
    <div class="metric"><div class="metric-val metric-y">${ym.toFixed(2)}</div><div class="metric-lab">Média</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--x)">${stdev.toFixed(2)}</div><div class="metric-lab">Desvio padrão</div></div>
    <div class="metric"><div class="metric-val" style="color:var(--acc2)">${cv.toFixed(1)}%</div><div class="metric-lab">CV (%)</div></div>
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
    <td style="color:var(--acc2);font-weight:600">${v.toFixed(4)}</td>
    <td style="color:var(--txt3)">${projTrend[i].toFixed(4)}</td>
    <td style="color:${v >= ym ? 'var(--y)' : 'var(--acc)'}">${v >= ym ? '↑' : '↓'} ${((v - ym) / Math.abs(ym) * 100).toFixed(1)}%</td>
  </tr>`).join('');
  document.getElementById('st-proj-tbl').innerHTML = `
    <table class="data-table">
      <thead><tr><th>Período</th><th>Projeção</th><th>Só tendência</th><th>vs. Média</th></tr></thead>
      <tbody>${projRows}</tbody>
    </table>`;
}

async function stGenerateAI(res) {
  const box = document.getElementById('st-ai-box');
  box.innerHTML = aiLoadingHTML();
  const prompt = `Você é especialista em séries temporais. Analise em português (3-4 parágrafos curtos):

Série: ${res.labelY} | Período: ${res.labelX}
n = ${res.n} períodos
Tendência: b₀=${res.b0.toFixed(4)}, b₁=${res.b1.toFixed(4)} por período
Média=${res.ym.toFixed(4)}, DP=${res.stdev.toFixed(4)}, CV=${res.cv.toFixed(1)}%
Crescimento médio=${res.avgGrowth.toFixed(2)}% por período
Melhor: ${esc(res.labels[res.maxIdx] || String(res.maxIdx + 1))} (${res.maxVal.toFixed(2)})
Pior: ${esc(res.labels[res.minIdx] || String(res.minIdx + 1))} (${res.minVal.toFixed(2)})
Projeção próximos ${res.futureN} períodos: ${res.projValues.map(v => v.toFixed(2)).join(', ')}

Inclua: 1) direção e força da tendência 2) padrão sazonal 3) perspectivas futuras 4) limitações do modelo.`;
  try {
    const text = await callAI(prompt);
    box.innerHTML = aiResultHTML(text);
  } catch (e) {
    box.innerHTML = aiFallbackHTML(`Tendência: ${res.b1 >= 0 ? 'crescente' : 'decrescente'} (${res.b1.toFixed(3)}/período). Cresc. médio: ${res.avgGrowth.toFixed(1)}%. Próx. projeção: ${res.projValues[0]?.toFixed(2) ?? '—'}.`);
  }
}

export async function stSaveAnalysis() {
  if (!stLastResult) { showToast('Execute uma análise primeiro.', 'err'); return; }
  document.getElementById('st-cloud-saving').style.display = 'flex';
  try {
    const res = stLastResult;
    await saveAnalysisRequest({
      nome: document.getElementById('st-analysis-name').value || 'Série Temporal',
      tipo: 'serie',
      dados: {
        labelX: res.labelX, labelY: res.labelY,
        n: res.n, ym: res.ym, stdev: res.stdev, cv: res.cv,
        b0: res.b0, b1: res.b1, avgGrowth: res.avgGrowth,
        maxVal: res.maxVal, minVal: res.minVal,
        maxIdx: res.maxIdx, minIdx: res.minIdx,
        windowSize: res.windowSize, futureN: res.futureN,
        labels: res.labels, values: res.values,
        projValues: res.projValues,
      },
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
  if (d.windowSize) document.getElementById('st-window').value = d.windowSize;
  if (d.futureN) document.getElementById('st-future').value = d.futureN;
  if (d.labels && d.values && d.labels.length > 0) {
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
  showToast('Série temporal carregada ✏️', 'info');
}

export function stExportExcel() {
  if (!stLastResult) return;
  const res = stLastResult;
  const name = document.getElementById('st-analysis-name').value || 'Serie Temporal';
  const wb = XLSX.utils.book_new();

  const rawWS = buildWS([
    [cell('📊 RAW DATA + DECOMPOSIÇÃO — ' + name, S.title)],
    [cell('🔢 ID', S.hDark), cell('📅 Período', S.hBlue), cell('📈 Real', S.hGreen), cell('📉 Tendência', S.hTeal), cell('🌊 Sazonalidade', S.hOrange), cell('📊 Resíduo', S.hGray), cell('🤖 Modelo', S.hGray)],
    ...res.values.map((v, i) => {
      const z = zebra(i);
      return [cell(i + 1, z ? S.even : S.odd), cell(res.labels[i], z ? S.evenL : S.oddL), cell(v, z ? S.num4 : S.num4Odd), cell(res.trend[i], z ? S.num4 : S.num4Odd), cell(res.seasonal[i], z ? S.num4 : S.num4Odd), cell(res.residual[i], Math.abs(res.residual[i]) > 2 * res.stdev ? S.warn : (z ? S.num4 : S.num4Odd)), cell('Série Temporal', z ? S.evenL : S.oddL)];
    }),
  ], [6, 16, 12, 12, 14, 12, 18]);
  mergeRange(rawWS, 0, 0, 0, 6);
  autoFilter(rawWS, 6, res.values.length + 1);
  XLSX.utils.book_append_sheet(wb, rawWS, 'RAW_DATA');

  const allRows = [
    ...res.values.map((v, i) => [i + 1, res.labels[i], v, res.trend[i], v - res.trend[i], 'histórico']),
    ...res.projValues.map((v, i) => [res.n + i + 1, `+${i + 1}`, '', v, '', 'projeção']),
  ];
  const predWS = buildWS([
    [cell('🎯 PREDICTION ANALYSIS — ' + name, S.title)],
    [cell('🔢 ID', S.hDark), cell('📅 Período', S.hBlue), cell('📈 Real', S.hGreen), cell('🎯 Previsto/Tend.', S.hTeal), cell('📉 Erro', S.hOrange), cell('🏷️ Tipo', S.hGray)],
    ...allRows.map((r, i) => {
      const isProj = r[5] === 'projeção';
      const z = zebra(i);
      const base = isProj ? S.section : (z ? S.even : S.odd);
      return r.map((v, j) => cell(v, j === 5 ? (isProj ? S.kpiNote : S.good) : base));
    }),
  ], [6, 16, 12, 14, 12, 12]);
  mergeRange(predWS, 0, 0, 0, 5);
  autoFilter(predWS, 5, allRows.length + 1);
  XLSX.utils.book_append_sheet(wb, predWS, 'PREDICTION_ANALYSIS');

  const projWS = buildWS([
    [cell('🔮 PROJEÇÕES — ' + name, S.title)],
    [cell('⏩ Período Futuro', S.hPurple), cell('🔮 Projeção', S.hBlue), cell('📉 Só Tendência', S.hTeal), cell('📊 Var vs Média %', S.hOrange)],
    ...res.projValues.map((v, i) => {
      const varPct = res.ym !== 0 ? (v - res.ym) / Math.abs(res.ym) * 100 : '';
      const z = zebra(i);
      return [cell(`+${i + 1}`, z ? S.even : S.odd), cell(v, z ? S.num4 : S.num4Odd), cell(res.projTrend[i], z ? S.num4 : S.num4Odd), cell(varPct, { ...(varPct >= 0 ? S.good : S.warn), numFmt: '0.00' })];
    }),
  ], [16, 14, 14, 16]);
  mergeRange(projWS, 0, 0, 0, 3);
  XLSX.utils.book_append_sheet(wb, projWS, 'PROJECTIONS');

  XLSX.utils.book_append_sheet(wb, buildKPISheet([
    { section: '📌 SÉRIE' },
    { label: '🏷️ Nome', value: name }, { label: '🔢 n', value: res.n }, { label: '🔮 Períodos projetados', value: res.futureN },
    { section: '📊 ESTATÍSTICAS' },
    { label: '📈 Média', value: res.ym.toFixed(4) },
    { label: '📉 Desvio Padrão', value: res.stdev.toFixed(4) },
    { label: '📊 CV (%)', value: res.cv.toFixed(1) + '%', note: res.cv >= 30 ? '🔴 Alta volatilidade' : res.cv >= 15 ? '🟡 Moderada' : '🟢 Baixa', good: res.cv < 15 },
    { label: '📈 Tendência β₁', value: res.b1.toFixed(4), note: res.b1 >= 0 ? '↑ Crescente' : '↓ Decrescente' },
    { label: '📊 Cresc. médio (%)', value: res.avgGrowth.toFixed(2) + '%' },
    { section: '🏆 EXTREMOS' },
    { label: '🏆 Melhor período', value: res.labels[res.maxIdx] + ' = ' + res.maxVal, good: true },
    { label: '📉 Pior período', value: res.labels[res.minIdx] + ' = ' + res.minVal, good: false },
  ], name), 'MODEL_KPIs');

  const compRows = [
    [name, 'Série Temporal', '📈 Média', res.ym],
    [name, 'Série Temporal', '📉 Desvio Padrão', res.stdev],
    [name, 'Série Temporal', '📊 CV %', res.cv],
    [name, 'Série Temporal', '📈 Tendência β₁', res.b1],
    [name, 'Série Temporal', '📊 Cresc. Médio %', res.avgGrowth],
    [name, 'Série Temporal', '🔢 n', res.n],
  ];
  XLSX.utils.book_append_sheet(wb, buildCompSheet(compRows, name), 'MODEL_COMPARISON');

  XLSX.utils.book_append_sheet(wb, buildDashSheet(
    [
      { label: '📈 Média', value: res.ym.toFixed(4) },
      { label: '📉 Desvio Padrão', value: res.stdev.toFixed(4) },
      { label: '📊 CV (%)', value: res.cv.toFixed(1) + '%', good: res.cv < 15, note: res.cv >= 30 ? '🔴 Alta volatilidade' : '🟢 OK' },
      { label: '📈 Tendência', value: res.b1 >= 0 ? `↑ +${res.b1.toFixed(4)}/período` : `↓ ${res.b1.toFixed(4)}/período`, good: res.b1 >= 0 },
      { label: '🔮 Próxima projeção', value: res.projValues[0]?.toFixed(4) ?? '—' },
      { label: '🏆 Melhor período', value: res.labels[res.maxIdx], good: true },
      { label: '📉 Pior período', value: res.labels[res.minIdx], good: false },
    ],
    name, 'Série Temporal', null, null,
    ['→ PREDICTION_ANALYSIS: Real + Previsto → gráfico de linha temporal', '→ PROJECTIONS: barras para períodos futuros', '→ RAW_DATA: Resíduo para detectar sazonalidade anômala', '→ MODEL_COMPARISON: comparar CV% entre séries']
  ), 'DASHBOARD');

  XLSX.utils.book_append_sheet(wb, buildInsightsSheet([
    { section: '📈 TENDÊNCIA' },
    { label: 'Direção', value: res.b1 >= 0 ? '↑ Crescente' : '↓ Decrescente', good: res.b1 >= 0 },
    { label: 'Força', value: Math.abs(res.b1 / res.ym) > 0.1 ? '💪 Forte' : '📊 Moderada/Fraca' },
    { section: '📊 VOLATILIDADE' },
    { label: 'CV (%)', value: res.cv.toFixed(1) + '%', good: res.cv < 15, note: res.cv >= 30 ? '🔴 Alta — projeções menos confiáveis' : '🟢 OK' },
    { label: 'Outliers sazonais', value: res.residual.filter(r => Math.abs(r) > 2 * res.stdev).length, good: res.residual.filter(r => Math.abs(r) > 2 * res.stdev).length === 0 },
    { section: '🔮 PROJEÇÃO' },
    { label: 'Próxima projeção', value: res.projValues[0]?.toFixed(4) ?? '—' },
    { label: 'Cresc. esperado', value: res.avgGrowth.toFixed(2) + '% por período' },
    { section: '💡 RECOMENDAÇÃO' },
    { label: 'Próximo passo', value: res.cv >= 30 ? '⚠️ Alta volatilidade — usar suavização exponencial ou modelos ARIMA' : '✅ Projeções de curto prazo confiáveis' },
  ], name), 'INSIGHTS');

  XLSX.writeFile(wb, name.replace(/[^a-zA-Z0-9_-]/g, '_') + '_BI.xlsx');
}

export function stExportCSV() {
  if (!stLastResult) return;
  const res = stLastResult;
  const header = [res.labelX, res.labelY, 'Tendencia', 'Sazonalidade', 'Residuo'];
  const rows = res.values.map((v, i) => [res.labels[i], v, res.trend[i], res.seasonal[i], res.residual[i]]);
  downloadCSV((document.getElementById('st-analysis-name').value || 'serie') + '.csv', header, rows);
}
