// ====================================================
// 407.TENNIS - BACKEND API SERVER
// Complete production-ready backend
// Tech: Node.js + Express.js + PostgreSQL
// Deploy to: Railway, Heroku, or AWS
// ====================================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============ MIDDLEWARE ============
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ DATABASE ============
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => console.error('Unexpected error on idle client', err));

// ============ JWT VERIFICATION ============
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============ AUTHENTICATION ROUTES ============

// POST /api/auth/register - Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, location, skillLevel } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, location, skill_level, is_premium, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, false, NOW())
       RETURNING id, email, first_name, last_name, location, skill_level, is_premium`,
      [email, hashedPassword, firstName, lastName, location || '', skillLevel || 'BEGINNER']
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        location: user.location,
        skillLevel: user.skill_level,
        isPremium: user.is_premium,
      },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login - Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        location: user.location,
        skillLevel: user.skill_level,
        isPremium: user.is_premium,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============ PLAYER ROUTES ============

// GET /api/players/:id - Get player profile
app.get('/api/players/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, first_name, last_name, location, skill_level, bio, photo_url, is_premium FROM users WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const p = result.rows[0];
    res.json({
      id: p.id,
      name: `${p.first_name} ${p.last_name}`,
      location: p.location,
      skillLevel: p.skill_level,
      bio: p.bio,
      photoUrl: p.photo_url,
      isPremium: p.is_premium,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get player' });
  }
});

// PUT /api/players/:id - Update player profile
app.put('/api/players/:id', verifyToken, async (req, res) => {
  try {
    if (req.userId !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { firstName, lastName, location, skillLevel, bio, photoUrl } = req.body;

    const result = await pool.query(
      `UPDATE users SET first_name = $1, last_name = $2, location = $3, skill_level = $4, bio = $5, photo_url = $6
       WHERE id = $7 RETURNING id, first_name, last_name, location, skill_level, bio, photo_url`,
      [firstName, lastName, location, skillLevel, bio, photoUrl, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const u = result.rows[0];
    res.json({
      success: true,
      user: {
        id: u.id,
        firstName: u.first_name,
        lastName: u.last_name,
        location: u.location,
        skillLevel: u.skill_level,
        bio: u.bio,
        photoUrl: u.photo_url,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/players/search?location=&skillLevel= - Search players
app.get('/api/players/search', async (req, res) => {
  try {
    const { location, skillLevel, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT id, first_name, last_name, location, skill_level, bio, photo_url FROM users WHERE id > 0';
    const params = [];

    if (location) {
      query += ` AND location ILIKE $${params.length + 1}`;
      params.push(`%${location}%`);
    }

    if (skillLevel && skillLevel !== 'all') {
      query += ` AND skill_level = $${params.length + 1}`;
      params.push(skillLevel);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      players: result.rows.map(p => ({
        id: p.id,
        name: `${p.first_name} ${p.last_name}`,
        location: p.location,
        skillLevel: p.skill_level,
        bio: p.bio,
        photoUrl: p.photo_url,
      })),
      total: result.rowCount,
    });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// ============ MATCH ROUTES ============

// POST /api/matches - Create match request
app.post('/api/matches', verifyToken, async (req, res) => {
  try {
    const { player2Id, scheduledDate, location, courtType } = req.body;

    if (!player2Id || !scheduledDate || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO matches (player1_id, player2_id, scheduled_date, location, court_type, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'PENDING', NOW())
       RETURNING id, player1_id, player2_id, scheduled_date, location, status`,
      [req.userId, player2Id, scheduledDate, location, courtType || 'HARD']
    );

    const match = result.rows[0];
    res.status(201).json({
      success: true,
      match: {
        id: match.id,
        player1Id: match.player1_id,
        player2Id: match.player2_id,
        scheduledDate: match.scheduled_date,
        location: match.location,
        status: match.status,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create match' });
  }
});

