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
    // 🔑 ADDED: State for the email input and error message
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSignInClick = () => {
        navigate('/signin');
    };

    const onGoogleSignup = () => {
        console.log('Google Signup Attempted, navigating to /google-auth');
        navigate('/google-auth');
    };

    // 🔑 MODIFIED: Validation logic added here
    const onDostSignup = () => {
        setError(''); // Clear previous errors

        if (!isValidEmail(email)) {
            setError('Please enter a valid email address to sign up.');
            console.log('Signup failed: Invalid email format.');
            return; // Stop the function if validation fails
        }
        
        // In a real app, this is where the DOST/APC signup process would begin
        console.log('DOST Signup successful. Redirecting to /dashboard');
        navigate('/dashboard'); // ⭐ Redirects to the Dashboard on successful validation
    };

    return (
        <React.Fragment>

            <div className="login3-container">
                <div className="login3-card">

                    <h1>Sign Up for AGHAMazing Quest</h1>
                    <LogosContainer />

                    {/* 🔑 MODIFIED: Input is now controlled by state */}
                    <input 
                        type="email" 
                        placeholder="Enter your email" 
                        className="login3-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                    
                    {/* 🔑 ADDED: Display Error Message */}
                    {error && <p style={{ color: 'red', fontSize: '0.85em', marginTop: '-10px', marginBottom: '10px' }}>{error}</p>}


                    <button className="dost-signup-btn" onClick={onDostSignup}>
                        Sign Up with DOST or APC Account
                    </button>

                    <div className="separator">or continue with</div>

                    <button className="login3-google-btn-alt" onClick={onGoogleSignup}>
                        <img
                            src="https://github.com/Marianne-101/pictures/blob/main/google-icon.png?raw=true"
                            alt="Google Icon"
                            className="google-icon"
                        />
                        Sign up with Google
                    </button>

                    <p className="terms-policy">
                        By clicking continue, you agree to our
                        <a href="/terms-of-service"> **Terms of Service** </a>
                        and
                        <a href="/privacy-policy"> **Privacy Policy** </a>
                    </p>

                    <p style={{ marginTop: '20px' }}>
                        Already have an account?
                        <a href="/signin" className="sign-in-link" onClick={(e) => { e.preventDefault(); handleSignInClick(); }}>Sign In</a>
                    </p>
                </div>
            </div>

        </React.Fragment>
    );
};

export default SignupScreen;