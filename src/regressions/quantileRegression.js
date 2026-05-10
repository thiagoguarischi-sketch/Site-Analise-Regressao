// Regressão quantílica — pinball loss + gradient descent com adaptive lr.

import { fmt, esc } from '../core/utils.js';
import { showToast } from '../ui/notifications.js';
import { saveAnalysisRequest } from '../services/analysisService.js';
import { analyze } from '../services/computeService.js';
import { callAI, aiLoadingHTML, aiResultHTML, aiFallbackHTML } from '../services/authService.js';
import {
  XC, S, cell, zebra, buildWS, autoFilter, mergeRange, downloadCSV,
  buildRawSheet, buildKPISheet, buildCompSheet, buildDashSheet, buildInsightsSheet,
} from '../services/exportService.js';
import { QR_COLORS } from '../config/constants.js';
import { loadHistory, updateProfileStats } from '../ui/tables.js';
import { createQuantileBand } from '../charts/dashboardCharts.js';

let qrLastResult = null;
let qrChartMain = null;


export function qrInitRows(n = 10) {
  document.getElementById('qr-data-rows').innerHTML = '';
  for (let i = 0; i < n; i++) qrAddRow();
  qrUpdateCount();
}

export function qrAddRow() {
  const container = document.getElementById('qr-data-rows');
  const i = container.children.length + 1;
  const row = document.createElement('div');
  row.className = 'data-row';
  row.innerHTML = `
    <span class="data-row-n">${i}</span>
    <input class="data-input" type="number" placeholder="x" oninput="qrUpdateCount()" step="any">
    <input class="data-input" type="number" placeholder="y" oninput="qrUpdateCount()" step="any">`;
  container.appendChild(row);
  qrUpdateCount();
}

export function qrClearRows() {
  document.getElementById('qr-data-rows').innerHTML = '';
  qrInitRows();
  document.getElementById('qr-results').style.display = 'none';
  document.getElementById('qr-btn-save').style.display = 'none';
  qrLastResult = null;
}

function qrGetData() {
  const rows = document.getElementById('qr-data-rows').children;
  const xs = [], ys = [];
  for (const row of rows) {
    const inputs = row.querySelectorAll('input');
    const x = parseFloat(inputs[0].value);
    const y = parseFloat(inputs[1].value);
    if (!isNaN(x) && !isNaN(y)) { xs.push(x); ys.push(y); }
  }
  return { xs, ys };
}

export function qrUpdateCount() {
  const { xs } = qrGetData();
  const countEl = document.getElementById('qr-data-count');
  if (countEl) countEl.textContent = `${xs.length} par${xs.length !== 1 ? 'es' : ''} de dados`;
  const elX = document.getElementById('qr-dh-x');
  const elY = document.getElementById('qr-dh-y');
  if (elX) elX.textContent = document.getElementById('qr-label-x').value || 'X';
  if (elY) elY.textContent = document.getElementById('qr-label-y').value || 'Y';
}

export function qrToggleChip(el) {
  el.classList.toggle('active');
}

function qrGetActiveTaus() {
  return Array.from(document.querySelectorAll('#qr-chips .quantile-chip.active'))
    .map(el => parseFloat(el.dataset.q))
    .sort((a, b) => a - b);
}

export function qrLoadExample() {
  const examples = [
    { name: 'Renda vs Escolaridade', lx: 'Anos de estudo', ly: 'Renda (R$k)',
      xs: [4,6,8,8,9,10,10,11,12,12,12,13,14,14,15,15,16,16,17,18,18,20,20,22],
      ys: [1.2,1.8,2.1,3.5,2.8,3.2,5.1,3.8,4.2,6.5,9.8,5.2,6.1,11.2,7.5,14.8,9.2,18.5,12.1,15.0,28.5,18.0,35.2,42.0] },
    { name: 'Consumo vs Temperatura', lx: 'Temperatura (°C)', ly: 'Consumo (kWh)',
      xs: [10,12,15,18,20,22,24,26,28,30,32,34,36,38,10,15,20,25,30,35],
      ys: [320,290,260,230,210,240,280,340,420,510,580,650,720,810,350,270,195,380,490,700] },
  ];
  const ex = examples[Math.floor(Math.random() * examples.length)];
  document.getElementById('qr-analysis-name').value = ex.name;
  document.getElementById('qr-label-x').value = ex.lx;
  document.getElementById('qr-label-y').value = ex.ly;
  document.getElementById('qr-data-rows').innerHTML = '';
  ex.xs.forEach((x, i) => {
    qrAddRow();
    const rows = document.getElementById('qr-data-rows').children;
    const last = rows[rows.length - 1];
    last.querySelectorAll('input')[0].value = x;
    last.querySelectorAll('input')[1].value = ex.ys[i];
  });
  for (let i = ex.xs.length; i < 10; i++) qrAddRow();
  qrUpdateCount();
}