// GET /api/matches/:id - Get match details
app.get('/api/matches/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM matches WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const m = result.rows[0];
    res.json({
      id: m.id,
      player1Id: m.player1_id,
      player2Id: m.player2_id,
      scheduledDate: m.scheduled_date,
      location: m.location,
      courtType: m.court_type,
      status: m.status,
      player1Score: m.player1_score,
      player2Score: m.player2_score,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get match' });
  }
});

// PATCH /api/matches/:id - Accept/decline match
app.patch('/api/matches/:id', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['ACCEPTED', 'DECLINED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE matches SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json({ success: true, match: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update match' });
  }
});

// POST /api/matches/:id/results - Post match results
app.post('/api/matches/:id/results', verifyToken, async (req, res) => {
  try {
    const { player1Score, player2Score } = req.body;

    const result = await pool.query(
      `UPDATE matches SET player1_score = $1, player2_score = $2, status = 'COMPLETED'
       WHERE id = $3 RETURNING *`,
      [player1Score, player2Score, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json({ success: true, match: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to post results' });
  }
});

// GET /api/players/:id/matches - Get user's matches
app.get('/api/players/:id/matches', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM matches WHERE player1_id = $1 OR player2_id = $1 ORDER BY scheduled_date DESC`,
      [req.params.id]
    );

    res.json({
      success: true,
      matches: result.rows,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get matches' });
  }
});

// ============ MESSAGING ROUTES ============

// GET /api/messages/conversations - Get all conversations
app.get('/api/messages/conversations', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT conversation_id FROM messages 
       WHERE sender_id = $1 OR receiver_id = $1 
       ORDER BY created_at DESC`,
      [req.userId]
    );

    res.json({
      success: true,
      conversations: result.rows.map(r => r.conversation_id),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// GET /api/messages/:conversationId - Get messages in conversation
app.get('/api/messages/:conversationId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
      [req.params.conversationId]
    );

    res.json({
      success: true,
      messages: result.rows,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// POST /api/messages - Send message
app.post('/api/messages', verifyToken, async (req, res) => {
  try {
    const { receiverId, conversationId, content } = req.body;

    if (!receiverId || !content || !conversationId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, conversation_id, content, is_read, created_at)
       VALUES ($1, $2, $3, $4, false, NOW())
       RETURNING *`,
      [req.userId, receiverId, conversationId, content]
    );

    res.status(201).json({
      success: true,
      message: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ============ SUBSCRIPTION ROUTES ============

// POST /api/subscriptions/create-intent - Create payment intent
app.post('/api/subscriptions/create-intent', verifyToken, async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 999, // $9.99 in cents
      currency: 'usd',
      metadata: {
        userId: req.userId,
        type: 'premium_subscription',
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// POST /api/subscriptions/confirm - Confirm subscription
app.post('/api/subscriptions/confirm', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE users SET is_premium = true, premium_started_at = NOW() WHERE id = $1 RETURNING *`,
      [req.userId]
    );

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to confirm subscription' });
  }
});

// GET /api/subscriptions/status - Check subscription status
app.get('/api/subscriptions/status', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT is_premium, premium_started_at FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      isPremium: user.is_premium,
      premiumStartedAt: user.premium_started_at,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check subscription status' });
  }
});

// ============ ADMIN ROUTES ============

// GET /api/admin/stats - Get platform statistics
app.get('/api/admin/stats', verifyToken, async (req, res) => {
  try {
    const users = await pool.query('SELECT COUNT(*) as count FROM users');
    const matches = await pool.query('SELECT COUNT(*) as count FROM matches');
    const premiumUsers = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_premium = true');

    res.json({
      success: true,
      stats: {
        totalUsers: parseInt(users.rows[0].count),
        totalMatches: parseInt(matches.rows[0].count),
        premiumUsers: parseInt(premiumUsers.rows[0].count),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// GET /api/admin/users - Get all users
app.get('/api/admin/users', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, location, skill_level, is_premium, created_at FROM users ORDER BY created_at DESC LIMIT 100'
    );

    res.json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '407.Tennis backend is running' });
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`407.Tennis backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
