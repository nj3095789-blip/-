import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
router.use(requireAuth, requireAdmin);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', 'data', 'uploads');

router.get('/stats', (_req, res) => {
  const num = (q) => db.prepare(q).get().n;
  res.json({
    users: num('SELECT COUNT(*) n FROM users'),
    applications: num('SELECT COUNT(*) n FROM applications'),
    jobs: num('SELECT COUNT(*) n FROM jobs WHERE active = 1'),
    paid: num("SELECT COUNT(*) n FROM payments WHERE status = 'paid'"),
    revenue_cents: db.prepare("SELECT COALESCE(SUM(amount_cents),0) s FROM payments WHERE status = 'paid'").get().s,
  });
});

router.get('/applications', (_req, res) => {
  res.json({ applications: db.prepare('SELECT * FROM applications ORDER BY created_at DESC LIMIT 200').all() });
});

router.patch('/applications/:id', (req, res) => {
  const { status, admin_note } = req.body || {};
  const allowed = ['received', 'in-review', 'approved', 'rejected', 'completed'];
  if (status !== undefined) {
    if (!allowed.includes(status)) return res.status(400).json({ error: 'حالة غير صالحة' });
    db.prepare('UPDATE applications SET status = ? WHERE id = ?').run(status, req.params.id);
  }
  if (admin_note !== undefined) {
    db.prepare('UPDATE applications SET admin_note = ? WHERE id = ?').run(admin_note, req.params.id);
  }
  res.json({ ok: true });
});

// Securely download an applicant's uploaded document (admin only).
router.get('/applications/:id/cv', (req, res) => {
  const row = db.prepare('SELECT cv_path, cv_name FROM applications WHERE id = ?').get(req.params.id);
  if (!row || !row.cv_path) return res.status(404).json({ error: 'لا يوجد ملف مرفق' });
  const filePath = path.join(uploadDir, path.basename(row.cv_path));
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'الملف غير موجود' });
  res.download(filePath, row.cv_name || row.cv_path);
});

router.get('/payments', (_req, res) => {
  res.json({ payments: db.prepare('SELECT * FROM payments ORDER BY created_at DESC LIMIT 200').all() });
});

router.get('/messages', (_req, res) => {
  res.json({ messages: db.prepare('SELECT * FROM messages ORDER BY created_at DESC LIMIT 200').all() });
});

// Job management
router.post('/jobs', (req, res) => {
  const { title, country, city, category, employment, salary, description, requirements, visa_support } = req.body || {};
  if (!title || !country || !category || !description)
    return res.status(400).json({ error: 'العنوان والدولة والفئة والوصف مطلوبة' });
  const info = db.prepare(`
    INSERT INTO jobs (title, country, city, category, employment, salary, description, requirements, visa_support)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, country, city || null, category, employment || 'full-time', salary || null,
    description, requirements || null, visa_support ? 1 : 0);
  res.json({ ok: true, id: info.lastInsertRowid });
});

router.delete('/jobs/:id', (req, res) => {
  db.prepare('UPDATE jobs SET active = 0 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
