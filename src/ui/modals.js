// Modal de visualização e edição de uma análise persistida.

import { fetchAnalyses, deleteAnalysisRequest } from '../services/analysisService.js';
import { showToast } from './notifications.js';
import { esc, fmt, fmtP } from '../core/utils.js';

import {
  loadSimpleAnalysis,
  loadMultipleAnalysis,
} from '../regressions/linearRegression.js';
import { loadLogisticAnalysis }   from '../regressions/logisticRegression.js';
import { loadPolynomialAnalysis } from '../regressions/polynomialRegression.js';
import { loadSerieAnalysis }      from '../regressions/timeSeries.js';

export async function viewAnalysis(id) {
  try {
    const analyses = await fetchAnalyses();
    const a = analyses.find(x => x.id === id);
    if (!a) throw new Error('Análise não encontrada.');

    const d = a.dados || {};
    const isSimples = a.tipo === 'simples';
    const isLogistica = a.tipo === 'logistica';
    const isPolinomial = a.tipo === 'polinomial';
    const dataFormatada = new Date(a.created_at).toLocaleString('pt-BR');

    let rows = '';
    if (isSimples) {
      rows = `
        <div class="modal-row"><span class="modal-row-key">β₀ (Intercepto)</span><span class="modal-row-val">${fmt(d.b0)}</span></div>
        <div class="modal-row"><span class="modal-row-key">β₁ (Inclinação)</span><span class="modal-row-val">${fmt(d.b1)}</span></div>
        <div class="modal-row"><span class="modal-row-key">R²</span><span class="modal-row-val" style="color:var(--y)">${fmt(d.r2)}</span></div>
        <div class="modal-row"><span class="modal-row-key">R² Ajustado</span><span class="modal-row-val">${fmt(d.r2adj)}</span></div>
        <div class="modal-row"><span class="modal-row-key">r de Pearson</span><span class="modal-row-val">${fmt(d.r)}</span></div>
        <div class="modal-row"><span class="modal-row-key">Erro Padrão</span><span class="modal-row-val">${fmt(d.se)}</span></div>
        <div class="modal-row"><span class="modal-row-key">F-stat</span><span class="modal-row-val">${fmt(d.Fstat)}</span></div>
        <div class="modal-row"><span class="modal-row-key">p-valor F</span><span class="modal-row-val">${fmtP(d.pF)}</span></div>
        <div class="modal-row"><span class="modal-row-key">n</span><span class="modal-row-val">${d.n}</span></div>
        <div class="modal-row"><span class="modal-row-key">X</span><span class="modal-row-val">${esc(a.label_x || 'X')}</span></div>
        <div class="modal-row"><span class="modal-row-key">Y</span><span class="modal-row-val">${esc(a.label_y || 'Y')}</span></div>
      `;
    } else if (isLogistica) {
      rows = `
        <div class="modal-row"><span class="modal-row-key">R² McFadden</span><span class="modal-row-val" style="color:var(--y)">${fmt(d.mcFaddenR2)}</span></div>
        <div class="modal-row"><span class="modal-row-key">AUC-ROC</span><span class="modal-row-val" style="color:var(--x)">${fmt(d.auc)}</span></div>
        <div class="modal-row"><span class="modal-row-key">AIC</span><span class="modal-row-val">${d.aic?.toFixed(2) ?? '—'}</span></div>
        <div class="modal-row"><span class="modal-row-key">Acurácia</span><span class="modal-row-val">${d.cm?.acc != null ? (d.cm.acc * 100).toFixed(1) + '%' : '—'}</span></div>
        <div class="modal-row"><span class="modal-row-key">F1-Score</span><span class="modal-row-val">${d.cm?.f1 != null ? (d.cm.f1 * 100).toFixed(1) + '%' : '—'}</span></div>
        <div class="modal-row"><span class="modal-row-key">n / k</span><span class="modal-row-val">${d.n} obs / ${d.k} preditores</span></div>
        <div class="modal-row"><span class="modal-row-key">Y</span><span class="modal-row-val">${esc(d.labelY || 'Y')}</span></div>
        ${(d.beta || []).map((b, j) => `<div class="modal-row"><span class="modal-row-key">${j === 0 ? 'β₀' : `β${j} (${esc((d.varNames || [])[j - 1] || 'X' + j)})`}</span><span class="modal-row-val">${fmt(b)}</span></div>`).join('')}
      `;
    } else if (a.tipo === 'serie') {
      rows = `
        <div class="modal-row"><span class="modal-row-key">Variável</span><span class="modal-row-val">${esc(d.labelY || '—')}</span></div>
        <div class="modal-row"><span class="modal-row-key">n</span><span class="modal-row-val">${d.n}</span></div>
        <div class="modal-row"><span class="modal-row-key">Média</span><span class="modal-row-val" style="color:var(--y)">${d.ym?.toFixed(4) ?? '—'}</span></div>
        <div class="modal-row"><span class="modal-row-key">Desvio padrão</span><span class="modal-row-val">${d.stdev?.toFixed(4) ?? '—'}</span></div>
        <div class="modal-row"><span class="modal-row-key">CV</span><span class="modal-row-val">${d.cv?.toFixed(1) ?? '—'}%</span></div>
        <div class="modal-row"><span class="modal-row-key">Tendência/período</span><span class="modal-row-val" style="color:${(d.b1 || 0) >= 0 ? 'var(--y)' : 'var(--acc)'}">${d.b1?.toFixed(4) ?? '—'}</span></div>
        <div class="modal-row"><span class="modal-row-key">Cresc. médio</span><span class="modal-row-val">${d.avgGrowth?.toFixed(2) ?? '—'}%</span></div>
        <div class="modal-row"><span class="modal-row-key">Melhor período</span><span class="modal-row-val">${esc((d.labels || [])[d.maxIdx] || '—')} (${d.maxVal?.toFixed(2) ?? '—'})</span></div>
        <div class="modal-row"><span class="modal-row-key">Pior período</span><span class="modal-row-val">${esc((d.labels || [])[d.minIdx] || '—')} (${d.minVal?.toFixed(2) ?? '—'})</span></div>
      `;
    } else {
      const coefs = (d.beta || []).map((b, j) => {
        const name = j === 0 ? 'β₀ (Intercepto)' : `β${j} (${esc((d.varNames || [])[j - 1] || 'X' + j)})`;
        return `<div class="modal-row"><span class="modal-row-key">${name}</span><span class="modal-row-val">${fmt(b)}</span></div>`;
      }).join('');
      rows = `
        <div class="modal-row"><span class="modal-row-key">R²</span><span class="modal-row-val" style="color:var(--y)">${fmt(d.r2)}</span></div>
        <div class="modal-row"><span class="modal-row-key">R² Ajustado</span><span class="modal-row-val" style="color:var(--y)">${fmt(d.r2adj)}</span></div>
        <div class="modal-row"><span class="modal-row-key">Erro Padrão</span><span class="modal-row-val">${fmt(d.se)}</span></div>
        <div class="modal-row"><span class="modal-row-key">F-stat</span><span class="modal-row-val">${fmt(d.Fstat)}</span></div>
        <div class="modal-row"><span class="modal-row-key">p-valor F</span><span class="modal-row-val">${fmtP(d.pF)}</span></div>
        <div class="modal-row"><span class="modal-row-key">n / k</span><span class="modal-row-val">${d.n} obs / ${d.k} preditores</span></div>
        <div class="modal-row"><span class="modal-row-key">Y</span><span class="modal-row-val">${esc(d.labelY || 'Y')}</span></div>
        ${coefs}
      `;
    }

    const tipoLabel = isSimples ? 'Regressão Linear'
                    : isLogistica ? 'Regressão Logística'
                    : isPolinomial ? `Reg. Polinomial Grau ${d.degree ?? '?'}`
                    : a.tipo === 'serie' ? 'Série Temporal'
                    : 'Regressão Múltipla';

    document.getElementById('modal-content').innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">
        <div>
          <div class="modal-title">${esc(a.nome)}</div>
          <div class="modal-subtitle">${tipoLabel} • ${dataFormatada}</div>
        </div>
        <button class="btn-ghost" style="font-size:18px;padding:4px 10px;line-height:1" onclick="closeModal()">×</button>
      </div>
      <div class="modal-section">
        <div class="modal-section-title">Resultados</div>
        ${rows}
      </div>
      <div class="modal-actions">
        <button class="btn-primary" style="font-size:13px" onclick="editAnalysis('${a.id}');closeModal()">✏️ Editar dados</button>
        <button class="btn-ghost" style="font-size:13px;border-color:rgba(255,107,107,.3);color:var(--acc)" onclick="deleteAnalysis('${a.id}');closeModal()">🗑 Excluir</button>
        <button class="btn-ghost" style="font-size:13px" onclick="closeModal()">Fechar</button>
      </div>
    `;
    document.getElementById('modal-overlay').classList.add('open');
  } catch (err) {
    showToast('Erro ao carregar análise.', 'err');
  }
}

export function closeModal(e) {
  if (e && e.target !== document.getElementById('modal-overlay')) return;
  document.getElementById('modal-overlay').classList.remove('open');
}

export async function editAnalysis(id) {
  try {
    const analyses = await fetchAnalyses();
    const a = analyses.find(x => x.id === id);
    if (!a) throw new Error('Análise não encontrada.');

    if (a.tipo === 'simples')         await loadSimpleAnalysis(a);
    else if (a.tipo === 'multipla')   await loadMultipleAnalysis(a);
    else if (a.tipo === 'logistica')  await loadLogisticAnalysis(a);
    else if (a.tipo === 'polinomial') await loadPolynomialAnalysis(a);
    else if (a.tipo === 'serie')      await loadSerieAnalysis(a);
  } catch (err) {
    console.error('editAnalysis error:', err);
    showToast('Erro ao carregar análise.', 'err');
  }
}

export async function deleteAnalysis(id, refreshHistoryFn, updateProfileStatsFn) {
  if (!confirm('Excluir esta análise permanentemente?')) return;
  document.getElementById('modal-overlay').classList.remove('open');
  try {
    await deleteAnalysisRequest(id);

    const el = document.getElementById(`hitem-${id}`);
    if (el) el.remove();

    const list = document.getElementById('history-list');
    if (list && list.children.length === 0) {
      list.innerHTML = '<p style="color:var(--txt3);font-size:13px">Nenhuma análise salva ainda.</p>';
    }

    const badge = document.getElementById('hbadge');
    if (badge) {
      const count = parseInt(badge.textContent || '0') - 1;
      badge.textContent = count;
      if (count <= 0) badge.style.display = 'none';
    }

    showToast('Análise excluída.', 'ok');
    if (typeof updateProfileStatsFn === 'function') await updateProfileStatsFn();
  } catch (err) {
    console.error('deleteAnalysis error:', err);
    showToast('Erro ao excluir: ' + (err.message || err), 'err');
    if (typeof refreshHistoryFn === 'function') await refreshHistoryFn();
  }
}
