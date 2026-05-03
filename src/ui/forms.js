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
  document.getElementById('import-preview').style.display = 'block';
  showToast(`${data.length - 1} linhas detectadas.`, 'ok');
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
  importPreviewData = null;
}
