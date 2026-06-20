import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'skyline.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name     TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    phone         TEXT,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'user',
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS services (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    slug        TEXT    NOT NULL UNIQUE,
    title_ar    TEXT    NOT NULL,
    title_en    TEXT    NOT NULL,
    summary_ar  TEXT    NOT NULL,
    summary_en  TEXT    NOT NULL,
    price_cents INTEGER NOT NULL,
    currency    TEXT    NOT NULL DEFAULT 'usd',
    icon        TEXT    NOT NULL DEFAULT 'globe',
    active      INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    title        TEXT    NOT NULL,
    country      TEXT    NOT NULL,
    city         TEXT,
    category     TEXT    NOT NULL,
    employment   TEXT    NOT NULL DEFAULT 'full-time',
    salary       TEXT,
    description  TEXT    NOT NULL,
    requirements TEXT,
    visa_support INTEGER NOT NULL DEFAULT 1,
    active       INTEGER NOT NULL DEFAULT 1,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS applications (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    job_id      INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    full_name   TEXT    NOT NULL,
    email       TEXT    NOT NULL,
    phone       TEXT,
    nationality TEXT,
    target      TEXT,
    message     TEXT,
    status      TEXT    NOT NULL DEFAULT 'received',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS payments (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
    service_id    INTEGER REFERENCES services(id) ON DELETE SET NULL,
    email         TEXT    NOT NULL,
    amount_cents  INTEGER NOT NULL,
    currency      TEXT    NOT NULL DEFAULT 'usd',
    provider      TEXT    NOT NULL DEFAULT 'stripe',
    session_id    TEXT,
    status        TEXT    NOT NULL DEFAULT 'pending',
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    subject    TEXT,
    body       TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// ── Lightweight migrations (add columns to pre-existing tables) ──
function ensureColumn(table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some(c => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}
ensureColumn('applications', 'cv_path', 'TEXT');
ensureColumn('applications', 'cv_name', 'TEXT');
ensureColumn('applications', 'admin_note', 'TEXT');

export default db;
