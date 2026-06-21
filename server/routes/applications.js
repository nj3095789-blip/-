import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db.js';
import { attachUser, requireAuth } from '../auth.js';
import { notifyNewApplication, notifyContact } from '../mailer.js';

const router = Router();
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── File upload setup (CV / documents) ──
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', 'data', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.\-؀-ۿ]+/g, '_').slice(-80);
    cb(null, `${Date.now()}_${Math.round(Math.random() * 1e6)}_${safe}`);
  },
});
const allowed = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(allowed.includes(ext) ? null : new Error('نوع الملف غير مدعوم (PDF, Word, صورة)'), allowed.includes(ext));
  },
});

// Accept the document fields used by the full application form (and legacy 'cv').
const docFields = upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'passport', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'certificates', maxCount: 8 },
  { name: 'documents', maxCount: 10 },
]);

// Submit an application — supports multiple document attachments.
router.post('/', attachUser, (req, res) => {
  docFields(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'تعذّر رفع الملفات' });

    const { full_name, email, phone, nationality, target, message, job_id, dob, service_type, current_location } = req.body || {};
    if (!full_name || !email) return res.status(400).json({ error: 'الاسم والبريد مطلوبان' });
    if (!emailRe.test(email)) return res.status(400).json({ error: 'بريد إلكتروني غير صالح' });

    let validJobId = null;
    if (job_id) {
      const job = db.prepare('SELECT id FROM jobs WHERE id = ? AND active = 1').get(job_id);
      if (job) validJobId = job.id;
    }

    const files = req.files || {};
    const firstCv = (files.cv && files.cv[0]) || (files.passport && files.passport[0]) || null;

    const info = db.prepare(`
      INSERT INTO applications (user_id, job_id, full_name, email, phone, nationality, target, message,
        dob, service_type, current_location, cv_path, cv_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user ? req.user.id : null,
      validJobId,
      full_name.trim(),
      email.toLowerCase(),
      phone || null,
      nationality || null,
      target || null,
      message || null,
      dob || null,
      service_type || null,
      current_location || null,
      firstCv ? firstCv.filename : null,
      firstCv ? firstCv.originalname : null
    );
    const appId = info.lastInsertRowid;

    // Persist every uploaded file as a document row.
    const insertDoc = db.prepare('INSERT INTO documents (application_id, field, file_path, file_name) VALUES (?, ?, ?, ?)');
    const labels = { cv: 'السيرة الذاتية', passport: 'جواز السفر', photo: 'صورة شخصية', certificates: 'شهادة', documents: 'مستند' };
    const tx = db.transaction(() => {
      for (const field of Object.keys(files)) {
        for (const f of files[field]) {
          insertDoc.run(appId, labels[field] || field, f.filename, f.originalname);
        }
      }
    });
    tx();

    const reference = `SKY-${String(appId).padStart(6, '0')}`;
    notifyNewApplication({ full_name, email, phone, target, service_type, job_id: validJobId }, reference);
    res.json({ ok: true, id: appId, reference });
  });
});

// Logged-in user: track their own applications.
router.get('/mine', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT a.id, a.full_name, a.target, a.status, a.created_at, a.admin_note,
           j.title AS job_title, j.country AS job_country
    FROM applications a
    LEFT JOIN jobs j ON j.id = a.job_id
    WHERE a.user_id = ? OR a.email = ?
    ORDER BY a.created_at DESC
  `).all(req.user.id, req.user.email);
  res.json({ applications: rows });
});

// Contact form
router.post('/contact', (req, res) => {
  const { name, email, subject, body } = req.body || {};
  if (!name || !email || !body) return res.status(400).json({ error: 'الاسم والبريد والرسالة مطلوبة' });
  if (!emailRe.test(email)) return res.status(400).json({ error: 'بريد إلكتروني غير صالح' });
  db.prepare('INSERT INTO messages (name, email, subject, body) VALUES (?, ?, ?, ?)')
    .run(name.trim(), email.toLowerCase(), subject || null, body);
  notifyContact({ name, email, subject, body });
  res.json({ ok: true });
});

export default router;
