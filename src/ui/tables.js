// Listagem do histórico e estatísticas do perfil — leitura via BFF.

import { fetchAnalyses } from '../services/analysisService.js';
import { apiRequest } from '../services/supabaseService.js';
import { esc, fmt, fmtDate } from '../core/utils.js';

export async function loadHistory() {
  const historyContainer = document.getElementById('history-list');
  if (!historyContainer) return;

  historyContainer.innerHTML = `<p style="color:var(--txt3);font-size:13px">${window.t('hist-loading')}</p>`;

  try {
    const analyses = await fetchAnalyses();

    if (!analyses || analyses.length === 0) {
      historyContainer.innerHTML = `<p style="color:var(--txt3);font-size:13px">${window.t('hist-empty')}</p>`;
      return;
    }

    const badge = document.getElementById('hbadge');
    if (badge) { badge.textContent = analyses.length; badge.style.display = 'inline'; }

    historyContainer.innerHTML = '';

    analyses.forEach(a => {
      const lang = localStorage.getItem('slope-lang') || 'pt';
      const locale = lang === 'pt' ? 'pt-BR' : 'en-US';
      const dataFormatada = new Date(a.created_at).toLocaleString(locale);
      const isSimples = a.tipo === 'simples';
      const isLogistica = a.tipo === 'logistica';
      const isPolinomial = a.tipo === 'polinomial';
      const isSerie = a.tipo === 'serie';
      const isQuantilica = a.tipo === 'quantilica';
      const isRegularizada = a.tipo === 'regularizada';

      const serieModelo = isSerie ? (a.dados?.modelo ?? 'classic') : null;

      const r2Val = isSimples
        ? (a.dados?.r2?.toFixed(3) ?? '—')
        : isLogistica
          ? (a.dados?.mcFaddenR2?.toFixed(3) ?? '—')
          : isSerie
            ? (serieModelo === 'var' || serieModelo === 'arima' || serieModelo === 'garch'
                ? (a.dados?.aic?.toFixed(2) ?? '—')
                : ((a.dados?.cv?.toFixed(1) ?? '—') + '%'))
            : isQuantilica
              ? (a.dados?.pinballLosses?.['0.5'] ?? a.dados?.pinballLosses?.[0.5])?.toFixed(4) ?? '—'
              : isRegularizada
                ? (a.dados?.ridge?.r2?.toFixed(3) ?? '—')
                : (a.dados?.r2adj?.toFixed(3) ?? '—');

      const r2Label = isSimples ? 'R²'
                    : isLogistica ? 'R²McF'
                    : isSerie
                      ? (serieModelo === 'var' || serieModelo === 'arima' || serieModelo === 'garch' ? 'AIC' : 'CV')
                    : isQuantilica ? 'PB(0.5)'
                    : isRegularizada ? 'R²(Ridge)'
                    : 'R² adj';

      const badgeClass = isSimples ? 'history-badge-simples'
                       : isLogistica ? 'history-badge-logistica'
                       : isPolinomial ? 'history-badge-polinomial'
                       : isSerie ? 'history-badge-serie'
                       : isQuantilica ? 'history-badge-quantilica'
                       : isRegularizada ? 'history-badge-regularizada'
                       : 'history-badge-multipla';

      const tipoLabel = isSimples ? window.t('hist-tipo-simples')
                      : isLogistica ? window.t('hist-tipo-logistica')
                      : isPolinomial ? `${window.t('hist-tipo-polinomial')} ${a.dados?.degree ?? '?'}`
                      : isSerie
                        ? (serieModelo === 'var'
                            ? `VAR(${a.dados?.p ?? '?'}) – ${a.dados?.k ?? '?'} var.`
                            : serieModelo === 'arima'
                              ? `ARIMA(${a.dados?.p ?? '?'},${a.dados?.d ?? '?'},${a.dados?.q ?? '?'})`
                              : serieModelo === 'garch'
                                ? 'GARCH(1,1)'
                                : window.t('hist-tipo-serie'))
                      : isQuantilica ? window.t('hist-tipo-quantilica')
                      : isRegularizada ? `${window.t('hist-tipo-regularizada')} (λ=${a.dados?.lambda ?? '?'})`
                      : window.t('hist-tipo-multipla');

      const card = document.createElement('div');
      card.className = 'history-item';
      card.id = `hitem-${a.id}`;
      card.innerHTML = `
        <span class="history-badge ${badgeClass}">${tipoLabel}</span>
        <div class="history-title">${esc(a.nome)}</div>
        <div class="history-desc">${r2Label} = <b style="color:var(--y)">${r2Val}</b> &nbsp;•&nbsp; n = ${a.dados?.n ?? '—'}</div>
        <div class="history-date">${window.t('hist-saved-on')} ${dataFormatada}</div>
        <div class="history-actions">
          <button class="btn-primary" style="font-size:12px;padding:6px 14px" onclick="viewAnalysis('${a.id}')">🔍 ${window.t('hist-btn-view')}</button>
          <button class="btn-ghost" style="font-size:12px;padding:6px 14px" onclick="editAnalysis('${a.id}')">✏️ ${window.t('hist-btn-edit')}</button>
          <button class="btn-ghost" style="font-size:12px;padding:6px 14px;border-color:rgba(255,107,107,.3);color:var(--acc)" onclick="deleteAnalysis('${a.id}')">🗑 ${window.t('hist-btn-delete')}</button>
        </div>
      `;
      historyContainer.appendChild(card);
    });
  } catch (err) {
    console.error('Erro ao carregar histórico:', err);
    historyContainer.innerHTML = `<p style="color:var(--acc);font-size:13px">${window.t('hist-error')}</p>`;
  }
}

export async function updateProfileStats() {
  try {
    const { analyses: list } = await apiRequest('/analyses').catch(() => ({ analyses: [] }));
    document.getElementById('stat-total').textContent = list.length;
    if (list.length) {
      const r2s = list.map(a => a.tipo === 'simples' ? (a.dados?.r2 ?? 0) : (a.dados?.r2adj ?? 0));
      document.getElementById('stat-r2').textContent = fmt(Math.max(...r2s));
      document.getElementById('stat-last').textContent = fmtDate(list[0].created_at);
    } else {
      document.getElementById('stat-r2').textContent = '—';
      document.getElementById('stat-last').textContent = '—';
    }
  } catch (e) {
    console.warn('updateProfileStats error:', e);
  }
}
