// Dispersões básicas e dispersão+linha de regressão (linear simples e múltipla obs vs ajuste).

import { C, axis, legendStyle } from './baseChart.js';

export function createScatterWithLine(canvasId, xs, ys, lineX, lineY, labelX, labelY) {
  return new Chart(document.getElementById(canvasId), {
    data: {
      datasets: [
        {
          type: 'scatter', label: 'Dados',
          data: xs.map((x, i) => ({ x, y: ys[i] })),
          backgroundColor: C.scatter, pointRadius: 5,
        },
        {
          type: 'line', label: 'Regressão',
          data: lineX.map((x, i) => ({ x, y: lineY[i] })),
          borderColor: C.y, borderWidth: 2, pointRadius: 0, fill: false,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: legendStyle(11),
        tooltip: { callbacks: { label: p => `(${p.parsed.x.toFixed(2)}, ${p.parsed.y.toFixed(2)})` } },
      },
      scales: {
        x: axis(labelX, C.x),
        y: axis(labelY, C.y),
      },
    },
  });
}

export function createObsVsFitChart(canvasId, observed, fitted, labelY) {
  const minV = Math.min(...observed, ...fitted);
  const maxV = Math.max(...observed, ...fitted);
  return new Chart(document.getElementById(canvasId), {
    data: {
      datasets: [
        {
          type: 'scatter', label: 'Dados',
          data: observed.map((y, i) => ({ x: fitted[i], y })),
          backgroundColor: C.scatter, pointRadius: 4,
        },
        {
          type: 'line', label: 'Linha ideal',
          data: [{ x: minV, y: minV }, { x: maxV, y: maxV }],
          borderColor: C.ideal, borderWidth: 1.5, pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: axis('Ŷ (Ajustado)'),
        y: axis(`${labelY} (Observado)`),
      },
    },
  });
}
