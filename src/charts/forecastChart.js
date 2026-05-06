// Gráficos da aba Séries Temporais — série + tendência + MM + projeção, e decomposição aditiva.

import { C, axis, smallTicks, legendStyle, gridColor } from './baseChart.js';

export function createTimeSeriesMain(canvasId, res, allLabels) {
  const { values, trend, ma, projValues, n, windowSize, labelY } = res;
  const maPoints = ma.map((v, i) => v === null ? null : { x: i, y: v }).filter(v => v !== null);
  return new Chart(document.getElementById(canvasId), {
    data: {
      datasets: [
        { type: 'line', label: 'Série original', data: values.map((v, i) => ({ x: i, y: v })),
          borderColor: 'rgba(123,111,255,.9)', borderWidth: 2, pointRadius: 3, fill: false },
        { type: 'line', label: 'Tendência', data: trend.map((v, i) => ({ x: i, y: v })),
          borderColor: C.acc2, borderWidth: 1.5, borderDash: [6, 3], pointRadius: 0, fill: false },
        { type: 'line', label: `MM(${windowSize})`, data: maPoints,
          borderColor: C.y, borderWidth: 2, pointRadius: 0, fill: false },
        { type: 'line', label: 'Projeção', data: projValues.map((v, i) => ({ x: n + i, y: v })),
          borderColor: 'rgba(255,107,107,.8)', borderWidth: 2, borderDash: [4, 4], pointRadius: 4, fill: false },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: legendStyle(11) },
      scales: {
        x: { type: 'linear', ticks: { color: C.txt2, font: { size: 9 }, callback: v => allLabels[v] || v }, grid: { color: gridColor() } },
        y: axis(labelY),
      },
    },
  });
}

export function createTrendChart(canvasId, labels, trend) {
  return new Chart(document.getElementById(canvasId), {
    type: 'line',
    data: { labels, datasets: [{ data: trend, borderColor: C.acc2, borderWidth: 2, pointRadius: 0, fill: false }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: C.txt2, font: { size: 9 }, maxTicksLimit: 8 }, grid: { color: gridColor() } },
        y: smallTicks(),
      },
    },
  });
}

export function createSeasonChart(canvasId, labels, seasonal) {
  return new Chart(document.getElementById(canvasId), {
    type: 'bar',
    data: { labels, datasets: [{
      data: seasonal,
      backgroundColor: seasonal.map(v => v >= 0 ? 'rgba(0,212,160,.5)' : 'rgba(255,107,107,.5)'),
      borderWidth: 0,
    }]},
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: C.txt2, font: { size: 9 }, maxTicksLimit: 8 }, grid: { color: gridColor() } },
        y: smallTicks(),
      },
    },
  });
}

export function createTSResidChart(canvasId, labels, residual) {
  return new Chart(document.getElementById(canvasId), {
    type: 'bar',
    data: { labels, datasets: [{
      data: residual,
      backgroundColor: residual.map(v => v >= 0 ? 'rgba(123,111,255,.5)' : 'rgba(255,179,71,.5)'),
      borderWidth: 0,
    }]},
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: C.txt2, font: { size: 9 }, maxTicksLimit: 8 }, grid: { color: gridColor() } },
        y: smallTicks(),
      },
    },
  });
}

export function createVolatilityChart(canvasId, labels, volatility) {
  const filtered = volatility.map((v, i) => ({ l: labels[i], v })).filter(d => d.v !== null);
  return new Chart(document.getElementById(canvasId), {
    type: 'line',
    data: {
      labels: filtered.map(d => d.l),
      datasets: [{
        data: filtered.map(d => d.v),
        borderColor: 'rgba(255,179,71,.8)', borderWidth: 2, pointRadius: 0,
        fill: true, backgroundColor: 'rgba(255,179,71,.06)',
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: C.txt2, font: { size: 9 }, maxTicksLimit: 8 }, grid: { color: gridColor() } },
        y: smallTicks(),
      },
    },
  });
}
