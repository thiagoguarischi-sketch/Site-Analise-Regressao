// Gráficos especializados: ROC, calibração, probabilidades preditas, deviance, polinômio,
// efeitos parciais (regressão múltipla), bandas quantílicas e sweep λ (Ridge/Lasso).

import { C, axis, legendStyle } from './baseChart.js';
import { sum } from '../core/utils.js';
import { QR_COLORS } from '../config/constants.js';

export function createROC(canvasId, Y, probs, auc) {
  const sorted = probs.map((p, i) => ({ p, y: Y[i] })).sort((a, b) => b.p - a.p);
  const nPos = sum(Y), nNeg = Y.length - nPos;
  let tpR = 0, fpR = 0;
  const rocPts = [{ x: 0, y: 0 }];
  sorted.forEach(({ y }) => {
    if (y === 1) tpR++; else fpR++;
    rocPts.push({ x: fpR / nNeg, y: tpR / nPos });
  });
  rocPts.push({ x: 1, y: 1 });

  return new Chart(document.getElementById(canvasId), {
    data: { datasets: [
      { type: 'line', data: rocPts, borderColor: C.x, borderWidth: 2, pointRadius: 0, fill: false, label: `AUC=${auc.toFixed(3)}` },
      { type: 'line', data: [{ x: 0, y: 0 }, { x: 1, y: 1 }], borderColor: C.diag, borderWidth: 1, borderDash: [4, 4], pointRadius: 0, label: 'Aleatório' },
    ]},
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: legendStyle(10) },
      scales: {
        x: { type: 'linear', min: 0, max: 1, ...axis('FPR (1-Especificidade)'), ticks: { color: C.txt2, stepSize: 0.2 } },
        y: { type: 'linear', min: 0, max: 1, ...axis('TPR (Sensibilidade)'), ticks: { color: C.txt2, stepSize: 0.2 } },
      },
    },
  });
}

export function createPredictedProbsScatter(canvasId, probs, Y) {
  return new Chart(document.getElementById(canvasId), {
    type: 'scatter',
    data: { datasets: [
      { data: probs.map((p, i) => ({ x: i + 1, y: p })).filter((_, i) => Y[i] === 1),
        backgroundColor: 'rgba(0,212,160,.7)', pointRadius: 5, label: 'Y=1' },
      { data: probs.map((p, i) => ({ x: i + 1, y: p })).filter((_, i) => Y[i] === 0),
        backgroundColor: 'rgba(255,107,107,.7)', pointRadius: 5, label: 'Y=0' },
    ]},
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: legendStyle(10) },
      scales: {
        x: axis('Observação'),
        y: { ...axis('P(Y=1)'), min: 0, max: 1 },
      },
    },
  });
}

export function createDevianceResid(canvasId, probs, devResid) {
  return new Chart(document.getElementById(canvasId), {
    type: 'scatter',
    data: { datasets: [{
      data: probs.map((p, i) => ({ x: p, y: devResid[i] })),
      backgroundColor: devResid.map(r => Math.abs(r) > 2 ? 'rgba(255,107,107,.8)' : 'rgba(123,111,255,.6)'),
      pointRadius: 4,
    }]},
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ...axis('Prob. Predita'), min: 0, max: 1 },
        y: axis('Resíduo Deviance'),
      },
    },
  });
}

export function createCalibration(canvasId, probs, Y) {
  const nBins = 5;
  const bins = Array.from({ length: nBins }, () => ({ sumP: 0, sumY: 0, count: 0 }));
  probs.forEach((p, i) => {
    const b = Math.min(Math.floor(p * nBins), nBins - 1);
    bins[b].sumP += p; bins[b].sumY += Y[i]; bins[b].count++;
  });
  const calibPts = bins.filter(b => b.count > 0).map(b => ({ x: b.sumP / b.count, y: b.sumY / b.count }));
  return new Chart(document.getElementById(canvasId), {
    data: { datasets: [
      { type: 'scatter', data: calibPts, backgroundColor: C.acc2, pointRadius: 7, label: 'Calibração' },
      { type: 'line', data: [{ x: 0, y: 0 }, { x: 1, y: 1 }], borderColor: C.diag, borderWidth: 1, borderDash: [4, 4], pointRadius: 0, label: 'Ideal' },
    ]},
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: legendStyle(10) },
      scales: {
        x: { ...axis('Prob. Média Predita'), min: 0, max: 1 },
        y: { ...axis('Freq. Observada'), min: 0, max: 1 },
      },
    },
  });
}

export function createPolynomialCurve(canvasId, xs, ys, lineXs, lineYs, degree, lx, ly) {
  return new Chart(document.getElementById(canvasId), {
    data: { datasets: [
      { type: 'scatter', label: 'Dados', data: xs.map((x, i) => ({ x, y: ys[i] })),
        backgroundColor: C.scatter, pointRadius: 5 },
      { type: 'line', label: `Polinômio Grau ${degree}`,
        data: lineXs.map((x, i) => ({ x, y: lineYs[i] })),
        borderColor: C.acc2, borderWidth: 2.5, pointRadius: 0, fill: false },
    ]},
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: legendStyle(11) },
      scales: { x: axis(lx, C.x), y: axis(ly, C.y) },
    },
  });
}

