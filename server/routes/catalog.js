import { Router } from 'express';
import db from '../db.js';

const router = Router();

// Public services catalog
router.get('/services', (_req, res) => {
  const rows = db.prepare('SELECT * FROM services WHERE active = 1 ORDER BY id').all();
  res.json({ services: rows });
});

// Public job board with simple filters
router.get('/jobs', (req, res) => {
  const { country, category, q } = req.query;
  let sql = 'SELECT * FROM jobs WHERE active = 1';
  const params = [];
  if (country) { sql += ' AND country = ?'; params.push(country); }
  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (q) {
    sql += ' AND (title LIKE ? OR description LIKE ? OR city LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  sql += ' ORDER BY created_at DESC';
  const jobs = db.prepare(sql).all(...params);

  const countries = db.prepare('SELECT DISTINCT country FROM jobs WHERE active = 1 ORDER BY country').all().map(r => r.country);
  const categories = db.prepare('SELECT DISTINCT category FROM jobs WHERE active = 1 ORDER BY category').all().map(r => r.category);
  res.json({ jobs, countries, categories });
});

router.get('/jobs/:id', (req, res) => {
  const job = db.prepare('SELECT * FROM jobs WHERE id = ? AND active = 1').get(req.params.id);
  if (!job) return res.status(404).json({ error: 'الوظيفة غير موجودة' });
  res.json({ job });
});

export default router;
