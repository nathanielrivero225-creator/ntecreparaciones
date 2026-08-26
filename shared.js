const SUPA_URL = 'https://vkfgweehpvyotqeplsie.supabase.co';
const SUPA_KEY = 'sb_publishable_pprhcX5Pl9fWQkNIOaSDzQ_Ql7ySzzv';
const SUPA_LIMIT = 500;

const _SVG = {
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  calculator: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/>',
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  phone: '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
  laptop: '<rect x="3" y="4" width="18" height="12" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/>',
  lightbulb: '<line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  arrowLeft: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
};

const _navItems = [
  { id: 'index',   label: 'Calculadora', href: 'index.html',                  icon: 'calculator' },
  { id: 'dashboard', label: 'Dashboard', href: 'dashboard.html',              icon: 'dashboard' },
  { id: 'ideas',   label: 'Ideas', href: 'ideas-posts.html',                 icon: 'lightbulb' },
  { id: 'estrategia', label: 'Estrategia', href: 'ntecreparaciones_estrategia_completa.html', icon: 'calendar' },
];

function renderNav(current) {
  const links = _navItems.map(n => {
    const active = n.id === current ? ' active' : '';
    return `<a class="ntec-nav-link${active}" href="${n.href}"><svg viewBox="0 0 24 24">${_SVG[n.icon]}</svg><span>${n.label}</span></a>`;
  }).join('');
  return `<nav class="ntec-nav"><div class="ntec-nav-inner">
    <a class="ntec-nav-brand" href="index.html"><svg viewBox="0 0 24 24">${_SVG.wrench}</svg><span>Ntec<em>.</em></span></a>
    <div class="ntec-nav-links">${links}</div>
  </div></nav>`;
}

function renderBackLink() {
  return `<a class="ntec-back" href="index.html"><svg viewBox="0 0 24 24">${_SVG.arrowLeft}</svg> Volver a Calculadora</a>`;
}

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
