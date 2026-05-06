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
