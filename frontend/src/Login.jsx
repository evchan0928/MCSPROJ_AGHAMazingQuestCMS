import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const API_BASE = process.env.REACT_APP_API_URL || ((window.location.hostname === 'localhost' && window.location.port === '3000') ? 'http://localhost:8000' : '');
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const ct = (res.headers.get('content-type') || '').toLowerCase();
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) {
          const message = data.detail || data.message || JSON.stringify(data);
          console.error('Login failed:', res.status, data);
          setError(message);
        } else {
          try { localStorage.setItem('access', data.access); localStorage.setItem('refresh', data.refresh); } catch (e) { }
          if (onLogin) {
            try { onLogin({ access: data.access, refresh: data.refresh }); } catch (e) { console.error('onLogin callback threw', e); }
          } else {
            try { window.location.href = '/dashboard'; } catch (e) { console.error(e); }
          }
        }
      } else {
        const text = await res.text();
        setError(`Expected JSON response but received HTML/text from server:\n${text.substring(0, 1000)}`);
      }
    } catch (err) {
      console.error('Login request error', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  return (
    <div className="signin-main-container">
      <div className="signin-card">
        <h1 className="signin-title">Welcome Back</h1>
        <h2 className="welcome-back-subtitle">Sign in to your account</h2>
        
        <form onSubmit={submit} className="signin-form">
          {error && <div className="error-message signin-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username" className="sr-only">Username</label>
            <input 
              id="username"
              type="text"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Username or Email" 
              required 
              className="signin-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="sr-only">Password</label>
            <input 
              id="password"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Password" 
              required 
              className="signin-input"
            />
          </div>
          
          <div className="signin-remember-me-container">
            <input type="checkbox" id="rememberMe" />
            <label htmlFor="rememberMe">Remember me</label>
          </div>
          
          <button type="submit" className="signin-continue-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        
        <div className="signin-terms-policy">
          <a href="/forgot-password">Forgot Password?</a>
        </div>
        
        <div className="signup-forgot-links">
          Don't have an account? 
          <a href="/signup" onClick={(e) => { e.preventDefault(); handleSignUpClick(); }}>Sign Up</a>
        </div>
      </div>
      
      <div className="signin-logo-footer">
        <p>© 2023 DOST-STII. All rights reserved.</p>
      </div>
    </div>
  );
}