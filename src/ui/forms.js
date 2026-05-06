// Formulário da regressão linear simples (linhas X/Y) + importação de arquivo/URL.

import { showToast } from './notifications.js';
import { parseCSVText, readFileAsArray } from '../core/validation.js';
import { esc } from '../core/utils.js';

let importPreviewData = null;

export function initRows(n = 8) {
  const container = document.getElementById('data-rows');
  container.innerHTML = '';
  for (let i = 0; i < n; i++) addRow();
  updateCount();
}

export function addRow() {
  const container = document.getElementById('data-rows');
  const i = container.children.length + 1;
  const row = document.createElement('div');
  row.className = 'data-row';
  row.innerHTML = `
    <span class="data-row-n">${i}</span>
    <input class="data-input" type="number" placeholder="x" oninput="updateCount()" step="any">
    <input class="data-input" type="number" placeholder="y" oninput="updateCount()" step="any">
  `;
  container.appendChild(row);
  updateCount();
}

export function clearRows(hideResultsFn) {
  document.getElementById('data-rows').innerHTML = '';
  initRows();
  if (typeof hideResultsFn === 'function') hideResultsFn();
}

export function setRows(xs, ys) {
  document.getElementById('data-rows').innerHTML = '';
  xs.forEach((x, i) => {
    addRow();
    const rows = document.getElementById('data-rows').children;
    const last = rows[rows.length - 1];
    last.querySelectorAll('input')[0].value = x;
    last.querySelectorAll('input')[1].value = ys[i];
  });
  for (let i = xs.length; i < 8; i++) addRow();
  updateCount();
}

export function getData() {
  const rows = document.getElementById('data-rows').children;
  const xs = [], ys = [];
  for (const row of rows) {
    const inputs = row.querySelectorAll('input');
    const x = parseFloat(inputs[0].value);
    const y = parseFloat(inputs[1].value);
    if (!isNaN(x) && !isNaN(y)) { xs.push(x); ys.push(y); }
  }
  return { xs, ys };
}

export function updateCount() {
  const { xs } = getData();
  document.getElementById('data-count').textContent = `${xs.length} par${xs.length !== 1 ? 'es' : ''} de dados`;
  document.getElementById('dh-x').textContent = document.getElementById('label-x').value || 'X';
  document.getElementById('dh-y').textContent = document.getElementById('label-y').value || 'Y';
}

export function loadExample() {
  const examples = [
    { name: 'Gasto Publicidade vs Vendas', lx: 'Gasto (R$k)', ly: 'Vendas (R$k)',
      xs: [2,3,5,7,8,10,12,15,18,20], ys: [4,5,8,11,13,16,19,23,27,30] },
    { name: 'Horas Estudo vs Nota', lx: 'Horas de Estudo', ly: 'Nota (0-10)',
      xs: [1,2,3,4,5,6,7,8,9,10], ys: [3.5,4.2,5.1,6.0,6.8,7.5,8.1,8.7,9.0,9.4] },
    { name: 'Temperatura vs Consumo Sorvete', lx: 'Temperatura (°C)', ly: 'Vendas (unid)',
      xs: [18,20,22,24,26,28,30,32,34,36], ys: [120,150,180,220,270,320,390,440,510,580] },
  ];
  const ex = examples[Math.floor(Math.random() * examples.length)];
  document.getElementById('analysis-name').value = ex.name;
  document.getElementById('label-x').value = ex.lx;
  document.getElementById('label-y').value = ex.ly;
  setRows(ex.xs, ex.ys);
}

// ── Drag-and-drop / file import ──

export function onDragOver(e) {
  e.preventDefault();
  document.getElementById('drop-zone').classList.add('drag-over');
}

export function onDragLeave() {
  const dz = document.getElementById('drop-zone');
  if (dz) dz.classList.remove('drag-over');
}

export function onDrop(e) {
  e.preventDefault();
  onDragLeave();
  processFile(e.dataTransfer.files[0]);
}

export function onFileSelect(e) {
  processFile(e.target.files[0]);
}

