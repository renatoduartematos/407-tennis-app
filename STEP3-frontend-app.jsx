// ====================================================
// 407.TENNIS - FRONTEND (REACT)
// Complete React Application
// Deploy to: Vercel, Netlify, or AWS
// ====================================================

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TennisApp = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentPage, setCurrentPage] = useState('login');

  // Data State
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [skillLevel, setSkillLevel] = useState('all');

  // Initialize app
  useEffect(() => {
    if (token) {
      fetchUserProfile();
      setCurrentPage('dashboard');
    }
  }, [token]);

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const userId = JSON.parse(atob(token.split('.')[1])).userId;
      const res = await axios.get(`${API_URL}/players/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  // Handle login
  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      setToken(res.data.token);
      setCurrentUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      setCurrentPage('dashboard');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  // Handle register
  const handleRegister = async (email, password, firstName, lastName, location, skillLevel) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        firstName,
        lastName,
        location,
        skillLevel,
      });
      setToken(res.data.token);
      setCurrentUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      setCurrentPage('dashboard');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  // Fetch players
  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/players/search`, {
        params: { location: searchLocation, skillLevel },
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlayers(res.data.players);
    } catch (err) {
      setError('Failed to fetch players');
    }
    setLoading(false);
  };

  // Fetch matches
  const fetchMatches = async () => {
    setLoading(true);
    try {
      const userId = JSON.parse(atob(token.split('.')[1])).userId;
      const res = await axios.get(`${API_URL}/players/${userId}/matches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(res.data.matches);
    } catch (err) {
      setError('Failed to fetch matches');
    }
    setLoading(false);
  };

  // Handle logout
  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('token');
    setCurrentPage('login');
  };

  // Challenge a player
  const handleChallenge = async (player2Id, location) => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/matches`, {
        player2Id,
        scheduledDate: new Date().toISOString(),
        location,
        courtType: 'HARD'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setError('');
      alert('Challenge sent!');
    } catch (err) {
      setError('Failed to send challenge');
    }
    setLoading(false);
  };

  // Render pages
  const renderPage = () => {
    if (!token) {
      return <LoginPage onLogin={handleLogin} onRegister={handleRegister} loading={loading} error={error} />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={currentUser} matches={matches} onFetchMatches={fetchMatches} />;
      case 'discover':
        return <DiscoverPage players={players} onFetchPlayers={fetchPlayers} searchLocation={searchLocation} setSearchLocation={setSearchLocation} skillLevel={skillLevel} setSkillLevel={setSkillLevel} onChallenge={handleChallenge} loading={loading} />;
      case 'matches':
        return <MatchesPage matches={matches} onFetchMatches={fetchMatches} />;
      case 'profile':
        return <ProfilePage user={userProfile} token={token} />;
      case 'messages':
        return <MessagesPage messages={messages} token={token} />;
      default:
        return <Dashboard user={currentUser} matches={matches} onFetchMatches={fetchMatches} />;
    }
  };

  return (
    <div className="app">
      {token && <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />}
      <div className="app-content">
        {renderPage()}
      </div>
    </div>
  );
};

// ========== LOGIN PAGE ==========
const LoginPage = ({ onLogin, onRegister, loading, error }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    location: '',
    skillLevel: 'BEGINNER',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(formData.email, formData.password);
    } else {
      onRegister(formData.email, formData.password, formData.firstName, formData.lastName, formData.location, formData.skillLevel);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>🎾 407.Tennis</h1>
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {!isLogin && (
            <>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
              />
              <select name="skillLevel" value={formData.skillLevel} onChange={handleChange}>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </>
          )}
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p>
          {isLogin ? 'No account? ' : 'Have an account? '}
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="link-button">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

// ========== NAVBAR ==========
const Navbar = ({ currentPage, setCurrentPage, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="nav-brand">🎾 407.Tennis</div>
      <div className="nav-links">
        <button className={currentPage === 'dashboard' ? 'active' : ''} onClick={() => setCurrentPage('dashboard')}>Home</button>
        <button className={currentPage === 'discover' ? 'active' : ''} onClick={() => setCurrentPage('discover')}>Discover</button>
        <button className={currentPage === 'matches' ? 'active' : ''} onClick={() => setCurrentPage('matches')}>Matches</button>
        <button className={currentPage === 'messages' ? 'active' : ''} onClick={() => setCurrentPage('messages')}>Messages</button>
        <button className={currentPage === 'profile' ? 'active' : ''} onClick={() => setCurrentPage('profile')}>Profile</button>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};

// ========== DASHBOARD PAGE ==========
const Dashboard = ({ user, matches, onFetchMatches }) => {
  useEffect(() => {
    onFetchMatches();
  }, []);

  return (
    <div className="page dashboard-page">
      <h1>Welcome, {user?.firstName}! 👋</h1>
      <p>Ready to find your next tennis match?</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Upcoming Matches</h3>
          <p className="stat-number">{matches.length}</p>
        </div>
        <div className="stat-card">
          <h3>Players Online</h3>
          <p className="stat-number">342</p>
        </div>
        <div className="stat-card">
          <h3>Your Ranking</h3>
          <p className="stat-number">1450</p>
        </div>
      </div>

      <h2>Recent Matches</h2>
      <div className="matches-list">
        {matches.length > 0 ? (
          matches.slice(0, 5).map(match => (
            <div key={match.id} className="match-card">
              <p><strong>Match #{match.id}</strong></p>
              <p>Status: {match.status}</p>
              <p>Location: {match.location}</p>
            </div>
          ))
        ) : (
          <p>No matches yet. Go discover players!</p>
        )}
      </div>
    </div>
  );
};

// ========== DISCOVER PAGE ==========
const DiscoverPage = ({ players, onFetchPlayers, searchLocation, setSearchLocation, skillLevel, setSkillLevel, onChallenge, loading }) => {
  useEffect(() => {
    onFetchPlayers();
  }, [searchLocation, skillLevel]);

  return (
    <div className="page discover-page">
      <h1>Discover Players</h1>

      <div className="search-filters">
        <input
          type="text"
          placeholder="Search by location..."
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
        />
        <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}>
          <option value="all">All Levels</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
      </div>

      <div className="players-grid">
        {loading ? (
          <p>Loading...</p>
        ) : players.length > 0 ? (
          players.map(player => (
            <div key={player.id} className="player-card">
              <div className="player-avatar">🎾</div>
              <h3>{player.name}</h3>
              <p><strong>Level:</strong> {player.skillLevel}</p>
              <p><strong>Location:</strong> {player.location}</p>
              <p className="bio">{player.bio}</p>
              <button onClick={() => onChallenge(player.id, player.location)} className="challenge-btn">
                Challenge
              </button>
            </div>
          ))
        ) : (
          <p>No players found. Try a different search.</p>
        )}
      </div>
    </div>
  );
};

// ========== MATCHES PAGE ==========
const MatchesPage = ({ matches, onFetchMatches }) => {
  useEffect(() => {
    onFetchMatches();
  }, []);

  return (
    <div className="page matches-page">
      <h1>Your Matches</h1>
      <div className="matches-list">
        {matches.length > 0 ? (
          matches.map(match => (
            <div key={match.id} className="match-card">
              <p><strong>Match #{match.id}</strong></p>
              <p>Status: <span className={`status ${match.status}`}>{match.status}</span></p>
              <p>Date: {new Date(match.scheduled_date).toLocaleDateString()}</p>
              <p>Location: {match.location}</p>
              {match.status === 'COMPLETED' && (
                <p>Score: {match.player1_score} - {match.player2_score}</p>
              )}
            </div>
          ))
        ) : (
          <p>No matches yet. Challenge someone to get started!</p>
        )}
      </div>
    </div>
  );
};

// ========== PROFILE PAGE ==========
const ProfilePage = ({ user, token }) => {
  return (
    <div className="page profile-page">
      <h1>My Profile</h1>
      {user && (
        <div className="profile-form">
          <div className="form-group">
            <label>Name</label>
            <input type="text" defaultValue={user.name || ''} />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input type="text" defaultValue={user.location || ''} />
          </div>
          <div className="form-group">
            <label>Skill Level</label>
            <select defaultValue={user.skillLevel || 'BEGINNER'}>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
          <button className="save-btn">Save Changes</button>
        </div>
      )}
    </div>
  );
};

// ========== MESSAGES PAGE ==========
const MessagesPage = ({ messages, token }) => {
  return (
    <div className="page messages-page">
      <h1>Messages</h1>
      <div className="messages-list">
        {messages.length > 0 ? (
          messages.map(msg => (
            <div key={msg.id} className="message-card">
              <p><strong>From: Player</strong></p>
              <p>{msg.content}</p>
            </div>
          ))
        ) : (
          <p>No messages yet. Start chatting with players you challenged!</p>
        )}
      </div>
    </div>
  );
};

export default TennisApp;
