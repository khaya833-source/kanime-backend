# KAnime Backend API

A Node.js/Express backend for the KAnime anime streaming website with authentication, watchlists, and Jikan API integration.

## Features

- ✅ User authentication (register/login with JWT)
- ✅ Watchlist management (add/remove/update anime status)
- ✅ Jikan API integration for anime metadata
- ✅ SQLite database with caching
- ✅ Rate-limited API requests (3 req/sec)
- ✅ CORS enabled for frontend

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Edit `.env`:
```
NODE_ENV=development
PORT=4000
JWT_SECRET=your-super-secret-key-change-this
CLIENT_URL=http://localhost:3000
```

### 3. Run the Server
```bash
npm run dev
```

Server runs on `http://localhost:4000`

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Anime
- `GET /api/anime/top?page=1` - Get top anime
- `GET /api/anime/search?q=naruto` - Search anime
- `GET /api/anime/:malId` - Get anime details
- `GET /api/anime/:malId/episodes?page=1` - Get episodes

### Watchlist (requires auth token)
- `GET /api/watchlist` - Get all watchlist items
- `GET /api/watchlist/:status` - Get by status (watching/planToWatch/completed/dropped)
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/:animeId` - Remove from watchlist
- `PATCH /api/watchlist/:animeId` - Update status

## Usage Examples

### Register
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","username":"user123"}'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

### Get Top Anime
```bash
curl http://localhost:4000/api/anime/top
```

### Add to Watchlist
```bash
curl -X POST http://localhost:4000/api/watchlist \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"animeId":20,"status":"watching"}'
```

## Stack

- Node.js
- Express.js
- SQLite (better-sqlite3)
- JWT (jsonwebtoken)
- Bcrypt (password hashing)
- Jikan API (anime data)

## Rate Limits

Jikan API: ~3 requests/second
Backend implements automatic rate limiting with 400ms delay.

## Database

SQLite database at `data/kanime.db` with tables:
- `users` - User accounts
- `watchlist` - User watchlist entries
- `anime_cache` - Cached anime metadata
