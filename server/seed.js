import 'dotenv/config';
import bcrypt from 'bcryptjs';
import db from './db.js';

function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@skyline.com').toLowerCase();
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return;
  const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Skyline@Admin2026', 10);
  db.prepare('INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)')
    .run('Skyline Admin', email, hash, 'admin');
  console.log(`  ➜  Admin account ready: ${email}`);
}

function seedServices() {
  if (db.prepare('SELECT COUNT(*) n FROM services').get().n > 0) return;
  const services = [
    ['consultation', 'استشارة هجرة مع خبير', 'Expert Immigration Consultation',
      'جلسة 60 دقيقة مع مستشار معتمد لتقييم ملفك ووضع خطة هجرة مخصصة.',
      '60-minute session with a certified advisor to assess your profile and build a tailored plan.',
      4900, 'globe'],
    ['skilled-worker', 'تأشيرة العمالة الماهرة', 'Skilled Worker Visa Package',
      'تجهيز كامل لملف الهجرة المهنية: معادلة الشهادات، السيرة الدولية، وتقديم الطلب.',
      'Full skilled-migration package: credential assessment, international CV, and application filing.',
      89900, 'briefcase'],
    ['express-entry', 'الدخول السريع (كندا)', 'Express Entry (Canada)',
      'إدارة شاملة لملف Express Entry وزيادة نقاط CRS وتقديم Profile.',
      'End-to-end Express Entry management, CRS optimization, and profile submission.',
      129900, 'maple'],
    ['job-placement', 'تأمين فرصة عمل دولية', 'International Job Placement',
      'ربطك بأصحاب عمل معتمدين يرعون التأشيرة، مع تجهيز ومتابعة عقد العمل.',
      'Match with visa-sponsoring employers, plus contract preparation and follow-up.',
      59900, 'handshake'],
    ['study-visa', 'تأشيرة دراسة', 'Study Visa Assistance',
      'قبول جامعي، خطاب الدافع، وتجهيز ملف تأشيرة الطالب من الألف إلى الياء.',
      'University admission, motivation letter, and complete student-visa file preparation.',
      39900, 'cap'],
    ['family-visa', 'لمّ الشمل العائلي', 'Family Reunification Visa',
      'تجهيز ملف لمّ الشمل وكفالة أفراد الأسرة وفق متطلبات الدولة المستهدفة.',
      'Family sponsorship and reunification filing per the destination country requirements.',
      54900, 'family'],
  ];
  const stmt = db.prepare(`INSERT INTO services (slug, title_ar, title_en, summary_ar, summary_en, price_cents, currency, icon)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  const cur = (process.env.CURRENCY || 'usd').toLowerCase();
  const tx = db.transaction(() => services.forEach(s => stmt.run(s[0], s[1], s[2], s[3], s[4], s[5], cur, s[6])));
  tx();
  console.log('  ➜  Seeded services catalog');
}

function seedJobs() {
  if (db.prepare('SELECT COUNT(*) n FROM jobs').get().n > 0) return;
  const jobs = [
    ['ممرض/ممرضة مسجّل', 'Canada', 'Toronto', 'الرعاية الصحية', 'full-time', 'CAD 75,000 - 95,000 / سنة',
      'مستشفى رائد يبحث عن ممرضين مسجّلين مع رعاية كاملة لتأشيرة العمل والإقامة.',
      'بكالوريوس تمريض · خبرة سنتان · IELTS 6.5'],
    ['مطوّر برمجيات Full-Stack', 'Germany', 'Berlin', 'تقنية المعلومات', 'full-time', 'EUR 65,000 - 85,000 / سنة',
      'شركة تقنية تقدّم تأشيرة EU Blue Card لمطوّرين بخبرة في Node.js و React.',
      '3+ سنوات خبرة · إنجليزية بطلاقة · معرفة بالـ Cloud'],
    ['فنّي لحام معتمد', 'Australia', 'Perth', 'الصناعة والإنشاءات', 'full-time', 'AUD 80,000 - 100,000 / سنة',
      'مقاول إنشاءات كبير يرعى تأشيرة 482 لفنيي اللحام المهرة.',
      'شهادة مهنية · خبرة 3 سنوات · فحص طبي'],
    ['طاهٍ تنفيذي', 'UAE', 'Dubai', 'الضيافة والسياحة', 'full-time', 'AED 12,000 - 18,000 / شهر',
      'سلسلة فنادق فاخرة تبحث عن طاهٍ تنفيذي مع سكن وتذاكر وتأشيرة عمل.',
      'خبرة 5 سنوات · مطبخ عالمي · قيادة فريق'],
    ['سائق شاحنة لمسافات طويلة', 'Poland', 'Warsaw', 'النقل واللوجستيات', 'full-time', 'EUR 2,200 - 3,000 / شهر',
      'شركة لوجستيات أوروبية توفّر رخصة CE ودعم تأشيرة العمل والإقامة.',
      'رخصة قيادة دولية · سجل نظيف · استعداد للسفر'],
    ['أخصائي تسويق رقمي', 'Netherlands', 'Amsterdam', 'التسويق', 'full-time', 'EUR 48,000 - 62,000 / سنة',
      'وكالة تسويق نامية تقدّم تأشيرة الموظف عالي المهارة (Highly Skilled Migrant).',
      'خبرة 3 سنوات · SEO/SEM · إنجليزية ممتازة'],
    ['عامل قطف وتعبئة زراعية', 'New Zealand', 'Hawke’s Bay', 'الزراعة', 'seasonal', 'NZD 26 - 32 / ساعة',
      'مزرعة معتمدة ضمن برنامج RSE الموسمي مع سكن وتأشيرة عمل موسمية.',
      'لياقة بدنية جيدة · لا يلزم خبرة سابقة'],
    ['محاسب قانوني', 'Qatar', 'Doha', 'المالية والمحاسبة', 'full-time', 'QAR 14,000 - 20,000 / شهر',
      'مجموعة تجارية كبرى توظّف محاسباً قانونياً مع حزمة مزايا وتأشيرة عمل.',
      'CPA/ACCA · خبرة 4 سنوات · خبرة ERP'],
  ];
  const stmt = db.prepare(`INSERT INTO jobs (title, country, city, category, employment, salary, description, requirements, visa_support)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`);
  const tx = db.transaction(() => jobs.forEach(j => stmt.run(...j)));
  tx();
  console.log('  ➜  Seeded job board');
}

seedAdmin();
seedServices();
seedJobs();
