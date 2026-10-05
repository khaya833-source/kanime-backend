import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../data/kanime.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      username TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      anime_id INTEGER NOT NULL,
      status TEXT DEFAULT 'watching',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, anime_id)
    );

    CREATE TABLE IF NOT EXISTS anime_cache (
      anime_id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      image TEXT,
      genres TEXT,
      score REAL,
      episodes INTEGER,
      description TEXT,
      studio TEXT,
      year INTEGER,
      status TEXT,
      mal_id INTEGER,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✓ Database initialized');
}

export default db;
