import { Router } from 'express';
import { getTopAnime, searchAnime, getAnimeDetails, getAnimeEpisodes } from '../jikan.js';
import db from '../db.js';

const router = Router();

router.get('/top', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const result = await getTopAnime(page);
    
    // Cache the results
    if (result.data) {
      result.data.forEach(anime => {
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO anime_cache 
          (anime_id, mal_id, title, image, genres, score, episodes, description, studio, year, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
          anime.mal_id,
          anime.mal_id,
          anime.title,
          anime.images?.jpg?.image_url,
          JSON.stringify(anime.genres?.map(g => g.name) || []),
          anime.score,
          anime.episodes,
          anime.synopsis,
          anime.studios?.[0]?.name,
          anime.year,
          anime.status
        );
      });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const result = await searchAnime(q, 25);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:malId', async (req, res) => {
  try {
    const { malId } = req.params;
    const result = await getAnimeDetails(malId);
    
    if (result.data) {
      const anime = result.data;
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO anime_cache 
        (anime_id, mal_id, title, image, genres, score, episodes, description, studio, year, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        anime.mal_id,
        anime.mal_id,
        anime.title,
        anime.images?.jpg?.image_url,
        JSON.stringify(anime.genres?.map(g => g.name) || []),
        anime.score,
        anime.episodes,
        anime.synopsis,
        anime.studios?.[0]?.name,
        anime.year,
        anime.status
      );
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:malId/episodes', async (req, res) => {
  try {
    const { malId } = req.params;
    const { page } = req.query;
    const result = await getAnimeEpisodes(malId, page || 1);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
