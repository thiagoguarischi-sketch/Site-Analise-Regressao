// Funções auxiliares puras: formatação, escape, agregações estatísticas básicas.

export const mean = arr => arr.reduce((s, v) => s + v, 0) / arr.length;
export const sum = arr => arr.reduce((s, v) => s + v, 0);

export const fmt = v => isNaN(v) ? 'NaN' : v.toFixed(4);
export const fmtP = v => v < 0.0001 ? '<0.0001' : v.toFixed(4);

export function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });
}

export function safeNum(v) {
  const n = parseFloat(v);
  return isNaN(n) ? '' : n;
}

export function rmse(resid) {
  return Math.sqrt(resid.reduce((s, r) => s + r * r, 0) / resid.length);
}

export function mae(resid) {
  return resid.reduce((s, r) => s + Math.abs(r), 0) / resid.length;
}

export function mape(ys, yhat) {
  const v = ys
    .map((y, i) => y !== 0 ? Math.abs((y - yhat[i]) / y) : null)
    .filter(x => x !== null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length * 100 : null;
}

export function qualLabel(r2adj) {
  return r2adj >= 0.9 ? '🏆 Excelente'
       : r2adj >= 0.7 ? '✅ Bom'
       : r2adj >= 0.5 ? '⚠️ Moderado'
       : '❌ Fraco';
}

export function sigStars(p) {
  return p < 0.001 ? '★★★'
       : p < 0.01  ? '★★'
       : p < 0.05  ? '★'
       : p < 0.1   ? '·'
       : '';
}

export function durbinWatson(resid) {
  let num = 0, den = 0;
  for (let i = 1; i < resid.length; i++) num += (resid[i] - resid[i - 1]) ** 2;
  resid.forEach(r => den += r ** 2);
  return num / den;
}
