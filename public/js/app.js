// ── Shared helpers ──────────────────────────────────────────
const api = async (path, opts = {}) => {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  let data = null;
  try { data = await res.json(); } catch { /* no body */ }
  if (!res.ok) throw new Error((data && data.error) || 'حدث خطأ غير متوقع');
  return data;
};

const money = (cents, currency = 'usd') => {
  const map = { usd: '$', eur: '€', gbp: '£', aed: 'AED ', sar: 'SAR ', cad: 'C$' };
  const sym = map[currency.toLowerCase()] || (currency.toUpperCase() + ' ');
  return sym + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

const el = (sel) => document.querySelector(sel);
const els = (sel) => Array.from(document.querySelectorAll(sel));

function showAlert(node, msg, type = 'err') {
  if (!node) return;
  node.textContent = msg;
  node.className = `alert show ${type}`;
}

// ── Auth state in nav ──
async function loadNavUser() {
  const actions = el('#navActions');
  if (!actions) return;
  try {
    const { user } = await api('/auth/me');
    const admin = user.role === 'admin'
      ? `<a class="btn btn-ghost" href="/admin.html">لوحة التحكم</a>` : '';
    actions.innerHTML = `
      ${admin}
      <a class="btn btn-ghost" href="/account.html">حسابي</a>
      <button class="btn btn-navy" id="logoutBtn">خروج</button>`;
    el('#logoutBtn').onclick = async () => {
      await api('/auth/logout', { method: 'POST' });
      location.href = '/';
    };
  } catch {
    actions.innerHTML = `
      <a class="btn btn-ghost" href="/account.html">دخول</a>
      <a class="btn btn-gold" href="/account.html#register">ابدأ الآن</a>`;
  }
}

// ── Mobile menu ──
function initMenu() {
  const t = el('#menuToggle'), l = el('#navLinks');
  if (t && l) t.onclick = () => l.classList.toggle('open');
}

// ── Scroll reveal ──
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els('.reveal').forEach(n => obs.observe(n));
}

// ── Count-up for stats ──
function initCounters() {
  els('[data-count]').forEach(node => {
    const target = +node.dataset.count;
    const suffix = node.dataset.suffix || '';
    let done = false;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !done) {
        done = true;
        const dur = 1400, start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          node.textContent = Math.floor(p * target).toLocaleString('en-US') + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(node);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initReveal();
  initCounters();
  loadNavUser();
});
