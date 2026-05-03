// Gráficos diagnósticos clássicos: resíduos vs ajustados, histograma, QQ-plot e Cook's D.

import { C, axis, smallTicks } from './baseChart.js';
import { normalQ } from '../core/statistics.js';

export function createResidualsVsFitted(canvasId, fitted, resid, color = C.scatter) {
  return new Chart(document.getElementById(canvasId), {
    type: 'scatter',
    data: { datasets: [{
      data: fitted.map((yh, i) => ({ x: yh, y: resid[i] })),
      backgroundColor: color, pointRadius: 4,
    }]},
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: axis('Valores Ajustados'), y: axis('Resíduos') },
    },
  });
}

export function createHistogram(canvasId, resid, n, options = {}) {
  const nBins = options.nBins || Math.max(5, Math.floor(Math.sqrt(n)));
  const min = Math.min(...resid);
  const max = Math.max(...resid);
  const bw = (max - min) / nBins || 1;
  const bins = Array(nBins).fill(0);
  resid.forEach(r => { const b = Math.min(Math.floor((r - min) / bw), nBins - 1); bins[b]++; });
  const labels = bins.map((_, i) => (min + i * bw + bw / 2).toFixed(2));
  return new Chart(document.getElementById(canvasId), {
    type: 'bar',
    data: { labels, datasets: [{
      data: bins,
      backgroundColor: options.bg || 'rgba(0,212,160,.5)',
      borderColor: options.border || C.y, borderWidth: 1,
    }]},
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: smallTicks(), y: smallTicks() },
    },
  });
}

export function createQQPlot(canvasId, residStd, n, options = {}) {
  const sorted = [...residStd].sort((a, b) => a - b);
  const qqData = sorted.map((r, i) => ({ x: normalQ((i + 1 - 0.375) / (n + 0.25)), y: r }));
  const qMin = qqData[0].x, qMax = qqData[qqData.length - 1].x;
  return new Chart(document.getElementById(canvasId), {
    data: { datasets: [
      { type: 'scatter', data: qqData, backgroundColor: options.bg || C.scatter, pointRadius: 4 },
      { type: 'line', data: [{ x: qMin, y: qMin }, { x: qMax, y: qMax }],
        borderColor: options.lineColor || 'rgba(255,179,71,.5)', borderWidth: 1.5, pointRadius: 0 },
    ]},
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: axis('Quantis Teóricos'), y: axis('Quantis Amostrais') },
    },
  });
}

export function createCookDistance(canvasId, cooksD, n) {
  const threshold = 4 / n;
  return new Chart(document.getElementById(canvasId), {
    type: 'bar',
    data: {
      labels: cooksD.map((_, i) => i + 1),
      datasets: [{
        data: cooksD,
        backgroundColor: cooksD.map(c => c > threshold ? 'rgba(255,107,107,.7)' : 'rgba(123,111,255,.5)'),
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: smallTicks(), y: smallTicks() },
    },
  });
}
