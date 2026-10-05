import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function registerUser(email, password, username) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  try {
    const stmt = db.prepare('INSERT INTO users (email, password_hash, username) VALUES (?, ?, ?)');
    const result = stmt.run(email, hashedPassword, username || email.split('@')[0]);
    
    return {
      id: result.lastInsertRowid,
      email,
      username: username || email.split('@')[0]
    };
  } catch (error) {
    throw new Error('User already exists');
  }
}

export function loginUser(email, password) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const user = stmt.get(email);
  
  if (!user) throw new Error('User not found');
  if (!bcrypt.compareSync(password, user.password_hash)) {
    throw new Error('Invalid password');
  }
  
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  
  return {
    token,
    user: { id: user.id, email: user.email, username: user.username }
  };
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