export async function runQuantile() {
  const { xs, ys } = qrGetData();
  if (xs.length < 5) { showToast('Mínimo 5 pares de dados.', 'err'); return; }
  const taus = qrGetActiveTaus();
  if (taus.length === 0) { showToast('Selecione ao menos 1 quantil.', 'err'); return; }

  const lr    = parseFloat(document.getElementById('qr-lr').value) || 0.001;
  const iters = parseInt(document.getElementById('qr-iters').value) || 5000;
  const tol   = parseFloat(document.getElementById('qr-tol').value) || 1e-7;

  const btn = document.getElementById('qr-run-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="loading-dots"><span></span><span></span><span></span></span>';
  await new Promise(r => setTimeout(r, 30));

  try {
    const lx = document.getElementById('qr-label-x').value || 'X';
    const ly = document.getElementById('qr-label-y').value || 'Y';
    const quantileResults = await analyze('quantile', { taus, lr, maxIter: iters, tol }, { xs, ys });
    qrLastResult = { xs, ys, taus, quantileResults, lx, ly, lr, iters, tol };
    qrRenderResults(qrLastResult);
    document.getElementById('qr-results').style.display = 'block';
    document.getElementById('qr-btn-save').style.display = 'inline-flex';
    qrGenerateAI(qrLastResult);
    showToast('Análise quantílica concluída!', 'ok');
  } catch (e) {
    showToast('Erro no cálculo: ' + e.message, 'err');
  }

  btn.disabled = false;
  btn.textContent = '▶ Gerar análise';
}

function qrRenderResults(res) {
  const { xs, ys, taus, quantileResults, lx, ly } = res;

  if (qrChartMain) qrChartMain.destroy();
  qrChartMain = createQuantileBand('qr-chart-main', xs, ys, taus, quantileResults, lx, ly);

  document.getElementById('qr-legend').innerHTML = taus.map(tau => {
    const color = QR_COLORS[String(tau)]?.line || '#fff';
    return `<div class="quantile-legend-item">
      <div class="quantile-legend-dot" style="background:${color}"></div>
      <span style="color:${color};font-weight:${tau === 0.5 ? 700 : 400}">τ=${tau}</span>
    </div>`;
  }).join('');

  const rows = taus.map(tau => {
    const qr = quantileResults[tau];
    const color = QR_COLORS[String(tau)]?.line || '#fff';
    return `<tr>
      <td style="color:${color};font-weight:600">τ = ${tau}</td>
      <td>${fmt(qr.b0)}</td><td>${fmt(qr.b1)}</td>
      <td>${qr.pinballLoss.toFixed(4)}</td>
      <td>${qr.mae.toFixed(4)}</td>
      <td>${(qr.coverage * 100).toFixed(1)}%</td>
    </tr>`;
  }).join('');
  document.getElementById('qr-coef-tbl').innerHTML = `
    <table class="data-table">
      <thead><tr><th>Quantil</th><th>β₀</th><th>β₁</th><th>Pinball Loss</th><th>MAE</th><th>Cobertura real</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="font-size:11px;color:var(--txt3);margin-top:6px;padding:0 4px">Cobertura real: % de observações abaixo da linha quantílica.</p>`;

  const metricsHtml = taus.map(tau => {
    const qr = quantileResults[tau];
    const color = QR_COLORS[String(tau)]?.line || '#fff';
    return `<div class="qmetric" style="border-color:${color}33">
      <div style="font-size:10px;font-weight:700;color:${color};margin-bottom:6px">τ = ${tau}</div>
      <div class="qmetric-val" style="color:${color}">${qr.pinballLoss.toFixed(4)}</div>
      <div class="qmetric-lab">Pinball Loss</div>
      <div style="margin-top:8px">
        <div class="qmetric-val" style="color:var(--txt2);font-size:13px">${fmt(qr.b1)}</div>
        <div class="qmetric-lab">β₁ (inclinação)</div>
      </div>
      <div style="margin-top:6px">
        <div class="qmetric-val" style="color:var(--txt2);font-size:13px">${(qr.coverage * 100).toFixed(1)}%</div>
        <div class="qmetric-lab">cobertura</div>
      </div>
    </div>`;
  }).join('');
  document.getElementById('qr-metrics-grid').innerHTML = `<div class="qmetric-grid">${metricsHtml}</div>`;
}

export function qrRunPrediction() {
  if (!qrLastResult) { showToast('Execute uma análise primeiro.', 'err'); return; }
  const xNew = parseFloat(document.getElementById('qr-pred-x').value);
  if (isNaN(xNew)) { showToast('Digite um valor de X.', 'err'); return; }
  const { taus, quantileResults, lx, ly } = qrLastResult;

  const rows = taus.map(tau => {
    const qr = quantileResults[tau];
    const yhat = qr.b0 + qr.b1 * xNew;
    const color = QR_COLORS[String(tau)]?.line || '#fff';
    return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--brd);font-size:13px">
      <span style="color:${color};font-weight:600">τ = ${tau}</span>
      <span>${ly} ≈ <b>${yhat.toFixed(4)}</b></span>
    </div>`;
  }).join('');

  const box = document.getElementById('qr-pred-result');
  box.style.display = 'block';
  const q01 = quantileResults[0.1], q09 = quantileResults[0.9];
  box.innerHTML = `
    <div class="pred-result">
      <div style="font-size:13px;color:var(--txt2);margin-bottom:10px">Previsões para ${esc(lx)} = ${xNew}</div>
      ${rows}
      ${q01 && q09 ? `<div style="margin-top:10px;font-size:12px;color:var(--txt3)">
        Intervalo 80% (τ0.1–τ0.9): [${(q01.b0 + q01.b1 * xNew).toFixed(4)}, ${(q09.b0 + q09.b1 * xNew).toFixed(4)}]
      </div>` : ''}
    </div>`;
}

async function qrGenerateAI(res) {
  const box = document.getElementById('qr-ai-box');
  box.innerHTML = aiLoadingHTML();
  const { taus, quantileResults, xs, lx, ly } = res;
  const summary = taus.map(tau => {
    const qr = quantileResults[tau];
    return `τ=${tau}: β₀=${qr.b0.toFixed(4)}, β₁=${qr.b1.toFixed(4)}, Pinball=${qr.pinballLoss.toFixed(4)}, cobertura=${(qr.coverage * 100).toFixed(1)}%`;
  }).join('\n');

  const prompt = `Você é especialista em estatística. Analise esta regressão quantílica em português (3-4 parágrafos curtos):
X: ${lx}, Y: ${ly}, n=${xs.length}
Quantis estimados:\n${summary}
Inclua: 1) o que os quantis revelam sobre a distribuição condicional 2) diferença de inclinações entre quantis (heterogeneidade) 3) utilidade prática 4) limitações do modelo linear por quantil.`;

  try {
    const text = await callAI(prompt);
    box.innerHTML = aiResultHTML(text);
  } catch (e) {
    const med = quantileResults[0.5];
    box.innerHTML = aiFallbackHTML(
      `Mediana: Ŷ = ${med ? fmt(med.b0) + ' + ' + fmt(med.b1) + '·X' : '—'}. ` +
      `${taus.length} quantis ajustados.`
    );
  }
}

export async function qrSaveAnalysis() {
  if (!qrLastResult) { showToast('Execute uma análise primeiro.', 'err'); return; }
  document.getElementById('qr-cloud-saving').style.display = 'flex';
  try {
    const res = qrLastResult;

    const quantisSalvos = res.taus.map(t => ({
      tau: t,
      b0: res.quantileResults[t].b0,
      b1: res.quantileResults[t].b1,
      pinballLoss: res.quantileResults[t].pinballLoss,
      mae: res.quantileResults[t].mae,
      coverage: res.quantileResults[t].coverage,
    }));

    await saveAnalysisRequest({
      nome: document.getElementById('qr-analysis-name').value || 'Regressão Quantílica',
      tipo: 'quantilica',
      dados: {
        labelX: res.lx, labelY: res.ly,
        n: res.xs.length, taus: res.taus, quantisSalvos,
        pinballLosses: res.taus.reduce((acc, t) => { acc[String(t)] = res.quantileResults[t].pinballLoss; return acc; }, {}),
        xs: res.xs, ys: res.ys,
      },
    });

    showToast('Análise quantílica salva 🚀', 'ok');
    await loadHistory();
    await updateProfileStats();
  } catch (err) {
    console.error('ERRO QUANTILICA:', err);
    showToast('Erro ao salvar: ' + (err.message || err), 'err');
  } finally {
    document.getElementById('qr-cloud-saving').style.display = 'none';
  }
}

export function qrExportExcel() {
  if (!qrLastResult) return;
  const { xs, ys, taus, quantileResults, lx, ly } = qrLastResult;
  const name = document.getElementById('qr-analysis-name').value || 'Quantilica';
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, buildRawSheet('ID', [lx], ly,
    xs.map((x, i) => [i + 1, x, ys[i], 'Quantílica', name]), name), 'RAW_DATA');

  const tauStyles = [S.hBlue, S.hGreen, S.hOrange, S.hPurple, S.hTeal, S.hRed, S.hGray];
  const predHeader = ['🔢 ID', '📈 Real', ...taus.map(t => `🎯 Ŷ τ=${t}`), ...taus.map(t => `📉 Erro τ=${t}`), '🤖 Modelo'];
  const predHStyles = [S.hDark, S.hGreen, ...taus.map((_, i) => tauStyles[i % tauStyles.length]), ...taus.map(() => S.hOrange), S.hGray];
  const predRows = xs.map((x, i) => {
    const z = zebra(i);
    const base = z ? S.even : S.odd;
    return [
      cell(i + 1, base), cell(ys[i], base),
      ...taus.map(t => cell(quantileResults[t].b0 + quantileResults[t].b1 * x, z ? S.num4 : S.num4Odd)),
      ...taus.map(t => cell(quantileResults[t].resid[i], base)),
      cell('Quantílica', z ? S.evenL : S.oddL),
    ];
  });
  const predWS = buildWS([
    [cell('🎯 PREDICTION ANALYSIS — ' + name, S.title)],
    predHeader.map((h, i) => cell(h, predHStyles[i])),
    ...predRows,
  ], [6, 12, ...taus.map(() => 13), ...taus.map(() => 12), 16]);
  mergeRange(predWS, 0, 0, 0, predHeader.length - 1);
  autoFilter(predWS, predHeader.length - 1, predRows.length + 1);
  XLSX.utils.book_append_sheet(wb, predWS, 'PREDICTION_ANALYSIS');

  XLSX.utils.book_append_sheet(wb, buildKPISheet([
    { section: '📌 MODELO' },
    { label: '🏷️ Nome', value: name }, { label: '🤖 Tipo', value: 'Quantílica' },
    { label: '🔢 n', value: xs.length }, { label: '🔢 Quantis', value: taus.join(', ') },
    { section: '📊 POR QUANTIL' },
    ...taus.flatMap(t => {
      const qr = quantileResults[t];
      return [
        { section: `── τ = ${t} ──` },
        { label: `τ=${t} · β₀`, value: qr.b0.toFixed(4) },
        { label: `τ=${t} · β₁`, value: qr.b1.toFixed(4) },
        { label: `τ=${t} · Pinball Loss`, value: qr.pinballLoss.toFixed(4), good: qr.pinballLoss < 1 },
        { label: `τ=${t} · MAE`, value: qr.mae.toFixed(4) },
        { label: `τ=${t} · Cobertura`, value: (qr.coverage * 100).toFixed(1) + '%' },
      ];
    }),
  ], name), 'MODEL_KPIs');

  const qcRows = [
    [cell('📊 COMPARAÇÃO ENTRE QUANTIS — ' + name, S.title)],
    [cell('📊 Quantil τ', S.hDark), cell('📈 β₀', S.hTeal), cell('📈 β₁', S.hBlue), cell('📉 Pinball Loss', S.hOrange), cell('📐 MAE', S.hOrange), cell('🎯 Cobertura', S.hGreen)],
    ...taus.map((t, i) => {
      const qr = quantileResults[t];
      const z = zebra(i);
      return [cell(`τ = ${t}`, z ? S.kpiLabel : { ...S.kpiLabel, fill: { fgColor: { rgb: XC.ROW_BASE }, patternType: 'solid' } }), cell(qr.b0, z ? S.num4 : S.num4Odd), cell(qr.b1, z ? S.num4 : S.num4Odd), cell(qr.pinballLoss, z ? S.num4 : S.num4Odd), cell(qr.mae, z ? S.num4 : S.num4Odd), cell((qr.coverage * 100).toFixed(1) + '%', z ? S.even : S.odd)];
    }),
  ];
  const qcWS = buildWS(qcRows, [12, 14, 14, 16, 12, 12]);
  mergeRange(qcWS, 0, 0, 0, 5);
  XLSX.utils.book_append_sheet(wb, qcWS, 'QUANTIL_COMPARISON');

  const compRows = [];
  taus.forEach(t => {
    const qr = quantileResults[t];
    [['📉 Pinball_Loss', qr.pinballLoss], ['📐 MAE', qr.mae], ['📈 β₁', qr.b1], ['🎯 Cobertura_%', qr.coverage * 100]].forEach(([m, v]) => compRows.push([name, `Quantílica τ=${t}`, m, v]));
  });
  XLSX.utils.book_append_sheet(wb, buildCompSheet(compRows, name), 'MODEL_COMPARISON');

  const med = quantileResults[0.5];
  const slopes = taus.map(t => quantileResults[t].b1);
  const slopeSpread = Math.max(...slopes) - Math.min(...slopes);
  XLSX.utils.book_append_sheet(wb, buildDashSheet(
    [
      { label: '🔢 Quantis', value: taus.join(', ') },
      { label: '📊 Mediana β₁ (τ=0.5)', value: med ? med.b1.toFixed(4) : '—' },
      { label: '📏 Spread β₁ (max-min)', value: slopeSpread.toFixed(4), note: slopeSpread > 0.5 * Math.abs(slopes[Math.floor(slopes.length / 2)]) ? '⚠️ Alta heterogeneidade' : '✅ Efeito uniforme' },
      ...taus.map(t => ({ label: `🎯 τ=${t} Pinball Loss`, value: quantileResults[t].pinballLoss.toFixed(4), good: quantileResults[t].pinballLoss < 1 })),
    ],
    name, 'Quantílica', null, null,
    ['→ QUANTIL_COMPARISON: β₁ por τ → gráfico de linha para ver heterogeneidade', '→ MODEL_COMPARISON: Slicer por Quantil', '→ PREDICTION_ANALYSIS: múltiplas séries para curvas quantílicas']
  ), 'DASHBOARD');

  XLSX.utils.book_append_sheet(wb, buildInsightsSheet([
    { section: '📊 HETEROGENEIDADE' },
    { label: 'Spread β₁ (τ máx - τ mín)', value: slopeSpread.toFixed(4) },
    { label: 'Interpretação', value: slopeSpread > 0.5 * Math.abs(slopes[Math.floor(slopes.length / 2)]) ? '⚠️ Alta heterogeneidade — efeito X→Y varia por quantil' : '✅ Efeito relativamente uniforme' },
    { section: '📊 MEDIANA (τ=0.5)' },
    { label: 'β₁', value: med ? med.b1.toFixed(4) : '—' },
    { label: 'β₀', value: med ? med.b0.toFixed(4) : '—' },
    { section: '💡 RECOMENDAÇÃO' },
    { label: 'Próximo passo', value: slopeSpread > 0.5 ? '⚠️ Efeito heterogêneo — reportar múltiplos quantis ao invés da média' : '✅ Mediana suficiente para representar o efeito' },
  ], name), 'INSIGHTS');

  XLSX.writeFile(wb, name.replace(/[^a-zA-Z0-9_-]/g, '_') + '_BI.xlsx');
}

export function qrExportCSV() {
  if (!qrLastResult) return;
  const { xs, ys, taus, quantileResults, lx, ly } = qrLastResult;
  const header = [lx, ly, ...taus.map(t => `Yhat_t${t}`), ...taus.map(t => `Resid_t${t}`)];
  const rows = xs.map((x, i) => [x, ys[i],
    ...taus.map(t => (quantileResults[t].b0 + quantileResults[t].b1 * x).toFixed(6)),
    ...taus.map(t => quantileResults[t].resid[i].toFixed(6)),
  ]);
  downloadCSV((document.getElementById('qr-analysis-name').value || 'quantilica') + '.csv', header, rows);
}
