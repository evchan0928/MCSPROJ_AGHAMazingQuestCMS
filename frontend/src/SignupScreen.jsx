import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogosContainer from './LogosContainer'; // Contains the four horizontal logos
import './styles.css';

// Simple email validation function
const isValidEmail = (email) => {
    // Basic regex for email format validation (name@domain.tld)
    return /\S+@\S+\.\S+/.test(email);
};

const SignupScreen = () => {
    const navigate = useNavigate();
    // State for the email input and error message
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSignInClick = () => {
        navigate('/signin');
    };

    const onGoogleSignup = () => {
        console.log('Google Signup Attempted, navigating to /google-auth');
        navigate('/google-auth');
    };

    // Validation logic added here
    const onDostSignup = () => {
        setError(''); // Clear previous errors

        if (!isValidEmail(email)) {
            setError('Please enter a valid email address to sign up.');
            console.log('Signup failed: Invalid email format.');
            return; // Stop the function if validation fails
        }
        
        // In a real app, this is where the DOST/APC signup process would begin
        console.log('DOST Signup successful. Redirecting to /dashboard');
        navigate('/dashboard'); // Redirects to the Dashboard on successful validation
    };

    return (
        <div className="signin-main-container">
            <div className="signin-card">
                <h1 className="signin-title">Create Your Account</h1>
                <h2 className="welcome-back-subtitle">Sign up for AGHAMazing Quest</h2>
                
                {/* Input is now controlled by state */}
                <div className="form-group">
                    <label htmlFor="email" className="sr-only">Email</label>
                    <input 
                        id="email"
                        type="email" 
                        placeholder="Enter your email" 
                        className="signin-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                </div>
                
                {/* Display Error Message */}
                {error && <p className="error-message signin-error">{error}</p>}
                
                <button className="signin-continue-btn" onClick={onDostSignup}>
                    Sign Up with DOST or APC Account
                </button>

                <div className="divider">or continue with</div>

                <button className="login3-google-btn-alt" onClick={onGoogleSignup}>
                    <img
                        src="https://github.com/Marianne-101/pictures/blob/main/google-icon.png?raw=true"
                        alt="Google Icon"
                        className="google-icon"
                    />
                    Sign up with Google
                </button>

                <div className="signin-terms-policy">
                    By clicking continue, you agree to our
                    <a href="/terms-of-service"> Terms of Service </a>
                    and
                    <a href="/privacy-policy"> Privacy Policy</a>
                </div>

                <div className="signup-forgot-links">
                    Already have an account?
                    <a href="/signin" onClick={(e) => { e.preventDefault(); handleSignInClick(); }}>Sign In</a>
                </div>
            </div>
            
            <div className="signin-logo-footer">
                <LogosContainer />
                <p>© 2023 DOST-STII. All rights reserved.</p>
            </div>
        </div>
    );
};

export default SignupScreen;