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

// ── Contact / WhatsApp config ───────────────────────────────
// 👉 غيّر هذا الرقم إلى رقم واتساب شركتك (بالصيغة الدولية بدون + أو 00)
const WHATSAPP_NUMBER = '970599000000';
const WHATSAPP_MSG = 'مرحباً Skyline، أرغب بالاستفسار عن خدمات الهجرة وفرص العمل.';

function injectWhatsApp() {
  if (location.pathname.includes('admin')) return; // not on admin panel
  const a = document.createElement('a');
  a.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`;
  a.target = '_blank';
  a.rel = 'noopener';
  a.className = 'wa-float';
  a.setAttribute('aria-label', 'WhatsApp');
  a.innerHTML = `<svg viewBox="0 0 32 32" width="30" height="30" fill="currentColor"><path d="M16 .5C7.4.5.4 7.5.4 16.1c0 2.8.7 5.5 2.1 7.9L.3 31.7l7.9-2.1c2.3 1.3 4.9 1.9 7.6 1.9h.1c8.6 0 15.6-7 15.6-15.6C31.6 7.5 24.6.5 16 .5zm0 28.5h-.1c-2.4 0-4.7-.6-6.7-1.8l-.5-.3-4.7 1.2 1.3-4.6-.3-.5c-1.3-2.1-2-4.5-2-7 0-7.2 5.9-13 13.1-13 3.5 0 6.8 1.4 9.2 3.8 2.5 2.5 3.8 5.7 3.8 9.2.1 7.2-5.8 13-12.9 13zm7.1-9.7c-.4-.2-2.3-1.1-2.6-1.3-.4-.1-.6-.2-.9.2-.3.4-1 1.3-1.2 1.5-.2.2-.4.3-.8.1-.4-.2-1.6-.6-3.1-1.9-1.1-1-1.9-2.3-2.2-2.7-.2-.4 0-.6.2-.8.2-.2.4-.4.5-.7.2-.2.2-.4.4-.6.1-.3 0-.5 0-.7-.1-.2-.9-2.1-1.2-2.9-.3-.8-.6-.7-.9-.7h-.7c-.2 0-.6.1-1 .5-.3.4-1.3 1.3-1.3 3.1s1.3 3.6 1.5 3.9c.2.3 2.6 4 6.3 5.6.9.4 1.6.6 2.1.8.9.3 1.7.2 2.3.1.7-.1 2.3-.9 2.6-1.8.3-.9.3-1.7.2-1.8-.1-.2-.3-.3-.7-.5z"/></svg>`;
  document.body.appendChild(a);
}

// ── Auth state in nav ──
async function loadNavUser() {
  const actions = el('#navActions');
  if (!actions) return;
  try {
    const { user } = await api('/auth/me');
    const admin = user.role === 'admin'
      ? `<a class="btn btn-ghost" href="/admin.html" data-i18n="nav_admin">لوحة التحكم</a>` : '';
    actions.innerHTML = `
      ${admin}
      <a class="btn btn-ghost" href="/account.html" data-i18n="nav_account">حسابي</a>
      <button class="btn btn-navy" id="logoutBtn" data-i18n="nav_logout">خروج</button>`;
    el('#logoutBtn').onclick = async () => {
      await api('/auth/logout', { method: 'POST' });
      location.href = '/';
    };
  } catch {
    actions.innerHTML = `
      <a class="btn btn-ghost" href="/account.html" data-i18n="nav_login">دخول</a>
      <a class="btn btn-gold" href="/account.html#register" data-i18n="nav_start">ابدأ الآن</a>`;
  }
  applyLang(currentLang(), actions);
}

// ── i18n (Arabic / English) ─────────────────────────────────
const I18N = {
  nav_home: ['الرئيسية', 'Home'],
  nav_services: ['الخدمات', 'Services'],
  nav_jobs: ['الوظائف الدولية', 'Jobs'],
  nav_countries: ['أدلّة الدول', 'Country Guides'],
  nav_apply: ['تقديم طلب', 'Apply'],
  nav_assess: ['تقييم الأهلية', 'Eligibility'],
  offices_eyebrow: ['حضورنا الدولي', 'Global Presence'],
  offices_title: ['مكاتبنا حول العالم', 'Our offices worldwide'],
  nav_process: ['كيف نعمل', 'How it works'],
  nav_contact: ['تواصل معنا', 'Contact'],
  nav_account: ['حسابي', 'My Account'],
  nav_admin: ['لوحة التحكم', 'Admin'],
  nav_login: ['دخول', 'Login'],
  nav_logout: ['خروج', 'Logout'],
  nav_start: ['ابدأ الآن', 'Get Started'],
  hero_badge: ['✦ شريكك الموثوق منذ التأسيس · أكثر من 30 دولة', '✦ Your trusted partner · 30+ countries'],
  hero_title: ['طريقك نحو <span class="gold-text">مستقبل عالمي</span><br />يبدأ مع سكايلاين <span class="cursor">_</span>', 'Your path to a <span class="gold-text">global future</span><br />starts with Skyline <span class="cursor">_</span>'],
  hero_lead: ['نحوّل حلم الهجرة وتأمين فرصة العمل إلى واقع. استشارات قانونية معتمدة، تأشيرات عمل ودراسة، ووظائف دولية برعاية كاملة للتأشيرة — كل ذلك تحت سقف واحد.',
    'We turn your migration and career dreams into reality: certified legal advice, work & study visas, and international jobs with full visa sponsorship — all under one roof.'],
  hero_cta1: ['احجز استشارتك الآن', 'Book a consultation'],
  hero_cta2: ['تصفّح الوظائف الدولية', 'Browse international jobs'],
  stat1: ['عميل تمّت خدمته', 'Clients served'],
  stat2: ['دولة وجهة', 'Destination countries'],
  stat3: ['نسبة نجاح الملفات', 'Case success rate'],
  stat4: ['سنة خبرة', 'Years of experience'],
  services_eyebrow: ['خدماتنا', 'Our Services'],
  services_title: ['حلول هجرة متكاملة مصمّمة لك', 'Complete immigration solutions, built for you'],
  services_sub: ['اختر الخدمة التي تناسب هدفك، وادفع بأمان عبر بوابة دفع عالمية. فريقنا يتولّى الباقي.',
    'Pick the service that fits your goal and pay securely via a global gateway. We handle the rest.'],
  services_all: ['عرض كل الخدمات والأسعار', 'View all services & pricing'],
  why_eyebrow: ['لماذا سكايلاين', 'Why Skyline'],
  why_title: ['لأنّ مستقبلك يستحق خبراء حقيقيين', 'Because your future deserves real experts'],
  process_eyebrow: ['آلية العمل', 'How it works'],
  process_title: ['أربع خطوات تفصلك عن وجهتك', 'Four steps to your destination'],
  trust_lead: ['معتمدون وموثوقون عالمياً', 'Globally accredited & trusted'],
  testi_eyebrow: ['قصص نجاح', 'Success Stories'],
  testi_title: ['عملاء وصلوا إلى وجهتهم', 'Clients who reached their destination'],
  faq_eyebrow: ['الأسئلة الشائعة', 'FAQ'],
  faq_title: ['كل ما تريد معرفته', 'Everything you need to know'],
  contact_eyebrow: ['تواصل معنا', 'Contact us'],
  contact_title: ['جاهزون للإجابة على كل أسئلتك', 'Ready to answer all your questions'],
  contact_sub: ['أرسل رسالتك وسيتواصل معك أحد مستشارينا خلال 24 ساعة. أو احجز استشارة مدفوعة للبدء فوراً.',
    'Send a message and an advisor will reach out within 24 hours. Or book a paid consultation to start now.'],
  form_name: ['الاسم الكامل', 'Full name'],
  form_email: ['البريد الإلكتروني', 'Email'],
  form_subject: ['الموضوع', 'Subject'],
  form_message: ['رسالتك', 'Your message'],
  form_send: ['إرسال الرسالة', 'Send message'],
  cta_lang: ['EN', 'ع'],
};

function currentLang() { return localStorage.getItem('sky_lang') || 'ar'; }

function applyLang(lang, root = document) {
  const i = lang === 'en' ? 1 : 0;
  root.querySelectorAll('[data-i18n]').forEach(node => {
    const t = I18N[node.dataset.i18n];
    if (t && t[i] != null) node.textContent = t[i];
  });
  root.querySelectorAll('[data-i18n-rich]').forEach(node => {
    const t = I18N[node.dataset.i18nRich];
    if (t && t[i] != null) node.innerHTML = t[i];
  });
  root.querySelectorAll('[data-i18n-ph]').forEach(node => {
    const t = I18N[node.dataset.i18nPh];
    if (t && t[i] != null) node.placeholder = t[i];
  });
  if (root === document) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
    const btn = el('#langToggle');
    if (btn) btn.textContent = I18N.cta_lang[i];
  }
}

function initLang() {
  applyLang(currentLang());
  const btn = el('#langToggle');
  if (btn) btn.onclick = () => {
    const next = currentLang() === 'ar' ? 'en' : 'ar';
    localStorage.setItem('sky_lang', next);
    applyLang(next);
  };
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

// ── Inject professional SVG icons into [data-icon] elements ──
function initIcons() {
  if (typeof window.ICON === 'function') {
    els('[data-icon]').forEach(n => {
      n.innerHTML = window.ICON(n.dataset.icon, +(n.dataset.iconSize) || 24);
    });
  }
  if (typeof window.FLAG === 'function') {
    els('[data-flag]').forEach(n => {
      n.innerHTML = window.FLAG(n.dataset.flag, +(n.dataset.flagSize) || 40);
    });
  }
}

// ── FAQ accordion ──
function initFaq() {
  els('.faq-q').forEach(q => q.onclick = () => q.parentElement.classList.toggle('open'));
}

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initReveal();
  initCounters();
  initFaq();
  initIcons();
  injectWhatsApp();
  loadNavUser();
  initLang();
});
