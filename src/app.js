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
  initRows, addRow, clearRows, setRows, getData, updateCount, loadExample,
  onDragOver, onDragLeave, onDrop, onFileSelect, importURL, confirmImport, cancelImport,
  updateImportStats,
} from './ui/forms.js';

import { viewAnalysis, closeModal, editAnalysis, deleteAnalysis as deleteAnalysisModal } from './ui/modals.js';
import { loadShareList, copyShareLink, copyShareText, previewShareCard, copyOverlayLink, copyOverlayText, closeShareOverlay, triggerLoadShared, openShareWithFriendModal, closeFriendPickOverlay, sendToFriend, loadReceivedShare, deleteReceivedShare } from './ui/share.js';
import { loadFriendsPanel, searchFriends, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, openChat, closeChat, sendMessage } from './ui/friends.js';
import { loadHistory, updateProfileStats } from './ui/tables.js';

import {
  runRegression, runPrediction, hideResults, setViewMode, saveAnalysis,
  exportExcel, exportCSV,
  mInitState, mAddVar, mRemoveVar, mAddRow, mClearRows, mUpdateCount, mLoadExample,
  runMultiple, runMultiplePrediction, mSaveAnalysis, mExportExcel, mExportCSV,
} from './regressions/linearRegression.js';

import {
  lgInitState, lgAddVar, lgRemoveVar, lgAddRow, lgClearRows, lgUpdateCount, lgLoadExample,
  runLogistic, runLogisticPrediction, lgSaveAnalysis, lgExportExcel, lgExportCSV,
} from './regressions/logisticRegression.js';

import {
  poSetDegree, poAutoSelectDegree, poInitRows, poAddRow, poClearRows, poUpdateCount, poLoadExample,
  runPolynomial, poRunPrediction, poSaveAnalysis, poExportExcel, poExportCSV,
} from './regressions/polynomialRegression.js';

import {
  stInitRows, stAddRow, stClearRows, stUpdateCount, stLoadExample,
  runSerie, stSaveAnalysis, stExportExcel, stExportCSV,
} from './regressions/timeSeries.js';

import {
  qrInitRows, qrAddRow, qrClearRows, qrUpdateCount, qrToggleChip, qrLoadExample,
  runQuantile, qrRunPrediction, qrSaveAnalysis, qrExportExcel, qrExportCSV,
} from './regressions/quantileRegression.js';

import {
  rrSetType, rrInitRows, rrAddRow, rrClearRows, rrUpdateCount, rrLoadExample,
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
  initRows, addRow, clearRows: clearRowsWrapper, setRows, getData, updateCount, loadExample,
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

  // Linear simples + múltipla
  runRegression, runPrediction, hideResults, setViewMode, saveAnalysis,
  exportExcel, exportCSV,
  mInitState, mAddVar, mRemoveVar, mAddRow, mClearRows, mUpdateCount, mLoadExample,
  runMultiple, runMultiplePrediction, mSaveAnalysis, mExportExcel, mExportCSV,

  // Logística
  lgInitState, lgAddVar, lgRemoveVar, lgAddRow, lgClearRows, lgUpdateCount, lgLoadExample,
  runLogistic, runLogisticPrediction, lgSaveAnalysis, lgExportExcel, lgExportCSV,

  // Polinomial
  poSetDegree, poAutoSelectDegree, poInitRows, poAddRow, poClearRows, poUpdateCount, poLoadExample,
  runPolynomial, poRunPrediction, poSaveAnalysis, poExportExcel, poExportCSV,

  // Séries temporais
  stInitRows, stAddRow, stClearRows, stUpdateCount, stLoadExample,
  runSerie, stSaveAnalysis, stExportExcel, stExportCSV,

  // Quantílica
  qrInitRows, qrAddRow, qrClearRows, qrUpdateCount, qrToggleChip, qrLoadExample,
  runQuantile, qrRunPrediction, qrSaveAnalysis, qrExportExcel, qrExportCSV,

  // Regularizada
  rrSetType, rrInitRows, rrAddRow, rrClearRows, rrUpdateCount, rrLoadExample,
  runRegularized, rrSaveAnalysis, rrExportExcel, rrExportCSV,
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
  tryRestoreSession();
});
