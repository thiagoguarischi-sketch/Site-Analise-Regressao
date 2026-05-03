// Toasts e indicador de salvamento na nuvem.

export function showToast(msg, type = 'ok') {
  const t = document.getElementById('toast');
  const icon = document.getElementById('toast-icon');
  document.getElementById('toast-msg').textContent = msg;
  t.className = 'show ' + type;
  icon.textContent = type === 'ok' ? '✓' : type === 'err' ? '✗' : 'ℹ';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

export function showCloudSaving(show) {
  const el = document.getElementById('cloud-saving');
  if (el) el.style.display = show ? 'flex' : 'none';
}
