// Infraestrutura Excel BI estilizada (xlsx-js-style 1.2.0): paleta, estilos, helpers
// e construtores de sheets reutilizados por todas as regressões.

import { XC } from '../config/constants.js';

export { XC };

export function st(opts = {}) {
  const s = {};
  if (opts.bg) s.fill = { fgColor: { rgb: opts.bg }, patternType: 'solid' };

  const font = {};
  if (opts.color)  font.color = { rgb: opts.color };
  if (opts.bold)   font.bold = true;
  if (opts.sz)     font.sz = opts.sz;
  if (opts.italic) font.italic = true;
  if (opts.name)   font.name = opts.name;
  if (Object.keys(font).length) s.font = font;

  if (opts.wrap || opts.ha || opts.va) {
    s.alignment = {};
    if (opts.wrap) s.alignment.wrapText = true;
    if (opts.ha)   s.alignment.horizontal = opts.ha;
    if (opts.va)   s.alignment.vertical = opts.va;
  }

  const thin = { style: 'thin', color: { rgb: XC.BRD } };
  const thick = { style: 'medium', color: { rgb: '7F8C8D' } };
  if (opts.border === 'all') s.border = { top: thin, bottom: thin, left: thin, right: thin };
  if (opts.border === 'box') s.border = { top: thick, bottom: thick, left: thick, right: thick };
  if (opts.border === 'bt')  s.border = { top: thick, bottom: thick };
  if (opts.border === 'b')   s.border = { bottom: thin };
  if (opts.border === 'bb')  s.border = { bottom: thick };

  if (opts.numFmt) s.numFmt = opts.numFmt;
  return s;
}

export const S = {
  title:    st({ bg: XC.H_DARK, color: XC.WHITE, bold: true, sz: 14, ha: 'center', border: 'box' }),
  subtitle: st({ bg: XC.H_PURPLE, color: XC.WHITE, bold: true, sz: 11, ha: 'center', border: 'all' }),
  hPurple:  st({ bg: XC.H_PURPLE, color: XC.WHITE, bold: true, sz: 10, ha: 'center', border: 'all' }),
  hGreen:   st({ bg: XC.H_GREEN,  color: XC.WHITE, bold: true, sz: 10, ha: 'center', border: 'all' }),
  hBlue:    st({ bg: XC.H_BLUE,   color: XC.WHITE, bold: true, sz: 10, ha: 'center', border: 'all' }),
  hTeal:    st({ bg: XC.H_TEAL,   color: XC.WHITE, bold: true, sz: 10, ha: 'center', border: 'all' }),
  hOrange:  st({ bg: XC.H_ORANGE, color: XC.WHITE, bold: true, sz: 10, ha: 'center', border: 'all' }),
  hGray:    st({ bg: XC.H_GRAY,   color: XC.WHITE, bold: true, sz: 10, ha: 'center', border: 'all' }),
  hRed:     st({ bg: XC.H_RED,    color: XC.WHITE, bold: true, sz: 10, ha: 'center', border: 'all' }),
  hDark:    st({ bg: XC.H_DARK,   color: XC.WHITE, bold: true, sz: 10, ha: 'center', border: 'all' }),
  even:     st({ bg: XC.ROW_BASE, border: 'all', ha: 'center' }),
  odd:      st({ bg: XC.ROW_ALT,  border: 'all', ha: 'center' }),
  evenL:    st({ bg: XC.ROW_BASE, border: 'all', ha: 'left' }),
  oddL:     st({ bg: XC.ROW_ALT,  border: 'all', ha: 'left' }),
  pct2:     st({ bg: XC.ROW_BASE, border: 'all', ha: 'center', numFmt: '0.00%' }),
  pctOdd:   st({ bg: XC.ROW_ALT,  border: 'all', ha: 'center', numFmt: '0.00%' }),
  num4:     st({ bg: XC.ROW_BASE, border: 'all', ha: 'center', numFmt: '0.0000' }),
  num4Odd:  st({ bg: XC.ROW_ALT,  border: 'all', ha: 'center', numFmt: '0.0000' }),
  warn:     st({ bg: XC.ROW_WARN, border: 'all', ha: 'center', bold: true }),
  crit:     st({ bg: XC.ROW_CRIT, border: 'all', ha: 'center', bold: true, color: XC.H_RED }),
  good:     st({ bg: XC.ROW_GOOD, border: 'all', ha: 'center', bold: true, color: XC.H_GREEN }),
  kpiLabel: st({ bg: XC.KPI_BG,   border: 'all', bold: true, ha: 'left',   color: XC.H_DARK }),
  kpiVal:   st({ bg: XC.WHITE,    border: 'all', ha: 'center', bold: true, sz: 12 }),
  kpiNote:  st({ bg: XC.ROW_ALT,  border: 'all', ha: 'left',  italic: true, color: '555555' }),
  section:  st({ bg: XC.SECTION,  border: 'bt',  bold: true,  ha: 'left', sz: 11 }),
  sectionR: st({ bg: XC.SECTION,  border: 'bt',  ha: 'center' }),
  insTitle: st({ bg: XC.H_PURPLE, color: XC.WHITE, bold: true, sz: 12, ha: 'left', border: 'bb' }),
  insLabel: st({ bg: XC.KPI_BG,   border: 'all', bold: true, ha: 'left' }),
  insVal:   st({ bg: XC.WHITE,    border: 'all', ha: 'left', wrap: true }),
  empty:    st({ bg: XC.WHITE }),
};

