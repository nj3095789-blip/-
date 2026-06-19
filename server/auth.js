import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev_insecure_secret_change_me';

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.full_name },
    SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

// Reads the token from the httpOnly cookie or the Authorization header.
function extract(req) {
  if (req.cookies && req.cookies.token) return req.cookies.token;
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}

export function attachUser(req, _res, next) {
  const token = extract(req);
  req.user = token ? verifyToken(token) : null;
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'يلزم تسجيل الدخول / Authentication required' });
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin')
    return res.status(403).json({ error: 'صلاحيات المشرف مطلوبة / Admin access required' });
  next();
}