export async function processFile(file) {
  if (!file) return;
  try {
    const data = await readFileAsArray(file);
    showPreview(data);
  } catch (err) {
    console.warn('processFile error:', err);
    showToast('Erro ao ler arquivo.', 'err');
  }
}

export async function importURL() {
  let url = document.getElementById('import-url').value.trim();
  if (!url) return;
  if (url.includes('docs.google.com/spreadsheets')) {
    const m = url.match(/\/d\/([^/]+)/);
    if (m) url = `https://docs.google.com/spreadsheets/d/${m[1]}/export?format=csv`;
  }
  try {
    showToast('Buscando dados...', 'info');
    const r = await fetch(url);
    const text = await r.text();
    showPreview(parseCSVText(text));
  } catch (e) {
    showToast('Erro ao importar. Verifique a URL e permissões.', 'err');
  }
}

export function showPreview(data) {
  if (!data || data.length < 2) { showToast('Arquivo inválido ou vazio.', 'err'); return; }
  importPreviewData = data;
  const headers = data[0].map(String);
  const selX = document.getElementById('col-x');
  const selY = document.getElementById('col-y');
  selX.innerHTML = headers.map(h => `<option>${h}</option>`).join('');
  selY.innerHTML = headers.map((h, i) => `<option ${i === 1 ? 'selected' : ''}>${h}</option>`).join('');

  const previewRows = data.slice(0, 8).map(r => `<tr>${r.map(c => `<td style="padding:5px 8px;border-bottom:1px solid var(--brd);font-size:12px">${esc(String(c))}</td>`).join('')}</tr>`).join('');
  document.getElementById('preview-tbl').innerHTML = `
    <table style="border-collapse:collapse;min-width:100%">
      <thead><tr>${headers.map(h => `<th style="background:var(--bg3);padding:6px 8px;font-size:11px;color:var(--x);text-align:left">${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>${previewRows}</tbody>
    </table>`;
  document.getElementById('import-stats').style.display = 'none';
  document.getElementById('import-preview').style.display = 'block';
  showToast(`${data.length - 1} linhas detectadas.`, 'ok');
  updateImportStats();
}

export function confirmImport(switchTabFn) {
  if (!importPreviewData) return;
  const headers = importPreviewData[0].map(String);
  const cx = headers.indexOf(document.getElementById('col-x').value);
  const cy = headers.indexOf(document.getElementById('col-y').value);
  if (cx === -1 || cy === -1) { showToast('Colunas inválidas.', 'err'); return; }

  const xs = [], ys = [];
  importPreviewData.slice(1).forEach(r => {
    const x = parseFloat(r[cx]), y = parseFloat(r[cy]);
    if (!isNaN(x) && !isNaN(y)) { xs.push(x); ys.push(y); }
  });
  if (xs.length < 3) { showToast('Dados insuficientes (mín. 3 pares).', 'err'); return; }

  document.getElementById('label-x').value = document.getElementById('col-x').value;
  document.getElementById('label-y').value = document.getElementById('col-y').value;
  setRows(xs, ys);
  if (typeof switchTabFn === 'function') {
    switchTabFn('nova', document.querySelector('[onclick*="nova"]'));
  }
  cancelImport();
  showToast(`${xs.length} pares importados com sucesso!`, 'ok');
}

export function cancelImport() {
  document.getElementById('import-preview').style.display = 'none';
  document.getElementById('import-stats').style.display = 'none';
  importPreviewData = null;
}

// ── Análise estatística e sugestão de modelos ──

export function updateImportStats() {
  if (!importPreviewData) return;
  const headers = importPreviewData[0].map(String);
  const cx = headers.indexOf(document.getElementById('col-x').value);
  const cy = headers.indexOf(document.getElementById('col-y').value);
  if (cx === -1 || cy === -1) return;

  const xs = [], ys = [], nullCount = { x: 0, y: 0 };
  importPreviewData.slice(1).forEach(r => {
    const xv = parseFloat(r[cx]), yv = parseFloat(r[cy]);
    if (isNaN(xv)) nullCount.x++;
    if (isNaN(yv)) nullCount.y++;
    if (!isNaN(xv) && !isNaN(yv)) { xs.push(xv); ys.push(yv); }
  });

  if (xs.length < 3) return;

  const stats = _computeImportStats(xs, ys);
  const suggestions = _suggestModels(xs, ys, stats);
  _renderStatStrip(stats, nullCount, xs.length);
  _renderStatTable(stats);
  _renderSuggestions(suggestions);
  document.getElementById('import-stats').style.display = 'block';
}

function _computeImportStats(xs, ys) {
  const n = xs.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  const stdX = Math.sqrt(xs.reduce((s, x) => s + (x - meanX) ** 2, 0) / (n - 1));
  const stdY = Math.sqrt(ys.reduce((s, y) => s + (y - meanY) ** 2, 0) / (n - 1));
  const num = xs.reduce((s, x, i) => s + (x - meanX) * (ys[i] - meanY), 0);
  const r = (stdX * stdY === 0) ? 0 : num / ((n - 1) * stdX * stdY);

  const sortedY = [...ys].sort((a, b) => a - b);
  const q1 = sortedY[Math.floor(n * 0.25)];
  const q3 = sortedY[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  const outliers = ys.filter(y => y < q1 - 1.5 * iqr || y > q3 + 1.5 * iqr).length;

  const uniqueY = [...new Set(ys)];
  const binaryY = uniqueY.length === 2 && uniqueY.every(v => v === 0 || v === 1);

  const diffs = xs.slice(1).map((x, i) => x - xs[i]);
  const isTimelike = xs.length >= 6 && diffs[0] !== 0 &&
    diffs.every(d => Math.abs(d - diffs[0]) < 0.001 * Math.abs(diffs[0])) &&
    diffs[0] > 0;

  return {
    n, r, outliers, binaryY, isTimelike,
    x: { min: Math.min(...xs), max: Math.max(...xs), mean: meanX, std: stdX },
    y: { min: Math.min(...ys), max: Math.max(...ys), mean: meanY, std: stdY },
  };
}

function _suggestModels(xs, ys, stats) {
  const { r, n, outliers, binaryY, isTimelike } = stats;
  const absR = Math.abs(r);
  const sug = [];

  if (binaryY) {
    sug.push({ tab: 'logistica', label: 'Regressão Logística', icon: '🎯',
      reason: 'Y é estritamente binário (0/1) — modelo ideal para classificação.', conf: 'alta', color: 'var(--acc)' });
    return sug;
  }

  if (isTimelike) {
    sug.push({ tab: 'serie', label: 'Séries Temporais', icon: '📅',
      reason: 'X parece índice temporal (intervalos iguais e crescente).', conf: 'alta', color: '#4FC3F7' });
  }

  if (outliers > n * 0.05) {
    sug.push({ tab: 'quantilica', label: 'Regressão Quantílica', icon: '🎻',
      reason: `${outliers} outlier(s) detectado(s) — quantílica é robusta a valores extremos.`, conf: 'média', color: '#CE93D8' });
  }

  if (absR >= 0.85) {
    sug.push({ tab: 'nova', label: 'Regressão Linear', icon: '📈',
      reason: `Correlação linear muito forte (r = ${r.toFixed(3)}).`, conf: 'alta', color: 'var(--x)' });
  } else if (absR >= 0.55) {
    sug.push({ tab: 'nova', label: 'Regressão Linear', icon: '📈',
      reason: `Correlação moderada (r = ${r.toFixed(3)}) — pode ser um bom ponto de partida.`, conf: 'média', color: 'var(--x)' });
    sug.push({ tab: 'polinomial', label: 'Regressão Polinomial', icon: '〰️',
      reason: 'Relação pode conter curvatura. Compare o ajuste com o modelo linear.', conf: 'baixa', color: 'var(--acc2)' });
  } else {
    sug.push({ tab: 'polinomial', label: 'Regressão Polinomial', icon: '〰️',
      reason: `Correlação linear fraca (r = ${r.toFixed(3)}) — relação provavelmente não-linear.`, conf: 'alta', color: 'var(--acc2)' });
    sug.push({ tab: 'multipla', label: 'Regressão Múltipla', icon: '📊',
      reason: 'Adicionar outras variáveis pode explicar melhor a variação de Y.', conf: 'média', color: 'var(--y)' });
  }

  if (sug.length === 0) {
    sug.push({ tab: 'nova', label: 'Regressão Linear', icon: '📈',
      reason: 'Ponto de partida recomendado para qualquer análise.', conf: 'baixa', color: 'var(--x)' });
  }

  return sug;
}

function _renderStatStrip(stats, nullCount, validN) {
  const absR = Math.abs(stats.r);
  const rColor = absR >= 0.7 ? 'var(--y)' : absR >= 0.4 ? 'var(--acc2)' : 'var(--acc)';
  const outColor = stats.outliers > 0 ? 'var(--acc)' : 'var(--y)';
  const nullTotal = nullCount.x + nullCount.y;
  const nullColor = nullTotal > 0 ? 'var(--acc2)' : 'var(--y)';

  document.getElementById('import-stat-strip').innerHTML = `
    <div class="import-stat-box">
      <div class="import-stat-val">${validN}</div>
      <div class="import-stat-lab">pares válidos</div>
    </div>
    <div class="import-stat-box">
      <div class="import-stat-val" style="color:${rColor}">${stats.r.toFixed(3)}</div>
      <div class="import-stat-lab">correlação r</div>
    </div>
    <div class="import-stat-box">
      <div class="import-stat-val" style="color:${outColor}">${stats.outliers}</div>
      <div class="import-stat-lab">outliers (IQR)</div>
    </div>
    <div class="import-stat-box">
      <div class="import-stat-val" style="color:${nullColor}">${nullTotal}</div>
      <div class="import-stat-lab">inválidos</div>
    </div>
  `;
}

function _renderStatTable(stats) {
  const f = v => Math.abs(v) >= 1000 ? v.toFixed(0) : Math.abs(v) >= 10 ? v.toFixed(2) : v.toFixed(4);
  const xLabel = esc(document.getElementById('col-x').value || 'X');
  const yLabel = esc(document.getElementById('col-y').value || 'Y');

  document.getElementById('import-stat-table').innerHTML = `
    <table class="import-stat-tbl">
      <thead><tr><th></th><th>${xLabel}</th><th>${yLabel}</th></tr></thead>
      <tbody>
        <tr><td>Mínimo</td><td>${f(stats.x.min)}</td><td>${f(stats.y.min)}</td></tr>
        <tr><td>Máximo</td><td>${f(stats.x.max)}</td><td>${f(stats.y.max)}</td></tr>
        <tr><td>Média</td><td>${f(stats.x.mean)}</td><td>${f(stats.y.mean)}</td></tr>
        <tr><td>Desvio padrão</td><td>${f(stats.x.std)}</td><td>${f(stats.y.std)}</td></tr>
      </tbody>
    </table>
  `;
}

function _renderSuggestions(sug) {
  const confLabel = { alta: '● Alta confiança', média: '◐ Média confiança', baixa: '○ Baixa confiança' };
  const confColor = { alta: 'var(--y)', média: 'var(--acc2)', baixa: 'var(--txt3)' };

  document.getElementById('import-suggestions').innerHTML = sug.map(s => `
    <div class="import-sug-card" style="border-left-color:${s.color}">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
        <span style="font-size:16px">${s.icon}</span>
        <strong style="font-size:13px;color:var(--txt)">${s.label}</strong>
        <span style="margin-left:auto;font-size:10px;font-weight:600;color:${confColor[s.conf]}">${confLabel[s.conf]}</span>
      </div>
      <div style="font-size:12px;color:var(--txt2);line-height:1.5;margin-bottom:8px">${s.reason}</div>
      <button class="btn-guide-use" onclick="switchTab('${s.tab}',document.querySelector('[onclick*=\\'${s.tab}\\']'))"
        style="font-size:11px;padding:5px 12px;border-color:${s.color}55;background:${s.color}18;color:${s.color}">
        Usar ${s.label} →
      </button>
    </div>
  `).join('');
}
