import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db.js';
import { attachUser, requireAuth } from '../auth.js';

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
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(allowed.includes(ext) ? null : new Error('نوع الملف غير مدعوم'), allowed.includes(ext));
  },
});

// Submit an application — optional CV/document attachment.
router.post('/', attachUser, (req, res) => {
  upload.single('cv')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'تعذّر رفع الملف' });

    const { full_name, email, phone, nationality, target, message, job_id } = req.body || {};
    if (!full_name || !email) return res.status(400).json({ error: 'الاسم والبريد مطلوبان' });
    if (!emailRe.test(email)) return res.status(400).json({ error: 'بريد إلكتروني غير صالح' });

    let validJobId = null;
    if (job_id) {
      const job = db.prepare('SELECT id FROM jobs WHERE id = ? AND active = 1').get(job_id);
      if (job) validJobId = job.id;
    }

    const info = db.prepare(`
      INSERT INTO applications (user_id, job_id, full_name, email, phone, nationality, target, message, cv_path, cv_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user ? req.user.id : null,
      validJobId,
      full_name.trim(),
      email.toLowerCase(),
      phone || null,
      nationality || null,
      target || null,
      message || null,
      req.file ? req.file.filename : null,
      req.file ? req.file.originalname : null
    );

    res.json({ ok: true, id: info.lastInsertRowid, reference: `SKY-${String(info.lastInsertRowid).padStart(6, '0')}` });
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
  res.json({ ok: true });
});

export default router;
