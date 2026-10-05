import { Router } from 'express';
import { authMiddleware } from '../auth.js';
import db from '../db.js';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT w.*, ac.title, ac.image, ac.genres, ac.score
      FROM watchlist w
      LEFT JOIN anime_cache ac ON w.anime_id = ac.mal_id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `);
    
    const items = stmt.all(req.user.id);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:status', (req, res) => {
  try {
    const { status } = req.params;
    
    const stmt = db.prepare(`
      SELECT w.*, ac.title, ac.image, ac.genres, ac.score
      FROM watchlist w
      LEFT JOIN anime_cache ac ON w.anime_id = ac.mal_id
      WHERE w.user_id = ? AND w.status = ?
      ORDER BY w.created_at DESC
    `);
    
    const items = stmt.all(req.user.id, status);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { animeId, status } = req.body;
    
    if (!animeId) {
      return res.status(400).json({ error: 'animeId required' });
    }
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO watchlist (user_id, anime_id, status)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(req.user.id, animeId, status || 'watching');
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:animeId', (req, res) => {
  try {
    const { animeId } = req.params;
    
    const stmt = db.prepare(`
      DELETE FROM watchlist
      WHERE user_id = ? AND anime_id = ?
    `);
    
    stmt.run(req.user.id, animeId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:animeId', (req, res) => {
  try {
    const { animeId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'status required' });
    }
    
    const stmt = db.prepare(`
      UPDATE watchlist
      SET status = ?
      WHERE user_id = ? AND anime_id = ?
    `);
    
    stmt.run(status, req.user.id, animeId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
