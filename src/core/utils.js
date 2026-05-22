// Funções auxiliares puras: formatação, escape, agregações estatísticas básicas.

export const mean = arr => arr.reduce((s, v) => s + v, 0) / arr.length;
export const sum = arr => arr.reduce((s, v) => s + v, 0);

export const fmt = v => (v == null || !isFinite(v)) ? '—' : v.toFixed(4);
export const fmtP = v => (v == null || !isFinite(v)) ? '—' : v < 0.0001 ? '<0.0001' : v.toFixed(4);

// Escapa para uso seguro em HTML — inclui aspas, cobrindo também
// contextos de atributo (ex.: title="..."). NÃO é suficiente para
// strings JS dentro de atributos on*: nesses casos não interpole dados.
export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });
}

// Iniciais para avatares (amigos/chat). Mantém apenas letras/dígitos —
// evita injeção via inicial '<' quando interpolada em innerHTML.
export function initials(name, email) {
  const ini = (name || email || '?').split(' ').map(n => n[0]).filter(Boolean)
    .slice(0, 2).join('').toUpperCase().replace(/[^0-9A-ZÀ-Ý]/g, '');
  return ini || '?';
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

