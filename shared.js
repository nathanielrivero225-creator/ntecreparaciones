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

function rangoDia(y, m, d) {
  const pad = n => String(n).padStart(2, '0');
  const ini = new Date(y, m, d);
  const fin = new Date(y, m, d + 1);
  return {
    desde: ini.getFullYear() + '-' + pad(ini.getMonth() + 1) + '-' + pad(ini.getDate()) + 'T00:00:00',
    hasta: fin.getFullYear() + '-' + pad(fin.getMonth() + 1) + '-' + pad(fin.getDate()) + 'T00:00:00',
  };
}

async function supaEliminar(opts) {
  let url = SUPA_URL + '/rest/v1/presupuestos?';
  if (opts.id != null) {
    url += 'id=eq.' + encodeURIComponent(opts.id);
  } else if (opts.fp) {
    const f = opts.fp;
    url += 'ns=eq.' + encodeURIComponent(opts.ns)
      + '&equipo=eq.' + encodeURIComponent(f.equipo || '')
      + '&cliente=' + (f.cliente ? 'eq.' + encodeURIComponent(f.cliente) : 'is.null')
      + '&total=eq.' + Math.round(num(f.total))
      + '&creado_en=gte.' + encodeURIComponent(f.desde)
      + '&creado_en=lt.' + encodeURIComponent(f.hasta);
  } else return { ok: false, affected: 0 };
  try {
    const r = await fetch(url, {
      method: 'DELETE',
      headers: { 'apikey': SUPA_KEY, Prefer: 'return=count' },
    });
    if (!r.ok) return { ok: false, affected: 0 };
    const cr = r.headers.get('content-range') || '';
    const m = cr.match(/\/(\d+)$/);
    const affected = m ? parseInt(m[1], 10) : -1;
    return { ok: true, affected };
  } catch (e) {
    return { ok: false, affected: 0 };
  }
}

async function supaPatch(id, body) {
  try {
    const r = await fetch(SUPA_URL + '/rest/v1/presupuestos?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: { 'apikey': SUPA_KEY, 'Content-Type': 'application/json', Prefer: 'return=count' },
      body: JSON.stringify(body),
    });
    if (!r.ok) return { ok: false, affected: 0 };
    const cr = r.headers.get('content-range') || '';
    const m = cr.match(/\/(\d+)$/);
    const affected = m ? parseInt(m[1], 10) : -1;
    return { ok: true, affected };
  } catch (e) {
    return { ok: false, affected: 0 };
  }
}
