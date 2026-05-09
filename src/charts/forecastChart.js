// Gráficos da aba Séries Temporais — clássico, ARIMA e GARCH.

import { C, axis, smallTicks, legendStyle, gridColor } from './baseChart.js';

// ─── DECOMPOSIÇÃO CLÁSSICA ────────────────────────────────────────────────────

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

// ─── ARIMA ────────────────────────────────────────────────────────────────────

// Série observada + valores ajustados (in-sample) + previsão com IC 95%
export function createARIMAMainChart(canvasId, res, allLabels) {
  const { values, fittedOrig, forecastY, ciLower, ciUpper, n, labelY } = res;

  const fLen = forecastY.length;
  const fcX = Array.from({ length: fLen }, (_, i) => n + i);

  const fittedPts = fittedOrig
    .map((v, i) => (isFinite(v) && !isNaN(v)) ? { x: i, y: v } : null)
    .filter(v => v !== null);

  return new Chart(document.getElementById(canvasId), {
    data: {
      datasets: [
        // IC superior (fill to dataset below = IC inferior)
        { type: 'line', label: 'IC 95% Sup',
          data: fcX.map((x, i) => ({ x, y: ciUpper[i] })),
          borderColor: 'rgba(255,107,107,.25)', borderWidth: 1, pointRadius: 0,
          fill: false },
        // IC inferior (fill up to IC superior)
        { type: 'line', label: 'IC 95%',
          data: fcX.map((x, i) => ({ x, y: ciLower[i] })),
          borderColor: 'rgba(255,107,107,.25)', borderWidth: 1, pointRadius: 0,
          fill: '-1', backgroundColor: 'rgba(255,107,107,.12)' },
        // Série observada
        { type: 'line', label: 'Observado',
          data: values.map((v, i) => ({ x: i, y: v })),
          borderColor: 'rgba(123,111,255,.9)', borderWidth: 2, pointRadius: 2.5, fill: false },
        // Ajustado (in-sample)
        { type: 'line', label: 'Ajustado',
          data: fittedPts,
          borderColor: C.acc2, borderWidth: 1.5, borderDash: [4, 2], pointRadius: 0, fill: false },
        // Previsão
        { type: 'line', label: 'Previsão',
          data: fcX.map((x, i) => ({ x, y: forecastY[i] })),
          borderColor: 'rgba(255,107,107,.9)', borderWidth: 2, borderDash: [5, 3], pointRadius: 4, fill: false },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: legendStyle(10) },
      scales: {
        x: { type: 'linear',
          ticks: { color: C.txt2, font: { size: 9 }, callback: v => allLabels[Math.round(v)] || v },
          grid: { color: gridColor() } },
        y: axis(labelY),
      },
    },
  });
}

// ACF ou PACF — barras coloridas com bandas de confiança (±1.96/√n)
export function createACFChart(canvasId, acfVals, confBand) {
  const n = acfVals.length;
  const labels = Array.from({ length: n }, (_, i) => String(i + 1));
  const upper = new Array(n).fill(confBand);
  const lower = new Array(n).fill(-confBand);
  return new Chart(document.getElementById(canvasId), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { type: 'line', label: '+1.96/√n', data: upper,
          borderColor: 'rgba(255,179,71,.6)', borderWidth: 1.5,
          borderDash: [4, 3], pointRadius: 0, fill: false, order: 1 },
        { type: 'line', label: '-1.96/√n', data: lower,
          borderColor: 'rgba(255,179,71,.6)', borderWidth: 1.5,
          borderDash: [4, 3], pointRadius: 0, fill: false, order: 1 },
        { label: 'ACF/PACF', data: acfVals,
          backgroundColor: acfVals.map(v => Math.abs(v) > confBand
            ? 'rgba(255,107,107,.7)' : 'rgba(123,111,255,.5)'),
          borderWidth: 0, order: 2 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: C.txt2, font: { size: 9 } }, grid: { color: gridColor() } },
        y: { ...smallTicks(), suggestedMin: -1, suggestedMax: 1 },
      },
    },
  });
}

// ─── GARCH ────────────────────────────────────────────────────────────────────

// Série observada com bandas de volatilidade condicional (μ ± 1.96σ_t) e previsão
export function createGARCHMainChart(canvasId, res, allLabels) {
  const { values, sigma, mu, n, futureN, ciLower, ciUpper, labelY } = res;
  const fcX = Array.from({ length: futureN }, (_, i) => n + i);

  const upperBand = values.map((_, i) => ({ x: i, y: mu + 1.96 * sigma[i] }));
  const lowerBand = values.map((_, i) => ({ x: i, y: mu - 1.96 * sigma[i] }));

  return new Chart(document.getElementById(canvasId), {
    data: {
      datasets: [
        // IC histórico superior (fill to lower = next dataset)
        { type: 'line', label: 'μ ± 1.96σ_t Sup', data: upperBand,
          borderColor: 'rgba(255,179,71,.2)', borderWidth: 1, pointRadius: 0,
          fill: false },
        // IC histórico inferior
        { type: 'line', label: 'μ ± 1.96σ_t Inf', data: lowerBand,
          borderColor: 'rgba(255,179,71,.2)', borderWidth: 1, pointRadius: 0,
          fill: '-1', backgroundColor: 'rgba(255,179,71,.10)' },
        // IC previsão superior (fill to lower)
        { type: 'line', label: 'IC 95% Sup', data: fcX.map((x, i) => ({ x, y: ciUpper[i] })),
          borderColor: 'rgba(255,107,107,.2)', borderWidth: 1, pointRadius: 0,
          fill: false },
        // IC previsão inferior
        { type: 'line', label: 'IC 95% Prev.', data: fcX.map((x, i) => ({ x, y: ciLower[i] })),
          borderColor: 'rgba(255,107,107,.2)', borderWidth: 1, pointRadius: 0,
          fill: '-1', backgroundColor: 'rgba(255,107,107,.15)' },
        // Série observada
        { type: 'line', label: 'Observado', data: values.map((v, i) => ({ x: i, y: v })),
          borderColor: 'rgba(123,111,255,.9)', borderWidth: 2, pointRadius: 2, fill: false },
        // Nível esperado (previsão)
        { type: 'line', label: 'Nível esperado (μ)',
          data: fcX.map(x => ({ x, y: mu })),
          borderColor: 'rgba(255,107,107,.8)', borderWidth: 1.5, borderDash: [5, 3], pointRadius: 3, fill: false },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: legendStyle(9) },
      scales: {
        x: { type: 'linear',
          ticks: { color: C.txt2, font: { size: 9 }, callback: v => allLabels[Math.round(v)] || v },
          grid: { color: gridColor() } },
        y: axis(labelY),
      },
    },
  });
}

// Variância condicional σ²_t ao longo do tempo
export function createGARCHVarChart(canvasId, labels, h) {
  return new Chart(document.getElementById(canvasId), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: h,
        borderColor: 'rgba(255,179,71,.85)', borderWidth: 2, pointRadius: 0,
        fill: true, backgroundColor: 'rgba(255,179,71,.07)',
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
