import { Router } from 'express';
import db from '../db.js';
import { attachUser } from '../auth.js';

const router = Router();

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Submit an immigration / job application (works for guests and logged-in users)
router.post('/', attachUser, (req, res) => {
  const { full_name, email, phone, nationality, target, message, job_id } = req.body || {};
  if (!full_name || !email) return res.status(400).json({ error: 'الاسم والبريد مطلوبان' });
  if (!emailRe.test(email)) return res.status(400).json({ error: 'بريد إلكتروني غير صالح' });

  let validJobId = null;
  if (job_id) {
    const job = db.prepare('SELECT id FROM jobs WHERE id = ? AND active = 1').get(job_id);
    if (job) validJobId = job.id;
  }

  const info = db.prepare(`
    INSERT INTO applications (user_id, job_id, full_name, email, phone, nationality, target, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user ? req.user.id : null,
    validJobId,
    full_name.trim(),
    email.toLowerCase(),
    phone || null,
    nationality || null,
    target || null,
    message || null
  );

  res.json({ ok: true, id: info.lastInsertRowid, reference: `SKY-${String(info.lastInsertRowid).padStart(6, '0')}` });
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
