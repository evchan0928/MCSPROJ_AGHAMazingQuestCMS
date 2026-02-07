// src/SignInScreen.jsx
import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { signInWithEmail, getCurrentUser } from './api/django-api'; // Import the authentication function
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

    // Check if user is already logged in
    useEffect(() => {
        const accessToken = localStorage.getItem('access');
        if (accessToken) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleContinue = async (e) => {
        e.preventDefault();
        setError(''); 

        if (!isValidInput(emailOrUsername) || !isValidInput(password)) {
            setError('Please enter your email/username and password.');
            console.log('Login failed: Missing credentials.');
            return;
        }
        
        setLoading(true);
        try {
            // Make the actual API call to authenticate
            const response = await signInWithEmail(emailOrUsername, password);
            console.log('Login successful. Fetching user data. Remember Me:', rememberMe);
            
            // Fetch user data to get user initials and name for the UI
            const userData = await getCurrentUser();
            
            // Store user initials and name in localStorage for the UI
            localStorage.setItem('currentUserInitials', 
              userData.first_name && userData.last_name 
                ? `${userData.first_name.charAt(0)}${userData.last_name.charAt(0)}`.toUpperCase()
                : userData.username.charAt(0).toUpperCase()
            );
            
            localStorage.setItem('currentUserName', 
              userData.first_name && userData.last_name 
                ? `${userData.first_name} ${userData.last_name}`
                : userData.username
            );
            
            console.log('User data stored. Redirecting to Dashboard.');
            navigate('/dashboard'); 
        } catch (err) {
            // Extract error message from response
            let errorMessage = 'Invalid credentials. Please try again.';
            if (err.response) {
                // Server responded with error status
                if (err.response.data && err.response.data.detail) {
                    errorMessage = err.response.data.detail;
                } else if (err.response.data && typeof err.response.data === 'object') {
                    errorMessage = Object.values(err.response.data)[0]; // Take first error message
                }
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
            console.error('Login failed:', err);
        } finally {
            setLoading(false);
        }
    };
    
    const handleForgotPasswordClick = (e) => {
        e.preventDefault();
        navigate('/forgot-password'); 
    }
    
    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleContinue(e);
        }
    }
    
    // 🗑️ REMOVED: handleSignUpClick function

    return (
        <React.Fragment> 
            <div className="signin-main-container">
                <div className="signin-card">
                    
                    <h1 className="signin-title">Sign In to AGHAMazing Quest CMS</h1>
                    <p className="welcome-back-subtitle">Welcome Back!</p>
                    <p className="enter-email-text">Enter your credentials to sign in to this app</p>

                    <input 
                        type="text"
                        id="email-username-input" 
                        placeholder="Email / Username" 
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        className="signin-input" 
                        onKeyPress={handleKeyPress}
                    />

                    <input 
                        type="password" 
                        id="password-input" 
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="signin-input" 
                        onKeyPress={handleKeyPress}
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

                    <button className="signin-continue-btn" onClick={handleContinue} disabled={loading}>
                        {loading ? 'Signing in...' : 'Continue'}
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