export function createPartialEffect(canvasId, xi, Y, beta, idx, Xs, mean, varNames, labelY) {
  const xMin = Math.min(...xi), xMax = Math.max(...xi);
  const otherMeans = Xs.map((ox, j) => j === idx ? null : mean(ox));
  const lineXs = [xMin, xMax];
  const lineYs = lineXs.map(x => {
    let y = beta[0];
    Xs.forEach((_, j) => { y += beta[j + 1] * (j === idx ? x : otherMeans[j]); });
    return y;
  });
  const colors = [
    'rgba(123,111,255,.7)', 'rgba(0,212,160,.7)', 'rgba(255,179,71,.7)', 'rgba(255,107,107,.7)',
    'rgba(100,200,255,.7)', 'rgba(200,100,255,.7)', 'rgba(255,200,100,.7)', 'rgba(100,255,200,.7)',
  ];
  return new Chart(document.getElementById(canvasId), {
    data: { datasets: [
      { type: 'scatter', data: xi.map((x, i) => ({ x, y: Y[i] })),
        backgroundColor: colors[idx % colors.length], pointRadius: 4 },
      { type: 'line', data: lineXs.map((x, i) => ({ x, y: lineYs[i] })),
        borderColor: 'rgba(255,255,255,.4)', borderWidth: 1.5, pointRadius: 0, borderDash: [4, 3] },
    ]},
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: axis(varNames[idx]), y: axis(labelY) },
    },
  });
}

export function createQuantileBand(canvasId, xs, ys, taus, quantileResults, lx, ly) {
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const nPts = 100;
  const step = (xMax - xMin) / nPts;
  const lineXs = Array.from({ length: nPts + 1 }, (_, i) => xMin + i * step);
  const datasets = [];
  const tauMin = taus[0], tauMax = taus[taus.length - 1];
  if (tauMin !== tauMax && quantileResults[tauMin] && quantileResults[tauMax]) {
    const rMin = quantileResults[tauMin], rMax = quantileResults[tauMax];
    datasets.push({
      type: 'line', label: `_banda_upper`,
      data: lineXs.map(x => ({ x, y: rMax.b0 + rMax.b1 * x })),
      borderWidth: 0, pointRadius: 0, fill: '+1',
      backgroundColor: 'rgba(123,111,255,0.07)',
    });
    datasets.push({
      type: 'line', label: `_banda_lower`,
      data: lineXs.map(x => ({ x, y: rMin.b0 + rMin.b1 * x })),
      borderWidth: 0, pointRadius: 0, fill: false,
    });
  }
  datasets.push({
    type: 'scatter', label: 'Dados',
    data: xs.map((x, i) => ({ x, y: ys[i] })),
    backgroundColor: 'rgba(200,200,255,0.55)', pointRadius: 4, order: 10,
  });
  for (const tau of taus) {
    const qr = quantileResults[tau];
    const color = QR_COLORS[String(tau)]?.line || '#fff';
    const isMedian = tau === 0.5;
    datasets.push({
      type: 'line', label: `τ = ${tau}`,
      data: lineXs.map(x => ({ x, y: qr.b0 + qr.b1 * x })),
      borderColor: color, borderWidth: isMedian ? 3 : 1.5,
      pointRadius: 0, fill: false,
      borderDash: isMedian ? [] : (tau < 0.5 ? [5, 3] : [3, 3]),
    });
  }
  return new Chart(document.getElementById(canvasId), {
    data: { datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: C.txt2, font: { size: 11 },
            filter: item => !item.text.startsWith('_banda_'),
          },
        },
      },
      scales: {
        x: { type: 'linear', ...axis(lx, C.x) },
        y: { type: 'linear', ...axis(ly, C.y) },
      },
    },
  });
}

export function createLambdaSweep(canvasId, sweep, olsB1, sweepType) {
  const sweepColor = sweepType === 'lasso' ? C.acc2 : C.x;
  return new Chart(document.getElementById(canvasId), {
    data: { datasets: [
      { type: 'line', label: `β₁ (${sweepType === 'lasso' ? 'Lasso' : 'Ridge'})`,
        data: sweep.map(s => ({ x: Math.log10(s.lambda), y: s.b1 })),
        borderColor: sweepColor, borderWidth: 2, pointRadius: 3, fill: false },
      { type: 'line', label: 'β₁ OLS',
        data: sweep.map(s => ({ x: Math.log10(s.lambda), y: olsB1 })),
        borderColor: 'rgba(200,200,200,.5)', borderWidth: 1.5, borderDash: [4, 3], pointRadius: 0, fill: false },
    ]},
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: legendStyle(11),
        tooltip: { callbacks: { title: items => `λ = 10^${items[0].parsed.x.toFixed(2)}` } },
      },
      scales: { x: { type: 'linear', ...axis('log₁₀(λ)') }, y: axis('β₁') },
    },
  });
}
