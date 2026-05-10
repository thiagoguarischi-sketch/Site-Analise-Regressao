// Cores compartilhadas, defaults de eixo Chart.js e helper de destruição segura.

import { CHART_COLORS } from '../config/constants.js';

export const C = CHART_COLORS;

export function destroyChart(instance) {
  if (instance && typeof instance.destroy === 'function') instance.destroy();
}

export function destroyChartMap(map, key) {
  if (key && map[key]) { map[key].destroy(); delete map[key]; return; }
  Object.keys(map).forEach(k => { if (map[k]) { map[k].destroy(); delete map[k]; } });
}

export function gridColor() {
  return document.documentElement.classList.contains('light')
    ? 'rgba(0,0,0,.13)'
    : 'rgba(255,255,255,.1)';
}

function tickColor() {
  return document.documentElement.classList.contains('light')
    ? 'rgba(0,0,0,.35)'
    : C.txt2;
}

export function axis(title, color) {
  const tc = tickColor();
  return {
    title: { display: true, text: title, color: color ?? tc, font: { size: 10 } },
    ticks: { color: tc },
    grid: { color: gridColor() },
  };
}

export function smallTicks() {
  return { ticks: { color: tickColor(), font: { size: 9 } }, grid: { color: gridColor() } };
}

export function legendStyle(size = 11) {
  return { labels: { color: C.txt2, font: { size } } };
}

// ── Controles de escala (zoom in/out/reset) ──

const _chartRegistry = {};
const _mousePos = {}; // última posição do mouse em coordenadas de dados por chart id

function _pixelToData(chart, px, py) {
  const sx = chart.scales.x;
  const sy = chart.scales.y;
  if (!sx || !sy) return null;
  return {
    x: sx.getValueForPixel(px),
    y: sy.getValueForPixel(py),
  };
}

function _attachMouseTracking(id, chart) {
  const canvas = chart.canvas;
  if (!canvas) return;
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const data = _pixelToData(chart, px, py);
    if (data) _mousePos[id] = data;
  });
  canvas.addEventListener('mouseleave', () => {
    delete _mousePos[id];
  });
  // Scroll do mouse também faz zoom centrado no cursor
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 0.7 : 1.43;
    scaleChart(id, factor);
  }, { passive: false });
}

export function registerChart(id, chart) {
  _chartRegistry[id] = chart;
  _attachMouseTracking(id, chart);
}

export function scaleChart(id, factor) {
  const chart = _chartRegistry[id];
  if (!chart) return;

  if (factor === 0) {
    chart.options.scales.x.min = undefined;
    chart.options.scales.x.max = undefined;
    chart.options.scales.y.min = undefined;
    chart.options.scales.y.max = undefined;
  } else {
    const sx = chart.scales.x;
    const sy = chart.scales.y;
    if (!sx || !sy) return;

    // Usa a posição do mouse como âncora; senão usa o centro
    const anchor = _mousePos[id] ?? {
      x: (sx.min + sx.max) / 2,
      y: (sy.min + sy.max) / 2,
    };

    // Mantém a âncora fixa: distâncias das bordas escalam pelo fator
    chart.options.scales.x.min = anchor.x - (anchor.x - sx.min) * factor;
    chart.options.scales.x.max = anchor.x + (sx.max - anchor.x) * factor;
    chart.options.scales.y.min = anchor.y - (anchor.y - sy.min) * factor;
    chart.options.scales.y.max = anchor.y + (sy.max - anchor.y) * factor;
  }

  chart.update('none');
}
