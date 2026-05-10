// Entrypoint da aplicação modularizada.
// Importa todos os módulos e expõe as funções no objeto `window` para preservar
// compatibilidade com os handlers `onclick=` inline do HTML.

import {
  showAuthTab, togglePw, updatePwStrength,
  doLogin, doSignup, doForgot, doDemo,
  doLogout, deleteAccount, saveProfile, changePw,
  tryRestoreSession, switchTab, goProfile,
  verifySignupCode, resendSignupCode, backToSignupForm,
} from './ui/dashboard.js';

import { showToast } from './ui/notifications.js';

import {
  initRows, addRow, addRowTop, clearRows, setRows, getData, updateCount, loadExample,
  onDragOver, onDragLeave, onDrop, onFileSelect, importURL, confirmImport, cancelImport,
  updateImportStats,
} from './ui/forms.js';

import { viewAnalysis, closeModal, editAnalysis, deleteAnalysis as deleteAnalysisModal } from './ui/modals.js';
import { loadShareList, copyShareLink, copyShareText, previewShareCard, copyOverlayLink, copyOverlayText, closeShareOverlay, triggerLoadShared, openShareWithFriendModal, closeFriendPickOverlay, sendToFriend, loadReceivedShare, deleteReceivedShare } from './ui/share.js';
import { loadFriendsPanel, searchFriends, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, openChat, closeChat, sendMessage } from './ui/friends.js';
import { loadHistory, updateProfileStats } from './ui/tables.js';
import { yfSearchInput, yfAddTicker, yfRemoveTicker, yfLoadAll, yfSwitchView, yfToggleNormalize, yfImportOne, yfOnModelChange } from './ui/yahooFinance.js';

import {
  runRegression, runPrediction, hideResults, setViewMode, saveAnalysis,
  exportExcel, exportCSV,
  mInitState, mAddVar, mRemoveVar, mAddRow, mAddRowTop, mClearRows, mUpdateCount, mLoadExample,
  runMultiple, runMultiplePrediction, mSaveAnalysis, mExportExcel, mExportCSV,
} from './regressions/linearRegression.js';

import {
  lgInitState, lgAddVar, lgRemoveVar, lgAddRow, lgAddRowTop, lgClearRows, lgUpdateCount, lgLoadExample,
  runLogistic, runLogisticPrediction, lgSaveAnalysis, lgExportExcel, lgExportCSV,
} from './regressions/logisticRegression.js';

import {
  poSetDegree, poAutoSelectDegree, poInitRows, poAddRow, poAddRowTop, poClearRows, poUpdateCount, poLoadExample,
  runPolynomial, poRunPrediction, poSaveAnalysis, poExportExcel, poExportCSV,
} from './regressions/polynomialRegression.js';

import {
  stInitRows, stAddRow, stAddRowTop, stClearRows, stUpdateCount, stLoadExample, stSetModel,
  runSerie, stSaveAnalysis, stExportExcel, stExportCSV,
  varInitRows, varAddRow, varAddRowTop, varClearRows, varAddVariable, varRemoveVariable,
  varUpdateName, varUpdateVarCountDisplay, varLoadExample,
} from './regressions/timeSeries.js';

import {
  qrInitRows, qrAddRow, qrAddRowTop, qrClearRows, qrUpdateCount, qrToggleChip, qrLoadExample,
  runQuantile, qrRunPrediction, qrSaveAnalysis, qrExportExcel, qrExportCSV,
} from './regressions/quantileRegression.js';

import {
  rrSetType, rrInitRows, rrAddRow, rrAddRowTop, rrClearRows, rrUpdateCount, rrLoadExample,
  runRegularized, rrSaveAnalysis, rrExportExcel, rrExportCSV,
} from './regressions/regularizedRegression.js';

// ── Wrapper para deleteAnalysis preservando assinatura do HTML inline ──
async function deleteAnalysis(id) {
  return deleteAnalysisModal(id, loadHistory, updateProfileStats);
}

// ── Theme toggle ──
function toggleTheme() {
  const isLight = document.documentElement.classList.toggle('light');
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = isLight ? '☀' : '🌙';
  localStorage.setItem('slope-theme', isLight ? 'light' : 'dark');
}

function confirmImportWrapper() {
  return confirmImport(switchTab);
}

function clearRowsWrapper() {
  return clearRows(hideResults);
}

