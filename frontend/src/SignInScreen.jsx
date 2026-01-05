// src/SignInScreen.jsx
import React, { useState } from 'react'; 
// 🔑 UPDATED: Removed /signup from required navigation actions
import { useNavigate } from 'react-router-dom';
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

    const handleContinue = () => {
        setError(''); 

        if (!isValidInput(emailOrUsername) || !isValidInput(password)) {
            setError('Please enter your email/username and password.');
            console.log('Login failed: Missing credentials.');
            return;
        }
        
        console.log('Login successful. Redirecting to Dashboard. Remember Me:', rememberMe);
        navigate('/dashboard'); 
    };
    
    const handleForgotPasswordClick = (e) => {
        e.preventDefault();
        navigate('/forgot-password'); 
    }
    
    // 🗑️ REMOVED: handleSignUpClick function

    return (
        <React.Fragment> 
            <div className="signin-main-container">
                <div className="signin-card">
                    
                    <h1 className="signin-title">Sign In to AGHAMazing Quest CMS</h1>
                    <p className="welcome-back-subtitle">Welcome Back!</p>
                    <p className="enter-email-text">Enter your email to sign in for this app</p>

                    <input 
                        type="text"
                        id="email-username-input" 
                        placeholder="Email / Username" 
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        className="signin-input" 
                    />

                    <input 
                        type="password" 
                        id="password-input" 
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="signin-input" 
                    />
                    
                    {error && <p style={{ color: '#d93025', fontSize: '0.85em', marginTop: '-10px', marginBottom: '10px' }}>{error}</p>}

                    <div className="signin-remember-me-container">
                        <input 
                            type="checkbox" 
                            id="remember-me" 
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label htmlFor="remember-me">Remember me on this computer</label>
                    </div>

                    <button className="signin-continue-btn" onClick={handleContinue}>
                        Continue
                    </button>
                    
                    <p className="signin-terms-policy">
                        By clicking continue, you agree to our <a href="/terms-of-service">**Terms of Service**</a> and <a href="/privacy-policy">**Privacy Policy**</a>
                    </p>
                    
                    {/* 🗑️ REMOVED: "Don't have an account? Sign Up" link */}
                    
                    <p className="signup-forgot-links">
                        <a href="/forgot-password" onClick={handleForgotPasswordClick}>Forgot password?</a>
                    </p>

                </div>

                <div className="signin-logo-footer">
                    <LogosContainer />
                </div>
            </div>
        </React.Fragment>
    );
}; 

export default SignInScreen;