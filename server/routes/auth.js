import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { signToken, requireAuth } from '../auth.js';

const router = Router();

const cookieOpts = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/register', (req, res) => {
  const { full_name, email, phone, password } = req.body || {};
  if (!full_name || !email || !password)
    return res.status(400).json({ error: 'الاسم والبريد وكلمة المرور مطلوبة' });
  if (!emailRe.test(email)) return res.status(400).json({ error: 'بريد إلكتروني غير صالح' });
  if (String(password).length < 6)
    return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (exists) return res.status(409).json({ error: 'هذا البريد مسجّل مسبقاً' });

  const hash = bcrypt.hashSync(String(password), 10);
  const info = db
    .prepare('INSERT INTO users (full_name, email, phone, password_hash) VALUES (?, ?, ?, ?)')
    .run(full_name.trim(), email.toLowerCase(), phone || null, hash);

  const user = db.prepare('SELECT id, full_name, email, role FROM users WHERE id = ?').get(info.lastInsertRowid);
  const token = signToken(user);
  res.cookie('token', token, cookieOpts);
  res.json({ user, token });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'البريد وكلمة المرور مطلوبة' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase());
  if (!user || !bcrypt.compareSync(String(password), user.password_hash))
    return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });

  const safe = { id: user.id, full_name: user.full_name, email: user.email, role: user.role };
  const token = signToken(safe);
  res.cookie('token', token, cookieOpts);
  res.json({ user: safe, token });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  const user = db
    .prepare('SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ?')
    .get(req.user.id);
  res.json({ user });
});

export default router;
