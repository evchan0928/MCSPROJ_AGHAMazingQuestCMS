import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmail } from './api/django-api';
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
      // Use the API function to sign in
      const response = await signInWithEmail(username, password);
      
      if (onLogin) {
        try { 
          onLogin({ access: response.access, refresh: response.refresh }); 
        } catch (e) { 
          console.error('onLogin callback threw', e); 
        }
      } else {
        try { 
          window.location.href = '/dashboard'; 
        } catch (e) { 
          console.error(e); 
        }
      }
    } catch (err) {
      console.error('Login request error', err);
      setError(err.message || String(err));
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