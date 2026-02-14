// src/SignInScreen.jsx
import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { signInWithEmail } from './api/django-api';
import LogosContainer from './LogosContainer'; 
import './styles.css';

const isValidInput = (input) => {
    return input.trim().length > 0;
};

const SignInScreen = () => {
    const navigate = useNavigate();
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleContinue = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!isValidInput(emailOrUsername) || !isValidInput(password)) {
            setError('Please enter your email/username and password.');
            console.log('Login failed: Missing credentials.');
            setLoading(false);
            return;
        }
        
        try {
            // Use the API function to sign in
            const response = await signInWithEmail(emailOrUsername, password);
            console.log('Login successful. Redirecting to Dashboard. Remember Me:', rememberMe);
            navigate('/dashboard'); 
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };
    
    const handleForgotPasswordClick = (e) => {
        e.preventDefault();
        navigate('/forgot-password'); 
    };
    
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Handle Enter key press to submit form
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleContinue(e);
        }
    };

    return (
        <div className="signin-page-wrapper">
            <div className="signin-left-panel">
                <div className="signin-branding">
                    <h1 className="signin-brand-title">AGHAMazing Quest</h1>
                    <p className="signin-brand-subtitle">Content Management System</p>
                </div>
                
                <div className="signin-features">
                    <div className="signin-feature-item">
                        <div className="signin-feature-icon">🔒</div>
                        <div className="signin-feature-content">
                            <h3>Secure Access</h3>
                            <p>Safely manage your content with our enterprise-grade security</p>
                        </div>
                    </div>
                    <div className="signin-feature-item">
                        <div className="signin-feature-icon">⚡</div>
                        <div className="signin-feature-content">
                            <h3>Fast Performance</h3>
                            <p>Optimized for speed and efficiency</p>
                        </div>
                    </div>
                    <div className="signin-feature-item">
                        <div className="signin-feature-icon">📱</div>
                        <div className="signin-feature-content">
                            <h3>Responsive Design</h3>
                            <p>Works seamlessly on all devices</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="signin-right-panel">
                <div className="signin-card">
                    <div className="signin-header">
                        <h1 className="signin-title">Welcome Back!</h1>
                        <p className="signin-subtitle">Sign in to your account to continue</p>
                    </div>

                    <form onSubmit={handleContinue} className="signin-form">
                        <div className="signin-input-group">
                            <label htmlFor="email-username-input" className="signin-label">Email or Username</label>
                            <input 
                                type="text"
                                id="email-username-input" 
                                placeholder="Enter your email or username" 
                                value={emailOrUsername}
                                onChange={(e) => setEmailOrUsername(e.target.value)}
                                className="signin-input" 
                                required
                                onKeyPress={handleKeyPress}
                            />
                        </div>

                        <div className="signin-input-group">
                            <label htmlFor="password-input" className="signin-label">Password</label>
                            <div className="signin-password-container">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    id="password-input" 
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="signin-input signin-password-input" 
                                    required
                                    onKeyPress={handleKeyPress}
                                />
                                <button 
                                    type="button" 
                                    className="signin-toggle-password"
                                    onClick={togglePasswordVisibility}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>
                        
                        {error && <div className="signin-error-message">{error}</div>}

                        <div className="signin-options">
                            <div className="signin-remember-me">
                                <input 
                                    type="checkbox" 
                                    id="remember-me" 
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label htmlFor="remember-me">Remember me</label>
                            </div>
                            
                            <a 
                                href="/forgot-password" 
                                onClick={handleForgotPasswordClick}
                                className="signin-forgot-password"
                            >
                                Forgot password?
                            </a>
                        </div>

                        <button type="submit" className="signin-submit-btn" disabled={loading}>
                            {loading ? (
                                <span className="signin-loading">
                                    <span className="signin-spinner"></span>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>
                    
                    <div className="signin-terms-policy">
                        By signing in, you agree to our <a href="/terms-of-service">Terms of Service</a> and <a href="/privacy-policy">Privacy Policy</a>
                    </div>
                </div>
                
                {/* Image gallery section below the form */}
                <div className="signin-image-gallery">
                    <div className="image-row">
                        <img src="https://via.placeholder.com/300x200/3b82f6/FFFFFF?text=Dashboard" alt="Dashboard Preview" className="signin-gallery-image" />
                        <img src="https://via.placeholder.com/300x200/10b981/FFFFFF?text=Content+Editor" alt="Content Editor" className="signin-gallery-image" />
                        <img src="https://via.placeholder.com/300x200/8b5cf6/FFFFFF?text=Analytics" alt="Analytics Dashboard" className="signin-gallery-image" />
                    </div>
                    <div className="image-row">
                        <img src="https://via.placeholder.com/300x200/f59e0b/FFFFFF?text=User+Management" alt="User Management" className="signin-gallery-image" />
                        <img src="https://via.placeholder.com/300x200/ef4444/FFFFFF?text=Security" alt="Security Features" className="signin-gallery-image" />
                        <img src="https://via.placeholder.com/300x200/0ea5e9/FFFFFF?text=Mobile+View" alt="Mobile Responsive" className="signin-gallery-image" />
                    </div>
                </div>
                
                <div className="signin-footer">
                    <LogosContainer />
                </div>
            </div>
        </div>
    );
}; 

export default SignInScreen;