export function cell(v, style, numFmt) {
  const c = { v: v ?? '', t: typeof v === 'number' ? 'n' : 's', s: style || S.even };
  if (numFmt) c.s = { ...c.s, numFmt };
  return c;
}

export const zebra = i => i % 2 === 0;

export function buildWS(rows, colWidths) {
  const ws = {};
  let maxC = 0;
  rows.forEach((row, r) => {
    if (!row) return;
    row.forEach((cellObj, c) => {
      if (cellObj == null) return;
      const addr = XLSX.utils.encode_cell({ r, c });
      ws[addr] = typeof cellObj === 'object' && cellObj.v !== undefined
        ? cellObj
        : { v: cellObj, t: typeof cellObj === 'number' ? 'n' : 's' };
      maxC = Math.max(maxC, c);
    });
  });
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length - 1, c: maxC } });
  if (colWidths) ws['!cols'] = colWidths.map(w => ({ wch: w }));
  return ws;
}

export function autoFilter(ws, endCol, endRow) {
  const ref = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: endRow, c: endCol } });
  ws['!autofilter'] = { ref };
}

export function mergeRange(ws, r1, c1, r2, c2) {
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push({ s: { r: r1, c: c1 }, e: { r: r2, c: c2 } });
}

// ── Construtores de sheets reutilizáveis ──

export function buildRawSheet(idCol, varCols, yCol, rows, modelName) {
  const headers = ['🔢 ID', ...varCols, yCol, '🤖 Modelo', '📋 Análise'];
  const hStyles = [S.hDark, ...varCols.map(() => S.hBlue), S.hGreen, S.hGray, S.hGray];

  const titleRow = [cell(`📊 RAW DATA — ${modelName}`, S.title)];
  const headerRow = headers.map((h, i) => cell(h, hStyles[i]));

  const dataRows = rows.map((r, i) => {
    const z = zebra(i);
    return r.map((v, j) => {
      const base = j === 0
        ? (z ? S.even : S.odd)
        : j < r.length - 2
          ? (z ? S.num4 : S.num4Odd)
          : (z ? S.evenL : S.oddL);
      return cell(v, base);
    });
  });

  const ws = buildWS([titleRow, headerRow, ...dataRows],
    [6, ...varCols.map(() => 14), 14, 20, 22]);
  mergeRange(ws, 0, 0, 0, headers.length - 1);
  autoFilter(ws, headers.length - 1, rows.length + 1);
  return ws;
}