// ── Exposição global para handlers inline `onclick=` ──
Object.assign(window, {
  // Auth / dashboard
  showAuthTab, togglePw, updatePwStrength,
  doLogin, doSignup, doForgot, doDemo,
  doLogout, deleteAccount, saveProfile, changePw,
  switchTab, goProfile,
  verifySignupCode, resendSignupCode, backToSignupForm,
  showToast, toggleTheme,

  // Linear simples — formulário e import
  initRows, addRow, addRowTop, clearRows: clearRowsWrapper, setRows, getData, updateCount, loadExample,
  onDragOver, onDragLeave, onDrop, onFileSelect, importURL,
  confirmImport: confirmImportWrapper, cancelImport, updateImportStats,

  // Modal/histórico
  viewAnalysis, closeModal, editAnalysis, deleteAnalysis,
  loadHistory, updateProfileStats,

  // Compartilhar
  loadShareList, copyShareLink, copyShareText, previewShareCard,
  copyOverlayLink, copyOverlayText, closeShareOverlay, triggerLoadShared,
  openShareWithFriendModal, closeFriendPickOverlay, sendToFriend, loadReceivedShare, deleteReceivedShare,

  // Amigos
  loadFriendsPanel, searchFriends, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend,

  // Chat
  openChat, closeChat, sendMessage,

  // Yahoo Finance
  yfSearchInput, yfAddTicker, yfRemoveTicker, yfLoadAll, yfSwitchView, yfToggleNormalize,
  yfOnModelChange,
  yfImportOne: sym => yfImportOne(sym, switchTab),

  // Linear simples + múltipla
  runRegression, runPrediction, hideResults, setViewMode, saveAnalysis,
  exportExcel, exportCSV,
  mInitState, mAddVar, mRemoveVar, mAddRow, mAddRowTop, mClearRows, mUpdateCount, mLoadExample,
  runMultiple, runMultiplePrediction, mSaveAnalysis, mExportExcel, mExportCSV,

  // Logística
  lgInitState, lgAddVar, lgRemoveVar, lgAddRow, lgAddRowTop, lgClearRows, lgUpdateCount, lgLoadExample,
  runLogistic, runLogisticPrediction, lgSaveAnalysis, lgExportExcel, lgExportCSV,

  // Polinomial
  poSetDegree, poAutoSelectDegree, poInitRows, poAddRow, poAddRowTop, poClearRows, poUpdateCount, poLoadExample,
  runPolynomial, poRunPrediction, poSaveAnalysis, poExportExcel, poExportCSV,

  // Séries temporais
  stInitRows, stAddRow, stAddRowTop, stClearRows, stUpdateCount, stLoadExample, stSetModel,
  runSerie, stSaveAnalysis, stExportExcel, stExportCSV,
  varInitRows, varAddRow, varAddRowTop, varClearRows, varAddVariable, varRemoveVariable,
  varUpdateName, varUpdateVarCountDisplay, varLoadExample,

  // Quantílica
  qrInitRows, qrAddRow, qrAddRowTop, qrClearRows, qrUpdateCount, qrToggleChip, qrLoadExample,
  runQuantile, qrRunPrediction, qrSaveAnalysis, qrExportExcel, qrExportCSV,

  // Regularizada
  rrSetType, rrInitRows, rrAddRow, rrAddRowTop, rrClearRows, rrUpdateCount, rrLoadExample,
  runRegularized, rrSaveAnalysis, rrExportExcel, rrExportCSV,
});

// ── Navegação por teclado em todas as tabelas de dados ──────────────────────
// Cobre todos os módulos via delegação: inputs com classe .data-input.
// ↑/↓/Enter → linha anterior/próxima (mesma coluna)
// ←/→       → coluna anterior/próxima (em texto, só na borda do cursor)
document.addEventListener('keydown', e => {
  const inp = e.target;
  if (inp.tagName !== 'INPUT' || !inp.classList.contains('data-input')) return;
  if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) return;

  // ← / → em inputs de texto: navega só quando cursor está na borda
  if (inp.type === 'text') {
    if (e.key === 'ArrowLeft'  && (inp.selectionStart ?? 0) !== 0) return;
    if (e.key === 'ArrowRight' && (inp.selectionStart ?? 0) !== inp.value.length) return;
  }

  const row       = inp.parentElement;
  const container = row?.parentElement;
  if (!row || !container) return;

  const rows    = Array.from(container.children);
  const rowIdx  = rows.indexOf(row);
  const inputs  = Array.from(row.querySelectorAll('input.data-input'));
  const colIdx  = inputs.indexOf(inp);

  let target = null;

  if (e.key === 'ArrowUp') {
    const prev = rows[rowIdx - 1];
    if (prev) {
      const pi = prev.querySelectorAll('input.data-input');
      target = pi[Math.min(colIdx, pi.length - 1)] ?? null;
    }
  } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
    const next = rows[rowIdx + 1];
    if (next) {
      const ni = next.querySelectorAll('input.data-input');
      target = ni[Math.min(colIdx, ni.length - 1)] ?? null;
    }
  } else if (e.key === 'ArrowLeft') {
    target = inputs[colIdx - 1] ?? null;
  } else if (e.key === 'ArrowRight') {
    target = inputs[colIdx + 1] ?? null;
  }

  if (target) {
    e.preventDefault();
    target.focus();
    target.select();
  }
});

// ── Storage sync entre abas (mantém histórico atualizado quando outra aba grava) ──
window.addEventListener('storage', async () => {
  try { await loadHistory(); } catch (e) { /* ignore */ }
  try { await updateProfileStats(); } catch (e) { /* ignore */ }
});

// ── Bootstrap ──
document.addEventListener('DOMContentLoaded', () => {
  // Restore saved theme
  if (localStorage.getItem('slope-theme') === 'light') {
    document.documentElement.classList.add('light');
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = '☀';
  }
  mInitState();
  lgInitState();
  poInitRows();
  qrInitRows();
  rrInitRows();
  varInitRows();
  tryRestoreSession();
});
