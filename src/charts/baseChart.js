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

export function axis(title, color = C.txt2) {
  return {
    title: { display: true, text: title, color, font: { size: 10 } },
    ticks: { color: C.txt2 },
    grid: { color: C.grid },
  };
}

export function smallTicks() {
  return { ticks: { color: C.txt2, font: { size: 9 } }, grid: { color: C.grid } };
}

export function legendStyle(size = 11) {
  return { labels: { color: C.txt2, font: { size } } };
}