export function buildPredSheet(predRows, modelLabel) {
  const headers = ['🔢 ID', '📈 Real', '🎯 Previsto', '📉 Erro', '📐 Erro²', '📏 |Erro|', '📊 Erro%', '🚨 Outlier', '🤖 Modelo'];
  const hS = [S.hDark, S.hGreen, S.hBlue, S.hOrange, S.hOrange, S.hOrange, S.hOrange, S.hRed, S.hGray];

  const titleRow = [cell(`🎯 PREDICTION ANALYSIS — ${modelLabel}`, S.title)];
  const headerRow = headers.map((h, i) => cell(h, hS[i]));

  const dataRows = predRows.map((r, i) => {
    const isOutlier = r[7] === 'SIM';
    const z = zebra(i);
    const base  = isOutlier ? S.warn : (z ? S.even : S.odd);
    const baseL = isOutlier ? S.warn : (z ? S.evenL : S.oddL);
    return [
      cell(r[0], base),
      cell(r[1], base),
      cell(r[2], base),
      cell(r[3], { ...base, numFmt: '0.0000' }),
      cell(r[4], { ...base, numFmt: '0.0000' }),
      cell(r[5], base),
      cell(r[6] !== '' ? r[6] / 100 : '', { ...(isOutlier ? S.warn : (z ? S.pct2 : S.pctOdd)) }),
      cell(r[7], isOutlier ? S.crit : S.good),
      cell(r[8], baseL),
    ];
  });

  const ws = buildWS([titleRow, headerRow, ...dataRows], [6, 12, 12, 12, 12, 12, 10, 10, 20]);
  mergeRange(ws, 0, 0, 0, headers.length - 1);
  autoFilter(ws, headers.length - 1, predRows.length + 1);
  return ws;
}

export function buildResidSheet(residRows, modelLabel) {
  const headers = ['🔢 ID', '📉 Resíduo', '📊 Resíduo Std', '📐 Resíduo²', '🔬 Leverage', "🍳 Cook's D", '🚦 Flag'];
  const hS = [S.hDark, S.hOrange, S.hOrange, S.hOrange, S.hBlue, S.hBlue, S.hRed];

  const titleRow = [cell(`🔬 RESIDUALS — ${modelLabel}`, S.title)];
  const headerRow = headers.map((h, i) => cell(h, hS[i]));

  const dataRows = residRows.map((r, i) => {
    const isOut = r[6] === 'OUTLIER' || (r[6] && r[6].includes('OUTLIER'));
    const isInf = r[6] && r[6].includes('INFLUENTE');
    const z = zebra(i);
    const base = isOut && isInf ? S.crit : isOut ? S.warn : (z ? S.even : S.odd);
    return r.map((v, j) =>
      cell(v, j === 6
        ? (isOut || isInf ? (isOut && isInf ? S.crit : S.warn) : S.good)
        : base)
    );
  });

  const ws = buildWS([titleRow, headerRow, ...dataRows], [6, 13, 13, 13, 12, 12, 16]);
  mergeRange(ws, 0, 0, 0, headers.length - 1);
  autoFilter(ws, headers.length - 1, residRows.length + 1);
  return ws;
}

export function buildKPISheet(kpiRows, modelLabel) {
  const titleRow = [cell(`📊 MODEL KPIs — ${modelLabel}`, S.title)];
  const headerRow = [cell('📋 Indicador', S.hTeal), cell('📈 Valor', S.hTeal), cell('💡 Referência', S.hTeal)];

  const dataRows = kpiRows.map((r, i) => {
    const z = zebra(i);
    const valStyle = r.good === true ? S.good
                   : r.good === false ? S.crit
                   : r.section ? S.section
                   : (z ? S.even : S.odd);
    if (r.section) return [cell(r.label, S.section), cell('', S.sectionR), cell('', S.sectionR)];
    return [cell(r.label, S.kpiLabel), cell(r.value, valStyle), cell(r.note || '', S.kpiNote)];
  });

  const ws = buildWS([titleRow, headerRow, ...dataRows], [28, 18, 36]);
  mergeRange(ws, 0, 0, 0, 2);
  return ws;
}

export function buildCompSheet(compRows, modelLabel) {
  const headers = ['🤖 Modelo', '🏷️ Tipo', '📋 Métrica', '📈 Valor'];
  const hS = [S.hDark, S.hBlue, S.hPurple, S.hTeal];

  const titleRow = [cell(`📊 MODEL COMPARISON — ${modelLabel}`, S.title)];
  const headerRow = headers.map((h, i) => cell(h, hS[i]));

  const dataRows = compRows.map((r, i) => {
    const z = zebra(i);
    return r.map((v, j) => cell(v, j < 3 ? (z ? S.evenL : S.oddL) : (z ? S.num4 : S.num4Odd)));
  });

  const ws = buildWS([titleRow, headerRow, ...dataRows], [22, 20, 18, 16]);
  mergeRange(ws, 0, 0, 0, 3);
  autoFilter(ws, 3, compRows.length + 1);
  return ws;
}

