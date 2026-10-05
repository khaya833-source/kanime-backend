const JIKAN_BASE = 'https://api.jikan.moe/v4';
const DELAY = 400; // Rate limit: ~3 req/sec

let lastFetchTime = 0;

async function rateLimit() {
  const now = Date.now();
  const timeSinceLastFetch = now - lastFetchTime;
  
  if (timeSinceLastFetch < DELAY) {
    await new Promise(resolve => setTimeout(resolve, DELAY - timeSinceLastFetch));
  }
  
  lastFetchTime = Date.now();
}

export async function getTopAnime(page = 1) {
  await rateLimit();
  const response = await fetch(`${JIKAN_BASE}/top/anime?page=${page}&limit=25`);
  return response.json();
}

export async function searchAnime(query, limit = 10) {
  await rateLimit();
  const url = `${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&limit=${limit}`;
  const response = await fetch(url);
  return response.json();
}

export async function getAnimeDetails(malId) {
  await rateLimit();
  const response = await fetch(`${JIKAN_BASE}/anime/${malId}`);
  return response.json();
}

export async function getAnimeEpisodes(malId, page = 1) {
  await rateLimit();
  const response = await fetch(`${JIKAN_BASE}/anime/${malId}/episodes?page=${page}`);
  return response.json();
}

export async function getSeasonalAnime() {
  await rateLimit();
  const response = await fetch(`${JIKAN_BASE}/seasons/now`);
  return response.json();
}
