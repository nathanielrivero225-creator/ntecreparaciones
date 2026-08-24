const SUPA_URL = 'https://vkfgweehpvyotqeplsie.supabase.co';
const SUPA_KEY = 'sb_publishable_pprhcX5Pl9fWQkNIOaSDzQ_Ql7ySzzv';
const SUPA_LIMIT = 500;

const fmt = n => '$' + Math.round(n).toLocaleString('es-UY');
const num = v => { const n = parseFloat(v); return Number.isFinite(n) && n > 0 ? n : 0; };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

let _toastTimer;
function toast(msg, isErr) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.toggle('err', !!isErr);
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