export function buildDashSheet(kpiCards, modelLabel, tipo, equations, pivotTips, extras) {
  const rows = [];
  rows.push([cell(`🚀 DASHBOARD BI — ${modelLabel}`, S.title), ...Array(3).fill(cell('', S.title))]);
  rows.push([cell(`📌 Tipo: ${tipo}`, S.subtitle), ...Array(3).fill(cell('', S.subtitle))]);
  rows.push([cell('', S.empty), cell('', S.empty), cell('', S.empty), cell('', S.empty)]);

  rows.push([cell('📊 KPIs PRINCIPAIS', S.section), cell('', S.sectionR), cell('', S.sectionR), cell('💡 Interpretação', S.section)]);

  kpiCards.forEach(({ label, value, note, good }) => {
    const valS = good === true ? S.good : good === false ? S.crit : S.kpiVal;
    rows.push([cell(label, S.kpiLabel), cell(value, valS), cell('', S.empty), cell(note || '', S.kpiNote)]);
  });

  rows.push([cell('', S.empty), cell('', S.empty), cell('', S.empty), cell('', S.empty)]);

  if (equations && equations.length) {
    rows.push([cell('📐 EQUAÇÃO DO MODELO', S.section), ...Array(3).fill(cell('', S.sectionR))]);
    equations.forEach(eq => {
      rows.push([cell(eq[0], S.kpiLabel), cell(eq[1], { ...S.kpiNote, alignment: { horizontal: 'left', wrapText: true } }), cell('', S.empty), cell('', S.empty)]);
    });
    rows.push([cell('', S.empty), cell('', S.empty), cell('', S.empty), cell('', S.empty)]);
  }

  if (extras && extras.length) {
    rows.push([cell('🔍 DETALHES ADICIONAIS', S.section), ...Array(3).fill(cell('', S.sectionR))]);
    extras.forEach(([label, value, note]) => {
      rows.push([cell(label, S.kpiLabel), cell(value, S.kpiVal), cell('', S.empty), cell(note || '', S.kpiNote)]);
    });
    rows.push([cell('', S.empty), cell('', S.empty), cell('', S.empty), cell('', S.empty)]);
  }

  if (pivotTips && pivotTips.length) {
    rows.push([cell('💡 COMO USAR ESTE EXCEL (Power BI / Pivot)', S.section), ...Array(3).fill(cell('', S.sectionR))]);
    pivotTips.forEach(tip => {
      rows.push([cell(tip, { ...S.kpiNote, alignment: { horizontal: 'left', wrapText: true } }), cell('', S.empty), cell('', S.empty), cell('', S.empty)]);
    });
  }

  const ws = buildWS(rows, [30, 26, 4, 40]);
  mergeRange(ws, 0, 0, 0, 3);
  mergeRange(ws, 1, 0, 1, 3);
  return ws;
}

export function buildInsightsSheet(insights, modelLabel) {
  const rows = [];
  rows.push([cell(`🧠 AUTO REPORT — INSIGHTS — ${modelLabel}`, S.insTitle), cell('', { ...S.insTitle }), cell('', S.insTitle)]);
  rows.push([cell(`📅 Gerado em: ${new Date().toLocaleString('pt-BR')}`, S.kpiNote), cell('', S.kpiNote), cell('', S.kpiNote)]);
  rows.push([cell('', S.empty), cell('', S.empty), cell('', S.empty)]);

  insights.forEach(item => {
    if (item.section) {
      rows.push([cell(item.section, S.section), cell('', S.sectionR), cell('', S.sectionR)]);
    } else {
      const valS = item.good === true ? S.good : item.good === false ? S.crit : S.insVal;
      rows.push([cell(item.label, S.insLabel), cell(item.value, valS), cell(item.note || '', S.kpiNote)]);
    }
  });

  const ws = buildWS(rows, [30, 40, 30]);
  mergeRange(ws, 0, 0, 0, 2);
  mergeRange(ws, 1, 0, 1, 2);
  return ws;
}

// CSV simples reutilizado por todas as exportações .csv
export function downloadCSV(filename, header, rows) {
  const csv = [header, ...rows].map(r => r.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = filename;
  a.click();
}
