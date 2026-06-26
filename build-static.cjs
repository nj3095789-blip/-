// Build a static (server-less) copy of the site into /docs for GitHub Pages.
// Strategy: copy public -> docs, inject a fetch() shim that answers /api/*
// from embedded data, and rewrite root-absolute paths to relative so the
// site works under a project-pages subpath (https://user.github.io/<repo>/).
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'public');
const OUT = path.join(__dirname, 'docs');
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(SRC, OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

const SERVICES = [
  { id:1, icon:'globe', currency:'usd', price_cents:4900, title_ar:'استشارة هجرة مع خبير', summary_ar:'جلسة 60 دقيقة مع مستشار معتمد لتقييم ملفك ووضع خطة هجرة مخصصة.' },
  { id:2, icon:'briefcase', currency:'usd', price_cents:89900, title_ar:'تأشيرة العمالة الماهرة', summary_ar:'تجهيز كامل لملف الهجرة المهنية: معادلة الشهادات، السيرة الدولية، وتقديم الطلب.' },
  { id:3, icon:'maple', currency:'usd', price_cents:129900, title_ar:'الدخول السريع (كندا)', summary_ar:'إدارة شاملة لملف Express Entry وزيادة نقاط CRS وتقديم Profile.' },
  { id:4, icon:'handshake', currency:'usd', price_cents:59900, title_ar:'تأمين فرصة عمل دولية', summary_ar:'ربطك بأصحاب عمل معتمدين يرعون التأشيرة، مع تجهيز ومتابعة عقد العمل.' },
  { id:5, icon:'cap', currency:'usd', price_cents:39900, title_ar:'تأشيرة دراسة', summary_ar:'قبول جامعي، خطاب الدافع، وتجهيز ملف تأشيرة الطالب من الألف إلى الياء.' },
  { id:6, icon:'family', currency:'usd', price_cents:54900, title_ar:'لمّ الشمل العائلي', summary_ar:'تجهيز ملف لمّ الشمل وكفالة أفراد الأسرة وفق متطلبات الدولة المستهدفة.' },
];
const JOBS = [
  { id:1, title:'ممرض/ممرضة مسجّل', country:'Canada', city:'Toronto', category:'الرعاية الصحية', employment:'full-time', salary:'CAD 75,000 - 95,000 / سنة', description:'مستشفى رائد يبحث عن ممرضين مسجّلين مع رعاية كاملة لتأشيرة العمل والإقامة.', requirements:'بكالوريوس تمريض · خبرة سنتان · IELTS 6.5', visa_support:1 },
  { id:2, title:'مطوّر برمجيات Full-Stack', country:'Germany', city:'Berlin', category:'تقنية المعلومات', employment:'full-time', salary:'EUR 65,000 - 85,000 / سنة', description:'شركة تقنية تقدّم تأشيرة EU Blue Card لمطوّرين بخبرة في Node.js و React.', requirements:'3+ سنوات خبرة · إنجليزية بطلاقة · معرفة بالـ Cloud', visa_support:1 },
  { id:3, title:'فنّي لحام معتمد', country:'Australia', city:'Perth', category:'الصناعة والإنشاءات', employment:'full-time', salary:'AUD 80,000 - 100,000 / سنة', description:'مقاول إنشاءات كبير يرعى تأشيرة 482 لفنيي اللحام المهرة.', requirements:'شهادة مهنية · خبرة 3 سنوات · فحص طبي', visa_support:1 },
  { id:4, title:'طاهٍ تنفيذي', country:'UAE', city:'Dubai', category:'الضيافة والسياحة', employment:'full-time', salary:'AED 12,000 - 18,000 / شهر', description:'سلسلة فنادق فاخرة تبحث عن طاهٍ تنفيذي مع سكن وتذاكر وتأشيرة عمل.', requirements:'خبرة 5 سنوات · مطبخ عالمي · قيادة فريق', visa_support:1 },
  { id:5, title:'سائق شاحنة لمسافات طويلة', country:'Poland', city:'Warsaw', category:'النقل واللوجستيات', employment:'full-time', salary:'EUR 2,200 - 3,000 / شهر', description:'شركة لوجستيات أوروبية توفّر رخصة CE ودعم تأشيرة العمل والإقامة.', requirements:'رخصة قيادة دولية · سجل نظيف · استعداد للسفر', visa_support:1 },
  { id:6, title:'أخصائي تسويق رقمي', country:'Netherlands', city:'Amsterdam', category:'التسويق', employment:'full-time', salary:'EUR 48,000 - 62,000 / سنة', description:'وكالة تسويق نامية تقدّم تأشيرة الموظف عالي المهارة (Highly Skilled Migrant).', requirements:'خبرة 3 سنوات · SEO/SEM · إنجليزية ممتازة', visa_support:1 },
  { id:7, title:'عامل قطف وتعبئة زراعية', country:'New Zealand', city:'Hawke’s Bay', category:'الزراعة', employment:'seasonal', salary:'NZD 26 - 32 / ساعة', description:'مزرعة معتمدة ضمن برنامج RSE الموسمي مع سكن وتأشيرة عمل موسمية.', requirements:'لياقة بدنية جيدة · لا يلزم خبرة سابقة', visa_support:1 },
  { id:8, title:'محاسب قانوني', country:'Qatar', city:'Doha', category:'المالية والمحاسبة', employment:'full-time', salary:'QAR 14,000 - 20,000 / شهر', description:'مجموعة تجارية كبرى توظّف محاسباً قانونياً مع حزمة مزايا وتأشيرة عمل.', requirements:'CPA/ACCA · خبرة 4 سنوات · خبرة ERP', visa_support:1 },
];

const shim = `/* ===== STATIC DEMO SHIM (GitHub Pages — no backend) ===== */
window.SKY_STATIC = true;
const SKY_SERVICES = ${JSON.stringify(SERVICES)};
const SKY_JOBS = ${JSON.stringify(JOBS)};
function skyStatic(p, opts){
  const method = ((opts && opts.method) || 'GET').toUpperCase();
  let body = {}; try { if (opts && typeof opts.body === 'string') body = JSON.parse(opts.body); } catch(e){}
  const q = p.split('?')[0];
  if (q === '/services') return { services: SKY_SERVICES };
  if (q === '/jobs') {
    const countries = [...new Set(SKY_JOBS.map(j => j.country))];
    const categories = [...new Set(SKY_JOBS.map(j => j.category))];
    return { jobs: SKY_JOBS, countries, categories };
  }
  if (q === '/payments/config') return { enabled:false, live:false, mode:'demo', publishableKey:'', currency:'usd' };
  if (q === '/payments/checkout') return { mode:'demo', url:'payment-demo.html?pid=0&amount=0&currency=usd&title=' + encodeURIComponent('خدمة Skyline') };
  if (q === '/payments/demo/confirm') return { ok:true, reference:'PAY-DEMO' };
  if (q === '/auth/me') { const u = localStorage.getItem('sky_demo_user'); if (u) return JSON.parse(u); throw new Error('guest'); }
  if (q === '/auth/login' || q === '/auth/register') { const r = { user:{ id:1, full_name: body.full_name || 'زائر', email: body.email || 'guest@demo', phone: body.phone || '', role:'user' } }; localStorage.setItem('sky_demo_user', JSON.stringify(r)); return r; }
  if (q === '/auth/logout') { localStorage.removeItem('sky_demo_user'); return { ok:true }; }
  if (q === '/applications/mine') return { applications: [] };
  if (q === '/applications' || q === '/applications/contact') return { ok:true, id: Date.now()%100000, reference:'SKY-' + String(Date.now()%1000000).padStart(6,'0') };
  if (q.indexOf('/admin') === 0) throw new Error('لوحة المشرف تحتاج النسخة الكاملة (سيرفر)');
  return { ok:true };
}
(function(){
  const real = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = async function(url, opts){
    if (typeof url === 'string' && url.indexOf('/api/') !== -1) {
      try { const data = skyStatic(url.replace(/^.*\\/api/, ''), opts || {}); return { ok:true, status:200, json: async()=>data }; }
      catch(e){ return { ok:false, status:400, json: async()=>({ error: e.message }) }; }
    }
    return real ? real(url, opts) : Promise.reject(new Error('offline'));
  };
})();
`;

// Inject shim at the top of the copied app.js
const appJs = fs.readFileSync(path.join(SRC, 'js', 'app.js'), 'utf8');
fs.writeFileSync(path.join(OUT, 'js', 'app.js'), shim + '\n' + appJs);

// Rewrite root-absolute paths to relative in every HTML file
for (const f of fs.readdirSync(OUT)) {
  if (!f.endsWith('.html')) continue;
  let s = fs.readFileSync(path.join(OUT, f), 'utf8');
  s = s.split('href="/#').join('href="index.html#');
  s = s.split('href="/"').join('href="index.html"');
  s = s.split('="/').join('="');                 // /css /js /assets /x.html
  s = s.split("location.href = '/'").join("location.href = 'index.html'");
  s = s.split("location.href='/'").join("location.href='index.html'");
  fs.writeFileSync(path.join(OUT, f), s);
}

console.log('Static build complete →', OUT);
console.log('Pages:', fs.readdirSync(OUT).filter(f => f.endsWith('.html')).length);
